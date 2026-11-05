-- No service-role key is exposed to the browser. All operations check the JWT and RLS.
-- Remove a legacy trigger which bypassed the configured email-confirmation requirement.
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid WHERE t.tgrelid='auth.users'::regclass AND t.tgname='on_auth_user_created' AND (t.tgtype & 2)=2 AND p.proname='handle_new_auth_user') THEN
   DROP TRIGGER on_auth_user_created ON auth.users;
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.protect_profile_privileges() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, auth AS $$
BEGIN
 IF auth.uid() IS NULL THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN
   IF NOT public.is_admin() AND (NEW.id<>auth.uid() OR NEW.role<>'user' OR coalesce(NEW.is_banned,false) OR lower(NEW.email)<>lower(auth.jwt()->>'email')) THEN
     RAISE EXCEPTION 'Criação de perfil não permitida.' USING ERRCODE='42501';
   END IF;
   RETURN NEW;
 END IF;
 IF NOT public.is_admin() THEN
   IF NEW.id IS DISTINCT FROM OLD.id OR NEW.email IS DISTINCT FROM OLD.email OR NEW.role IS DISTINCT FROM OLD.role OR NEW.account_type IS DISTINCT FROM OLD.account_type OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
     RAISE EXCEPTION 'Somente administradores alteram identidade, papel ou tipo de conta.' USING ERRCODE='42501';
   END IF;
   IF NEW.is_banned IS DISTINCT FROM OLD.is_banned OR NEW.ban_reason IS DISTINCT FROM OLD.ban_reason THEN
     IF NOT public.is_staff() OR OLD.role IN ('admin','supervisor') OR public.is_master_email(OLD.email) OR OLD.id=auth.uid() THEN
       RAISE EXCEPTION 'Suspensão não permitida.' USING ERRCODE='42501';
     END IF;
   END IF;
   IF OLD.id<>auth.uid() AND (to_jsonb(NEW)-ARRAY['is_banned','ban_reason','updated_at']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['is_banned','ban_reason','updated_at']) THEN
     RAISE EXCEPTION 'Não é permitido editar os dados pessoais de outra conta.' USING ERRCODE='42501';
   END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_protect_columns ON public.profiles;
DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

CREATE TABLE IF NOT EXISTS public.moderation_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
 category text NOT NULL CHECK(category IN ('athlete_listing','external_offer','community','athlete_profile','trial')),
 target_id text NOT NULL CHECK(length(target_id) BETWEEN 1 AND 200),
 target_title text NOT NULL CHECK(length(target_title) BETWEEN 1 AND 300),
 reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 5 AND 2000),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewing','resolved','dismissed')),
 response text NOT NULL DEFAULT '', reviewer_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS moderation_reports_queue ON public.moderation_reports(category,status,created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_reports_reporter ON public.moderation_reports(reporter_id);
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reports_read ON public.moderation_reports;
CREATE POLICY reports_read ON public.moderation_reports FOR SELECT TO authenticated USING (NOT public.is_banned_user() AND (reporter_id=auth.uid() OR public.is_staff()));
DROP POLICY IF EXISTS reports_insert ON public.moderation_reports;
CREATE POLICY reports_insert ON public.moderation_reports FOR INSERT TO authenticated WITH CHECK (reporter_id=auth.uid() AND NOT public.is_banned_user() AND status='open' AND response='' AND reviewer_id IS NULL AND reviewed_at IS NULL);
GRANT SELECT,INSERT ON public.moderation_reports TO authenticated;
REVOKE ALL ON public.moderation_reports FROM anon;

CREATE TABLE IF NOT EXISTS public.account_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 category text NOT NULL, target_id text NOT NULL, message text NOT NULL CHECK(length(btrim(message)) BETWEEN 5 AND 2000),
 created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz
);
CREATE INDEX IF NOT EXISTS notifications_recipient ON public.account_notifications(recipient_id,created_at DESC);
ALTER TABLE public.account_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_read ON public.account_notifications;
CREATE POLICY notifications_read ON public.account_notifications FOR SELECT TO authenticated USING(recipient_id=auth.uid() AND NOT public.is_banned_user());
GRANT SELECT ON public.account_notifications TO authenticated;
REVOKE ALL ON public.account_notifications FROM anon;

CREATE TABLE IF NOT EXISTS public.moderation_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, action text NOT NULL,
 target_id text NOT NULL, reason text, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.moderation_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_staff_read ON public.moderation_audit;
CREATE POLICY audit_staff_read ON public.moderation_audit FOR SELECT TO authenticated USING(public.is_staff());
GRANT SELECT ON public.moderation_audit TO authenticated;
REVOKE ALL ON public.moderation_audit FROM anon;

CREATE OR REPLACE FUNCTION public.moderate_account(p_target uuid, p_action text, p_role text DEFAULT NULL, p_account_type text DEFAULT NULL, p_reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
DECLARE target public.profiles; result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF;
 SELECT * INTO target FROM public.profiles WHERE id=p_target FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Conta não encontrada.'; END IF;
 IF target.id=auth.uid() OR public.is_master_email(target.email) OR target.role='admin' THEN RAISE EXCEPTION 'Esta conta é protegida.' USING ERRCODE='42501'; END IF;
 IF p_action IN ('role','delete') AND NOT public.is_admin() THEN RAISE EXCEPTION 'Somente administradores podem excluir contas ou alterar papéis.' USING ERRCODE='42501'; END IF;
 IF NOT public.is_admin() AND target.role='supervisor' THEN RAISE EXCEPTION 'Supervisores não moderam outras contas da equipe.' USING ERRCODE='42501'; END IF;
 IF p_action='role' THEN
   IF p_role NOT IN ('user','supervisor') OR p_account_type IS NULL OR p_account_type NOT IN ('athlete','coach','casual') THEN RAISE EXCEPTION 'Papel ou tipo de conta inválido.'; END IF;
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

CREATE OR REPLACE FUNCTION public.review_moderation_report(p_id uuid,p_status text,p_response text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
DECLARE report public.moderation_reports;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF;
 IF p_status NOT IN ('reviewing','resolved','dismissed') OR length(btrim(coalesce(p_response,''))) NOT BETWEEN 5 AND 2000 THEN RAISE EXCEPTION 'Informe um status e uma resposta (5 a 2000 caracteres).'; END IF;
 SELECT * INTO report FROM public.moderation_reports WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Denúncia não encontrada.'; END IF;
 UPDATE public.moderation_reports SET status=p_status,response=p_response,reviewer_id=auth.uid(),reviewed_at=now() WHERE id=p_id;
 INSERT INTO public.account_notifications(recipient_id,category,target_id,message) VALUES(report.reporter_id,report.category,report.target_id,p_response);
 INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),'report_'||p_status,p_id::text,p_response);
END $$;
REVOKE ALL ON FUNCTION public.review_moderation_report(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_moderation_report(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_content_owner(p_category text,p_target text,p_message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
DECLARE recipient uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF;
 IF length(btrim(coalesce(p_message,''))) NOT BETWEEN 5 AND 2000 THEN RAISE EXCEPTION 'Escreva uma orientação de 5 a 2000 caracteres.'; END IF;
 IF p_category='athlete_listing' THEN SELECT seller_id INTO recipient FROM public.products WHERE id::text=p_target;
 ELSIF p_category='community' THEN SELECT author_id INTO recipient FROM public.community_posts WHERE id::text=p_target;
 ELSIF p_category IN ('athlete_profile','trial') THEN SELECT owner INTO recipient FROM public.sports_records WHERE id::text=p_target;
 ELSE RAISE EXCEPTION 'Esta categoria não possui anunciante interno.'; END IF;
 IF recipient IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=recipient) THEN RAISE EXCEPTION 'Não há uma conta de anunciante vinculada a este conteúdo.'; END IF;
 INSERT INTO public.account_notifications(recipient_id,category,target_id,message) VALUES(recipient,p_category,p_target,p_message);
 INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),'feedback_'||p_category,p_target,p_message);
END $$;
REVOKE ALL ON FUNCTION public.notify_content_owner(text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.notify_content_owner(text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.read_account_notification(p_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
 UPDATE public.account_notifications SET read_at=now() WHERE id=p_id AND recipient_id=auth.uid() AND NOT public.is_banned_user();
$$;
REVOKE ALL ON FUNCTION public.read_account_notification(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.read_account_notification(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.moderation_diagnostics() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object('checked_at',now(),'profiles',(SELECT count(*) FROM public.profiles),'suspended',(SELECT count(*) FROM public.profiles WHERE is_banned),'products',(SELECT count(*) FROM public.products),'offers',(SELECT count(*) FROM public.external_offers),'orders',(SELECT count(*) FROM public.orders),'reports_open',(SELECT count(*) FROM public.moderation_reports WHERE status IN ('open','reviewing')),'rls',(SELECT jsonb_object_agg(c.relname,c.relrowsecurity) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('profiles','products','external_offers','orders','moderation_reports','account_notifications','sports_records')));
END $$;
REVOKE ALL ON FUNCTION public.moderation_diagnostics() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.moderation_diagnostics() TO authenticated;
