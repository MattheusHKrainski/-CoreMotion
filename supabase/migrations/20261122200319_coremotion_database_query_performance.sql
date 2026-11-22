-- Maintain equivalent authorization while optimizing session helper evaluation and foreign key joins.

-- Each condition is copied from the CURRENT live policy to preserve access semantics.

ALTER POLICY "notifications_read" ON public."account_notifications" USING (((recipient_id = (select auth.uid())) AND (NOT (select public.is_banned_user()))));

ALTER POLICY "coach_activities_delete" ON public."coach_activities" USING (((NOT (select public.is_banned_user())) AND ((select public.is_staff()) OR ((owner = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.account_type = 'coach'::text))))))));

ALTER POLICY "coach_activities_insert" ON public."coach_activities" WITH CHECK (((NOT (select public.is_banned_user())) AND (owner = (select auth.uid())) AND ((select public.is_staff()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.account_type = 'coach'::text)))))));

ALTER POLICY "coach_activities_update" ON public."coach_activities" USING (((NOT (select public.is_banned_user())) AND ((select public.is_staff()) OR ((owner = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.account_type = 'coach'::text)))))))) WITH CHECK (((NOT (select public.is_banned_user())) AND ((select public.is_staff()) OR ((owner = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.account_type = 'coach'::text))))))));

ALTER POLICY "core_events_read" ON public."core_sale_events" USING ((EXISTS ( SELECT 1
   FROM core_sale_orders o
  WHERE ((o.id = core_sale_events.order_id) AND ((o.owner = (select auth.uid())) OR ((select public.is_staff()) AND (NOT (select public.is_banned_user()))))))));

ALTER POLICY "core_orders_read" ON public."core_sale_orders" USING (((owner = (select auth.uid())) OR ((select public.is_staff()) AND (NOT (select public.is_banned_user())))));

ALTER POLICY "reports_insert" ON public."moderation_reports" WITH CHECK (((reporter_id = (select auth.uid())) AND (NOT (select public.is_banned_user())) AND (status = 'open'::text) AND (response = ''::text) AND (reviewer_id IS NULL) AND (reviewed_at IS NULL)));

ALTER POLICY "reports_read" ON public."moderation_reports" USING (((NOT (select public.is_banned_user())) AND ((reporter_id = (select auth.uid())) OR (select public.is_staff()))));

ALTER POLICY "profiles_delete" ON public."profiles" USING ((((select public.is_admin()) AND (id <> (select auth.uid())))) AND NOT public.is_master_email(email));

ALTER POLICY "sports_delete" ON public."sports_records" USING (((select public.sports_member()) AND ((owner = (select auth.uid())) OR (select public.is_staff()))));

ALTER POLICY "sports_insert" ON public."sports_records" WITH CHECK (((owner = (select auth.uid())) AND (select public.sports_member()) AND ((select public.is_staff()) OR ((kind = ANY (ARRAY['athlete'::text, 'application'::text])) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.account_type = 'athlete'::text))))) OR ((kind = ANY (ARRAY['coach'::text, 'trial'::text, 'invite'::text])) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.account_type = 'coach'::text))))))));

ALTER POLICY "sports_read" ON public."sports_records" USING (((NOT (select public.is_banned_user())) AND ((select public.is_staff()) OR ((kind = 'coach'::text) AND ((select auth.uid()) IS NOT NULL)) OR ((kind = 'trial'::text) AND (select public.sports_member())) OR ((kind = 'athlete'::text) AND (select public.sports_member()) AND ((owner = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.account_type = 'coach'::text)))))) OR ((kind = ANY (ARRAY['application'::text, 'invite'::text])) AND (select public.sports_member()) AND ((owner = (select auth.uid())) OR ((data ->> 'recipient'::text) = ((select auth.uid()))::text))))));

ALTER POLICY "sports_update" ON public."sports_records" USING (((select public.sports_member()) AND ((owner = (select auth.uid())) OR (select public.is_staff()) OR ((kind = ANY (ARRAY['application'::text, 'invite'::text])) AND ((data ->> 'recipient'::text) = ((select auth.uid()))::text))))) WITH CHECK (((select public.sports_member()) AND ((owner = (select auth.uid())) OR (select public.is_staff()) OR ((kind = ANY (ARRAY['application'::text, 'invite'::text])) AND ((data ->> 'recipient'::text) = ((select auth.uid()))::text)))));

ALTER POLICY "support_create" ON public."support_tickets" WITH CHECK (((owner = (select auth.uid())) AND (NOT (select public.is_banned_user())) AND (status = 'open'::text) AND (response = ''::text)));

ALTER POLICY "support_read" ON public."support_tickets" USING (((owner = (select auth.uid())) OR ((select public.is_staff()) AND (NOT (select public.is_banned_user())))));

CREATE INDEX IF NOT EXISTS "admin_logs_admin_id_fk_idx" ON public."admin_logs" ("admin_id");

CREATE INDEX IF NOT EXISTS "bookings_coach_id_fk_idx" ON public."bookings" ("coach_id");

CREATE INDEX IF NOT EXISTS "bookings_service_id_fk_idx" ON public."bookings" ("service_id");

CREATE INDEX IF NOT EXISTS "bookings_user_id_fk_idx" ON public."bookings" ("user_id");

CREATE INDEX IF NOT EXISTS "coach_services_coach_id_fk_idx" ON public."coach_services" ("coach_id");

CREATE INDEX IF NOT EXISTS "community_likes_user_id_fk_idx" ON public."community_likes" ("user_id");

CREATE INDEX IF NOT EXISTS "community_posts_author_id_fk_idx" ON public."community_posts" ("author_id");

CREATE INDEX IF NOT EXISTS "core_sale_events_actor_fk_idx" ON public."core_sale_events" ("actor");

CREATE INDEX IF NOT EXISTS "core_sale_events_order_id_fk_idx" ON public."core_sale_events" ("order_id");

CREATE INDEX IF NOT EXISTS "external_offers_created_by_fk_idx" ON public."external_offers" ("created_by");

CREATE INDEX IF NOT EXISTS "follows_following_id_fk_idx" ON public."follows" ("following_id");

CREATE INDEX IF NOT EXISTS "orders_user_id_fk_idx" ON public."orders" ("user_id");

CREATE INDEX IF NOT EXISTS "post_comments_post_id_fk_idx" ON public."post_comments" ("post_id");

CREATE INDEX IF NOT EXISTS "post_comments_user_id_fk_idx" ON public."post_comments" ("user_id");

CREATE INDEX IF NOT EXISTS "post_likes_user_id_fk_idx" ON public."post_likes" ("user_id");

CREATE INDEX IF NOT EXISTS "posts_user_id_fk_idx" ON public."posts" ("user_id");

CREATE INDEX IF NOT EXISTS "products_seller_id_fk_idx" ON public."products" ("seller_id");

CREATE INDEX IF NOT EXISTS "products_store_id_fk_idx" ON public."products" ("store_id");

CREATE INDEX IF NOT EXISTS "sessions_user_id_fk_idx" ON public."sessions" ("user_id");

CREATE INDEX IF NOT EXISTS "stores_owner_id_fk_idx" ON public."stores" ("owner_id");

DROP INDEX IF EXISTS public.users_email_idx;

CREATE INDEX IF NOT EXISTS external_offers_active_recent_idx ON public.external_offers (created_at DESC) WHERE is_active = true;

ANALYZE public.external_offers;

NOTIFY pgrst, 'reload schema';