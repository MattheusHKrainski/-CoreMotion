-- Public recreational listings; authenticated coaches publish, staff moderate.
CREATE TABLE public.coach_activities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 type text NOT NULL CHECK(type IN ('class','group','association')),
 title text NOT NULL CHECK(length(btrim(title)) BETWEEN 1 AND 120),
 organizer text NOT NULL CHECK(length(btrim(organizer)) BETWEEN 1 AND 120),
 sport text NOT NULL CHECK(length(btrim(sport)) BETWEEN 1 AND 60),
 city text NOT NULL CHECK(length(btrim(city)) BETWEEN 1 AND 120),
 schedule text NOT NULL CHECK(length(btrim(schedule)) BETWEEN 1 AND 300),
 contact text NOT NULL CHECK(length(btrim(contact)) BETWEEN 1 AND 200),
 description text NOT NULL CHECK(length(btrim(description)) BETWEEN 1 AND 3000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX coach_activities_owner_idx ON public.coach_activities(owner);
ALTER TABLE public.coach_activities ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.coach_activities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coach_activities TO authenticated;
CREATE POLICY coach_activities_read ON public.coach_activities FOR SELECT TO anon, authenticated USING(NOT public.is_banned_user());
CREATE POLICY coach_activities_insert ON public.coach_activities FOR INSERT TO authenticated WITH CHECK(
 NOT public.is_banned_user() AND owner=auth.uid() AND
 (public.is_staff() OR EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND account_type='coach'))
);
CREATE POLICY coach_activities_update ON public.coach_activities FOR UPDATE TO authenticated USING(
 NOT public.is_banned_user() AND (public.is_staff() OR (owner=auth.uid() AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND account_type='coach')))
) WITH CHECK(
 NOT public.is_banned_user() AND (public.is_staff() OR (owner=auth.uid() AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND account_type='coach')))
);
CREATE POLICY coach_activities_delete ON public.coach_activities FOR DELETE TO authenticated USING(
 NOT public.is_banned_user() AND (public.is_staff() OR (owner=auth.uid() AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND account_type='coach')))
);
CREATE FUNCTION public.guard_coach_activity_identity() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.id IS DISTINCT FROM OLD.id OR NEW.owner IS DISTINCT FROM OLD.owner OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'Identidade da publicação imutável'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_coach_activity_identity BEFORE UPDATE ON public.coach_activities FOR EACH ROW EXECUTE FUNCTION public.guard_coach_activity_identity();
