-- =====================================================================
-- Correções de segurança e integridade (migração incremental).
-- As migrações anteriores não são alteradas: tudo aqui são objetos novos
-- ou substituições explícitas. Cobre os achados do relatório de análise:
--
--   C3  dono não reativa anúncio suspenso (trigger em products)
--   C4  total do pedido é recalculado no banco com os preços reais (trigger em orders)
--   C5  comunidade: não autor não remove denúncia, não apaga nem edita comentários
--       e só altera a contagem de curtidas de um em um
--   C6  verification_docs deixa de ser legível por anônimos e por outros usuários
--   --  selo is_verified_store dos anúncios acompanha a verificação da loja
--
-- Regras de frete e de desconto PIX do pedido: iguais às de lib/checkout.ts.
-- =====================================================================

-- ---------------------------------------------------------------- C3
-- Fora da equipe de moderação, um anúncio suspenso não muda de status.
-- (A rota de API também recusa a reativação; este trigger protege o acesso direto via PostgREST.)
CREATE OR REPLACE FUNCTION public.guard_suspended_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_staff() THEN
    RETURN NEW;
  END IF;
  IF OLD.status = 'suspended' OR NEW.status = 'suspended' THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_suspended_guard ON public.products;
CREATE TRIGGER products_suspended_guard
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.guard_suspended_product();

-- ---------------------------------------------------------------- C4 / C11
-- O total do pedido nunca vem do cliente: é recalculado a partir de products.price.
-- items = [{ "product": { "id": "<uuid>", ... }, "quantity": n, ... }, ...]
CREATE OR REPLACE FUNCTION public.compute_order_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  v_product_id UUID;
  v_price NUMERIC(10,2);
  v_status TEXT;
  v_qty INT;
  v_subtotal NUMERIC(10,2) := 0;
  v_shipping NUMERIC(10,2);
  v_discount NUMERIC(10,2) := 0;
BEGIN
  IF jsonb_typeof(NEW.items) IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'O pedido precisa de pelo menos um item.';
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(NEW.items) LOOP
    v_product_id := (item #>> '{product,id}')::UUID;
    v_qty := COALESCE((item ->> 'quantity')::INT, 1);
    IF v_qty < 1 OR v_qty > 99 THEN
      RAISE EXCEPTION 'Quantidade inválida no pedido.';
    END IF;
    SELECT p.price, p.status INTO v_price, v_status
      FROM public.products p WHERE p.id = v_product_id;
    IF NOT FOUND OR v_status IS DISTINCT FROM 'active' THEN
      RAISE EXCEPTION 'Anúncio indisponível para compra.';
    END IF;
    v_subtotal := v_subtotal + v_price * v_qty;
  END LOOP;

  v_shipping := CASE NEW.shipping_method
    WHEN 'pac' THEN 24.90
    WHEN 'sedex' THEN 42.50
    WHEN 'express' THEN 58.00
    ELSE NULL
  END;
  IF v_shipping IS NULL THEN
    RAISE EXCEPTION 'Método de envio inválido.';
  END IF;

  IF NEW.payment_method = 'pix' THEN
    v_discount := ROUND(v_subtotal * 0.05, 2);
  END IF;

  NEW.subtotal := v_subtotal;
  NEW.shipping_fee := v_shipping;
  NEW.discount := v_discount;
  NEW.total := v_subtotal - v_discount + v_shipping;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_compute_totals ON public.orders;
CREATE TRIGGER orders_compute_totals
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.compute_order_totals();

-- ---------------------------------------------------------------- C5
-- Engajamento da comunidade: a equipe de moderação faz qualquer alteração;
-- os demais usuários só acrescentam um comentário por vez, registram denúncias
-- e variam a contagem de curtidas de um em um.
CREATE OR REPLACE FUNCTION public.guard_community_engagement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_len INT := COALESCE(jsonb_array_length(OLD.comments), 0);
  new_len INT := COALESCE(jsonb_array_length(NEW.comments), 0);
  i INT;
BEGIN
  IF auth.uid() IS NULL OR public.is_staff() THEN
    RETURN NEW;
  END IF;

  -- Denúncia registrada só sai pela moderação.
  IF OLD.is_reported AND NOT NEW.is_reported THEN
    NEW.is_reported := true;
    NEW.report_reason := OLD.report_reason;
  END IF;

  -- Comentários: só acréscimo de um por vez; os já publicados não mudam.
  IF NEW.comments IS DISTINCT FROM OLD.comments THEN
    IF new_len <> old_len + 1 THEN
      RAISE EXCEPTION 'Comentários só podem ser acrescentados, um por vez.';
    END IF;
    FOR i IN 0 .. old_len - 1 LOOP
      IF NEW.comments -> i IS DISTINCT FROM OLD.comments -> i THEN
        RAISE EXCEPTION 'Comentários já publicados não podem ser alterados.';
      END IF;
    END LOOP;
  END IF;

  -- Curtidas: variam de um em um.
  IF abs(COALESCE(NEW.likes_count, 0) - COALESCE(OLD.likes_count, 0)) > 1 THEN
    RAISE EXCEPTION 'Alteração de curtidas inválida.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_posts_engagement_guard ON public.community_posts;
CREATE TRIGGER community_posts_engagement_guard
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.guard_community_engagement();

-- ---------------------------------------------------------------- C6
-- verification_docs (documentos enviados para verificação) não é mais lido por
-- anônimos nem por usuários comuns via PostgREST. O servidor lê essa coluna
-- aplicando a regra de dono ou moderador (lib/db-queries.ts).
REVOKE SELECT ON public.stores FROM anon, authenticated;
GRANT SELECT (
  id, owner_id, name, slug, description, logo_url, banner_url, category,
  is_verified, verification_status, verification_requested_at,
  cnpj, business_type, contact_email, contact_phone, location,
  rating, sales_count, products_count, created_at, updated_at
) ON public.stores TO anon, authenticated;

-- ---------------------------------------------------------------- Selo de loja
CREATE OR REPLACE FUNCTION public.sync_store_verified_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    UPDATE public.products SET is_verified_store = NEW.is_verified WHERE store_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stores_sync_verified_flag ON public.stores;
CREATE TRIGGER stores_sync_verified_flag
  AFTER UPDATE OF is_verified ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.sync_store_verified_flag();
