-- Additional RLS policies for admin dashboard reads

CREATE POLICY order_items_admin_select ON public.order_items
  FOR SELECT USING (public.is_admin());

CREATE POLICY orders_admin_insert ON public.orders
  FOR INSERT WITH CHECK (public.is_admin() OR user_id = auth.uid());
