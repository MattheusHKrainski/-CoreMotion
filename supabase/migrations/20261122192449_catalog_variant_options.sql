ALTER TABLE public.external_offers ADD COLUMN IF NOT EXISTS variant_options text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.validate_core_sale_snapshot()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
DECLARE
  line jsonb;
  offer public.external_offers%ROWTYPE;
  variant text;
BEGIN
  FOR line IN SELECT value FROM jsonb_array_elements(NEW.items) LOOP
    variant := trim(line->>'variant');
    IF jsonb_typeof(line->'variant') IS DISTINCT FROM 'string' OR length(line->>'variant') > 120 THEN
      RAISE EXCEPTION 'Variante inválida';
    END IF;
    SELECT * INTO offer FROM public.external_offers WHERE id = line->>'offerId';
    IF cardinality(offer.variant_options) > 0 AND NOT (variant = ANY(offer.variant_options)) THEN
      RAISE EXCEPTION 'O tamanho selecionado não consta no cadastro do produto.';
    END IF;
    IF offer.category IN ('Calçados','Vestuário','Roupas','Lutas','Artes Marciais') AND variant = '' THEN
      RAISE EXCEPTION 'Informe a variante desejada';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
NOTIFY pgrst, 'reload schema';
