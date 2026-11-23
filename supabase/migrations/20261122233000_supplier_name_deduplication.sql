-- Merge capitalization/whitespace duplicates without losing notes or inventing agreements.
DO $$ DECLARE item record; BEGIN
 FOR item IN SELECT lower(regexp_replace(btrim(name),'\s+',' ','g')) AS key,min(name) AS canonical,
 CASE WHEN count(DISTINCT agreement_status)=1 THEN min(agreement_status) ELSE 'unconfirmed' END AS status,
 coalesce(string_agg(DISTINCT nullif(operation_notes,''),E'\n\n'),'') AS notes
 FROM public.core_supplier_settings GROUP BY 1 HAVING count(*)>1 LOOP
  IF length(item.notes)>2000 THEN RAISE EXCEPTION 'Consolide manualmente as notas do fornecedor % antes de continuar.',item.canonical; END IF;
  UPDATE public.core_supplier_settings SET agreement_status=item.status,operation_notes=item.notes WHERE name=item.canonical;
  UPDATE public.external_offers SET store_name=item.canonical WHERE lower(regexp_replace(btrim(store_name),'\s+',' ','g'))=item.key;
  DELETE FROM public.core_supplier_settings WHERE lower(regexp_replace(btrim(name),'\s+',' ','g'))=item.key AND name<>item.canonical;
 END LOOP;
END $$;
CREATE UNIQUE INDEX core_supplier_settings_normalized_name ON public.core_supplier_settings(lower(regexp_replace(btrim(name),'\s+',' ','g')));
CREATE FUNCTION public.normalize_supplier_identity() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE candidate text; incoming text;
BEGIN
 incoming:=coalesce(to_jsonb(NEW)->>'store_name',to_jsonb(NEW)->>'name');
 incoming:=regexp_replace(btrim(incoming),'\s+',' ','g');
 SELECT name INTO candidate FROM public.core_supplier_settings WHERE lower(regexp_replace(btrim(name),'\s+',' ','g'))=lower(incoming) ORDER BY name LIMIT 1;
 NEW:=jsonb_populate_record(NEW,jsonb_build_object(CASE WHEN TG_TABLE_NAME='external_offers' THEN 'store_name' ELSE 'name' END,coalesce(candidate,incoming)));
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.normalize_supplier_identity() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER normalize_supplier_setting BEFORE INSERT OR UPDATE OF name ON public.core_supplier_settings FOR EACH ROW EXECUTE FUNCTION public.normalize_supplier_identity();
CREATE TRIGGER normalize_offer_supplier BEFORE INSERT OR UPDATE OF store_name ON public.external_offers FOR EACH ROW EXECUTE FUNCTION public.normalize_supplier_identity();
NOTIFY pgrst,'reload schema';
