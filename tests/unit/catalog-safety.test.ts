import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('public offer API rejects destructive global reset without reaching SQL', () => {
  const route = readFileSync('app/api/offers/route.ts', 'utf8');
  assert.match(route, /if \(action === 'reset'\)/);
  assert.match(route, /Restauração global desativada[\s\S]*409/);
  assert.doesNotMatch(route, /resetExternalOffersInDb/);
});

test('catalog persistence has no delete-all reset operation', () => {
  const source = readFileSync('lib/offer-db.ts', 'utf8');
  assert.doesNotMatch(source, /resetExternalOffersInDb/);
  assert.doesNotMatch(source, /queryDb\(`DELETE FROM public\.external_offers`\)/);
});

test('catalog seed bookkeeping is private and new profiles have no invented hometown', () => {
  const migration = readFileSync('supabase/migrations/20261122194326_protect_catalog_seed_batches.sql', 'utf8');
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL[\s\S]*anon, authenticated/);
  const profiles = readFileSync('lib/db-queries.ts', 'utf8');
  assert.doesNotMatch(profiles, /COALESCE\(\$7, 'São Paulo'\)/);
});
