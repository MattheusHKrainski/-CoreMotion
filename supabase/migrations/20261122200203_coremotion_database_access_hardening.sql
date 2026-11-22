-- Database safety hardening: remove redundant read policies while retaining staff write access.

DROP POLICY IF EXISTS likes_read_own ON public.community_likes;

DROP POLICY IF EXISTS coaches_staff_write ON public.coaches;

CREATE POLICY coaches_staff_insert ON public.coaches FOR INSERT TO authenticated WITH CHECK ((select public.is_staff()));

CREATE POLICY coaches_staff_update ON public.coaches FOR UPDATE TO authenticated USING ((select public.is_staff())) WITH CHECK ((select public.is_staff()));

CREATE POLICY coaches_staff_delete ON public.coaches FOR DELETE TO authenticated USING ((select public.is_staff()));

DROP POLICY IF EXISTS news_staff_write ON public.news;

CREATE POLICY news_staff_insert ON public.news FOR INSERT TO authenticated WITH CHECK ((select public.is_staff()));

CREATE POLICY news_staff_update ON public.news FOR UPDATE TO authenticated USING ((select public.is_staff())) WITH CHECK ((select public.is_staff()));

CREATE POLICY news_staff_delete ON public.news FOR DELETE TO authenticated USING ((select public.is_staff()));

REVOKE ALL ON FUNCTION public.protect_profile_privileges() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.handle_new_auth_user();

CREATE POLICY catalog_seed_batches_internal_only ON public.catalog_seed_batches FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.moderate_account(p_target uuid, p_action text, p_role text DEFAULT NULL::text, p_account_type text DEFAULT NULL::text, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'auth'
AS $function$ DECLARE target public.profiles; result jsonb; BEGIN IF auth.uid() IS NULL OR NOT public.is_staff() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF; SELECT * INTO target FROM public.profiles WHERE id=p_target FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Conta não encontrada.'; END IF; IF target.id=auth.uid() THEN RAISE EXCEPTION 'Esta conta é protegida.' USING ERRCODE='42501'; END IF; IF p_action IN ('role','delete') AND public.is_master_email(target.email) THEN RAISE EXCEPTION 'Conta protegida: identidade administrativa principal.' USING ERRCODE='42501'; END IF; IF p_action IN ('role','delete') AND NOT public.is_admin() THEN RAISE EXCEPTION 'Somente administradores podem excluir contas ou alterar papéis.' USING ERRCODE='42501'; END IF; IF NOT public.is_admin() AND target.role IN ('admin','supervisor') THEN RAISE EXCEPTION 'Supervisores não moderam outras contas da equipe.' USING ERRCODE='42501'; END IF; IF p_action='role' THEN IF p_role IS NULL OR p_role NOT IN ('user','supervisor','admin') OR p_account_type IS NULL OR p_account_type NOT IN ('athlete','coach','casual') THEN RAISE EXCEPTION 'Papel ou tipo de conta inválido.'; END IF; UPDATE public.profiles SET role=p_role,account_type=p_account_type,updated_at=now() WHERE id=p_target; ELSIF p_action IN ('ban','unban') THEN IF p_action='ban' AND length(btrim(coalesce(p_reason,'')))<5 THEN RAISE EXCEPTION 'Informe o motivo da suspensão (mínimo 5 caracteres).'; END IF; UPDATE public.profiles SET is_banned=(p_action='ban'),ban_reason=CASE WHEN p_action='ban' THEN left(p_reason,2000) ELSE NULL END,updated_at=now() WHERE id=p_target; IF p_action='ban' THEN DELETE FROM auth.sessions WHERE user_id=p_target; END IF; ELSIF p_action='delete' THEN DELETE FROM auth.users WHERE id=p_target; ELSE RAISE EXCEPTION 'Ação inválida.'; END IF; INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),'account_'||p_action,p_target::text,left(p_reason,2000)); SELECT to_jsonb(p) INTO result FROM public.profiles p WHERE id=p_target; RETURN coalesce(result,jsonb_build_object('deleted',true)); END $function$
;

NOTIFY pgrst, 'reload schema';