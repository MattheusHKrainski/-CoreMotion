-- Account deletion must not orphan authored content. Runs in the same transaction
-- for BOTH moderate_account and the server DELETE /api/users path.
CREATE OR REPLACE FUNCTION public.cleanup_deleted_profile_content()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
BEGIN
  -- Remove embedded comments without touching comments from other members.
  UPDATE public.community_posts p SET comments = (
    SELECT coalesce(jsonb_agg(c.item ORDER BY c.ordinality), '[]'::jsonb)
    FROM jsonb_array_elements(coalesce(p.comments,'[]'::jsonb)) WITH ORDINALITY c(item, ordinality)
    WHERE c.item->>'author_id' IS DISTINCT FROM OLD.id::text
  ) WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(p.comments,'[]'::jsonb)) c WHERE c->>'author_id'=OLD.id::text);
  DELETE FROM public.community_likes WHERE user_id=OLD.id;
  DELETE FROM public.community_posts WHERE author_id=OLD.id;
  DELETE FROM public.core_sale_events WHERE actor=OLD.id OR order_id IN (SELECT id FROM public.core_sale_orders WHERE owner=OLD.id);
  DELETE FROM public.core_sale_orders WHERE owner=OLD.id;
  DELETE FROM public.orders WHERE user_id=OLD.id;
  DELETE FROM public.products WHERE seller_id=OLD.id OR store_id IN (SELECT id FROM public.stores WHERE owner_id=OLD.id);
  DELETE FROM public.stores WHERE owner_id=OLD.id;
  DELETE FROM public.external_offers WHERE created_by=OLD.id;
  DELETE FROM public.sports_records WHERE owner=OLD.id OR data->>'recipient'=OLD.id::text
    OR data->>'target' IN (SELECT id::text FROM public.sports_records WHERE owner=OLD.id);
  DELETE FROM public.coach_activities WHERE owner=OLD.id;
  DELETE FROM public.support_tickets WHERE owner=OLD.id;
  DELETE FROM public.community_follows WHERE follower_id=OLD.id OR following_id=OLD.id;
  DELETE FROM public.moderation_reports WHERE reporter_id=OLD.id;
  DELETE FROM public.account_notifications WHERE recipient_id=OLD.id;
  DELETE FROM public.moderation_audit WHERE actor_id=OLD.id OR target_id=OLD.id::text;
  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_deleted_profile_content() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS profile_content_cleanup ON public.profiles;
CREATE TRIGGER profile_content_cleanup BEFORE DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.cleanup_deleted_profile_content();
