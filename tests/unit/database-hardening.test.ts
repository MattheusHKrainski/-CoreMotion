import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const migration = (name: string) => readFileSync(`supabase/migrations/${name}.sql`, 'utf8');

test('protections remain in place for the main administrative account', () => {
  const access = migration('20261122200203_coremotion_database_access_hardening');
  const perf = migration('20261122200319_coremotion_database_query_performance');
  assert.match(access, /public\.is_master_email\(target\.email\)/);
  assert.match(perf, /NOT public\.is_master_email\(email\)/);
});

test('legacy tables have explicit deny policies without opening public grants', () => {
  const sql = migration('20261122200426_coremotion_private_legacy_tables_and_sports_rpc');
  for (const table of ['users', 'sessions', 'stores', 'bookings', 'communities']) {
    assert.match(sql, new RegExp(`CREATE POLICY "${table}_private_deny"`));
  }
  assert.match(sql, /USING \(false\) WITH CHECK \(false\)/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.sports_member\(\) TO authenticated/);
  assert.doesNotMatch(sql, /GRANT EXECUTE[\s\S]*TO anon/);
});

test('catalog and account security hardening does not delete operational rows', () => {
  const all = [
    '20261122200203_coremotion_database_access_hardening',
    '20261122200319_coremotion_database_query_performance',
    '20261122200426_coremotion_private_legacy_tables_and_sports_rpc',
    '20261122200519_coremotion_definer_search_path_hardening',
  ].map(migration).join('\n');
  // Existing authorized admin RPC bodies may delete accounts. Verify no migration-level mass deletion.
  const ddlOnly = all.replace(/AS \$function\$[\s\S]*?\$function\$/g, 'STORED_PROCEDURE_BODY');
  assert.doesNotMatch(ddlOnly, /(?:DELETE\s+FROM|TRUNCATE\s+(?:TABLE\s+)?)\s+(?:public\.)?(?:products|external_offers|profiles|auth\.users)\b/i);
  assert.match(all, /CREATE INDEX IF NOT EXISTS/);
  assert.match(all, /ALTER POLICY/);
  assert.match(all, /SET search_path TO pg_catalog/);
  assert.match(all, /REVOKE ALL ON FUNCTION public\.protect_profile_privileges\(\)/);
});

test('community engagement is derived from stored likes and real comment arrays', () => {
  const sql = migration('20261122200908_coremotion_community_counter_integrity');
  assert.match(sql, /CREATE TRIGGER community_likes_counter_sync/);
  assert.match(sql, /AFTER INSERT OR DELETE ON public\.community_likes/);
  assert.match(sql, /UPDATE public\.community_posts p/);
  assert.match(sql, /jsonb_array_length\(coalesce\(NEW\.comments/);
  assert.match(sql, /Interações devem ser registradas pelos serviços autorizados/);
});
