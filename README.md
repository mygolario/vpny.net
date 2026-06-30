# VPNy.net — Order Fulfillment Automation

React + Vite frontend with Supabase backend for automated VPN config delivery after OxaPay crypto payment.

## Features

- Plan configurator and cart checkout
- Supabase Auth (email + password, email verification)
- OxaPay crypto payments with webhook-triggered fulfillment
- Pre-staged config pool with atomic assignment
- Client portal with subscription URLs
- Resend email delivery (bilingual EN/FA footer)
- Full admin dashboard (orders, pool import, retry fulfill, audit log)
- s-ui integration guide for phase 2

## Quick start

### 1. Frontend

```bash
npm install
cp .env.example .env
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

### 2. Supabase

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy create-order
npx supabase functions deploy oxapay-webhook
npx supabase functions deploy admin-import-pool
npx supabase functions deploy admin-retry-fulfill
```

### 3. Edge Function secrets

```bash
npx supabase secrets set OXAPAY_MERCHANT_API_KEY=your_key
npx supabase secrets set RESEND_API_KEY=your_key
npx supabase secrets set RESEND_FROM_EMAIL=support@vpny.net
npx supabase secrets set ADMIN_ALERT_EMAIL=your@email.com
npx supabase secrets set APP_URL=https://vpny.net
npx supabase secrets set ENCRYPTION_KEY=your-32-char-secret-key-here!!
```

### 4. Promote admin user

After registering, run in Supabase SQL editor:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Import config pool

Use [docs/config-pool-example.json](docs/config-pool-example.json) or CSV via Admin → Config Pool → Import.

### 6. OxaPay webhook

Set callback URL to:

```
https://YOUR_PROJECT.supabase.co/functions/v1/oxapay-webhook
```

## Documentation

- [s-ui sync guide](docs/SUI_SYNC.md)
- [Config pool JSON example](docs/config-pool-example.json)
- [Config pool CSV example](docs/config-pool-example.csv)

## Order flow

1. User adds plan to cart and signs in
2. `create-order` Edge Function creates order + OxaPay invoice
3. OxaPay webhook on `paid` status triggers fulfillment
4. Matching config assigned from pool → subscription created → Resend email sent
5. Config visible in Client Portal

If no matching config exists, order status becomes `awaiting_inventory` and admin is emailed.
