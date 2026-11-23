-- Remove the temporary gallery of four user-submitted uniform images.
-- Keep all real CoreShop offers and athlete listings untouched.
BEGIN;
DO $guard$
BEGIN
  IF (SELECT count(*) FROM public.catalog_team_uniform_previews) <> 4
     OR EXISTS (
       SELECT 1 FROM public.catalog_team_uniform_previews
       WHERE id NOT IN (
         'user-photo-monte-carmelo-blue-orange',
         'user-photo-montes-claros-black-gold',
         'user-photo-norde-2025-blue',
         'user-photo-dentil-praia-black-women'
       )
     ) THEN
       RAISE EXCEPTION 'Unexpected records in preview gallery: preserve unrelated data';
  END IF;
END
$guard$;
DROP TABLE public.catalog_team_uniform_previews;
COMMIT;
NOTIFY pgrst, 'reload schema';
