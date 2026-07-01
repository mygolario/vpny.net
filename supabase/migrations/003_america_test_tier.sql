-- Temporary test tier for VPNy America E2E email validation (see docs/AMERICA_TEST_CLEANUP.md)

ALTER TABLE public.config_pool
  DROP CONSTRAINT IF EXISTS config_pool_product_tier_check;

ALTER TABLE public.config_pool
  ADD CONSTRAINT config_pool_product_tier_check
  CHECK (product_tier IN ('general', 'professional', 'ultimate', 'creator', 'america'));

ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_product_tier_check;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_tier_check
  CHECK (product_tier IN ('general', 'professional', 'ultimate', 'creator', 'america'));
