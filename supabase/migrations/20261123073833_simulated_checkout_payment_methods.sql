-- Payment method selection for the CoreMotion TCC demonstration checkout.
-- This is not a bank/card integration, and it cannot charge a customer.
ALTER TABLE public.core_sale_orders
  ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.core_sale_orders
  DROP CONSTRAINT IF EXISTS core_sale_orders_payment_method_check;
ALTER TABLE public.core_sale_orders
  ADD CONSTRAINT core_sale_orders_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('pix','credit','debit','boleto'));

CREATE OR REPLACE FUNCTION public.confirm_demo_order(
  p_items jsonb, p_address jsonb, p_request_key uuid, p_method text
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog
AS $payment$
DECLARE order_id uuid;
DECLARE previous_method text;
BEGIN
  IF p_method IS NULL OR p_method NOT IN ('pix','credit','debit','boleto') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida';
  END IF;
  -- Existing owner-aware preparation checks the current catalog price and stock,
  -- validates the address, locks the request key, and deduplicates retries.
  order_id := public.prepare_core_sale(p_items,p_address,p_request_key);
  SELECT payment_method INTO STRICT previous_method
    FROM public.core_sale_orders
    WHERE id=order_id AND owner=auth.uid() FOR UPDATE;
  IF previous_method IS NOT NULL AND previous_method <> p_method THEN
    RAISE EXCEPTION 'Pedido já confirmado com outra forma de pagamento';
  END IF;
  PERFORM public.simulate_core_sale_payment(order_id);
  UPDATE public.core_sale_orders
    SET payment_method=p_method
    WHERE id=order_id AND payment_method IS NULL;
  RETURN order_id;
END;
$payment$;
REVOKE ALL ON FUNCTION public.confirm_demo_order(jsonb,jsonb,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_demo_order(jsonb,jsonb,uuid,text) TO authenticated;
NOTIFY pgrst, 'reload schema';
