-- Public reads must not invoke is_staff(): anon intentionally cannot execute it.
-- Keep administrative writes restricted and inactive offers private.
DROP POLICY IF EXISTS external_offers_public_read ON public.external_offers;
CREATE POLICY external_offers_public_read ON public.external_offers
  FOR SELECT TO anon USING (is_active = true);
DROP POLICY IF EXISTS external_offers_authenticated_read ON public.external_offers;
CREATE POLICY external_offers_authenticated_read ON public.external_offers
  FOR SELECT TO authenticated USING (is_active = true OR (SELECT public.is_staff()));
