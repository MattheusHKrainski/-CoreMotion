import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('Club filters keep their title without redundant badge', () => {
  const component = read('components/marketplace/CatalogTeams.tsx');
  assert.match(component, /Campeonato e clube/);
  assert.doesNotMatch(component, /Filtro específico/);
});

test('Brazilian club shirts are versioned with genuine SKU photos and club associations', () => {
  const sql = [
    'supabase/migrations/20261123051300_verified_brazilian_club_shirts.sql',
    'supabase/migrations/20261123052000_verified_brazilian_club_shirts_extra.sql',
  ].map(read).join('\n');
  const ids = [...sql.matchAll(/'verified-br-[a-z0-9-]+'/g)].map(m => m[0]);
  assert.equal(ids.length, 10);
  assert.equal(new Set(ids).size, 10);
  for (const club of ['volei-renata', 'itambe-minas', 'minas-tenis-clube', 'bauru-basket', 'paulistano']) {
    assert.ok(sql.includes('2026-27:' + club), club);
  }
  assert.match(sql, /image_urls/);
  assert.match(sql, /variant_options/);
  assert.match(sql, /NOT EXISTS/);
  assert.match(sql, /ON CONFLICT/);
});
