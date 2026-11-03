import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
it('o catálogo conectado respeita o banco sem misturar seeds ou descartar anúncios antigos', () => {
  const store = readFileSync('lib/store.tsx','utf8');
  assert.match(store, /setProducts\(liveProducts\)/);
  assert.doesNotMatch(store, /recentUserListings|new Date\('2026-10-22/);
  assert.match(store, /from\('external_offers'\)/);
  const db = readFileSync('lib/db-queries.ts','utf8');
  assert.match(db, /image_is_reference: Boolean\(row.image_is_reference\)/);
  assert.match(db, /account_type: row.account_type/);
});
