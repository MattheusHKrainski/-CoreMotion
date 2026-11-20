-- Validate snapshots even when clients bypass form validation. No inventory assertions.
CREATE FUNCTION public.validate_core_sale_snapshot() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE line jsonb; category text;
BEGIN
 FOR line IN SELECT value FROM jsonb_array_elements(NEW.items) LOOP
  IF jsonb_typeof(line->'variant') IS DISTINCT FROM 'string' OR length(line->>'variant')>120 THEN RAISE EXCEPTION 'Variante inválida'; END IF;
  SELECT e.category INTO category FROM public.external_offers e WHERE e.id=line->>'offerId';
  IF category IN ('Calçados','Vestuário','Roupas','Lutas','Artes Marciais') AND length(trim(line->>'variant'))=0 THEN RAISE EXCEPTION 'Informe a variante desejada'; END IF;
 END LOOP;
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_core_sale_snapshot BEFORE INSERT ON public.core_sale_orders FOR EACH ROW EXECUTE FUNCTION public.validate_core_sale_snapshot();
REVOKE ALL ON FUNCTION public.validate_core_sale_snapshot() FROM PUBLIC;
NOTIFY pgrst,'reload schema';
