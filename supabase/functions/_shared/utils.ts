import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, hmac',
};

export function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function createUserClient(authHeader: string): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export async function requireAdmin(supabase: SupabaseClient, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', userId)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return profile;
}

export async function encryptSecret(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  const key = Deno.env.get('ENCRYPTION_KEY');
  if (!key) return value;

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    encoder.encode(value),
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptSecret(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  const key = Deno.env.get('ENCRYPTION_KEY');
  if (!key) return value;

  try {
    const combined = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, keyMaterial, data);
    return new TextDecoder().decode(decrypted);
  } catch {
    return value;
  }
}

export async function writeAudit(
  supabase: SupabaseClient,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
  actorId?: string | null,
) {
  await supabase.from('audit_logs').insert({
    actor_id: actorId ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

export async function sendResendEmail(payload: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'support@vpny.net';
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return { skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `VPNy.net <${from}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error: ${text}`);
  }
  return response.json();
}

export function buildConfigDeliveryEmail(options: {
  productName: string;
  country: string;
  city: string | null;
  subscriptionUrl: string | null;
  configUri: string | null;
  expiresAt: string;
  portalUrl: string;
}) {
  const location = options.city ? `${options.country} (${options.city})` : options.country;
  const configBlock = [
    options.subscriptionUrl
      ? `<p><strong>Subscription URL:</strong><br/><code style="word-break:break-all">${options.subscriptionUrl}</code></p>`
      : '',
    options.configUri
      ? `<p><strong>Config URI:</strong><br/><code style="word-break:break-all">${options.configUri}</code></p>`
      : '',
  ].join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2>Your VPNy.net gateway is ready</h2>
      <p>Your <strong>${options.productName}</strong> configuration for <strong>${location}</strong> has been activated.</p>
      ${configBlock}
      <p><strong>Expires:</strong> ${options.expiresAt}</p>
      <p>You can also view your configs anytime in the <a href="${options.portalUrl}">Client Portal</a>.</p>
      <hr/>
      <p style="color:#666;font-size:14px">راهنمای اتصال: از Hiddify، v2rayNG یا PassWall استفاده کنید و لینک اشتراک را وارد کنید.<br/>
      Connection guide: Use Hiddify, v2rayNG, or PassWall and import your subscription link.</p>
      <p style="color:#666;font-size:12px">Need help? Contact support@vpny.net</p>
    </div>
  `;
}

export async function getLowStockThreshold(supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'low_stock_threshold')
    .maybeSingle();
  return typeof data?.value === 'number' ? data.value : 3;
}

export async function checkLowStockAndAlert(
  supabase: SupabaseClient,
  config: {
    product_tier: string;
    country: string;
    city: string | null;
    protocol: string;
    traffic_gb: number;
    duration_days: number;
  },
) {
  const threshold = await getLowStockThreshold(supabase);
  let query = supabase
    .from('config_pool')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')
    .eq('product_tier', config.product_tier)
    .eq('country', config.country)
    .eq('traffic_gb', config.traffic_gb)
    .eq('duration_days', config.duration_days)
    .eq('protocol', config.protocol);

  if (config.city) {
    query = query.eq('city', config.city);
  } else {
    query = query.is('city', null);
  }

  const { count } = await query;

  const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL') ?? 'support@vpny.net';
  if ((count ?? 0) <= threshold) {
    await sendResendEmail({
      to: adminEmail,
      subject: `[VPNy] Low stock: ${config.product_tier} ${config.country}`,
      html: `<p>Config pool for ${config.product_tier} / ${config.country}${config.city ? ` / ${config.city}` : ''} / ${config.protocol} / ${config.traffic_gb}GB / ${config.duration_days}d has <strong>${count ?? 0}</strong> remaining (threshold: ${threshold}).</p>`,
    }).catch((err) => console.error('Low stock alert failed', err));
  }
}
