CREATE OR REPLACE FUNCTION public.protect_profile_privileges() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, auth AS $$
BEGIN
 IF auth.uid() IS NULL THEN RETURN NEW; END IF;
 IF public.is_banned_user() THEN RAISE EXCEPTION 'Esta conta está suspensa.' USING ERRCODE='42501'; END IF;
 IF TG_OP='INSERT' THEN
   IF NOT public.is_admin() AND (NEW.id<>auth.uid() OR NEW.role<>'user' OR coalesce(NEW.is_banned,false) OR lower(NEW.email)<>lower(auth.jwt()->>'email')) THEN
     RAISE EXCEPTION 'Criação de perfil não permitida.' USING ERRCODE='42501';
   END IF;
   RETURN NEW;
 END IF;
 IF NOT public.is_admin() THEN
   IF NEW.id IS DISTINCT FROM OLD.id OR NEW.email IS DISTINCT FROM OLD.email OR NEW.role IS DISTINCT FROM OLD.role OR NEW.account_type IS DISTINCT FROM OLD.account_type OR NEW.created_at IS DISTINCT FROM OLD.created_at OR NEW.store_id IS DISTINCT FROM OLD.store_id THEN
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
