/**
 * VPNy America 6-month email E2E smoke test.
 * Seeds test pool → create-order → simulated paid webhook → DB assertions → Resend email check.
 *
 * Requires scripts/supabase-secrets.local.env with OXAPAY_MERCHANT_API_KEY and RESEND_API_KEY.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadSmokeEnv } from './_smoke-env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { anon, base, email: customerEmail, password: smokePassword } = loadSmokeEnv();
const startedAt = new Date().toISOString();

const AMERICA_CART = [
  {
    product_tier: 'america',
    product: 'VPNy America',
    country: 'United States',
    city: 'Country-Level',
    duration_days: 180,
    duration: '6 Months',
    traffic_gb: 50,
    protocol: 'hysteria2',
    price: 5.1,
  },
];

function loadEnv() {
  const envPath = join(__dirname, 'supabase-secrets.local.env');
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
  return env;
}

function step(steps, name, pass, detail = {}) {
  steps.push({ name, pass, ...detail, at: new Date().toISOString() });
  const icon = pass ? 'PASS' : 'FAIL';
  console.error(`[${icon}] ${name}${detail.message ? `: ${detail.message}` : ''}`);
}

async function hmac512(body, key) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function login() {
  const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password: smokePassword }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(data.error_description ?? 'Login failed');
  return data.access_token;
}

async function importAmericaPool(accessToken) {
  const poolFile = join(__dirname, '..', 'docs', 'config-pool-america-test.json');
  const { configs } = JSON.parse(readFileSync(poolFile, 'utf8'));
  const res = await fetch(`${base}/functions/v1/admin-import-pool`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ configs }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function queryPoolAvailable(accessToken) {
  const filter =
    'product_tier=eq.america&country=eq.United%20States&traffic_gb=eq.50&duration_days=eq.180&protocol=eq.hysteria2&status=eq.available';
  const res = await fetch(`${base}/rest/v1/config_pool_inventory?${filter}&select=count,status`, {
    headers: { apikey: anon, Authorization: `Bearer ${accessToken}` },
  });
  const rows = await res.json();
  return rows[0]?.count ?? 0;
}

async function createOrder(accessToken, items) {
  const res = await fetch(`${base}/functions/v1/create-order`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items, paymentMethod: 'crypto' }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function simulateWebhook(env, orderId, trackId, amount) {
  const payload = {
    track_id: trackId,
    trackId,
    status: 'paid',
    order_id: orderId,
    orderId,
    amount,
  };
  const rawBody = JSON.stringify(payload);
  const hmac = await hmac512(rawBody, env.OXAPAY_MERCHANT_API_KEY);
  const res = await fetch(`${base}/functions/v1/oxapay-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', HMAC: hmac },
    body: rawBody,
  });
  return { status: res.status, body: await res.text() };
}

async function queryOrder(accessToken, orderId) {
  const res = await fetch(
    `${base}/rest/v1/orders?id=eq.${orderId}&select=id,status,paid_at,total_amount`,
    { headers: { apikey: anon, Authorization: `Bearer ${accessToken}` } },
  );
  const rows = await res.json();
  return rows[0] ?? null;
}

async function queryOrderDetails(accessToken, orderId) {
  const headers = { apikey: anon, Authorization: `Bearer ${accessToken}` };
  const [itemsRes, subsRes, poolRes] = await Promise.all([
    fetch(
      `${base}/rest/v1/order_items?order_id=eq.${orderId}&select=id,fulfillment_status,config_pool_id,product_name,protocol,traffic_gb,duration_days`,
      { headers },
    ),
    fetch(
      `${base}/rest/v1/subscriptions?order_id=eq.${orderId}&select=id,status,product_name,protocol,subscription_url,expires_at`,
      { headers },
    ),
    fetch(
      `${base}/rest/v1/config_pool?external_id=like.US-AMERICA-*&select=external_id,status&order=external_id`,
      { headers },
    ),
  ]);
  const [items, subs, poolRows] = await Promise.all([
    itemsRes.json(),
    subsRes.json(),
    poolRes.json(),
  ]);
  return { items, subscriptions: subs, poolRows };
}

async function pollUntilActive(accessToken, orderId, maxMs = 25000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const order = await queryOrder(accessToken, orderId);
    if (order?.status === 'active') return order;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return queryOrder(accessToken, orderId);
}

async function findConfigDeliveryEmail(resendApiKey, subscriptionUrl) {
  if (!resendApiKey) {
    return { found: false, reason: 'RESEND_API_KEY not set in supabase-secrets.local.env' };
  }

  await new Promise((r) => setTimeout(r, 3000));

  const listRes = await fetch('https://api.resend.com/emails?limit=20', {
    headers: { Authorization: `Bearer ${resendApiKey}` },
  });
  if (!listRes.ok) {
    return { found: false, reason: `Resend list failed: ${await listRes.text()}` };
  }

  const { data: emails } = await listRes.json();
  const candidates = (emails ?? []).filter(
    (e) =>
      e.to?.includes(customerEmail) &&
      e.subject === 'Your VPNy.net configuration is ready',
  );

  for (const email of candidates) {
    const detailRes = await fetch(`https://api.resend.com/emails/${email.id}`, {
      headers: { Authorization: `Bearer ${resendApiKey}` },
    });
    if (!detailRes.ok) continue;
    const detail = await detailRes.json();
    const html = detail.html ?? '';
    const hasProduct = html.includes('VPNy America');
    const hasSubUrl = subscriptionUrl ? html.includes(subscriptionUrl) : true;
    if (hasProduct && hasSubUrl) {
      return {
        found: true,
        emailId: email.id,
        subject: email.subject,
        status: email.last_event ?? detail.last_event,
      };
    }
  }

  return {
    found: false,
    reason: `No matching config email in last ${emails?.length ?? 0} sent messages`,
    recentSubjects: (emails ?? []).slice(0, 5).map((e) => e.subject),
  };
}

const env = loadEnv();
const steps = [];
const summary = { startedAt, finishedAt: null, order: null, steps: [] };

try {
  if (!env.OXAPAY_MERCHANT_API_KEY) {
    throw new Error('OXAPAY_MERCHANT_API_KEY missing in scripts/supabase-secrets.local.env');
  }
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY missing in scripts/supabase-secrets.local.env');
  }

  const accessToken = await login();
  step(steps, 'Auth login', true, { email: customerEmail });

  const poolBefore = await queryPoolAvailable(accessToken);
  step(steps, 'Pool available before test (america/US/180d/50GB/hy2)', poolBefore >= 1, {
    availableCount: poolBefore,
    message: poolBefore >= 1 ? `${poolBefore} available` : 'Need at least 1 — importing',
  });

  if (poolBefore < 1) {
    const imported = await importAmericaPool(accessToken);
    const ok =
      imported.status === 200 &&
      imported.data.imported >= 1 &&
      (imported.data.errors?.length ?? 0) === 0;
    step(steps, 'Import america test pool (10 configs)', ok, imported.data);
    if (!ok) throw new Error(`Pool import failed: ${JSON.stringify(imported.data)}`);
  }

  const poolAfterImport = await queryPoolAvailable(accessToken);
  step(steps, 'Pool available after import', poolAfterImport >= 1, {
    availableCount: poolAfterImport,
  });

  const created = await createOrder(accessToken, AMERICA_CART);
  const { orderId, trackId, totalAmount, paymentUrl } = created.data ?? {};
  step(steps, 'create-order (VPNy America 6 months)', created.status === 200 && !!orderId, {
    orderId,
    trackId,
    totalAmount,
    paymentUrl,
    httpStatus: created.status,
  });
  if (!orderId) throw new Error('create-order did not return orderId');

  summary.order = { orderId, trackId, totalAmount, paymentUrl };

  const webhook = await simulateWebhook(env, orderId, trackId, totalAmount ?? 5.1);
  step(steps, 'Simulated OxaPay paid webhook', webhook.status === 200 && webhook.body === 'ok', {
    httpStatus: webhook.status,
    body: webhook.body,
  });

  const activeOrder = await pollUntilActive(accessToken, orderId);
  step(steps, 'Order status active', activeOrder?.status === 'active', {
    status: activeOrder?.status,
  });

  const details = await queryOrderDetails(accessToken, orderId);
  const item = details.items?.[0];
  const sub = details.subscriptions?.[0];
  const assignedPool = details.poolRows?.find((r) => r.status === 'assigned');
  const availableAfter = await queryPoolAvailable(accessToken);

  step(steps, 'Order item fulfilled', item?.fulfillment_status === 'fulfilled', {
    fulfillment_status: item?.fulfillment_status,
    product_name: item?.product_name,
  });
  step(steps, 'Subscription created with subscription_url', !!sub?.subscription_url && sub?.status === 'active', {
    subscriptionId: sub?.id,
    subscription_url: sub?.subscription_url,
  });
  step(steps, 'US-AMERICA pool config assigned', !!item?.config_pool_id && !!assignedPool, {
    config_pool_id: item?.config_pool_id,
    external_id: assignedPool?.external_id,
  });
  step(steps, 'Pool inventory decremented', availableAfter >= 0 && availableAfter < poolAfterImport, {
    availableBeforeOrder: poolAfterImport,
    availableAfterOrder: availableAfter,
  });

  const emailResult = await findConfigDeliveryEmail(env.RESEND_API_KEY, sub?.subscription_url);
  step(steps, 'Config delivery email (Resend)', emailResult.found, emailResult);

  summary.order = {
    ...summary.order,
    status: activeOrder?.status,
    subscriptionId: sub?.id,
    subscriptionUrl: sub?.subscription_url,
    configPoolExternalId: assignedPool?.external_id,
    configEmail: emailResult,
    poolAvailableAfter: availableAfter,
  };
} catch (err) {
  step(steps, 'Unexpected error', false, {
    message: err instanceof Error ? err.message : String(err),
  });
}

summary.finishedAt = new Date().toISOString();
summary.steps = steps;
summary.allPassed = steps.every((s) => s.pass);

console.log(JSON.stringify(summary, null, 2));

const outPath =
  process.env.AMERICA_TEST_OUTPUT ??
  join(__dirname, '..', 'docs', 'america-email-test-latest.json');
writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.error(`Wrote ${outPath}`);

process.exit(summary.allPassed ? 0 : 1);
