import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (file: string) => readFileSync(file,'utf8');

test('Sold-out catalog entries stay visible but cannot be bought from cards, details, or checkout', () => {
  const card=read('components/marketplace/ExternalOfferCard.tsx');
  const detail=read('components/commerce/ProductPage.tsx');
  const checkout=read('components/commerce/CheckoutPage.tsx');
  assert.match(card,/offer\.stock_status === 'sold_out'/);
  assert.match(card,/disabled=\{soldOut\}/);
  assert.match(card,/Esgotado/);
  assert.match(detail,/soldOut \|\| variantRequired/);
  assert.match(detail,/!available \|\| soldOut/);
  assert.match(checkout,/line\.offer\.stock_status !== 'sold_out'/);
});

test('Database protects against direct checkout of sold-out stock', () => {
  const sql=read('supabase/migrations/20261123054032_block_checkout_for_sold_out_catalog_jerseys.sql');
  assert.match(sql,/stock_status IN \('available','sold_out'\)/);
  assert.match(sql,/AND stock_status = ''available'' FOR SHARE/);
  assert.match(sql,/prepare_core_sale/);
  assert.match(sql,/RAISE EXCEPTION 'Checkout RPC changed unexpectedly/);
});

test('Source-verified jerseys contain direct product photographs, club IDs, explicit stock states, and actual prices', () => {
  const files = [
    '20261123055100_verified_sold_out_brazilian_volleyball_jerseys.sql',
    '20261123055500_verified_more_brazilian_club_uniforms.sql',
    '20261123055800_official_uniao_corinthians_jersey.sql',
  ];
  const sql=files.map(file=>read('supabase/migrations/'+file)).join('\n');
  for(const team of ['saneago-goias-volei','viapol-volei-sao-jose','azulim-sicoob-aracoop-mc','sada-cruzeiro','suzano-volei','basket-osasco','ceisc-uniao-corinthians']) assert.ok(sql.includes(team),team);
  assert.match(sql,/stock_status/);
  assert.match(sql,/WHERE EXISTS/i);
  assert.match(sql,/ON CONFLICT/i);
  assert.match(read('lib/schemas/offer.schema.ts'),/stock_status: z\.enum/);
});
