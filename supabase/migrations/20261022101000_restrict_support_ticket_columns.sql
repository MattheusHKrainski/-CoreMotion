-- Supabase default table privileges can otherwise override column-level grants.
REVOKE ALL ON public.support_tickets FROM anon, authenticated;
GRANT SELECT ON public.support_tickets TO authenticated;
GRANT INSERT(category,subject,message,reference) ON public.support_tickets TO authenticated;
GRANT UPDATE(status,response) ON public.support_tickets TO authenticated;
NOTIFY pgrst, 'reload schema';
