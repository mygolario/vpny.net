-- VPNy.net Order Fulfillment Schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (key, value) VALUES
  ('low_stock_threshold', '3'::jsonb),
  ('admin_alert_email', '"support@vpny.net"'::jsonb);

CREATE TYPE public.order_status AS ENUM (
  'pending_payment',
  'paid',
  'provisioning',
  'active',
  'awaiting_inventory',
  'awaiting_manual',
  'failed',
  'expired',
  'cancelled'
);

CREATE TYPE public.config_pool_status AS ENUM (
  'available',
  'assigned',
  'retired'
);

CREATE TYPE public.fulfillment_status AS ENUM (
  'pending',
  'fulfilled',
  'awaiting_inventory',
  'awaiting_manual',
  'failed'
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  oxapay_track_id TEXT UNIQUE,
  oxapay_payment_url TEXT,
  payment_method TEXT NOT NULL DEFAULT 'crypto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_tier TEXT NOT NULL CHECK (product_tier IN ('general', 'professional', 'ultimate', 'creator')),
  product_name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  duration_days INTEGER NOT NULL,
  duration_label TEXT NOT NULL,
  traffic_gb INTEGER NOT NULL,
  protocol TEXT CHECK (protocol IS NULL OR protocol IN ('vless', 'hysteria2')),
  dns_type TEXT,
  price NUMERIC(10, 2) NOT NULL,
  fulfillment_status public.fulfillment_status NOT NULL DEFAULT 'pending',
  config_pool_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.config_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE,
  protocol TEXT NOT NULL CHECK (protocol IN ('vless', 'hysteria2')),
  product_tier TEXT NOT NULL CHECK (product_tier IN ('general', 'professional', 'ultimate', 'creator')),
  country TEXT NOT NULL,
  city TEXT,
  traffic_gb INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  server_ip TEXT NOT NULL,
  server_label TEXT,
  subscription_url TEXT,
  config_uri_encrypted TEXT,
  sui_client_id TEXT,
  sui_inbound_tag TEXT,
  notes TEXT,
  status public.config_pool_status NOT NULL DEFAULT 'available',
  assigned_at TIMESTAMPTZ,
  assigned_to_order_item_id UUID REFERENCES public.order_items(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT config_pool_delivery_check CHECK (
    subscription_url IS NOT NULL OR config_uri_encrypted IS NOT NULL
  )
);

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_config_pool_id_fkey
  FOREIGN KEY (config_pool_id) REFERENCES public.config_pool(id);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL UNIQUE REFERENCES public.order_items(id) ON DELETE CASCADE,
  config_pool_id UUID NOT NULL REFERENCES public.config_pool(id),
  product_name TEXT NOT NULL,
  product_tier TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  protocol TEXT NOT NULL,
  server_ip TEXT NOT NULL,
  server_label TEXT,
  subscription_url TEXT,
  config_uri_encrypted TEXT,
  traffic_gb INTEGER NOT NULL,
  traffic_used_gb NUMERIC(10, 2) NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'oxapay',
  track_id TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  payload JSONB NOT NULL,
  status TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, track_id, status)
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_oxapay_track_id ON public.orders(oxapay_track_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_config_pool_available ON public.config_pool(status, product_tier, country, city, traffic_gb, duration_days, protocol);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Normalize city for matching
CREATE OR REPLACE FUNCTION public.normalize_city(city TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN city IS NULL OR trim(city) = '' OR lower(trim(city)) = 'country-level' THEN NULL
    ELSE trim(city)
  END;
$$;

-- Atomic config assignment from pool
CREATE OR REPLACE FUNCTION public.assign_config_from_pool(
  p_product_tier TEXT,
  p_country TEXT,
  p_city TEXT,
  p_traffic_gb INTEGER,
  p_duration_days INTEGER,
  p_protocol TEXT DEFAULT NULL,
  p_order_item_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config_id UUID;
  v_normalized_city TEXT;
BEGIN
  v_normalized_city := normalize_city(p_city);

  UPDATE public.config_pool cp
  SET
    status = 'assigned',
    assigned_at = now(),
    assigned_to_order_item_id = p_order_item_id,
    updated_at = now()
  WHERE cp.id = (
    SELECT id
    FROM public.config_pool
    WHERE status = 'available'
      AND product_tier = p_product_tier
      AND country = p_country
      AND normalize_city(city) IS NOT DISTINCT FROM v_normalized_city
      AND traffic_gb = p_traffic_gb
      AND duration_days = p_duration_days
      AND (p_protocol IS NULL OR protocol = p_protocol)
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING cp.id INTO v_config_id;

  RETURN v_config_id;
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER config_pool_updated_at BEFORE UPDATE ON public.config_pool
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles policies
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- Orders policies
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY orders_insert_own ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY orders_update_admin ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Order items policies
CREATE POLICY order_items_select_own ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Subscriptions policies
CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Config pool - admin only
CREATE POLICY config_pool_admin_all ON public.config_pool
  FOR ALL USING (public.is_admin());

-- Webhook events - admin read only
CREATE POLICY webhook_events_admin ON public.webhook_events
  FOR SELECT USING (public.is_admin());

-- Audit logs - admin read only
CREATE POLICY audit_logs_admin ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- App settings - admin read
CREATE POLICY app_settings_admin ON public.app_settings
  FOR SELECT USING (public.is_admin());

-- Inventory count view for admin
CREATE OR REPLACE VIEW public.config_pool_inventory AS
SELECT
  product_tier,
  country,
  city,
  protocol,
  traffic_gb,
  duration_days,
  status,
  COUNT(*) AS count
FROM public.config_pool
GROUP BY product_tier, country, city, protocol, traffic_gb, duration_days, status;

GRANT SELECT ON public.config_pool_inventory TO authenticated;
