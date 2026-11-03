-- Tabela dedicada para gestão administrativa da vitrine de Ofertas externas / links de afiliados.
-- Separada de public.products para manter intacto o isolamento C2C do checkout interno.

CREATE TABLE IF NOT EXISTS public.external_offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(btrim(title)) >= 3),
  description TEXT NOT NULL DEFAULT '',
  store_name TEXT NOT NULL CHECK (char_length(btrim(store_name)) >= 2),
  category TEXT NOT NULL DEFAULT 'Equipamentos',
  sport TEXT NOT NULL DEFAULT 'Corrida',
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  original_price NUMERIC(12, 2),
  image_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  coupon_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_external_offers_active_created
  ON public.external_offers (is_active, created_at DESC);

ALTER TABLE public.external_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS external_offers_select ON public.external_offers;
CREATE POLICY external_offers_select ON public.external_offers
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS external_offers_insert ON public.external_offers;
CREATE POLICY external_offers_insert ON public.external_offers
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS external_offers_update ON public.external_offers;
CREATE POLICY external_offers_update ON public.external_offers
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS external_offers_delete ON public.external_offers;
CREATE POLICY external_offers_delete ON public.external_offers
  FOR DELETE TO authenticated
  USING (public.is_staff());
