ALTER TABLE public.moderation_reports ADD COLUMN reporter_read_at timestamptz;
CREATE FUNCTION public.moderation_content_owner(p_category text,p_target text) RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result uuid; BEGIN
 IF p_category='athlete_listing' THEN SELECT seller_id INTO result FROM public.products WHERE id::text=p_target;
 ELSIF p_category='community' THEN SELECT author_id INTO result FROM public.community_posts WHERE id::text=p_target;
 ELSIF p_category IN ('athlete_profile','trial') THEN SELECT owner INTO result FROM public.sports_records WHERE id::text=p_target;
 ELSIF p_category='external_offer' THEN SELECT created_by INTO result FROM public.external_offers WHERE id::text=p_target;
 END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.moderation_content_owner(text,text) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.list_report_owners(p_ids uuid[]) RETURNS TABLE(report_id uuid,owner_id uuid,owner_name text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() OR public.is_banned_user() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF;
 RETURN QUERY SELECT r.id,p.id,p.name FROM public.moderation_reports r LEFT JOIN public.profiles p ON p.id=public.moderation_content_owner(r.category,r.target_id) WHERE r.id=ANY(p_ids);
END $$;
REVOKE ALL ON FUNCTION public.list_report_owners(uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.list_report_owners(uuid[]) TO authenticated;
CREATE OR REPLACE FUNCTION public.review_moderation_report(p_id uuid,p_status text,p_response text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE report public.moderation_reports; recipient uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() OR public.is_banned_user() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF;
 IF p_status NOT IN ('reviewing','resolved','dismissed') OR length(btrim(coalesce(p_response,''))) NOT BETWEEN 5 AND 2000 THEN RAISE EXCEPTION 'Informe um status e uma resposta (5 a 2000 caracteres).'; END IF;
 SELECT * INTO report FROM public.moderation_reports WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Denúncia não encontrada.'; END IF;
 recipient:=public.moderation_content_owner(report.category,report.target_id);
 IF recipient IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=recipient) THEN RAISE EXCEPTION 'O conteúdo não possui uma conta responsável disponível. Não é possível enviar a resposta.'; END IF;
 -- The reporter sees the decision, not the private guidance sent to the reported owner.
 UPDATE public.moderation_reports SET status=p_status,response='',reviewer_id=auth.uid(),reviewed_at=now(),reporter_read_at=NULL WHERE id=p_id;
 INSERT INTO public.account_notifications(recipient_id,category,target_id,message) VALUES(recipient,report.category,report.target_id,trim(p_response));
 INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),'report_'||p_status,p_id::text,trim(p_response));
END $$;
CREATE FUNCTION public.read_report_update(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF auth.uid() IS NULL OR public.is_banned_user() THEN RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE='42501'; END IF;
 UPDATE public.moderation_reports SET reporter_read_at=now() WHERE id=p_id AND reporter_id=auth.uid() AND reviewed_at IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.read_report_update(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.read_report_update(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.read_account_notification(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE n public.account_notifications;
BEGIN
 IF auth.uid() IS NULL OR public.is_banned_user() THEN RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE='42501'; END IF;
 UPDATE public.account_notifications SET read_at=now() WHERE id=p_id AND recipient_id=auth.uid() RETURNING * INTO n;
 IF n.id IS NOT NULL THEN UPDATE public.moderation_reports SET reporter_read_at=now() WHERE reporter_id=auth.uid() AND category=n.category AND target_id=n.target_id AND reviewed_at IS NOT NULL AND reviewed_at<=now(); END IF;
END $$;
NOTIFY pgrst,'reload schema';
