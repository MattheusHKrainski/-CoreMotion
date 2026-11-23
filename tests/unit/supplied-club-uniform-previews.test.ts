import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(path,'utf8');

test('User-submitted club uniform photos have immutable team identities', () => {
  const sql=read('supabase/migrations/20261123063300_catalog_user_submitted_club_uniform_photo_previews.sql');
  for (const club of ['azulim-sicoob-aracoop-mc','montes-claros-volei','norde-volei','praia-clube-uberlandia-volei']) {
    assert.ok(sql.includes('2026-27:' + club),club);
  }
  assert.match(sql,/womens_collection boolean/);
  assert.match(sql,/Linha feminina|vôlei feminino/);
  assert.match(sql,/price_brl numeric\(12,2\)/);
  assert.match(sql,/awaiting_verification/);
  assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
  assert.match(sql,/GRANT SELECT/);
});

test('Uniform photos never masquerade as checkout-eligible offers', () => {
  const ui=read('components/marketplace/ClubUniformPreviewGrid.tsx');
  const marketplace=read('components/marketplace/MarketplaceView.tsx');
  assert.match(ui,/catalog_team_uniform_previews/);
  assert.match(ui,/Compra indisponível/);
  assert.match(ui,/disabled/);
  assert.doesNotMatch(ui,/cart\.add\(|addToCart\(/);
  assert.match(marketplace,/selectedTeam && <ClubUniformPreviewGrid teamId=\{selectedTeam.id\}/);
});

test('Image import workflow preserves four original user-submitted club photos', () => {
  const workflow=read('.github/workflows/import-submitted-uniform-photos.yml');
  for (const filename of ['monte-carmelo-blue-orange.png','montes-claros-black-gold.png','norde-blue-pink.png','dentil-praia-womens-black.png']) {
    assert.ok(workflow.includes(filename),filename);
  }
  assert.match(workflow,/python3 - <<'PY'/);
  assert.match(workflow,/write_bytes/);
});
