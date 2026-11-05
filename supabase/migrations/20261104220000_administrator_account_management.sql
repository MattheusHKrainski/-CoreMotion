-- Reconcile the live legacy CHECK: it did not permit the supervisor role.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK(role IN ('user','seller','merchant','supervisor','admin'));

-- Privileges follow the stored role. A historical email cannot override a demotion.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin' AND NOT coalesce(is_banned,false));
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- An account deleted and recreated must not recover admin privileges by email.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
DECLARE requested_type text;
BEGIN
 requested_type := CASE WHEN NEW.raw_user_meta_data->>'account_type' IN ('athlete','coach','casual') THEN NEW.raw_user_meta_data->>'account_type' ELSE 'athlete' END;
 INSERT INTO public.profiles(id,email,name,avatar_url,role,account_type,city,state,sport_interests,is_banned,created_at,updated_at)
 VALUES(NEW.id,lower(NEW.email),coalesce(nullif(NEW.raw_user_meta_data->>'name',''),nullif(NEW.raw_user_meta_data->>'full_name',''),split_part(NEW.email,'@',1)),coalesce(NEW.raw_user_meta_data->>'avatar_url',NEW.raw_user_meta_data->>'picture'),'user',requested_type,coalesce(NEW.raw_user_meta_data->>'city',''),coalesce(NEW.raw_user_meta_data->>'state',''),CASE WHEN length(btrim(NEW.raw_user_meta_data->>'sport')) BETWEEN 1 AND 60 THEN ARRAY[btrim(NEW.raw_user_meta_data->>'sport')] ELSE ARRAY[]::text[] END,false,now(),now())
 ON CONFLICT(id) DO UPDATE SET email=excluded.email,updated_at=now();
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.moderate_account(p_target uuid, p_action text, p_role text DEFAULT NULL, p_account_type text DEFAULT NULL, p_reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
DECLARE target public.profiles; result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF;
 SELECT * INTO target FROM public.profiles WHERE id=p_target FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Conta não encontrada.'; END IF;
 IF target.id=auth.uid() THEN RAISE EXCEPTION 'Esta conta é protegida.' USING ERRCODE='42501'; END IF;
 IF p_action IN ('role','delete') AND NOT public.is_admin() THEN RAISE EXCEPTION 'Somente administradores podem excluir contas ou alterar papéis.' USING ERRCODE='42501'; END IF;
 IF NOT public.is_admin() AND target.role IN ('admin','supervisor') THEN RAISE EXCEPTION 'Supervisores não moderam outras contas da equipe.' USING ERRCODE='42501'; END IF;
 IF p_action='role' THEN
   IF p_role IS NULL OR p_role NOT IN ('user','supervisor','admin') OR p_account_type IS NULL OR p_account_type NOT IN ('athlete','coach','casual') THEN RAISE EXCEPTION 'Papel ou tipo de conta inválido.'; END IF;
   UPDATE public.profiles SET role=p_role,account_type=p_account_type,updated_at=now() WHERE id=p_target;
 ELSIF p_action IN ('ban','unban') THEN
   IF p_action='ban' AND length(btrim(coalesce(p_reason,'')))<5 THEN RAISE EXCEPTION 'Informe o motivo da suspensão (mínimo 5 caracteres).'; END IF;
   UPDATE public.profiles SET is_banned=(p_action='ban'),ban_reason=CASE WHEN p_action='ban' THEN left(p_reason,2000) ELSE NULL END,updated_at=now() WHERE id=p_target;
   IF p_action='ban' THEN DELETE FROM auth.sessions WHERE user_id=p_target; END IF;
 ELSIF p_action='delete' THEN
   DELETE FROM auth.users WHERE id=p_target;
 ELSE RAISE EXCEPTION 'Ação inválida.';
 END IF;
 INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),'account_'||p_action,p_target::text,left(p_reason,2000));
 SELECT to_jsonb(p) INTO result FROM public.profiles p WHERE id=p_target;
 RETURN coalesce(result,jsonb_build_object('deleted',true));
END $$;
REVOKE ALL ON FUNCTION public.moderate_account(uuid,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.moderate_account(uuid,text,text,text,text) TO authenticated;

-- Self-deletion is denied even if someone bypasses the account moderation UI.
DROP POLICY IF EXISTS profiles_delete ON public.profiles;
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated USING(public.is_admin() AND id<>auth.uid());
