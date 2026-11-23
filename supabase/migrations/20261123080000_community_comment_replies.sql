-- Separate RPC preserves compatibility with older clients and existing comment RPCs.
CREATE FUNCTION public.reply_community_comment(p_post_id uuid,p_content text,p_request_key uuid,p_parent_id text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE post public.community_posts%ROWTYPE; entries jsonb;
BEGIN
 IF auth.uid() IS NULL OR public.is_banned_user() THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
 SELECT * INTO post FROM public.community_posts WHERE id=p_post_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Publicação não encontrada'; END IF;
 entries=CASE WHEN jsonb_typeof(post.comments)='array' THEN post.comments ELSE '[]'::jsonb END;
 -- Retrying a request must not change the target of an already saved comment.
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(entries) c WHERE c->>'id'=p_request_key::text AND c->>'author_id'=auth.uid()::text) THEN RETURN to_jsonb(post); END IF;
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(entries) c WHERE c->>'id'=p_parent_id) THEN RAISE EXCEPTION 'O comentário original não está mais disponível'; END IF;
 PERFORM public.add_community_comment(p_post_id,p_content,p_request_key);
 SELECT comments INTO entries FROM public.community_posts WHERE id=p_post_id;
 SELECT jsonb_agg(CASE WHEN c->>'id'=p_request_key::text AND c->>'author_id'=auth.uid()::text THEN c || jsonb_build_object('parent_id',p_parent_id) ELSE c END ORDER BY ordinal)
 INTO entries FROM jsonb_array_elements(entries) WITH ORDINALITY AS items(c,ordinal);
 UPDATE public.community_posts SET comments=entries WHERE id=p_post_id RETURNING * INTO post;
 RETURN to_jsonb(post);
END $$;
REVOKE ALL ON FUNCTION public.reply_community_comment(uuid,text,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.reply_community_comment(uuid,text,uuid,text) TO authenticated;
NOTIFY pgrst,'reload schema';
