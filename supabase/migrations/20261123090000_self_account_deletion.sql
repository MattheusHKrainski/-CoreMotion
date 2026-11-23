-- Self deletion is permanent, unlike the administrative 30-day trash.
CREATE FUNCTION public.delete_my_account(p_confirmation text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor uuid:=auth.uid();
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION 'Autenticação necessária' USING ERRCODE='42501'; END IF;
 IF p_confirmation IS DISTINCT FROM 'EXCLUIR' THEN RAISE EXCEPTION 'Confirme digitando EXCLUIR'; END IF;
 IF EXISTS(SELECT 1 FROM auth.users WHERE id=actor AND public.is_master_email(email)) THEN RAISE EXCEPTION 'A conta administrativa principal é protegida' USING ERRCODE='42501'; END IF;
 -- Existing profile cleanup trigger removes authored data and interactions atomically.
 DELETE FROM auth.users WHERE id=actor;
END $$;
REVOKE ALL ON FUNCTION public.delete_my_account(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account(text) TO authenticated;
NOTIFY pgrst,'reload schema';
