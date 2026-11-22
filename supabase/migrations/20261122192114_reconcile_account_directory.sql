-- Restore the directory entry for existing sign-ins that predate profile provisioning.
INSERT INTO public.profiles
  (id, email, name, avatar_url, role, account_type, city, state, sport_interests,
   created_at, updated_at, is_banned)
SELECT a.id, lower(a.email),
       coalesce(nullif(trim(m->>'name'), ''), nullif(trim(m->>'full_name'), ''), split_part(a.email, '@', 1)),
       coalesce(m->>'avatar_url', m->>'picture'), 'user',
       CASE WHEN m->>'account_type' IN ('athlete','coach','casual') THEN m->>'account_type' ELSE 'athlete' END,
       coalesce(m->>'city',''), coalesce(m->>'state',''),
       CASE WHEN length(trim(m->>'sport')) BETWEEN 1 AND 60 THEN ARRAY[trim(m->>'sport')] ELSE ARRAY[]::text[] END,
       a.created_at, now(), coalesce(a.banned_until > now(), false)
FROM auth.users a
CROSS JOIN LATERAL (SELECT a.raw_user_meta_data AS m) metadata
WHERE a.deleted_at IS NULL AND NOT coalesce(a.is_anonymous, false) AND a.email IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = a.id)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime'
                 AND schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
