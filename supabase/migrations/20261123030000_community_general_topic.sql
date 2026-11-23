-- Preserve former Events posts under General. Keep legacy clients/data readable.
UPDATE public.community_posts SET category='geral' WHERE category='evento';
NOTIFY pgrst,'reload schema';
