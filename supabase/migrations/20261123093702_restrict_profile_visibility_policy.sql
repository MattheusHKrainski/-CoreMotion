-- ========================================
-- COREMOTION | VISIBILIDADE DE PERFIS V1
-- Responsabilidade: combinar a politica de exclusao logica com a
-- politica principal de acesso, sem permissao adicional por OR.
-- ========================================
DROP POLICY IF EXISTS trash_hide_profiles ON public.profiles;
CREATE POLICY trash_hide_profiles
  ON public.profiles AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    (NOT public.is_account_trashed(id))
    OR (id = (SELECT auth.uid()))
    OR (SELECT public.is_staff())
  );
NOTIFY pgrst, 'reload schema';
