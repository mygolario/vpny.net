# VPNy.net Full Automation Demo Report

**Run date:** 2026-07-01 05:38 UTC  
**Environment:** Production — [vpny-net.vercel.app](https://vpny-net.vercel.app) · Supabase `zhfxomofodwifoxiqfjx`  
**Runner:** `node scripts/smoke-full-demo.mjs`  
**Machine-readable log:** [demo-run-latest.json](./demo-run-latest.json)

---

## Summary for your friend

VPNy.net is a working automated VPN storefront. A customer picks a plan on the website, pays via OxaPay crypto, and the backend **automatically** confirms payment, assigns a config from inventory, creates an active subscription, and emails the customer — with no manual steps.

This demo used **sample pool configs** (not production s-ui servers yet). Payment was **simulated** by sending the same signed webhook OxaPay sends after a real crypto payment. That is the identical server code path used in production.

**Result: 11/11 automated checks passed** in ~11 seconds.

---

## What was tested

| # | Step | Result |
|---|------|--------|
| 1 | Auth login | Pass |
| 2 | `create-order` → real OxaPay invoice | Pass |
| 3 | Invoice URL is `pay.oxapay.com` (not demo mode) | Pass |
| 4 | Simulated OxaPay `paid` webhook (HMAC-signed) | Pass |
| 5 | Order status → `active` | Pass |
| 6 | Order item → `fulfilled` | Pass |
| 7 | Subscription row created (`active`) | Pass |
| 8 | Pool config `DE-FRA-HY2-001` assigned | Pass |
| 9 | Second order (no matching inventory) created | Pass |
| 10 | Awaiting-inventory webhook | Pass |
| 11 | Order status → `awaiting_inventory` | Pass |

---

## Fulfillment order (happy path)

| Field | Value |
|-------|-------|
| Product | VPNy Professional · Germany · Frankfurt · 50GB · 1 month · hysteria2 |
| Order ID | `66ce38ad-ba25-4af0-8f69-3cd04ee95974` |
| OxaPay track ID | `185649369` |
| Payment URL | https://pay.oxapay.com/10663061/185649369 |
| Amount | $1.40 |
| Final status | `active` |
| Subscription ID | `a1675414-f2fb-45a6-8158-1c1490b948f7` |
| Pool row | `DE-FRA-HY2-001` (`53fa0837-516c-4b15-b3aa-32fb5d72eb9c`) |
| Subscription URL | `https://sub.vpny.net/sub/REPLACE_HY2_TOKEN` |

### Audit trail

| Time (UTC) | Action | Entity |
|------------|--------|--------|
| 05:38:17 | `order_created` | order `66ce38ad…` |
| 05:38:18 | `payment_confirmed` | order `66ce38ad…` |
| 05:38:19 | `config_assigned` | order item `dc746e02…` |

---

## Awaiting-inventory order (edge path)

| Field | Value |
|-------|-------|
| Product | VPNy Ultimate AI · Norway · Oslo · 100GB · 1 month · vless |
| Order ID | `82583a22-d1c7-444d-b11f-48be3f01db08` |
| OxaPay track ID | `193163894` |
| Final status | `awaiting_inventory` |
| Admin alert | Email sent to `kavehtkts@gmail.com` (no pool match) |

---

## Screenshots

| File | Shows |
|------|-------|
| [demo-oxapay-invoice.png](./demo-screenshots/demo-oxapay-invoice.png) | Real OxaPay invoice for demo order `66ce38ad…` ($1.421 USD) |
| [demo-client-portal.png](./demo-screenshots/demo-client-portal.png) | Client Portal with active HYSTERIA2 subscription after automation |
| [demo-admin-orders.png](./demo-screenshots/demo-admin-orders.png) | Admin dashboard: `active` + `awaiting_inventory` orders |

---

## Flow diagram

```
Website checkout → create-order Edge Function → OxaPay invoice
       ↓
OxaPay paid callback → oxapay-webhook → fulfillOrder()
       ↓
assign_config_from_pool() → subscription + emails → Client Portal
```

---

## Notes

- **Payment simulation:** Webhook used valid OxaPay HMAC — same handler as live payments. No crypto was sent for this demo.
- **Sample configs:** Pool URLs contain placeholder tokens (`REPLACE_*`). Replace with real s-ui exports before launch.
- **Emails:** Check `kavehtkts@gmail.com` for payment-confirmed and config-delivery messages from `support@arioai.ir`.
- **Re-run:** `node scripts/smoke-full-demo.mjs` (requires `scripts/supabase-secrets.local.env` with OxaPay key).

---

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — full infrastructure setup
- [config-pool-example.json](./config-pool-example.json) — sample inventory format
- [SUI_SYNC.md](./SUI_SYNC.md) — importing real configs
