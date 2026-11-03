-- Applied to the connected project. No password is stored in migrations or source files.
CREATE OR REPLACE FUNCTION public.is_master_email(p_email text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
SELECT lower(coalesce(p_email,'')) IN ('mattheusxmljz@gmail.com','operacaoamd@gmail.com','professorchines2026@gmail.com','admin@coremotiom.com','mattheus.h.krainski@gmail.com'); $$;
UPDATE public.profiles SET role='admin', updated_at=NOW() WHERE lower(email)='mattheus.h.krainski@gmail.com';
