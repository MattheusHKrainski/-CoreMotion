import { it } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_PRODUCTS } from '@/fixtures/initial-data';
import { ATHLETE_CATALOG_PHONE, refreshSeededContacts } from '@/lib/athlete-contact';
import { sellerContactUrl } from '@/lib/seller-contact';

it('os anúncios de atleta do catálogo possuem o contato autorizado', () => {
  const products = INITIAL_PRODUCTS.filter(p => p.product_type === 'c2c');
  assert.ok(products.length > 0);
  for (const product of products) {
    assert.equal(product.contact_phone, ATHLETE_CATALOG_PHONE, product.id);
    assert.match(sellerContactUrl(product.contact_phone, product.title)!, /^https:\/\/wa.me\/5541988918146\?text=/);
  }
});
it('atualiza cópias antigas sem mudar o telefone de outros vendedores', () => {
  const seed = INITIAL_PRODUCTS.find(p => p.product_type === 'c2c')!;
  const old = { ...seed, contact_phone: undefined };
  const custom = { ...seed, contact_phone: '5541999999999' };
  const own = { ...old, id: 'new-seller-listing' };
  const result = refreshSeededContacts([old, custom, own], INITIAL_PRODUCTS);
  assert.equal(result[0].contact_phone, ATHLETE_CATALOG_PHONE);
  assert.equal(result[1], custom);
  assert.equal(result[2], own);
  assert.equal(refreshSeededContacts(result, INITIAL_PRODUCTS)[0], result[0]);
});
