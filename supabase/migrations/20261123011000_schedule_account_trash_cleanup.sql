GRANT SELECT,DELETE ON public.account_trash TO service_role;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
-- Endpoint ignores request input; no caller can nominate an account or change a deadline.
-- Server-side service client selects only expired entries, removes Storage through its
-- API first and then Auth (with cascading deletion). Failed entries retry next hour.
SELECT cron.schedule('coremotion-purge-account-trash','17 * * * *',$job$
 SELECT net.http_post(url:='https://erpwfjdycdlygxwkdakv.supabase.co/functions/v1/purge-account-trash',body:='{}'::jsonb,timeout_milliseconds:=120000);
$job$);
