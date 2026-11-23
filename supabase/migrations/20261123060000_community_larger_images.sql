-- Increase community images only; keep avatars/products at 8 MB and videos at 50 MB.
ALTER POLICY community_video_upload_limits ON storage.objects WITH CHECK (
 bucket_id<>'user-media' OR (
 CASE WHEN split_part(name,'/',2)='community-videos' THEN
  name ~ '/[0-9a-f-]{36}\.(mp4|webm)$' AND coalesce((metadata->>'size')::bigint,0)<=52428800 AND metadata->>'mimetype' IN ('video/mp4','video/webm')
 ELSE coalesce((metadata->>'size')::bigint,0)<=CASE WHEN split_part(name,'/',2)='community' THEN 20971520 ELSE 8388608 END AND metadata->>'mimetype' IN ('image/jpeg','image/png','image/webp') END
 )
);
