CREATE OR REPLACE FUNCTION public.add_community_comment(p_post_id uuid, p_id uuid, p_content text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE
  actor public.profiles%ROWTYPE;
  prior jsonb;
  entry jsonb;
BEGIN
  SELECT * INTO actor FROM public.profiles WHERE id = auth.uid() AND NOT is_banned;
  IF NOT FOUND THEN RAISE EXCEPTION 'Entre em uma conta ativa para comentar.'; END IF;
  IF p_id IS NULL OR p_content IS NULL OR length(trim(p_content)) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'O comentário deve ter de 1 a 2000 caracteres.';
  END IF;
  SELECT coalesce(comments, '[]'::jsonb) INTO prior FROM public.community_posts WHERE id = p_post_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Publicação não encontrada.'; END IF;
  SELECT item INTO entry FROM jsonb_array_elements(prior) item WHERE item->>'id' = p_id::text;
  IF FOUND THEN
    IF entry->>'author_id' IS DISTINCT FROM actor.id::text THEN RAISE EXCEPTION 'Identificador indisponível.'; END IF;
    RETURN entry;
  END IF;
  entry := jsonb_build_object('id', p_id, 'author_id', actor.id, 'author_name', actor.name,
                              'author_avatar', actor.avatar_url, 'content', trim(p_content), 'created_at', now());
  UPDATE public.community_posts SET comments = prior || jsonb_build_array(entry),
    comments_count = jsonb_array_length(prior) + 1 WHERE id = p_post_id;
  RETURN entry;
END;
$$;
REVOKE ALL ON FUNCTION public.add_community_comment(uuid,uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_community_comment(uuid,uuid,text) TO authenticated;
