import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path: string) => readFileSync(path, 'utf8');
it('exclusão limpa conteúdo no banco para ambos os caminhos de exclusão de conta', () => {
  const sql = read('supabase/migrations/20261122220000_account_content_cleanup.sql');
  assert.match(sql, /BEFORE DELETE ON public.profiles/);
  assert.match(sql, /SECURITY DEFINER SET search_path = pg_catalog/);
  assert.match(sql, /REVOKE ALL.*FROM PUBLIC, anon, authenticated/);
  for (const table of ['community_likes','community_posts','products','external_offers','orders','core_sale_events','core_sale_orders','sports_records','coach_activities','support_tickets','community_follows']) {
    assert.ok(sql.includes(`DELETE FROM public.${table}`), table);
  }
  assert.match(sql, /author_id' IS DISTINCT FROM OLD.id::text/);
  assert.match(sql, /jsonb_agg\(c.item ORDER BY c.ordinality\)/);
});
it('central fica na gestão, perfil filtra autor e pagina os produtos pessoais', () => {
  const profile = read('components/ProfileView.tsx');
  assert.ok(!profile.includes('<AdminOffersManager'));
  assert.match(profile, /seller_id === user.id/);
  assert.match(profile, /created_by === user.id/);
  assert.match(profile, /slice\(0, visibleProducts\)/);
  assert.match(profile, /Mostrar mais/);
  assert.match(read('components/admin/AdminDashboard.tsx'), /'Central de Ofertas'/);
  const offers = read('components/admin/AdminOffersManager.tsx');
  assert.match(offers, /slice\(0, visibleCount\)/);
  assert.match(offers, /setVisibleCount\(12\)/);
});
it('botão de menu separado precede a marca no cabeçalho', () => {
  const sidebar = read('components/shared/Sidebar.tsx');
  assert.match(sidebar, /aria-label="Abrir barra de funções"[\s\S]*?<Menu/);
  assert.match(sidebar, /aria-label="Voltar à tela principal"/);
});
