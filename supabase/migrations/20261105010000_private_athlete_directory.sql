-- Only coaches and moderation staff browse athlete résumés. Athletes retain their own profile.
DROP POLICY IF EXISTS sports_read ON public.sports_records;
CREATE POLICY sports_read ON public.sports_records FOR SELECT TO authenticated USING (
 NOT public.is_banned_user() AND (
  public.is_staff() OR
  (kind='coach' AND auth.uid() IS NOT NULL) OR
  (kind='trial' AND public.sports_member()) OR
  (kind='athlete' AND public.sports_member() AND (owner=auth.uid() OR EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.account_type='coach'))) OR
  (kind IN ('application','invite') AND public.sports_member() AND (owner=auth.uid() OR data->>'recipient'=auth.uid()::text))
 )
);
