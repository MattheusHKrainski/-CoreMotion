-- Trust profile type from the DB, not user-editable auth metadata.
CREATE OR REPLACE FUNCTION public.sports_member() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$
 SELECT NOT public.is_banned_user() AND (public.is_staff() OR EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND account_type IN ('athlete','coach')));
$$;
CREATE OR REPLACE FUNCTION public.sports_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public,auth AS $$ SELECT public.is_staff(); $$;
DROP POLICY IF EXISTS sports_read ON public.sports_records;
CREATE POLICY sports_read ON public.sports_records FOR SELECT TO authenticated USING (
 NOT public.is_banned_user() AND ((kind='coach' AND auth.uid() IS NOT NULL) OR (public.sports_member() AND (kind IN ('athlete','coach','trial') OR owner=auth.uid() OR data->>'recipient'=auth.uid()::text OR public.is_staff())))
);
DROP POLICY IF EXISTS sports_insert ON public.sports_records;
CREATE POLICY sports_insert ON public.sports_records FOR INSERT TO authenticated WITH CHECK (
 owner=auth.uid() AND public.sports_member() AND (public.is_staff() OR (kind IN ('athlete','application') AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND account_type='athlete')) OR (kind IN ('coach','trial','invite') AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND account_type='coach')))
);
DROP POLICY IF EXISTS sports_update ON public.sports_records;
CREATE POLICY sports_update ON public.sports_records FOR UPDATE TO authenticated USING (
 public.sports_member() AND (owner=auth.uid() OR public.is_staff() OR (kind IN ('application','invite') AND data->>'recipient'=auth.uid()::text))
) WITH CHECK (public.sports_member() AND (owner=auth.uid() OR public.is_staff() OR (kind IN ('application','invite') AND data->>'recipient'=auth.uid()::text)));
DROP POLICY IF EXISTS sports_delete ON public.sports_records;
CREATE POLICY sports_delete ON public.sports_records FOR DELETE TO authenticated USING (public.sports_member() AND (owner=auth.uid() OR public.is_staff()));
