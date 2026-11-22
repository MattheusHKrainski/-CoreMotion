import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string): string => readFileSync(path, 'utf8');
const migration = (version: string, name: string) => read('supabase/migrations/' + version + '_' + name + '.sql');

test('Realtime publication contains every live shared and account workflow', () => {
  const sql = migration('20261122203023', 'realtime_collaborative_workflows_and_coach_read');
  for (const table of [
    'account_notifications', 'coach_activities', 'community_follows', 'community_likes',
    'core_sale_orders', 'core_sale_events', 'core_supplier_settings', 'moderation_reports',
    'moderation_audit', 'orders', 'platform_settings', 'support_tickets',
  ]) assert.ok(sql.includes("'" + table + "'"), 'Missing Realtime table ' + table);
  assert.ok(sql.includes('ALTER PUBLICATION supabase_realtime ADD TABLE'));
  assert.ok(sql.includes('CREATE POLICY coach_activities_public_read'));
  assert.ok(sql.includes('CREATE POLICY coach_activities_member_read'));
  assert.ok(!sql.includes('GRANT EXECUTE'));
});

test('Safe invalidation covers deletes and visibility changes without publishing private records', () => {
  const sql = migration('20261122203448', 'realtime_public_change_invalidation');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.realtime_invalidations'));
  assert.ok(sql.includes('ALTER TABLE public.realtime_invalidations ENABLE ROW LEVEL SECURITY'));
  assert.ok(sql.includes('GRANT SELECT ON TABLE public.realtime_invalidations TO anon, authenticated'));
  assert.ok(sql.includes('REVOKE ALL ON TABLE public.realtime_invalidations'));
  assert.ok(sql.includes('FOR EACH ROW EXECUTE FUNCTION public.bump_public_content_revision()'));
  assert.ok(sql.includes('AFTER INSERT OR UPDATE OR DELETE ON public.products'));
  assert.ok(sql.includes('AFTER INSERT OR UPDATE OR DELETE ON public.external_offers'));
  assert.ok(sql.includes('AFTER INSERT OR UPDATE OR DELETE ON public.community_posts'));
  assert.ok(sql.includes('ADD TABLE public.realtime_invalidations'));
  assert.ok(!sql.includes('REPLICA IDENTITY FULL'));
  assert.ok(!sql.includes('GRANT INSERT ON TABLE public.realtime_invalidations'));
});

test('Community feed uses Realtime subscriptions and RLS-authoritative reloads', () => {
  const store = read('lib/store.tsx');
  for (const table of ['products', 'external_offers', 'community_posts', 'news', 'coaches', 'realtime_invalidations']) {
    assert.ok(store.includes("table: '" + table + "'"), 'Store not watching ' + table);
  }
  assert.ok(store.includes("if (status === 'SUBSCRIBED') resync()"));
  assert.ok(store.includes('setInterval(resync, 60000)'));
  assert.ok(store.includes("window.addEventListener('online', resync)"));
  assert.ok(store.includes('client.removeChannel(channel)'));
  assert.ok(store.includes('prev.filter((entry) => entry.id !== newPost.id)'));
  assert.ok(store.includes('prev.filter((entry) => entry.id !== newProduct.id)'));
  assert.ok(store.includes("'community_likes', filter: 'user_id=eq.' + id"));
});

test('Private and collaborative views clean up listeners and recover after reconnection', () => {
  const hook = read('hooks/useRealtimeRefresh.ts');
  assert.ok(hook.includes("status === 'SUBSCRIBED'"));
  assert.ok(hook.includes("event: '*'"));
  assert.ok(hook.includes('visibilitychange'));
  assert.ok(hook.includes('removeChannel(channel)'));
  assert.ok(hook.includes('clearInterval(fallback)'));
  const sources: Record<string, string> = {
    'components/shared/NotificationsInbox.tsx': 'account_notifications',
    'components/commerce/OrdersPage.tsx': 'core_sale_orders',
    'components/shared/HelpCenter.tsx': 'support_tickets',
    'components/CoachActivities.tsx': 'coach_activities',
    'components/SportsActivityView.tsx': 'sports_records',
    'components/SportsHub.tsx': 'sports_records',
    'components/CoachProfiles.tsx': 'sports_records',
    'components/CommunityView.tsx': 'community_follows',
  };
  for (const [filename, table] of Object.entries(sources)) {
    const source = read(filename);
    assert.ok(source.includes('useRealtimeRefresh'), filename + ' missing Realtime sync hook');
    assert.ok(source.includes("table: '" + table + "'"), filename + ' missing ' + table);
  }
  const admin = read('components/admin/AdminDashboard.tsx');
  for (const table of ['profiles','products','external_offers','community_posts','sports_records','moderation_reports','orders','moderation_audit']) {
    assert.ok(admin.includes("'" + table + "'"), 'Admin tab missing Realtime table ' + table);
  }
});

test('Connected database errors never silently replace real community content with fixtures', () => {
  const service = read('services/communityService.ts');
  assert.ok(service.includes("if (!sb) return demoPosts()"));
  assert.ok(service.includes('if (error || !data) throw'));
  assert.ok(service.includes('throw error instanceof Error ? error'));
});
