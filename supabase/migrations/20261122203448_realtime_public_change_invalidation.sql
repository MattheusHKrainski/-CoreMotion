-- A public, non-sensitive revision signal covers deletions and visibility changes which
-- Postgres Changes RLS may not deliver to users who cannot read the new row.
CREATE TABLE IF NOT EXISTS public.realtime_invalidations (
  topic text PRIMARY KEY CHECK (topic IN ('products','external_offers','community_posts')),
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  changed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.realtime_invalidations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.realtime_invalidations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.realtime_invalidations TO anon, authenticated;
DROP POLICY IF EXISTS realtime_invalidations_read ON public.realtime_invalidations;
CREATE POLICY realtime_invalidations_read ON public.realtime_invalidations FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.realtime_invalidations(topic) VALUES ('products'),('external_offers'),('community_posts')
ON CONFLICT (topic) DO NOTHING;

CREATE OR REPLACE FUNCTION public.bump_public_content_revision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog
AS $$
BEGIN
  INSERT INTO public.realtime_invalidations(topic, revision, changed_at)
    VALUES (TG_TABLE_NAME, 1, now())
  ON CONFLICT(topic) DO UPDATE
    SET revision = realtime_invalidations.revision + 1,
        changed_at = EXCLUDED.changed_at;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.bump_public_content_revision() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS products_realtime_invalidation ON public.products;
CREATE TRIGGER products_realtime_invalidation
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.bump_public_content_revision();

DROP TRIGGER IF EXISTS external_offers_realtime_invalidation ON public.external_offers;
CREATE TRIGGER external_offers_realtime_invalidation
AFTER INSERT OR UPDATE OR DELETE ON public.external_offers
FOR EACH ROW EXECUTE FUNCTION public.bump_public_content_revision();

DROP TRIGGER IF EXISTS community_posts_realtime_invalidation ON public.community_posts;
CREATE TRIGGER community_posts_realtime_invalidation
AFTER INSERT OR UPDATE OR DELETE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.bump_public_content_revision();

DO $publication$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='realtime_invalidations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_invalidations;
  END IF;
END $publication$;
NOTIFY pgrst, 'reload schema';