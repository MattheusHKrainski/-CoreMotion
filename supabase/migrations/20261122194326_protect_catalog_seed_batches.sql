-- The batch ledger is internal bookkeeping, not a public Data API resource.
-- Server maintenance uses the privileged database connection and keeps working.
ALTER TABLE public.catalog_seed_batches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.catalog_seed_batches FROM anon, authenticated;
