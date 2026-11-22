-- Engagement counters must reflect real persisted interactions, never fixture numbers.
CREATE OR REPLACE FUNCTION public.guard_community_post_engagement()
RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  IF jsonb_typeof(coalesce(NEW.comments,'[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'Os comentários devem ser uma lista JSON.';
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.likes_count := 0;
    NEW.comments_count := jsonb_array_length(coalesce(NEW.comments,'[]'::jsonb));
  ELSE
    IF current_user IN ('authenticated','anon') AND
       (NEW.likes_count IS DISTINCT FROM OLD.likes_count OR NEW.comments IS DISTINCT FROM OLD.comments) THEN
      RAISE EXCEPTION 'Interações devem ser registradas pelos serviços autorizados.' USING ERRCODE = '42501';
    END IF;
    NEW.comments_count := jsonb_array_length(coalesce(NEW.comments,'[]'::jsonb));
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_community_post_engagement() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS community_posts_engagement_guard ON public.community_posts;
CREATE TRIGGER community_posts_engagement_guard
BEFORE INSERT OR UPDATE OF comments, comments_count, likes_count
ON public.community_posts FOR EACH ROW
EXECUTE FUNCTION public.guard_community_post_engagement();

-- Count from authoritative rows, including deletes that occur outside the like RPC.
CREATE OR REPLACE FUNCTION public.apply_community_like_delta()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE post_uuid uuid; delta integer;
BEGIN
  IF TG_OP = 'INSERT' THEN post_uuid := NEW.post_id; delta := 1;
  ELSE post_uuid := OLD.post_id; delta := -1;
  END IF;
  UPDATE public.community_posts
     SET likes_count = greatest(0, likes_count + delta)
   WHERE id = post_uuid;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_community_like_delta() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS community_likes_counter_sync ON public.community_likes;
CREATE TRIGGER community_likes_counter_sync
AFTER INSERT OR DELETE ON public.community_likes
FOR EACH ROW EXECUTE FUNCTION public.apply_community_like_delta();

-- Repair old display counters from real liked rows; preserve legitimate post/comment content.
UPDATE public.community_posts p
   SET likes_count = (SELECT count(*)::integer FROM public.community_likes l WHERE l.post_id=p.id),
       comments_count = jsonb_array_length(coalesce(p.comments,'[]'::jsonb))
 WHERE p.likes_count IS DISTINCT FROM (SELECT count(*)::integer FROM public.community_likes l WHERE l.post_id=p.id)
    OR p.comments_count IS DISTINCT FROM jsonb_array_length(coalesce(p.comments,'[]'::jsonb));
NOTIFY pgrst,'reload schema';