-- Applies only to new identities. Does not promote accounts or confirm addresses.
CREATE OR REPLACE FUNCTION public.validate_signup_email_provider()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.email IS NULL OR lower(btrim(NEW.email)) !~ '^[^[:space:]@]+@(gmail[.]com|hotmail[.]com|outlook[.]com)$' THEN
  RAISE EXCEPTION 'Use um e-mail @gmail.com, @hotmail.com ou @outlook.com.' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS validate_signup_email_provider ON auth.users;
CREATE TRIGGER validate_signup_email_provider BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.validate_signup_email_provider();
