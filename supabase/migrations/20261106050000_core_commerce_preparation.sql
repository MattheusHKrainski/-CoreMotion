-- CoreMotion-owned commerce preparation. Intentionally incapable of payment/fulfilment.
-- No changes to C2C products, cart or orders. Retail prices come from external_offers.
CREATE TABLE public.core_supplier_settings (
 name text PRIMARY KEY, agreement_status text NOT NULL DEFAULT 'unconfirmed' CHECK (agreement_status IN ('unconfirmed','negotiating','approved')),
 operation_notes text NOT NULL DEFAULT '' CHECK(length(operation_notes)<=2000), updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.core_supplier_settings(name) SELECT DISTINCT store_name FROM public.external_offers ON CONFLICT DO NOTHING;
ALTER TABLE public.core_supplier_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.core_supplier_settings FROM anon,authenticated;
GRANT SELECT, INSERT ON public.core_supplier_settings TO authenticated;
GRANT UPDATE(agreement_status,operation_notes) ON public.core_supplier_settings TO authenticated;
CREATE POLICY core_suppliers_staff ON public.core_supplier_settings FOR ALL TO authenticated USING(public.is_staff() AND NOT public.is_banned_user()) WITH CHECK(public.is_staff() AND NOT public.is_banned_user());

CREATE TABLE public.core_sale_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner uuid NOT NULL REFERENCES public.profiles(id), request_key uuid NOT NULL,
 status text NOT NULL DEFAULT 'preparation' CHECK(status IN ('preparation','reviewing','cancelled')),
 payment_status text NOT NULL DEFAULT 'disabled' CHECK(payment_status='disabled'),
 shipping_status text NOT NULL DEFAULT 'not_quoted' CHECK(shipping_status='not_quoted'),
 subtotal_cents bigint NOT NULL CHECK(subtotal_cents>0), shipping_cents bigint CHECK(shipping_cents IS NULL), total_cents bigint CHECK(total_cents IS NULL),
 address jsonb NOT NULL, items jsonb NOT NULL, note text NOT NULL DEFAULT '' CHECK(length(note)<=2000),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(owner,request_key)
);
CREATE INDEX core_sale_orders_owner_created ON public.core_sale_orders(owner,created_at DESC);
ALTER TABLE public.core_sale_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.core_sale_orders FROM anon,authenticated;
GRANT SELECT ON public.core_sale_orders TO authenticated;
CREATE POLICY core_orders_read ON public.core_sale_orders FOR SELECT TO authenticated USING(owner=auth.uid() OR (public.is_staff() AND NOT public.is_banned_user()));

CREATE FUNCTION public.prepare_core_sale(p_items jsonb,p_address jsonb,p_request_key uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE line jsonb; offer public.external_offers%ROWTYPE; snapshot jsonb='[]'; subtotal bigint=0; qty integer; result uuid; k text; seen text[]='{}'; itemkey text;
BEGIN
 IF auth.uid() IS NULL OR public.is_banned_user() OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid()) THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
 IF p_request_key IS NULL THEN RAISE EXCEPTION 'Identificador obrigatório'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text || p_request_key::text,0));
 SELECT id INTO result FROM public.core_sale_orders WHERE owner=auth.uid() AND request_key=p_request_key;
 IF FOUND THEN RETURN result; END IF;
 IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 30 THEN RAISE EXCEPTION 'Carrinho inválido'; END IF;
 IF jsonb_typeof(p_address) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Endereço inválido'; END IF;
 FOREACH k IN ARRAY ARRAY['recipient','phone','postalCode','street','number','district','city','state'] LOOP
  IF jsonb_typeof(p_address->k) IS DISTINCT FROM 'string' OR length(trim(p_address->>k)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Endereço incompleto'; END IF;
 END LOOP;
 IF regexp_replace(p_address->>'postalCode','\D','','g') !~ '^\d{8}$' OR p_address->>'state' !~ '^[A-Z]{2}$' OR regexp_replace(p_address->>'phone','\D','','g') !~ '^\d{10,13}$' OR length(coalesce(p_address->>'complement',''))>200 THEN RAISE EXCEPTION 'CEP, UF ou telefone inválido'; END IF;
 IF (SELECT count(*) FROM public.core_sale_orders WHERE owner=auth.uid() AND created_at>now()-interval '1 hour')>=20 THEN RAISE EXCEPTION 'Limite de preparações atingido. Tente mais tarde.'; END IF;
 FOR line IN SELECT value FROM jsonb_array_elements(p_items) LOOP
  IF jsonb_typeof(line->'quantity') IS DISTINCT FROM 'number' OR line->>'quantity' !~ '^(10|[1-9])$' OR length(coalesce(line->>'variant',''))>120 OR jsonb_typeof(line->'offerId') IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'Item inválido'; END IF;
  qty=(line->>'quantity')::integer;
  itemkey=jsonb_build_array(line->>'offerId',trim(coalesce(line->>'variant','')))::text;
  IF itemkey=ANY(seen) THEN RAISE EXCEPTION 'Item duplicado'; END IF; seen=array_append(seen,itemkey);
  SELECT * INTO offer FROM public.external_offers WHERE id=line->>'offerId' AND is_active FOR SHARE;
  IF NOT FOUND OR offer.price<=0 OR offer.price>9999999 THEN RAISE EXCEPTION 'Produto indisponível'; END IF;
  subtotal=subtotal+round(offer.price*100)::bigint*qty;
  snapshot=snapshot || jsonb_build_array(jsonb_build_object('offerId',offer.id,'title',offer.title,'supplier',offer.store_name,'quantity',qty,'variant',trim(coalesce(line->>'variant','')),'unitPriceCents',round(offer.price*100)::bigint));
 END LOOP;
 INSERT INTO public.core_sale_orders(owner,request_key,subtotal_cents,address,items) VALUES(auth.uid(),p_request_key,subtotal,
 jsonb_build_object('recipient',p_address->>'recipient','phone',p_address->>'phone','postalCode',p_address->>'postalCode','street',p_address->>'street','number',p_address->>'number','complement',coalesce(p_address->>'complement',''),'district',p_address->>'district','city',p_address->>'city','state',p_address->>'state'),snapshot) RETURNING id INTO result;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.prepare_core_sale(jsonb,jsonb,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_core_sale(jsonb,jsonb,uuid) TO authenticated;

CREATE TABLE public.core_sale_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.core_sale_orders(id), actor uuid NOT NULL REFERENCES public.profiles(id), status text NOT NULL, note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.core_sale_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.core_sale_events FROM anon,authenticated;
GRANT SELECT ON public.core_sale_events TO authenticated;
CREATE POLICY core_events_read ON public.core_sale_events FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.core_sale_orders o WHERE o.id=order_id AND (o.owner=auth.uid() OR (public.is_staff() AND NOT public.is_banned_user()))));

CREATE FUNCTION public.review_core_sale(p_id uuid,p_status text,p_note text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.core_sale_orders%ROWTYPE;
BEGIN
 IF auth.uid() IS NULL OR public.is_banned_user() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
 SELECT * INTO o FROM public.core_sale_orders WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
 IF NOT public.is_staff() AND (o.owner<>auth.uid() OR p_status<>'cancelled') THEN RAISE EXCEPTION 'Acesso negado'; END IF;
 IF p_status IS NULL OR p_status NOT IN ('reviewing','cancelled') OR o.status='cancelled' OR length(coalesce(p_note,''))>2000 THEN RAISE EXCEPTION 'Transição inválida'; END IF;
 UPDATE public.core_sale_orders SET status=p_status,note=CASE WHEN public.is_staff() THEN coalesce(p_note,'') ELSE note END,updated_at=now() WHERE id=p_id;
 INSERT INTO public.core_sale_events(order_id,actor,status,note) VALUES(p_id,auth.uid(),p_status,CASE WHEN public.is_staff() THEN coalesce(p_note,'') ELSE 'Cancelado pelo cliente' END);
END; $$;
REVOKE ALL ON FUNCTION public.review_core_sale(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_core_sale(uuid,text,text) TO authenticated;
NOTIFY pgrst,'reload schema';
