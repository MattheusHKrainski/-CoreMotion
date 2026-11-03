-- Anúncios antigos permanecem legíveis; novos exigem contato pela API e pelo banco.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.products ADD CONSTRAINT products_contact_format CHECK (contact_phone IS NULL OR contact_phone ~ '^[0-9]{10,15}$');
CREATE OR REPLACE FUNCTION public.require_listing_contact() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.product_type = 'c2c' AND (NEW.contact_phone IS NULL OR NEW.contact_phone !~ '^[0-9]{10,15}$') THEN
    RAISE EXCEPTION 'Informe um telefone de contato com DDD para anunciar.';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER products_require_contact BEFORE INSERT OR UPDATE OF contact_phone ON public.products FOR EACH ROW EXECUTE FUNCTION public.require_listing_contact();

CREATE TABLE public.community_likes (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY(post_id, user_id)
);
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY likes_read_own ON public.community_likes FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON public.community_likes TO authenticated;
-- Client sets desired state instead of incrementing a counter. Row lock serializes concurrent requests.
CREATE OR REPLACE FUNCTION public.set_community_like(p_post_id uuid, p_liked boolean)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer; changed integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned) THEN RAISE EXCEPTION 'Conta suspensa'; END IF;
  PERFORM 1 FROM public.community_posts WHERE id = p_post_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Publicação não encontrada'; END IF;
  IF p_liked THEN
    INSERT INTO public.community_likes VALUES (p_post_id, auth.uid()) ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS changed = ROW_COUNT;
    UPDATE public.community_posts SET likes_count = COALESCE(likes_count,0) + changed WHERE id = p_post_id;
  ELSE
    DELETE FROM public.community_likes WHERE post_id = p_post_id AND user_id = auth.uid();
    GET DIAGNOSTICS changed = ROW_COUNT;
    UPDATE public.community_posts SET likes_count = GREATEST(0, COALESCE(likes_count,0) - changed) WHERE id = p_post_id;
  END IF;
  SELECT likes_count INTO n FROM public.community_posts WHERE id = p_post_id;
  RETURN n;
END; $$;
REVOKE ALL ON FUNCTION public.set_community_like(uuid,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_community_like(uuid,boolean) TO authenticated;
-- Counter cannot be changed through direct table updates.
REVOKE UPDATE ON public.community_posts FROM authenticated;
GRANT UPDATE (author_name, author_avatar, author_badge, category, title, content, image_url, comments_count, comments, is_reported, report_reason) ON public.community_posts TO authenticated;

-- The existing Auth trigger creates the profile first; preserve the chosen sport on confirmation/login.
CREATE OR REPLACE FUNCTION public.apply_signup_sport() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'account_type' IN ('athlete', 'coach') AND length(trim(NEW.raw_user_meta_data->>'sport')) BETWEEN 1 AND 60 THEN
    UPDATE public.profiles SET sport_interests = ARRAY[trim(NEW.raw_user_meta_data->>'sport')] WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER zz_apply_signup_sport AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.apply_signup_sport();

CREATE OR REPLACE FUNCTION public.initialize_post_likes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.likes_count := 0; RETURN NEW; END; $$;
CREATE TRIGGER community_posts_initialize_likes BEFORE INSERT ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.initialize_post_likes();
