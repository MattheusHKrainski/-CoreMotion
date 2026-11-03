-- Remove the retired official-store catalog data.
-- Keep the products table and C2C rows: they are still used by athlete listings.
-- Keep orders as historical records; their two existing rows are not deleted here.
BEGIN;

DELETE FROM public.products
WHERE product_type = 'b2c';

DELETE FROM public.stores;

-- Ensure any surviving C2C listing is detached from the retired store model.
UPDATE public.products
SET store_id = NULL,
    store_name = NULL,
    is_verified_store = false
WHERE product_type = 'c2c'
  AND (store_id IS NOT NULL OR store_name IS NOT NULL OR is_verified_store IS DISTINCT FROM false);

COMMENT ON TABLE public.stores IS
  'Retired legacy structure. Data purged by 20261103010000_retire_legacy_store_data; remove table after application/test references are migrated.';

COMMIT;
