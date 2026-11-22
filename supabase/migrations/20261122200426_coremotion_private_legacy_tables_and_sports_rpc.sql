-- Make deny-by-default explicit for retired/private tables. No rows or existing access are changed.

CREATE POLICY "bookings_private_deny" ON public."bookings" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "coach_services_private_deny" ON public."coach_services" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "communities_private_deny" ON public."communities" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "follows_private_deny" ON public."follows" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "notifications_private_deny" ON public."notifications" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "post_comments_private_deny" ON public."post_comments" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "post_likes_private_deny" ON public."post_likes" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "posts_private_deny" ON public."posts" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "sessions_private_deny" ON public."sessions" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "stores_private_deny" ON public."stores" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "users_private_deny" ON public."users" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- Sports authorization helpers are needed by authenticated RLS, but not by anonymous visitors.

REVOKE ALL ON FUNCTION public.sports_admin() FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION public.sports_member() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.sports_admin() TO authenticated;

GRANT EXECUTE ON FUNCTION public.sports_member() TO authenticated;

NOTIFY pgrst, 'reload schema';