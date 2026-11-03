import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_OFFERS, getOfferDiscountPercent } from '../../fixtures/demo-offers';

describe('DEMO_OFFERS', () => {
  it('marca cada oferta como fictícia e usa somente domínios reservados .test', () => {
    assert.ok(DEMO_OFFERS.length > 0);
    for (const offer of DEMO_OFFERS) {
      assert.equal(offer.is_demo, true);
      const source = new URL(offer.source_url);
      assert.equal(source.protocol, 'https:');
      assert.ok(source.hostname.endsWith('.example.test'), `${source.hostname} não é um domínio de demonstração reservado`);
    }
  });

  it('calcula o desconto apenas quando há preço original maior', () => {
    assert.equal(getOfferDiscountPercent({ price: 75, original_price: 100 }), 25);
    assert.equal(getOfferDiscountPercent({ price: 100 }), null);
    assert.equal(getOfferDiscountPercent({ price: 100, original_price: 100 }), null);
  });
});
