INSERT INTO public.core_supplier_settings (name)
SELECT DISTINCT store_name FROM public.external_offers
ON CONFLICT (name) DO NOTHING;
