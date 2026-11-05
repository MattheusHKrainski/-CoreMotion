-- Staff may remove a meaningless complaint without deleting the reported content.
CREATE OR REPLACE FUNCTION public.delete_moderation_report(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
DECLARE removed_id uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() THEN RAISE EXCEPTION 'Acesso restrito à equipe.' USING ERRCODE='42501'; END IF;
 DELETE FROM public.moderation_reports WHERE id=p_id RETURNING id INTO removed_id;
 IF removed_id IS NULL THEN RAISE EXCEPTION 'Denúncia não encontrada ou já excluída.'; END IF;
 INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),'report_deleted',p_id::text,'Exclusão de denúncia pela moderação');
END $$;
REVOKE ALL ON FUNCTION public.delete_moderation_report(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.delete_moderation_report(uuid) TO authenticated;
