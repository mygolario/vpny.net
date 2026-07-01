# VPNy America Test — Cleanup Guide

Temporary assets added for the **VPNy America 6-month email E2E test**. Remove them after validation.

## When to clean up

After `node scripts/smoke-america-email.mjs` passes and you have confirmed the config delivery email in the customer inbox.

## Revert code changes

Remove the `america` test tier from:

1. [`src/lib/products.js`](../src/lib/products.js) — delete `america` from `PRODUCT_TIERS` and `PRODUCTS.america`
2. [`src/components/Plans.jsx`](../src/components/Plans.jsx) — delete `PRODUCTS.america`, `handleProductChange` branch, price branch, and `protocol` in `handleAddToCart`
3. [`supabase/functions/admin-import-pool/index.ts`](../supabase/functions/admin-import-pool/index.ts) — remove `'america'` from `PRODUCT_TIERS`

Redeploy the edge function after reverting (requires `SUPABASE_ACCESS_TOKEN` in `scripts/supabase-secrets.local.env`):

```bash
node scripts/_build-america-deploy.mjs   # optional: rebuild deploy payload after revert
npx supabase functions deploy admin-import-pool --project-ref zhfxomofodwifoxiqfjx
```

## Revert database migration

Migration [`003_america_test_tier.sql`](../supabase/migrations/003_america_test_tier.sql) added `america` to `product_tier` CHECK constraints. After cleanup, restore original constraints:

```sql
ALTER TABLE public.config_pool DROP CONSTRAINT IF EXISTS config_pool_product_tier_check;
ALTER TABLE public.config_pool ADD CONSTRAINT config_pool_product_tier_check
  CHECK (product_tier IN ('general', 'professional', 'ultimate', 'creator'));

ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_tier_check;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_tier_check
  CHECK (product_tier IN ('general', 'professional', 'ultimate', 'creator'));
```

## Delete test-only files

- [`docs/config-pool-america-test.json`](config-pool-america-test.json)
- [`scripts/smoke-america-email.mjs`](../scripts/smoke-america-email.mjs)
- [`docs/america-email-test-latest.json`](america-email-test-latest.json) (generated run log)
- This file: `docs/AMERICA_TEST_CLEANUP.md`

## Retire test pool inventory

In Supabase SQL editor (or Admin → Config Pool), retire or delete rows with `external_id` like `US-AMERICA-%`:

```sql
UPDATE public.config_pool
SET status = 'retired', updated_at = now()
WHERE external_id LIKE 'US-AMERICA-%';
```

Or delete if no longer needed:

```sql
DELETE FROM public.config_pool
WHERE external_id LIKE 'US-AMERICA-%'
  AND status IN ('available', 'retired');
```

**Note:** Rows with `status = 'assigned'` are linked to test subscriptions — leave them or delete the related test orders/subscriptions first.

## Verify cleanup

- Plans page no longer shows **VPNy America** tier tab
- `config_pool_inventory` has no `america` tier rows (or only retired/assigned leftovers you chose to keep)
- Pool import rejects `product_tier: america` after `admin-import-pool` revert
