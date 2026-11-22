-- SECURITY DEFINER routines run with privileged credentials: resolve only pg_catalog implicitly.

-- All references to app tables and RPC helpers in these routines are explicitly schema-qualified.

ALTER FUNCTION public.add_community_comment(uuid,text,uuid) SET search_path TO pg_catalog;

ALTER FUNCTION public.community_follow_allowed(uuid) SET search_path TO pg_catalog;

ALTER FUNCTION public.prepare_core_sale(jsonb,jsonb,uuid) SET search_path TO pg_catalog;

ALTER FUNCTION public.review_core_sale(uuid,text,text) SET search_path TO pg_catalog;

ALTER FUNCTION public.set_community_like(uuid,boolean) SET search_path TO pg_catalog;

NOTIFY pgrst, 'reload schema';