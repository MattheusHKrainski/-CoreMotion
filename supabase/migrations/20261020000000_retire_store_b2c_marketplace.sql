-- Retire user-created B2C store listings without deleting legacy rows or columns.
-- The application now uses a separate, clearly simulated external-offer feed for B2C.

-- Legacy store profiles and their CNPJ/verification data remain in the database,
-- but the public Supabase REST roles no longer read or write that table.
REVOKE ALL PRIVILEGES ON TABLE public.stores FROM anon, authenticated;
COMMENT ON TABLE public.stores IS
  'Legacy store-profile data retained for compatibility; public application flows are retired.';

-- Hide legacy B2C product rows from PostgREST and prevent changes/deletions through
-- authenticated client roles. The rows themselves are intentionally preserved.
DROP POLICY IF EXISTS products_select ON public.products;
CREATE POLICY products_select ON public.products FOR SELECT TO anon, authenticated
  USING (
    product_type = 'c2c'
    AND (status = 'active' OR auth.uid() = seller_id OR public.is_staff())
  );

DROP POLICY IF EXISTS products_insert ON public.products;
CREATE POLICY products_insert ON public.products FOR INSERT TO authenticated
  WITH CHECK (
    product_type = 'c2c'
    AND ((auth.uid() = seller_id AND NOT public.is_banned_user()) OR public.is_admin())
  );

DROP POLICY IF EXISTS products_update ON public.products;
CREATE POLICY products_update ON public.products FOR UPDATE TO authenticated
  USING (
    product_type = 'c2c'
    AND ((auth.uid() = seller_id AND NOT public.is_banned_user()) OR public.is_staff())
  )
  WITH CHECK (
    product_type = 'c2c'
    AND ((auth.uid() = seller_id AND NOT public.is_banned_user()) OR public.is_staff())
  );

DROP POLICY IF EXISTS products_delete ON public.products;
CREATE POLICY products_delete ON public.products FOR DELETE TO authenticated
  USING (product_type = 'c2c' AND (auth.uid() = seller_id OR public.is_staff()));

-- Defense in depth: no SQL client, including a server-side writer, can add a new
-- B2C row or change a C2C row into B2C. Existing B2C rows are not rewritten.
CREATE OR REPLACE FUNCTION public.reject_new_b2c_product_writes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.product_type IS DISTINCT FROM 'c2c' THEN
    RAISE EXCEPTION 'Anúncios B2C não podem ser publicados no catálogo interno.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_reject_new_b2c ON public.products;
CREATE TRIGGER products_reject_new_b2c
  BEFORE INSERT OR UPDATE OF product_type ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.reject_new_b2c_product_writes();

-- The checkout remains demonstrative and C2C-only. This guard also blocks direct
-- PostgREST order inserts that reference a preserved legacy B2C product.
CREATE OR REPLACE FUNCTION public.reject_non_c2c_order_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  product_id UUID;
  item_product_type TEXT;
BEGIN
  IF jsonb_typeof(NEW.items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'O pedido precisa listar anúncios C2C.';
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(NEW.items) LOOP
    product_id := NULLIF(item #>> '{product,id}', '')::UUID;
    SELECT p.product_type
      INTO item_product_type
      FROM public.products AS p
     WHERE p.id = product_id;

    IF item_product_type IS DISTINCT FROM 'c2c' THEN
      RAISE EXCEPTION 'O checkout interno aceita apenas anúncios C2C entre atletas.';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_z_c2c_only_items ON public.orders;
CREATE TRIGGER orders_z_c2c_only_items
  BEFORE INSERT OR UPDATE OF items ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.reject_non_c2c_order_items();
