-- Protect real product galleries against accidental truncation and unrelated images.
-- Keeps the authenticated/current user's usual RLS and permissions unchanged.
CREATE OR REPLACE FUNCTION public.normalize_external_offer_gallery()
RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog
AS $body$
DECLARE candidates text[];
BEGIN
  NEW.image_url := btrim(NEW.image_url);
  IF NEW.image_url !~ '^https://' THEN
    RAISE EXCEPTION 'A imagem principal deve ser HTTPS';
  END IF;
  IF TG_OP='UPDATE' AND NEW.image_url IS DISTINCT FROM OLD.image_url
    AND NEW.image_urls IS NOT DISTINCT FROM OLD.image_urls
  THEN
    candidates := ARRAY[NEW.image_url] || array_remove(coalesce(OLD.image_urls, '{}'::text[]), OLD.image_url);
  ELSE
    candidates := ARRAY[NEW.image_url] || coalesce(NEW.image_urls, '{}'::text[]);
  END IF;
  SELECT coalesce(array_agg(photo ORDER BY ordinal), ARRAY[NEW.image_url])
  INTO NEW.image_urls
  FROM (
    SELECT btrim(u) AS photo, min(ord) AS ordinal
    FROM unnest(candidates) WITH ORDINALITY AS inp(u,ord)
    WHERE u IS NOT NULL AND btrim(u) LIKE 'https://%'
    GROUP BY btrim(u)
  ) AS ordered;
  NEW.image_urls := NEW.image_urls[1:12];
  RETURN NEW;
END;
$body$;
REVOKE ALL ON FUNCTION public.normalize_external_offer_gallery() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS external_offers_normalize_gallery ON public.external_offers;
CREATE TRIGGER external_offers_normalize_gallery BEFORE INSERT OR UPDATE ON public.external_offers
FOR EACH ROW EXECUTE FUNCTION public.normalize_external_offer_gallery();
DO $constraint$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='external_offers_gallery_primary_check') THEN
    ALTER TABLE public.external_offers ADD CONSTRAINT external_offers_gallery_primary_check
    CHECK (cardinality(image_urls)>=1 AND image_url=image_urls[1]);
  END IF;
END $constraint$;

-- Public-facing seed C2C listings should not include an unrelated stock third photograph.
-- Keep existing first/second product photographs, original listings, and user-owned data.
UPDATE public.products
SET images=images[1:2], updated_at=now()
WHERE id IN ('93cfd6c1-b7f2-4bdb-a496-0e1cff4e91eb','e81a1d5d-c0ea-4928-a3c6-fc6159e84ad4')
  AND cardinality(images)=3 AND images[3] LIKE 'https://images.unsplash.com/%';
-- A Nike-branded demo card had an ASICS product photograph; do not misrepresent its model.
UPDATE public.products
SET images=ARRAY['/products/image-unavailable.svg']::text[],image_is_reference=true,updated_at=now()
WHERE id='a8227c26-8a3b-4b9e-811c-347598f56c36'
  AND images=ARRAY['/products/asics-gel-nimbus-1.jpg']::text[];

NOTIFY pgrst, 'reload schema';