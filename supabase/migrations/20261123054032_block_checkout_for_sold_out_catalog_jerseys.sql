-- Preserve sold-out jerseys in the catalog while forbidding purchase at the database boundary.
ALTER TABLE public.external_offers
  ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'available';
ALTER TABLE public.external_offers DROP CONSTRAINT IF EXISTS external_offers_stock_status_check;
ALTER TABLE public.external_offers ADD CONSTRAINT external_offers_stock_status_check
  CHECK (stock_status IN ('available','sold_out'));

DO $protect$
DECLARE fn text;
BEGIN
  SELECT pg_get_functiondef('public.prepare_core_sale(jsonb,jsonb,uuid)'::regprocedure) INTO fn;
  IF fn IS NULL THEN RAISE EXCEPTION 'Cannot find protected checkout RPC'; END IF;
  IF position('AND stock_status = ''available'' FOR SHARE;' in fn) = 0 THEN
    IF position('AND is_active FOR SHARE;' in fn) = 0 THEN
      RAISE EXCEPTION 'Checkout RPC changed unexpectedly: review manually before enabling sold-out products';
    END IF;
    EXECUTE replace(fn, 'AND is_active FOR SHARE;',
      'AND is_active AND stock_status = ''available'' FOR SHARE;');
  END IF;
END
$protect$;
COMMENT ON COLUMN public.external_offers.stock_status IS
  'Supplier stock snapshot for CoreShop: sold_out remains visible but cannot be ordered; never infer available stock from an old listing.';
NOTIFY pgrst, 'reload schema';
