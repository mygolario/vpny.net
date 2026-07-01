import { readFileSync } from 'fs';

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
  return env;
}

const env = loadEnv(new URL('supabase-secrets.local.env', import.meta.url));
const base = 'https://zhfxomofodwifoxiqfjx.supabase.co';
const orderId = process.argv[2] ?? '200c4ac0-ae72-4172-908a-e3b6d1771b33';
const trackId = process.argv[3] ?? '158720826';

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

const payload = {
  track_id: trackId,
  trackId,
  status: 'paid',
  order_id: orderId,
  orderId,
  amount: 29.99,
};
const rawBody = JSON.stringify(payload);
const hmac = await hmac512(rawBody, env.OXAPAY_MERCHANT_API_KEY);

const res = await fetch(`${base}/functions/v1/oxapay-webhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', HMAC: hmac },
  body: rawBody,
});

console.log('webhook', res.status, await res.text());
