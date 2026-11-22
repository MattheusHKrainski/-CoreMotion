-- Commenting on somebody else's post must not require editing that post through RLS.
CREATE FUNCTION public.add_community_comment(p_post_id uuid,p_content text,p_request_key uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE post public.community_posts%ROWTYPE; profile public.profiles%ROWTYPE; entries jsonb; entry jsonb;
BEGIN
 IF auth.uid() IS NULL OR public.is_banned_user() THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
 SELECT * INTO profile FROM public.profiles WHERE id=auth.uid();
 IF NOT FOUND THEN RAISE EXCEPTION 'Perfil não encontrado'; END IF;
 IF p_content IS NULL OR length(trim(p_content)) NOT BETWEEN 1 AND 2000 OR p_request_key IS NULL THEN RAISE EXCEPTION 'Comentário inválido'; END IF;
 SELECT * INTO post FROM public.community_posts WHERE id=p_post_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Publicação não encontrada'; END IF;
 entries=CASE WHEN jsonb_typeof(post.comments)='array' THEN post.comments ELSE '[]'::jsonb END;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(entries) c WHERE c->>'id'=p_request_key::text AND c->>'author_id'=auth.uid()::text) THEN RETURN to_jsonb(post); END IF;
 entry=jsonb_build_object('id',p_request_key,'author_id',auth.uid(),'author_name',profile.name,'author_avatar',profile.avatar_url,'content',trim(p_content),'created_at',now());
 entries=entries || jsonb_build_array(entry);
 UPDATE public.community_posts SET comments=entries,comments_count=jsonb_array_length(entries) WHERE id=p_post_id RETURNING * INTO post;
 RETURN to_jsonb(post);
END; $$;
REVOKE ALL ON FUNCTION public.add_community_comment(uuid,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_community_comment(uuid,text,uuid) TO authenticated;
REVOKE UPDATE(comments,comments_count) ON public.community_posts FROM authenticated;
NOTIFY pgrst,'reload schema';
