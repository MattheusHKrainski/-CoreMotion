ALTER TABLE public.community_posts ADD COLUMN video_url text;
ALTER TABLE public.community_posts ADD CONSTRAINT community_video_owned_path CHECK(video_url IS NULL OR video_url='' OR (video_url LIKE 'https://erpwfjdycdlygxwkdakv.supabase.co/storage/v1/object/public/user-media/'||author_id::text||'/community-videos/%' AND video_url ~ '/[0-9a-f-]{36}\.(mp4|webm)$'));
GRANT UPDATE(video_url) ON public.community_posts TO authenticated;
-- Existing trigger continues to guard other authors' content, including video.
CREATE OR REPLACE FUNCTION public.protect_community_columns() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF auth.uid() IS NULL OR public.is_staff() OR auth.uid()=OLD.author_id THEN RETURN NEW; END IF;
 NEW.author_id:=OLD.author_id; NEW.author_name:=OLD.author_name; NEW.author_avatar:=OLD.author_avatar; NEW.author_badge:=OLD.author_badge; NEW.title:=OLD.title; NEW.content:=OLD.content; NEW.image_url:=OLD.image_url; NEW.video_url:=OLD.video_url; NEW.category:=OLD.category; RETURN NEW;
END $$;
UPDATE storage.buckets SET file_size_limit=52428800,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/webm'] WHERE id='user-media';
CREATE POLICY community_video_upload_limits ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (
 bucket_id<>'user-media' OR (
 CASE WHEN split_part(name,'/',2)='community-videos' THEN
  name ~ '/[0-9a-f-]{36}\.(mp4|webm)$' AND coalesce((metadata->>'size')::bigint,0)<=52428800 AND metadata->>'mimetype' IN ('video/mp4','video/webm')
 ELSE coalesce((metadata->>'size')::bigint,0)<=8388608 AND metadata->>'mimetype' IN ('image/jpeg','image/png','image/webp') END
 )
);
-- Fictional example post: local editorial illustration, not a replacement photograph.
UPDATE public.community_posts SET image_url='/community/treino-coletivo.jpg' WHERE id='7204c4b6-4f2a-2f0a-4e03-cdc3cb397244' AND author_badge ILIKE '%fict%';
NOTIFY pgrst,'reload schema';
