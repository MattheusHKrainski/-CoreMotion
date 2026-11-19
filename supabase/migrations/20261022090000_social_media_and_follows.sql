-- Real social graph and user-owned images. No passwords or public session tokens.
CREATE TABLE IF NOT EXISTS public.community_follows (
 follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (follower_id, following_id),
 CHECK (follower_id <> following_id)
);
CREATE INDEX IF NOT EXISTS community_follows_target_idx ON public.community_follows(following_id);
ALTER TABLE public.community_follows ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.community_follows TO authenticated;
CREATE POLICY follows_read_own ON public.community_follows FOR SELECT TO authenticated USING (follower_id = (SELECT auth.uid()));
CREATE POLICY follows_insert_own ON public.community_follows FOR INSERT TO authenticated WITH CHECK (
 follower_id = (SELECT auth.uid())
 AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND NOT coalesce(is_banned, false))
 AND EXISTS (SELECT 1 FROM public.profiles WHERE id = following_id AND NOT coalesce(is_banned, false))
);
CREATE POLICY follows_delete_own ON public.community_follows FOR DELETE TO authenticated USING (follower_id = (SELECT auth.uid()));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-media', 'user-media', true, 8388608, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 8388608, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];
CREATE POLICY user_media_read ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'user-media');
CREATE POLICY user_media_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (
 bucket_id = 'user-media' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
 AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND NOT coalesce(is_banned, false))
);
CREATE POLICY user_media_delete ON storage.objects FOR DELETE TO authenticated USING (
 bucket_id = 'user-media' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
