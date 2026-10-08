-- =============================================================================
-- CoreMotiom — Hierarquia de papéis e endurecimento de segurança
--
--   admin       → Administrador: acesso total (papéis, exclusão de contas, moderação)
--   supervisor  → Supervisor: moderação (suspende atletas/lojistas, verifica lojas,
--                 modera comunidade, gerencia pedidos e anúncios)
--   seller      → Lojista: gerencia a própria loja e anúncios B2C
--   user        → Atleta/Usuário: compra, anuncia C2C, participa da comunidade
--
-- Executar DEPOIS de 20250101000000_coremotiom_initial_schema.sql.
-- Idempotente: pode ser executada mais de uma vez sem erro.
--
-- Correções de segurança incluídas:
--   1. O papel não é mais aceito dos metadados do cadastro (escalonamento para admin).
--   2. E-mails de conta-mestre são comparados de forma EXATA (sem prefixos).
--   3. Usuários não alteram papel, e-mail, suspensão, verificação de loja, status de
--      pagamento ou de pedido. Essas colunas são protegidas por triggers.
--   4. Políticas RLS antigas (algumas com USING (true) ou "qualquer autenticado") são
--      removidas e substituídas por regras de dono ou de staff.
--   5. Privilégios amplos (GRANT ALL, inclusive TRUNCATE, que o RLS não controla) são revogados.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Contas-mestre (lista única; manter em sincronia com lib/permissions.ts)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_master_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(coalesce(p_email, '')) IN (
    'mattheusxmljz@gmail.com',
    'operacaoamd@gmail.com',
    'professorchines2026@gmail.com',
    'admin@coremotiom.com'
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. Colunas de papel e suspensão
-- -----------------------------------------------------------------------------
UPDATE public.profiles SET role = 'seller' WHERE role = 'merchant';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'supervisor', 'seller', 'user'));
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

UPDATE public.profiles SET role = 'admin' WHERE public.is_master_email(email);

-- -----------------------------------------------------------------------------
-- 3. Funções de autorização (SECURITY DEFINER com search_path fixo)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_master_email(auth.jwt() ->> 'email')
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin' AND NOT p.is_banned
      );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'supervisor' AND NOT p.is_banned
      );
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_banned_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT p.is_banned FROM public.profiles p WHERE p.id = auth.uid()), false);
$$;

-- -----------------------------------------------------------------------------
-- 4. Criação de perfil: o papel vem apenas de regras do servidor (conta-mestre → admin)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, avatar_url, role, city, state, sport_interests, created_at, updated_at
  ) VALUES (
    NEW.id,
    lower(NEW.email),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data ->> 'avatar_url',
    CASE WHEN public.is_master_email(NEW.email) THEN 'admin' ELSE 'user' END,
    COALESCE(NEW.raw_user_meta_data ->> 'city', 'São Paulo'),
    COALESCE(NEW.raw_user_meta_data ->> 'state', 'SP'),
    ARRAY['Corrida', 'Alta Performance'],
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        role = CASE WHEN public.is_master_email(EXCLUDED.email) THEN 'admin' ELSE public.profiles.role END,
        updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. Triggers de proteção de colunas (valem para chamadas via API/PostgREST).
--    Conexões sem JWT (servidor com DATABASE_URL, migrações, painel) não são restringidas,
--    pois o servidor já valida o papel antes de gravar.
-- -----------------------------------------------------------------------------

-- 5.1 profiles
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin() THEN
      NEW.role := 'user';
      NEW.is_banned := false;
      NEW.ban_reason := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;       -- somente administradores alteram papéis
    NEW.email := OLD.email;     -- e-mail espelha auth.users
  END IF;

  -- Somente staff suspende/reativa; supervisor não age sobre administradores.
  IF NOT public.is_staff() OR (OLD.role = 'admin' AND NOT public.is_admin()) THEN
    NEW.is_banned := OLD.is_banned;
    NEW.ban_reason := OLD.ban_reason;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_columns ON public.profiles;
CREATE TRIGGER profiles_protect_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- 5.2 stores
CREATE OR REPLACE FUNCTION public.protect_store_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin() THEN
      NEW.owner_id := auth.uid();
    END IF;
    NEW.is_verified := false;
    NEW.verification_status := 'none';
    NEW.rating := 5.0;
    NEW.sales_count := 0;
    NEW.products_count := 0;
    RETURN NEW;
  END IF;

  IF NOT public.is_staff() THEN
    NEW.owner_id := OLD.owner_id;
    NEW.is_verified := OLD.is_verified;
    NEW.rating := OLD.rating;
    NEW.sales_count := OLD.sales_count;
    NEW.products_count := OLD.products_count;
    -- O lojista pode solicitar ('pending'), mas não aprovar ou reprovar.
    IF NEW.verification_status IN ('verified', 'rejected')
       AND NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
      NEW.verification_status := OLD.verification_status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stores_protect_columns ON public.stores;
CREATE TRIGGER stores_protect_columns
  BEFORE INSERT OR UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.protect_store_columns();

-- 5.3 products
CREATE OR REPLACE FUNCTION public.protect_product_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_seller BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin() THEN
      NEW.seller_id := auth.uid();
      NEW.is_verified_store := false;
      NEW.views := 0;
      NEW.likes_count := 0;
      IF NEW.status = 'suspended' THEN
        NEW.status := 'active';
      END IF;
      SELECT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'seller' AND NOT p.is_banned
      ) INTO is_seller;
      IF NEW.product_type = 'b2c' AND NOT is_seller THEN
        RAISE EXCEPTION 'Somente lojistas podem publicar anúncios B2C';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF NOT public.is_staff() THEN
    NEW.seller_id := OLD.seller_id;
    NEW.views := OLD.views;
    NEW.likes_count := OLD.likes_count;
    NEW.is_verified_store := OLD.is_verified_store;
    IF NEW.status = 'suspended' AND OLD.status IS DISTINCT FROM 'suspended' THEN
      NEW.status := OLD.status;   -- somente moderadores suspendem anúncios
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_protect_columns ON public.products;
CREATE TRIGGER products_protect_columns
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.protect_product_columns();

-- 5.4 orders: cliente não define pagamento nem status operacional
CREATE OR REPLACE FUNCTION public.protect_order_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_staff() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.user_id := auth.uid();
    NEW.payment_status := 'pending';
    NEW.order_status := 'pending_payment';
    NEW.tracking_code := NULL;
    RETURN NEW;
  END IF;

  NEW.user_id := OLD.user_id;
  NEW.subtotal := OLD.subtotal;
  NEW.shipping_fee := OLD.shipping_fee;
  NEW.discount := OLD.discount;
  NEW.total := OLD.total;
  NEW.payment_status := OLD.payment_status;
  NEW.tracking_code := OLD.tracking_code;
  -- O cliente só pode cancelar um pedido ainda não pago.
  IF NOT (OLD.order_status = 'pending_payment' AND NEW.order_status = 'cancelled') THEN
    NEW.order_status := OLD.order_status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_protect_columns ON public.orders;
CREATE TRIGGER orders_protect_columns
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_order_columns();

-- 5.5 community_posts: qualquer atleta interage (curte, comenta, denuncia);
--     conteúdo da publicação só pode ser alterado pelo autor ou por staff.
CREATE OR REPLACE FUNCTION public.protect_community_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_staff() OR auth.uid() = OLD.author_id THEN
    RETURN NEW;
  END IF;

  NEW.author_id := OLD.author_id;
  NEW.author_name := OLD.author_name;
  NEW.author_avatar := OLD.author_avatar;
  NEW.author_badge := OLD.author_badge;
  NEW.title := OLD.title;
  NEW.content := OLD.content;
  NEW.image_url := OLD.image_url;
  NEW.category := OLD.category;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_protect_columns ON public.community_posts;
CREATE TRIGGER community_protect_columns
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.protect_community_columns();

-- -----------------------------------------------------------------------------
-- 6. Políticas RLS: remove TODAS as políticas existentes das tabelas e recria as regras.
--    (Políticas são combinadas com OR; uma política antiga permissiva anularia as novas.)
-- -----------------------------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'stores', 'products', 'orders', 'community_posts')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Contas suspensas não criam nem alteram conteúdo (is_banned_user()).
-- profiles: cada um vê o próprio perfil; staff vê todos (para moderação)
CREATE POLICY profiles_select ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_staff());
CREATE POLICY profiles_insert ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY profiles_update ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_staff())
  WITH CHECK (auth.uid() = id OR public.is_staff());
CREATE POLICY profiles_delete ON public.profiles FOR DELETE
  USING (public.is_admin());

-- stores: vitrine pública; lojista gerencia a própria loja; staff modera
CREATE POLICY stores_select ON public.stores FOR SELECT USING (true);
CREATE POLICY stores_insert ON public.stores FOR INSERT
  WITH CHECK ((auth.uid() = owner_id AND NOT public.is_banned_user()) OR public.is_admin());
CREATE POLICY stores_update ON public.stores FOR UPDATE
  USING ((auth.uid() = owner_id AND NOT public.is_banned_user()) OR public.is_staff())
  WITH CHECK ((auth.uid() = owner_id AND NOT public.is_banned_user()) OR public.is_staff());
CREATE POLICY stores_delete ON public.stores FOR DELETE
  USING (auth.uid() = owner_id OR public.is_admin());

-- products: anúncios ativos são públicos; rascunhos/suspensos só para dono e staff
CREATE POLICY products_select ON public.products FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id OR public.is_staff());
CREATE POLICY products_insert ON public.products FOR INSERT
  WITH CHECK ((auth.uid() = seller_id AND NOT public.is_banned_user()) OR public.is_admin());
CREATE POLICY products_update ON public.products FOR UPDATE
  USING ((auth.uid() = seller_id AND NOT public.is_banned_user()) OR public.is_staff())
  WITH CHECK ((auth.uid() = seller_id AND NOT public.is_banned_user()) OR public.is_staff());
CREATE POLICY products_delete ON public.products FOR DELETE
  USING (auth.uid() = seller_id OR public.is_staff());

-- orders: o comprador vê os próprios pedidos; staff gerencia todos
CREATE POLICY orders_select ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff());
CREATE POLICY orders_insert ON public.orders FOR INSERT
  WITH CHECK ((auth.uid() = user_id AND NOT public.is_banned_user()) OR public.is_admin());
CREATE POLICY orders_update ON public.orders FOR UPDATE
  USING ((auth.uid() = user_id AND NOT public.is_banned_user()) OR public.is_staff())
  WITH CHECK ((auth.uid() = user_id AND NOT public.is_banned_user()) OR public.is_staff());
CREATE POLICY orders_delete ON public.orders FOR DELETE
  USING (public.is_admin());

-- community_posts: leitura pública; publicação pelo próprio autor;
-- interações por qualquer atleta ativo (regras de colunas no trigger);
-- exclusão pelo autor ou por staff
CREATE POLICY community_select ON public.community_posts FOR SELECT USING (true);
CREATE POLICY community_insert ON public.community_posts FOR INSERT
  WITH CHECK ((auth.uid() = author_id AND NOT public.is_banned_user()) OR public.is_admin());
CREATE POLICY community_update ON public.community_posts FOR UPDATE
  USING (auth.role() = 'authenticated' AND (NOT public.is_banned_user() OR public.is_staff()))
  WITH CHECK (auth.role() = 'authenticated' AND (NOT public.is_banned_user() OR public.is_staff()));
CREATE POLICY community_delete ON public.community_posts FOR DELETE
  USING (auth.uid() = author_id OR public.is_staff());

-- -----------------------------------------------------------------------------
-- 7. Privilégios mínimos. Anônimos apenas leem a vitrine; autenticados passam pelo RLS.
-- -----------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.products, public.stores, public.community_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- -----------------------------------------------------------------------------
-- 8. Índices de apoio às consultas de permissão e listagem
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products (seller_id);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON public.stores (owner_id);

COMMIT;
