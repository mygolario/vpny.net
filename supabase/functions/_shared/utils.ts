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

const edgeSecretCache = new Map<string, string>();

function parseSettingValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return null;
  return String(value);
}

export async function getEdgeSecret(
  name: string,
  supabase?: SupabaseClient,
): Promise<string | undefined> {
  const fromEnv = Deno.env.get(name);
  if (fromEnv) return fromEnv;

  if (edgeSecretCache.has(name)) {
    return edgeSecretCache.get(name);
  }

  const client = supabase ?? createServiceClient();
  const { data } = await client
    .from('app_settings')
    .select('value')
    .eq('key', name)
    .maybeSingle();

  const parsed = parseSettingValue(data?.value);
  if (parsed) {
    edgeSecretCache.set(name, parsed);
    return parsed;
  }

  return undefined;
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
  const key = await getEdgeSecret('ENCRYPTION_KEY');
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
  const key = await getEdgeSecret('ENCRYPTION_KEY');
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

export async function getCustomerEmail(
  supabase: SupabaseClient,
  userId: string,
  embeddedProfile?: unknown,
): Promise<string | null> {
  if (embeddedProfile && typeof embeddedProfile === 'object') {
    const profile = Array.isArray(embeddedProfile) ? embeddedProfile[0] : embeddedProfile;
    const email = (profile as { email?: string })?.email;
    if (email) return email;
  }

  const { data } = await supabase.from('profiles').select('email').eq('id', userId).maybeSingle();
  return data?.email ?? null;
}

export async function sendResendEmail(
  payload: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  },
  supabase?: SupabaseClient,
) {
  const client = supabase ?? createServiceClient();
  const apiKey = await getEdgeSecret('RESEND_API_KEY', client);
  const from = (await getEdgeSecret('RESEND_FROM_EMAIL', client)) ?? 'support@vpny.net';
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return { skipped: true as const, reason: 'missing_api_key' };
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
      ...(payload.text ? { text: payload.text } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error: ${text}`);
  }
  return response.json();
}

const EMAIL_BG = '#0b0b0d';
const EMAIL_CARD_BG = '#161616';
const EMAIL_BORDER = '#2a2a2a';
const EMAIL_GOLD = '#f5c451';
const EMAIL_GOLD_DARK = '#caa23a';
const EMAIL_TEXT = '#f4f4f5';
const EMAIL_MUTED = '#9a9a9f';
const EMAIL_GREEN = '#34d399';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildConfigDeliveryEmail(options: {
  productName: string;
  country: string;
  city: string | null;
  subscriptionUrl: string | null;
  configUri: string | null;
  expiresAt: string;
  portalUrl: string;
}): { html: string; text: string } {
  const location = options.city ? `${options.country} (${options.city})` : options.country;
  const safeProductName = escapeHtml(options.productName);
  const safeLocation = escapeHtml(location);

  const copyBoxes = [
    options.subscriptionUrl
      ? {
        label: 'Subscription URL',
        value: options.subscriptionUrl,
      }
      : null,
    options.configUri
      ? {
        label: 'Config URI',
        value: options.configUri,
      }
      : null,
  ].filter((box): box is { label: string; value: string } => box !== null);

  const copyBoxesHtml = copyBoxes
    .map(
      (box) => `
        <tr>
          <td style="padding:0 0 16px 0;">
            <div style="font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${EMAIL_MUTED};margin:0 0 6px 0;">${escapeHtml(box.label)}</div>
            <div style="background:#0f0f10;border:1px solid ${EMAIL_BORDER};border-radius:10px;padding:12px 14px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;line-height:1.5;color:${EMAIL_TEXT};word-break:break-all;">${escapeHtml(box.value)}</div>
          </td>
        </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your VPNy.net gateway is ready</title>
  </head>
  <body style="margin:0;padding:0;background:${EMAIL_BG};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:${EMAIL_TEXT};letter-spacing:-0.01em;">
                  &#128737; VPNy<span style="color:${EMAIL_GOLD};">.net</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="background:${EMAIL_CARD_BG};border:1px solid ${EMAIL_BORDER};border-radius:16px;padding:32px;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:8px;">
                      <span style="display:inline-block;background:rgba(245,196,81,0.12);color:${EMAIL_GOLD};font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;">${safeProductName}</span>
                      <span style="display:inline-block;background:rgba(52,211,153,0.12);color:${EMAIL_GREEN};font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;margin-left:6px;">&#9679; Active</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0 20px 0;">
                      <h1 style="margin:0;font-size:20px;line-height:1.3;color:${EMAIL_TEXT};font-weight:700;">Your gateway is ready</h1>
                      <p style="margin:8px 0 0 0;font-size:14px;line-height:1.6;color:${EMAIL_MUTED};">Your <strong style="color:${EMAIL_TEXT};">${safeProductName}</strong> configuration for <strong style="color:${EMAIL_TEXT};">${safeLocation}</strong> has been activated and is ready to use.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${EMAIL_BORDER};border-bottom:1px solid ${EMAIL_BORDER};">
                        <tr>
                          <td style="padding:14px 0;font-size:12px;color:${EMAIL_MUTED};text-transform:uppercase;letter-spacing:0.04em;">Server Location</td>
                          <td style="padding:14px 0;font-size:13px;color:${EMAIL_TEXT};font-weight:600;text-align:right;">${safeLocation}</td>
                        </tr>
                        <tr>
                          <td style="padding:14px 0;font-size:12px;color:${EMAIL_MUTED};text-transform:uppercase;letter-spacing:0.04em;border-top:1px solid ${EMAIL_BORDER};">Expiration Date</td>
                          <td style="padding:14px 0;font-size:13px;color:${EMAIL_TEXT};font-weight:600;text-align:right;border-top:1px solid ${EMAIL_BORDER};">${escapeHtml(options.expiresAt)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${copyBoxesHtml}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:8px 0 4px 0;">
                      <a href="${options.portalUrl}" style="display:inline-block;background:${EMAIL_GOLD};background:linear-gradient(180deg,${EMAIL_GOLD},${EMAIL_GOLD_DARK});color:#151108;font-weight:700;font-size:14px;text-decoration:none;padding:13px 28px;border-radius:10px;">Open Client Portal</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 8px 0 8px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
                <p style="margin:0 0 10px 0;font-size:13px;line-height:1.6;color:${EMAIL_MUTED};">راهنمای اتصال: از Hiddify، v2rayNG یا PassWall استفاده کنید و لینک اشتراک را وارد کنید.<br/>Connection guide: use Hiddify, v2rayNG, or PassWall and import your subscription link.</p>
                <p style="margin:0;font-size:12px;color:${EMAIL_MUTED};">Need help? Contact support@vpny.net</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textLines = [
    'YOUR VPNY.NET GATEWAY IS READY',
    '',
    `Your ${options.productName} configuration for ${location} has been activated.`,
    '',
    `Expires: ${options.expiresAt}`,
    '',
    ...copyBoxes.map((box) => `${box.label}: ${box.value}`),
    '',
    `Open your Client Portal: ${options.portalUrl}`,
    '',
    '----------------------------------------',
    '',
    'Connection guide: use Hiddify, v2rayNG, or PassWall and import your subscription link.',
    '',
    'Need help? Contact support@vpny.net',
  ];

  return { html, text: textLines.join('\n') };
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

  const adminEmail = (await getEdgeSecret('ADMIN_ALERT_EMAIL', supabase)) ?? 'support@vpny.net';
  if ((count ?? 0) <= threshold) {
    await sendResendEmail({
      to: adminEmail,
      subject: `[VPNy] Low stock: ${config.product_tier} ${config.country}`,
      html: `<p>Config pool for ${config.product_tier} / ${config.country}${config.city ? ` / ${config.city}` : ''} / ${config.protocol} / ${config.traffic_gb}GB / ${config.duration_days}d has <strong>${count ?? 0}</strong> remaining (threshold: ${threshold}).</p>`,
    }, supabase).catch((err) => console.error('Low stock alert failed', err));
  }
}
