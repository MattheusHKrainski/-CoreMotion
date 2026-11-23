CREATE TABLE public.account_trash (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 deleted_at timestamptz NOT NULL DEFAULT now(), purge_after timestamptz NOT NULL DEFAULT now()+interval '30 days',
 deleted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 previous_banned boolean NOT NULL, previous_reason text,
 CHECK(purge_after>=deleted_at)
);
ALTER TABLE public.account_trash ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_trash FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.account_trash TO authenticated;
CREATE POLICY account_trash_staff_read ON public.account_trash FOR SELECT TO authenticated USING(public.is_staff() AND NOT public.is_banned_user());
CREATE FUNCTION public.is_account_trashed(p_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$ SELECT EXISTS(SELECT 1 FROM public.account_trash WHERE user_id=p_id); $$;
REVOKE ALL ON FUNCTION public.is_account_trashed(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_account_trashed(uuid) TO anon,authenticated;
CREATE POLICY trash_hide_profiles ON public.profiles AS RESTRICTIVE FOR SELECT TO authenticated USING(NOT public.is_account_trashed(id) OR id=auth.uid() OR public.is_staff());
CREATE POLICY trash_hide_profiles_anon ON public.profiles AS RESTRICTIVE FOR SELECT TO anon USING(NOT public.is_account_trashed(id));
CREATE POLICY trash_hide_products ON public.products AS RESTRICTIVE FOR SELECT TO authenticated USING(NOT public.is_account_trashed(seller_id) OR public.is_staff());
CREATE POLICY trash_hide_products_anon ON public.products AS RESTRICTIVE FOR SELECT TO anon USING(NOT public.is_account_trashed(seller_id));
CREATE POLICY trash_hide_posts ON public.community_posts AS RESTRICTIVE FOR SELECT TO authenticated USING(NOT public.is_account_trashed(author_id) OR public.is_staff());
CREATE POLICY trash_hide_posts_anon ON public.community_posts AS RESTRICTIVE FOR SELECT TO anon USING(NOT public.is_account_trashed(author_id));
CREATE POLICY trash_hide_sports ON public.sports_records AS RESTRICTIVE FOR SELECT TO authenticated USING(NOT public.is_account_trashed(owner) OR public.is_staff());
CREATE POLICY trash_hide_sports_anon ON public.sports_records AS RESTRICTIVE FOR SELECT TO anon USING(NOT public.is_account_trashed(owner));
ALTER FUNCTION public.moderate_account(uuid,text,text,text,text) RENAME TO moderate_account_before_trash;
REVOKE ALL ON FUNCTION public.moderate_account_before_trash(uuid,text,text,text,text) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.moderate_account(p_target uuid,p_action text,p_role text DEFAULT NULL,p_account_type text DEFAULT NULL,p_reason text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE target public.profiles; archived public.account_trash;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() OR public.is_banned_user() THEN RAISE EXCEPTION 'Acesso restrito à equipe ativa.' USING ERRCODE='42501'; END IF;
 SELECT * INTO target FROM public.profiles WHERE id=p_target FOR UPDATE;
 IF target.id IS NULL THEN RAISE EXCEPTION 'Conta não encontrada.'; END IF;
 SELECT * INTO archived FROM public.account_trash WHERE user_id=p_target;
 IF p_action IN ('delete','restore') THEN
  IF NOT public.is_admin() OR p_target=auth.uid() OR public.is_master_email(target.email) THEN RAISE EXCEPTION 'Conta protegida ou operação não permitida.' USING ERRCODE='42501'; END IF;
  IF p_action='delete' THEN
   IF archived.user_id IS NOT NULL THEN RAISE EXCEPTION 'Esta conta já está na lixeira.'; END IF;
   INSERT INTO public.account_trash(user_id,deleted_by,previous_banned,previous_reason) VALUES(p_target,auth.uid(),coalesce(target.is_banned,false),target.ban_reason);
   UPDATE public.profiles SET is_banned=true,ban_reason='Conta na lixeira administrativa. Acesso bloqueado.',updated_at=now() WHERE id=p_target;
   DELETE FROM auth.sessions WHERE user_id=p_target;
  ELSE
   IF archived.user_id IS NULL OR archived.purge_after<=now() THEN RAISE EXCEPTION 'O prazo de restauração acabou ou a conta não está na lixeira.'; END IF;
   DELETE FROM public.account_trash WHERE user_id=p_target;
   UPDATE public.profiles SET is_banned=archived.previous_banned,ban_reason=archived.previous_reason,updated_at=now() WHERE id=p_target;
  END IF;
  INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),CASE WHEN p_action='delete' THEN 'account_trash' ELSE 'account_restore' END,p_target::text,CASE WHEN p_action='delete' THEN 'Lixeira administrativa por 30 dias' ELSE 'Conta restaurada; suspensão anterior preservada' END);
  RETURN jsonb_build_object('success',true);
 END IF;
 IF archived.user_id IS NOT NULL THEN RAISE EXCEPTION 'Restaure a conta antes de moderá-la.'; END IF;
 RETURN public.moderate_account_before_trash(p_target,p_action,p_role,p_account_type,p_reason);
END $$;
REVOKE ALL ON FUNCTION public.moderate_account(uuid,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_account(uuid,text,text,text,text) TO authenticated;
CREATE FUNCTION public.guard_trashed_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 IF public.is_account_trashed(OLD.id) AND (NOT coalesce(NEW.is_banned,false) OR NEW.role IS DISTINCT FROM OLD.role OR NEW.account_type IS DISTINCT FROM OLD.account_type) THEN RAISE EXCEPTION 'Restaure a conta pela lixeira antes de alterar acesso ou permissões.'; END IF;
 RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.guard_trashed_profile() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_trashed_profile BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_trashed_profile();
NOTIFY pgrst,'reload schema';
