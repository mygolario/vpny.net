/**
 * Full automation demo: checkout → OxaPay invoice → simulated paid webhook → fulfillment → awaiting-inventory.
 * Outputs JSON summary to stdout; optional file via DEMO_OUTPUT env.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadSmokeEnv } from './_smoke-env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { anon, base, email, password } = loadSmokeEnv();
const startedAt = new Date().toISOString();

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(__dirname, 'supabase-secrets.local.env'), 'utf8').split(/\r?\n/)) {
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
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(data.error_description ?? 'Login failed');
  return data.access_token;
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
    {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
  const rows = await res.json();
  return rows[0] ?? null;
}

async function queryOrderDetails(accessToken, orderId) {
  const headers = { apikey: anon, Authorization: `Bearer ${accessToken}` };
  const [orderRes, itemsRes, subsRes] = await Promise.all([
    fetch(`${base}/rest/v1/orders?id=eq.${orderId}&select=*`, { headers }),
    fetch(
      `${base}/rest/v1/order_items?order_id=eq.${orderId}&select=id,fulfillment_status,config_pool_id,product_name,protocol,traffic_gb`,
      { headers },
    ),
    fetch(
      `${base}/rest/v1/subscriptions?order_id=eq.${orderId}&select=id,status,product_name,protocol,subscription_url,expires_at`,
      { headers },
    ),
  ]);
  const [orders, items, subs] = await Promise.all([
    orderRes.json(),
    itemsRes.json(),
    subsRes.json(),
  ]);
  return { order: orders[0], items, subscriptions: subs };
}

async function pollUntilActive(accessToken, orderId, maxMs = 20000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const order = await queryOrder(accessToken, orderId);
    if (order?.status === 'active') return order;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return queryOrder(accessToken, orderId);
}

const env = loadEnv();
const steps = [];
const summary = {
  startedAt,
  finishedAt: null,
  fulfillmentOrder: null,
  awaitingInventoryOrder: null,
  steps: [],
};

try {
  // --- Fulfillment path (DE-FRA-HY2-001) ---
  const fulfillmentCart = [
    {
      product_tier: 'professional',
      product: 'VPNy Professional',
      country: 'Germany',
      city: 'Frankfurt',
      duration_days: 30,
      duration: '1 Month',
      traffic_gb: 50,
      protocol: 'hysteria2',
      price: 1.4,
    },
  ];

  const accessToken = await login();
  step(steps, 'Auth login', true, { email: 'kavehtkts@gmail.com' });

  const created = await createOrder(accessToken, fulfillmentCart);
  const { orderId, paymentUrl, trackId, totalAmount } = created.data ?? {};
  const realOxaPay =
    typeof paymentUrl === 'string' &&
    paymentUrl.includes('pay.oxapay.com') &&
    !paymentUrl.includes('demo=1');

  step(steps, 'create-order (HY2 fulfillment cart)', created.status === 200 && !!orderId, {
    orderId,
    trackId,
    paymentUrl,
    totalAmount,
    httpStatus: created.status,
  });
  step(steps, 'Real OxaPay invoice URL', realOxaPay, { paymentUrl });

  summary.fulfillmentOrder = { orderId, trackId, paymentUrl, totalAmount };

  const webhook = await simulateWebhook(env, orderId, trackId, totalAmount ?? 1.4);
  step(steps, 'Simulated OxaPay paid webhook', webhook.status === 200 && webhook.body === 'ok', {
    httpStatus: webhook.status,
    body: webhook.body,
  });

  const activeOrder = await pollUntilActive(accessToken, orderId);
  step(steps, 'Order status active after webhook', activeOrder?.status === 'active', {
    status: activeOrder?.status,
  });

  const details = await queryOrderDetails(accessToken, orderId);
  const item = details.items?.[0];
  const sub = details.subscriptions?.[0];

  step(steps, 'Order item fulfilled', item?.fulfillment_status === 'fulfilled', {
    fulfillment_status: item?.fulfillment_status,
  });
  step(steps, 'Subscription created', !!sub?.id && sub?.status === 'active', {
    subscriptionId: sub?.id,
    status: sub?.status,
    subscription_url: sub?.subscription_url,
  });
  step(steps, 'Pool config assigned (DE-FRA-HY2-001)', !!item?.config_pool_id, {
    config_pool_id: item?.config_pool_id,
    expected_external_id: 'DE-FRA-HY2-001',
  });

  summary.fulfillmentOrder = {
    ...summary.fulfillmentOrder,
    status: activeOrder?.status,
    subscriptionId: sub?.id,
    configPoolId: item?.config_pool_id,
    subscriptionUrl: sub?.subscription_url,
  };

  // --- Awaiting inventory path ---
  const awaitingCart = [
    {
      product_tier: 'ultimate',
      product: 'VPNy Ultimate AI',
      country: 'Norway',
      city: 'Oslo',
      duration_days: 30,
      duration: '1 Month',
      traffic_gb: 100,
      protocol: 'vless',
      price: 2.5,
    },
  ];

  const awaitingCreated = await createOrder(accessToken, awaitingCart);
  const a = awaitingCreated.data ?? {};
  step(steps, 'create-order (awaiting inventory cart)', awaitingCreated.status === 200 && !!a.orderId, {
    orderId: a.orderId,
    trackId: a.trackId,
  });

  const awaitingWebhook = await simulateWebhook(env, a.orderId, a.trackId, a.totalAmount ?? 2.5);
  step(steps, 'Awaiting-inventory webhook', awaitingWebhook.status === 200, {
    httpStatus: awaitingWebhook.status,
  });

  await new Promise((r) => setTimeout(r, 2000));
  const awaitingOrder = await queryOrder(accessToken, a.orderId);
  step(steps, 'Order awaiting_inventory', awaitingOrder?.status === 'awaiting_inventory', {
    status: awaitingOrder?.status,
  });

  summary.awaitingInventoryOrder = {
    orderId: a.orderId,
    trackId: a.trackId,
    status: awaitingOrder?.status,
  };
} catch (err) {
  step(steps, 'Unexpected error', false, { message: err instanceof Error ? err.message : String(err) });
}

summary.finishedAt = new Date().toISOString();
summary.steps = steps;
summary.allPassed = steps.every((s) => s.pass);

console.log(JSON.stringify(summary, null, 2));

const outPath = process.env.DEMO_OUTPUT ?? join(__dirname, '..', 'docs', 'demo-run-latest.json');
writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.error(`Wrote ${outPath}`);

process.exit(summary.allPassed ? 0 : 1);
