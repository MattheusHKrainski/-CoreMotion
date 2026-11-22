DROP POLICY IF EXISTS core_suppliers_staff ON public.core_supplier_settings;
CREATE POLICY core_suppliers_staff_read ON public.core_supplier_settings
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY core_suppliers_admin_insert ON public.core_supplier_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY core_suppliers_admin_update ON public.core_supplier_settings
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
