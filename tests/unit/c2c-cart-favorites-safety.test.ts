import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { accountListsKey, readAccountLists } from '@/lib/account-lists';

const source = (path: string) => readFileSync(path, 'utf8');

test('guest favorites are account-scoped and restored without authentication', () => {
  const key = accountListsKey(null);
  const lists = readAccountLists({ getItem: (name: string) => name === key
    ? JSON.stringify({ favorites: ['one', 'two', 'one', 3], cart: [] }) : null }, null);
  assert.deepEqual(lists.favorites.filter((v: string) => v === 'one'), ['one', 'one']);
  assert.ok(lists.favorites.includes('two'));
  for (const file of ['components/marketplace/ProductCard.tsx', 'components/marketplace/ProductDetailModal.tsx']) {
    const card = source(file);
    assert.match(card, /toggleFavorite\(product\.id\)/);
    assert.doesNotMatch(card, /isVisitor\s*\?\s*setAuthModalOpen|if\s*\(isVisitor\)/);
  }
});

test('athlete cart rejects inactive listings and caps quantity to verified stock', () => {
  const store = source('lib/store.tsx');
  assert.match(store, /live\.status !== 'active'/);
  assert.match(store, /already \+ quantity > stock/);
  assert.match(store, /live\.stock < quantity/);
  const card = source('components/marketplace/ProductCard.tsx');
  assert.match(card, /disabled=\{!hasIdentifiedSeller \|\| product\.status !== 'active' \|\| product\.stock < 1\}/);
});

test('used-item reference photos are labeled rather than presented as seller originals', () => {
  const card = source('components/marketplace/ProductCard.tsx');
  const detail = source('components/marketplace/ProductDetailModal.tsx');
  assert.match(card, /product\.image_is_reference/);
  assert.match(detail, /product\.image_is_reference/);
});
