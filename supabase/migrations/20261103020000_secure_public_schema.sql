-- CoreMotion: secure all exposed public tables and replace permissive legacy policies.
-- Legacy tables are retained for compatibility/data preservation but are not exposed.
BEGIN;

CREATE OR REPLACE FUNCTION public.is_master_email(p_email text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path = pg_catalog
AS $$
  SELECT lower(coalesce(p_email, '')) IN (
    'mattheusxmljz@gmail.com',
    'operacaoamd@gmail.com',
    'professorchines2026@gmail.com',
    'admin@coremotiom.com'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
  SELECT public.is_master_email(auth.jwt() ->> 'email')
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin' AND NOT coalesce(p.is_banned, false)
      );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
  SELECT public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'supervisor' AND NOT coalesce(p.is_banned, false)
      );
$$;

CREATE OR REPLACE FUNCTION public.is_banned_user()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
  SELECT coalesce((SELECT p.is_banned FROM public.profiles p WHERE p.id = auth.uid()), false);
$$;

-- The old public RPC contained an unsafe role assignment from user-editable metadata.
-- It is not attached to a trigger and is not part of the current auth flow.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Trigger-only function: keep it for the existing auth.users trigger, but never expose it as RPC.
ALTER FUNCTION public.handle_new_auth_user() SET search_path = pg_catalog, public, auth;
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_banned_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_banned_user() TO authenticated;

-- Remove all existing policies on the current and legacy public tables.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Enable RLS everywhere in the exposed public schema.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.relname);
  END LOOP;
END $$;

-- Start from no client privileges; grant only the current app's intended surface.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Profiles: private profile data; a user sees/edits their own profile, staff can moderate.
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id OR (SELECT public.is_staff()));
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id OR (SELECT public.is_admin()));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id OR (SELECT public.is_staff()))
  WITH CHECK ((SELECT auth.uid()) = id OR (SELECT public.is_staff()));
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- C2C listings: public sees active listings only; owners and staff manage their own scope.
CREATE POLICY products_public_read ON public.products FOR SELECT TO anon
  USING (product_type = 'c2c' AND status = 'active');
CREATE POLICY products_user_read ON public.products FOR SELECT TO authenticated
  USING (product_type = 'c2c' AND (status = 'active' OR seller_id = (SELECT auth.uid()) OR (SELECT public.is_staff())));
CREATE POLICY products_insert ON public.products FOR INSERT TO authenticated
  WITH CHECK (product_type = 'c2c' AND (((SELECT auth.uid()) = seller_id AND NOT (SELECT public.is_banned_user())) OR (SELECT public.is_admin())));
CREATE POLICY products_update ON public.products FOR UPDATE TO authenticated
  USING (product_type = 'c2c' AND (((SELECT auth.uid()) = seller_id AND NOT (SELECT public.is_banned_user())) OR (SELECT public.is_staff())))
  WITH CHECK (product_type = 'c2c' AND (((SELECT auth.uid()) = seller_id AND NOT (SELECT public.is_banned_user())) OR (SELECT public.is_staff())));
CREATE POLICY products_delete ON public.products FOR DELETE TO authenticated
  USING (product_type = 'c2c' AND (seller_id = (SELECT auth.uid()) OR (SELECT public.is_staff())));

-- Orders: never publicly readable; each buyer sees only their own records.
CREATE POLICY orders_select ON public.orders FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_staff()));
CREATE POLICY orders_insert ON public.orders FOR INSERT TO authenticated
  WITH CHECK ((user_id = (SELECT auth.uid()) AND NOT (SELECT public.is_banned_user())) OR (SELECT public.is_admin()));
CREATE POLICY orders_update ON public.orders FOR UPDATE TO authenticated
  USING ((user_id = (SELECT auth.uid()) AND NOT (SELECT public.is_banned_user())) OR (SELECT public.is_staff()))
  WITH CHECK ((user_id = (SELECT auth.uid()) AND NOT (SELECT public.is_banned_user())) OR (SELECT public.is_staff()));
CREATE POLICY orders_delete ON public.orders FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Current community feed.
CREATE POLICY community_posts_public_read ON public.community_posts FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY community_posts_insert ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = (SELECT auth.uid()) AND NOT (SELECT public.is_banned_user()));
CREATE POLICY community_posts_update ON public.community_posts FOR UPDATE TO authenticated
  USING ((author_id = (SELECT auth.uid()) AND NOT (SELECT public.is_banned_user())) OR (SELECT public.is_staff()))
  WITH CHECK ((author_id = (SELECT auth.uid()) AND NOT (SELECT public.is_banned_user())) OR (SELECT public.is_staff()));
CREATE POLICY community_posts_delete ON public.community_posts FOR DELETE TO authenticated
  USING (author_id = (SELECT auth.uid()) OR (SELECT public.is_staff()));

-- Presentation data: coaches remain publicly readable; only staff can change them.
CREATE POLICY coaches_public_read ON public.coaches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY coaches_staff_write ON public.coaches FOR ALL TO authenticated
  USING ((SELECT public.is_staff())) WITH CHECK ((SELECT public.is_staff()));

-- Published news is public; administration is restricted to staff.
CREATE POLICY news_public_read ON public.news FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY news_staff_write ON public.news FOR ALL TO authenticated
  USING ((SELECT public.is_staff())) WITH CHECK ((SELECT public.is_staff()));

-- Admin-only settings/logs; old tables remain locked until their replacement is implemented.
CREATE POLICY platform_settings_staff ON public.platform_settings FOR ALL TO authenticated
  USING ((SELECT public.is_staff())) WITH CHECK ((SELECT public.is_staff()));
CREATE POLICY admin_logs_staff_read ON public.admin_logs FOR SELECT TO authenticated
  USING ((SELECT public.is_staff()));

-- Current app table grants.
GRANT SELECT ON public.products, public.community_posts, public.coaches, public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.products, public.orders, public.community_posts, public.coaches, public.news, public.platform_settings TO authenticated;
GRANT SELECT ON public.admin_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Old schema (users/password_hash, sessions, posts, comments, likes, follows,
-- bookings, coach_services, communities, notifications) intentionally receives
-- no anon/authenticated grants. RLS is enabled above as defense in depth.

COMMIT;
