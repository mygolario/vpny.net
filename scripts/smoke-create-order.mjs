import { loadSmokeEnv } from './_smoke-env.mjs';

const { anon, base, email, password } = loadSmokeEnv();

const items = JSON.parse(process.argv[2] ?? JSON.stringify([
  {
    product_tier: 'professional',
    product: 'VPNy Professional',
    country: 'Germany',
    city: 'Frankfurt',
    duration_days: 90,
    duration: '3 Months',
    traffic_gb: 100,
    protocol: 'vless',
    price: 29.99,
  },
]));

const login = await fetch(`${base}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: anon, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { access_token } = await login.json();

const order = await fetch(`${base}/functions/v1/create-order`, {
  method: 'POST',
  headers: {
    apikey: anon,
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ items, paymentMethod: 'crypto' }),
});

const text = await order.text();
console.log('create-order', order.status, text);
