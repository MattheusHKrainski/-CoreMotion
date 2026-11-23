import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path: string) => readFileSync(path, 'utf8');

test('reference-only products are never presented as purchasable C2C stock', () => {
  const store = read('lib/store.tsx');
  assert.match(store, /if \(!live\.seller_id\)/);
  const card = read('components/marketplace/ProductCard.tsx');
  const detail = read('components/marketplace/ProductDetailModal.tsx');
  assert.match(card, /disabled=\{!hasIdentifiedSeller \|\|/);
  assert.match(detail, /disabled=\{!hasIdentifiedSeller \|\|/);
  assert.match(card, /não está à venda/);
  assert.match(detail, /não disponível para compra/);
});

test('photo sources and authors of used-item reference galleries are documented', () => {
  const docs = read('docs/c2c-used-images-licensed-mapping-2026-11-23.md');
  for (const file of ['Nike_used_shoes_01.jpg', 'Adidas_used_0001.JPG', 'Avia_used_shoes.jpg']) assert.ok(docs.includes(file));
  assert.match(docs, /Joxemai/);
  assert.match(docs, /CC BY-SA 3\.0/);
  assert.match(docs, /CC BY-SA 4\.0/);
});
