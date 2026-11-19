-- Profiles remain private. Validate following eligibility without granting profile-table reads.
CREATE OR REPLACE FUNCTION public.community_follow_allowed(target uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT auth.uid() IS NOT NULL AND target <> auth.uid()
 AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND NOT coalesce(is_banned,false))
 AND EXISTS (SELECT 1 FROM public.profiles WHERE id = target AND NOT coalesce(is_banned,false));
$$;
REVOKE ALL ON FUNCTION public.community_follow_allowed(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_follow_allowed(uuid) TO authenticated;
ALTER POLICY follows_insert_own ON public.community_follows
WITH CHECK (follower_id = (SELECT auth.uid()) AND public.community_follow_allowed(following_id));
