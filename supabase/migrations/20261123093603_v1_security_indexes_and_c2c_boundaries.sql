-- ========================================
-- COREMOTION | SEGURANCA E INTEGRIDADE V1
-- Responsabilidade: corrigir indices, RLS e chamadas publicas expostas,
-- mantendo o checkout CoreShop via RPC e anuncios C2C por contato direto.
-- ========================================

CREATE INDEX IF NOT EXISTS account_trash_deleted_by_idx
  ON public.account_trash (deleted_by);
CREATE INDEX IF NOT EXISTS product_moderation_trash_deleted_by_idx
  ON public.product_moderation_trash (deleted_by);
CREATE INDEX IF NOT EXISTS support_messages_author_id_idx
  ON public.support_messages (author_id);

-- Funcoes de trigger nao devem ser acessiveis como RPC.
REVOKE EXECUTE ON FUNCTION public.protect_community_columns()
  FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS trash_hide_profiles ON public.profiles;
CREATE POLICY trash_hide_profiles ON public.profiles FOR SELECT TO authenticated
  USING (
    (NOT public.is_account_trashed(id))
    OR (id = (SELECT auth.uid()))
    OR (SELECT public.is_staff())
  );

DROP POLICY IF EXISTS support_messages_read ON public.support_messages;
CREATE POLICY support_messages_read ON public.support_messages FOR SELECT TO authenticated
  USING (
    (NOT (SELECT public.is_banned_user()))
    AND EXISTS (
      SELECT 1 FROM public.support_tickets AS t
      WHERE t.id = support_messages.ticket_id
        AND (
          t.owner = (SELECT auth.uid())
          OR (SELECT public.is_staff())
        )
    )
  );

-- Pedidos C2C so por contato com o anunciante. O antigo INSERT direto
-- aceitava precos/status vindos do cliente. Preservamos todos os registros.
DROP POLICY IF EXISTS orders_insert ON public.orders;
REVOKE INSERT ON TABLE public.orders FROM authenticated, anon;
DROP POLICY IF EXISTS orders_update ON public.orders;
CREATE POLICY orders_update ON public.orders FOR UPDATE TO authenticated
  USING ((SELECT public.is_staff()) AND NOT (SELECT public.is_banned_user()))
  WITH CHECK ((SELECT public.is_staff()) AND NOT (SELECT public.is_banned_user()));

NOTIFY pgrst, 'reload schema';
