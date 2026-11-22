-- Realtime replication for actual collaborative workflows; keep RLS and existing grants unchanged.
DO $realtime$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['account_notifications','coach_activities','community_follows','community_likes','core_sale_orders','core_sale_events','core_supplier_settings','moderation_reports','moderation_audit','orders','platform_settings','support_tickets'] LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN RAISE EXCEPTION 'Required table missing: %', t; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',t);
    END IF;
  END LOOP;
END $realtime$;

-- Anonymous coach activity reads previously called a privileged helper without EXECUTE.
-- Public listings are intentionally readable by visitors; blocked users remain denied on authenticated reads.
DROP POLICY IF EXISTS coach_activities_read ON public.coach_activities;
CREATE POLICY coach_activities_public_read ON public.coach_activities FOR SELECT TO anon USING (true);
CREATE POLICY coach_activities_member_read ON public.coach_activities FOR SELECT TO authenticated USING (NOT (select public.is_banned_user()));

-- Leave replica identity DEFAULT. The client re-fetches authorized rows instead of exposing OLD row data.
NOTIFY pgrst, 'reload schema';