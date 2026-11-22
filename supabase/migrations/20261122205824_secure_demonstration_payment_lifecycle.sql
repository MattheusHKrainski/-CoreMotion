-- Secure, idempotent *test-only* payment state for TCC presentations.
-- No bank, Pix, card, carrier, or external checkout integration is invoked.
ALTER TABLE public.core_sale_orders
  DROP CONSTRAINT IF EXISTS core_sale_orders_payment_status_check;
ALTER TABLE public.core_sale_orders
  ADD CONSTRAINT core_sale_orders_payment_status_check
  CHECK (payment_status IN ('disabled','test_approved','test_cancelled'));

CREATE OR REPLACE FUNCTION public.simulate_core_sale_payment(p_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog
AS $payment$
DECLARE ord public.core_sale_orders%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR public.is_banned_user()
     OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT coalesce(is_banned,false))
  THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  IF p_id IS NULL THEN RAISE EXCEPTION 'Pedido inválido'; END IF;
  SELECT * INTO ord FROM public.core_sale_orders WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR ord.owner<>auth.uid() THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
  IF ord.status='cancelled' OR ord.payment_status='test_cancelled' THEN
    RAISE EXCEPTION 'Pedido cancelado';
  END IF;
  IF ord.payment_status='test_approved' THEN RETURN 'test_approved'; END IF;
  IF ord.payment_status<>'disabled' OR ord.subtotal_cents<=0 OR
    jsonb_typeof(ord.items) <> 'array' OR jsonb_array_length(ord.items)=0
  THEN RAISE EXCEPTION 'Pedido não pode ser aprovado'; END IF;
  UPDATE public.core_sale_orders
    SET payment_status='test_approved',status='reviewing',updated_at=now()
  WHERE id=p_id;
  INSERT INTO public.core_sale_events(order_id,actor,status,note)
    VALUES (p_id,auth.uid(),'test_approved','Pagamento de demonstração aprovado');
  RETURN 'test_approved';
END;
$payment$;
REVOKE ALL ON FUNCTION public.simulate_core_sale_payment(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.simulate_core_sale_payment(uuid) TO authenticated;

-- Cancelling a test-approved preparation also clears its simulated payment state.
CREATE OR REPLACE FUNCTION public.review_core_sale(p_id uuid, p_status text, p_note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog
AS $review$
DECLARE ord public.core_sale_orders%ROWTYPE;
BEGIN
 IF auth.uid() IS NULL OR public.is_banned_user() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
 SELECT * INTO ord FROM public.core_sale_orders WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
 IF NOT public.is_staff() AND (ord.owner<>auth.uid() OR p_status<>'cancelled') THEN RAISE EXCEPTION 'Acesso negado'; END IF;
 IF p_status IS NULL OR p_status NOT IN ('reviewing','cancelled')
    OR ord.status='cancelled' OR length(coalesce(p_note,''))>2000
 THEN RAISE EXCEPTION 'Transição inválida'; END IF;
 UPDATE public.core_sale_orders
 SET status=p_status,
     payment_status=CASE WHEN p_status='cancelled' AND payment_status='test_approved'
       THEN 'test_cancelled' ELSE payment_status END,
     note=CASE WHEN public.is_staff() THEN coalesce(p_note,'') ELSE note END,
     updated_at=now()
 WHERE id=p_id;
 INSERT INTO public.core_sale_events(order_id,actor,status,note)
 VALUES(p_id,auth.uid(),p_status,CASE WHEN public.is_staff() THEN coalesce(p_note,'') ELSE 'Cancelado pelo cliente' END);
END;
$review$;
REVOKE ALL ON FUNCTION public.review_core_sale(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.review_core_sale(uuid,text,text) TO authenticated;
NOTIFY pgrst, 'reload schema';