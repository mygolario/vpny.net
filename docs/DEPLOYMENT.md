# VPNy.net Deployment & Test Results

Deployment completed **2026-06-30** for project `zhfxomofodwifoxiqfjx` and Vercel `vpny-net`.

## Live URLs

| Service | URL |
|---------|-----|
| Production site | https://vpny-net.vercel.app |
| Custom domain | https://www.arioai.ir |
| Supabase API | https://zhfxomofodwifoxiqfjx.supabase.co |
| OxaPay webhook | https://zhfxomofodwifoxiqfjx.supabase.co/functions/v1/oxapay-webhook |

## What was deployed automatically

- **GitHub** — commit `409d463` on `main` (fulfillment automation)
- **Supabase migrations** — `001_initial_schema`, `002_admin_policies`
- **Edge Functions** (all ACTIVE, redeployed from git HEAD with Edge secrets via `Deno.env.get`):

  | Function | Version | JWT |
  |----------|---------|-----|
  | `create-order` | 5 | on |
  | `oxapay-webhook` | 6 | off |
  | `fulfill-order` | 3 | on (service-role body auth) |
  | `admin-import-pool` | 4 | on |
  | `admin-retry-fulfill` | 3 | on |

- **Edge Function secrets** — all 6 keys saved in Supabase dashboard (2026-06-30)
- **Vercel env vars** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL` (Production + Preview)
- **Production redeploy** — env vars picked up on latest deployment
- **Sample config pool** — 2 example rows from `docs/config-pool-example.json`
- **Admin account** — `kavehtkts@gmail.com` registered, email confirmed, role `admin`
- **OxaPay merchant** — CALLBACK + RETURN URLs set manually by operator

## Manual steps still required

None for core auth/checkout — all one-time setup below is **done** (2026-06-30).

## One-time setup reference (completed)

Edge secrets were set via dashboard; OxaPay callback/return URLs were set in the merchant panel.

### Option A — Dashboard

1. [Edge Function Secrets](https://supabase.com/dashboard/project/zhfxomofodwifoxiqfjx/functions/secrets) — **done** (6 keys)

2. [Auth URL Configuration](https://supabase.com/dashboard/project/zhfxomofodwifoxiqfjx/auth/url-configuration) — **done**:
   - **Site URL:** `https://vpny-net.vercel.app`
   - **Redirect URLs (3):** `https://vpny-net.vercel.app/**`, `https://www.arioai.ir/**`, `http://localhost:5173/**`

3. [OxaPay Merchant settings](https://oxapay.com) — **done**:
   - **CALLBACK URL:** `https://zhfxomofodwifoxiqfjx.supabase.co/functions/v1/oxapay-webhook`
   - **RETURN URL:** `https://vpny-net.vercel.app/?section=portal`

### Option B — Script (with PAT)

```powershell
# Create token at https://supabase.com/dashboard/account/tokens
Copy-Item scripts/supabase-secrets.local.env.example scripts/supabase-secrets.local.env
# Edit supabase-secrets.local.env with your keys + SUPABASE_ACCESS_TOKEN
.\scripts\configure-supabase.ps1
```

## Smoke test results (2026-06-30)

| Test | Result |
|------|--------|
| Site loads on Vercel | Pass |
| Supabase client + auth login | Pass |
| Admin nav after promote | Pass |
| Admin dashboard + Config Pool (2 rows) | Pass |
| `assign_config_from_pool()` RPC | Pass |
| Resend API (`support@arioai.ir`) | Pass — test email sent |
| `create-order` → real OxaPay invoice | **Pass** — `https://pay.oxapay.com/...` (not demo mode) |
| OxaPay webhook → fulfillment | **Pass** — order `200c4ac0…` → `active`, pool `DE-FRA-VLESS-001` assigned |
| Awaiting inventory path | **Pass** — order `25e08beb…` (Ultimate · Norway · Oslo) → `awaiting_inventory` + admin alert email |
| Fulfillment delivery email | **Pass** (via webhook simulation with valid HMAC) |
| Auth redirect URLs in dashboard | **Pass** — Site URL + 3 redirect URLs saved |

Run smoke scripts locally:

```bash
node scripts/smoke-create-order.mjs
node scripts/smoke-webhook.mjs <orderId> <trackId>
node scripts/smoke-awaiting-inventory.mjs
```

### Admin login (smoke test account)

- Email: `kavehtkts@gmail.com`
- Password: set during deployment smoke test — change in Supabase Auth or site profile after go-live

## Swap in real configs

1. Export configs from s-ui (see `docs/SUI_SYNC.md`)
2. Match **exact** fields: `product_tier`, `country`, `city`, `traffic_gb`, `duration_days`, `protocol`
3. Admin → **Config Pool** → paste JSON/CSV or use import API
4. Retire example rows (`DE-FRA-VLESS-001`, `DE-FRA-HY2-001`) after real inventory is loaded
5. Run one live order end-to-end

## Switch email to vpny.net

1. Verify `vpny.net` in [Resend Domains](https://resend.com/domains)
2. Update Supabase secret: `RESEND_FROM_EMAIL=support@vpny.net`
3. No code changes required

## Security notes

- API keys were shared in chat during setup — rotate OxaPay and Resend keys before public launch if desired
- Never commit `scripts/supabase-secrets.local.env` or `.env` files
- `ENCRYPTION_KEY` must stay stable once configs are encrypted in the pool

## Redeploy Edge Functions

Build git-HEAD bundles (fixes `./_shared/` import paths for MCP deploy):

```bash
node scripts/build-head-deploy.mjs
```

Output: `scripts/mcp-*-head.json`. Deploy each via Supabase MCP `deploy_edge_function` or the Supabase Dashboard.

## Automation demo

A full end-to-end proof run (checkout → OxaPay → webhook → fulfillment → portal) is documented in [DEMO_REPORT.md](./DEMO_REPORT.md). Re-run with:

```bash
node scripts/smoke-full-demo.mjs
```
