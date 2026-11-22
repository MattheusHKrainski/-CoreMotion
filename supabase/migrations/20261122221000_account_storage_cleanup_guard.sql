-- Storage binaries must be deleted via Storage API, never by DELETE storage.objects.
-- A supervisor cannot remove another member's uploads; admins cannot use this to erase themselves.
CREATE POLICY user_media_admin_account_cleanup ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id='user-media'
  AND (storage.foldername(storage.objects.name))[1] <> (SELECT auth.uid())::text
  AND EXISTS (SELECT 1 FROM public.profiles a WHERE a.id=(SELECT auth.uid()) AND a.role='admin' AND NOT coalesce(a.is_banned,false))
  AND EXISTS (SELECT 1 FROM public.profiles t WHERE t.id::text=(storage.foldername(storage.objects.name))[1])
);
CREATE OR REPLACE FUNCTION public.require_profile_media_cleanup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.objects WHERE owner=OLD.id OR owner_id=OLD.id::text
    OR (bucket_id='user-media' AND split_part(name,'/',1)=OLD.id::text)) THEN
    RAISE EXCEPTION 'Remova primeiro os arquivos da conta pelo serviço Storage e tente novamente.';
  END IF;
  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.require_profile_media_cleanup() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER profile_00_require_media_cleanup BEFORE DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.require_profile_media_cleanup();
