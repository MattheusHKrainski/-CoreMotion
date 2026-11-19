-- Repair the RPC actually called by the web client, retaining existing likes.
CREATE OR REPLACE FUNCTION public.set_community_like(p_post_id uuid, p_liked boolean)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT coalesce(is_banned,false)) THEN RAISE EXCEPTION 'Autenticação necessária ou conta suspensa'; END IF;
 IF p_liked IS NULL THEN RAISE EXCEPTION 'Estado da curtida inválido'; END IF;
 PERFORM 1 FROM public.community_posts WHERE id=p_post_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Publicação não encontrada'; END IF;
 IF p_liked THEN
  INSERT INTO public.community_likes(post_id,user_id) VALUES(p_post_id,auth.uid()) ON CONFLICT DO NOTHING;
 ELSE
  DELETE FROM public.community_likes WHERE post_id=p_post_id AND user_id=auth.uid();
 END IF;
 SELECT count(*)::integer INTO n FROM public.community_likes WHERE post_id=p_post_id;
 UPDATE public.community_posts SET likes_count=n WHERE id=p_post_id;
 RETURN n;
END; $$;
REVOKE ALL ON FUNCTION public.set_community_like(uuid,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_community_like(uuid,boolean) TO authenticated;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS likes_read_own ON public.community_likes;
CREATE POLICY likes_read_own ON public.community_likes FOR SELECT TO authenticated USING(user_id=auth.uid());
REVOKE ALL ON public.community_likes FROM anon, authenticated;
GRANT SELECT ON public.community_likes TO authenticated;
REVOKE UPDATE ON public.community_posts FROM authenticated;
GRANT UPDATE(author_name,author_avatar,author_badge,category,title,content,image_url,comments_count,comments,is_reported,report_reason) ON public.community_posts TO authenticated;

CREATE TABLE public.support_tickets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
 category text NOT NULL CHECK(category IN ('general','size','delivery','orders','returns','payments','products','corporate','contact','problem')),
 subject text NOT NULL CHECK(length(trim(subject)) BETWEEN 3 AND 200),
 message text NOT NULL CHECK(length(trim(message)) BETWEEN 10 AND 4000),
 reference text NOT NULL DEFAULT '' CHECK(length(reference)<=200),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewing','resolved')),
 response text NOT NULL DEFAULT '' CHECK(length(response)<=4000),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_tickets_owner_created_idx ON public.support_tickets(owner,created_at DESC);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.support_tickets TO authenticated;
GRANT INSERT(category,subject,message,reference) ON public.support_tickets TO authenticated;
GRANT UPDATE(status,response) ON public.support_tickets TO authenticated;
CREATE POLICY support_read ON public.support_tickets FOR SELECT TO authenticated USING(owner=auth.uid() OR (public.is_staff() AND NOT public.is_banned_user()));
CREATE POLICY support_create ON public.support_tickets FOR INSERT TO authenticated WITH CHECK(owner=auth.uid() AND NOT public.is_banned_user() AND status='open' AND response='');
CREATE POLICY support_review ON public.support_tickets FOR UPDATE TO authenticated USING(public.is_staff() AND NOT public.is_banned_user()) WITH CHECK(public.is_staff() AND NOT public.is_banned_user());
CREATE FUNCTION public.support_touch() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
CREATE TRIGGER support_touch_updated BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.support_touch();
NOTIFY pgrst, 'reload schema';
