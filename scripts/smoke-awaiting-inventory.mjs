import { loadSmokeEnv } from './_smoke-env.mjs';

const { anon, base, email, password } = loadSmokeEnv();

const login = await fetch(`${base}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: anon, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { access_token } = await login.json();

const items = [
  {
    product_tier: 'ultimate',
    product: 'VPNy Ultimate',
    country: 'Norway',
    city: 'Oslo',
    duration_days: 30,
    duration: '1 Month',
    traffic_gb: 100,
    protocol: 'vless',
    price: 49.99,
  },
];

const order = await fetch(`${base}/functions/v1/create-order`, {
  method: 'POST',
  headers: {
    apikey: anon,
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ items, paymentMethod: 'crypto' }),
});

const created = await order.json();
console.log('create-order', order.status, JSON.stringify(created));

if (created.orderId && created.trackId) {
  const { execFileSync } = await import('child_process');
  execFileSync('node', ['scripts/smoke-webhook.mjs', created.orderId, String(created.trackId)], {
    stdio: 'inherit',
  });
}
