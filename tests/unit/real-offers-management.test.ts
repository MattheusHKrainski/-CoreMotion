import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_EXTERNAL_OFFERS } from '@/fixtures/real-offers';
import {
  detectStoreNameFromHost,
  offerCreateSchema,
  offerUpdateSchema,
} from '@/lib/schemas/offer.schema';

describe('Real External Offers & Admin Affiliate Management', () => {
  it('ships real curated offers with HTTPS store URLs, non-demo mode, and 100% unique images', () => {
    assert.ok(INITIAL_EXTERNAL_OFFERS.length >= 8);

    const images = new Set<string>();
    const urls = new Set<string>();

    for (const offer of INITIAL_EXTERNAL_OFFERS) {
      assert.equal(offer.is_demo, false);
      assert.equal(offer.is_active, true);
      assert.equal(offer.source_url.startsWith('https://'), true);
      assert.equal(offer.source_url.includes('.example.test'), false);
      assert.ok(offer.price > 0);
      images.add(offer.image_url);
      urls.add(offer.source_url);
    }

    assert.equal(images.size, INITIAL_EXTERNAL_OFFERS.length);
    assert.equal(urls.size, INITIAL_EXTERNAL_OFFERS.length);
  });

  it('validates real store links, affiliate links, uploaded photos, and blocks unsafe schemes', () => {
    const validAffiliate = offerCreateSchema.safeParse({
      title: 'Ciclocomputador GPS AliExpress Choice',
      description: 'Oferta real com envio do Brasil e frete grátis.',
      store_name: 'AliExpress',
      category: 'Tecnologia & Wearables',
      sport: 'Ciclismo',
      price: 159.9,
      original_price: 279.9,
      image_url: 'https://ae01.alicdn.com/kf/product-photo.jpg',
      source_url: 'https://s.click.aliexpress.com/e/_exampleAffiliateCode',
      coupon_code: 'BRASIL15',
    });
    assert.equal(validAffiliate.success, true);

    const unsafeJsLink = offerCreateSchema.safeParse({
      title: 'Oferta inválida',
      description: 'Tentativa XSS',
      store_name: 'Teste',
      price: 99,
      image_url: '/offers/gps-ciclocomputador-bike.jpg',
      source_url: 'javascript:alert(1)',
    });
    assert.equal(unsafeJsLink.success, false);

    const partialUpdate = offerUpdateSchema.safeParse({
      source_url: 'https://amzn.to/3exampleAmazonTag',
      price: 129.9,
    });
    assert.equal(partialUpdate.success, true);
  });

  it('detects popular Brazilian & international e-commerce and affiliate hostnames', () => {
    assert.equal(detectStoreNameFromHost('s.click.aliexpress.com'), 'AliExpress');
    assert.equal(detectStoreNameFromHost('pt.aliexpress.com'), 'AliExpress');
    assert.equal(detectStoreNameFromHost('lista.mercadolivre.com.br'), 'Mercado Livre');
    assert.equal(detectStoreNameFromHost('amzn.to'), 'Amazon Brasil');
    assert.equal(detectStoreNameFromHost('www.amazon.com.br'), 'Amazon Brasil');
    assert.equal(detectStoreNameFromHost('shopee.com.br'), 'Shopee');
    assert.equal(detectStoreNameFromHost('www.netshoes.com.br'), 'Netshoes');
    assert.equal(detectStoreNameFromHost('www.centauro.com.br'), 'Centauro');
    assert.equal(detectStoreNameFromHost('www.decathlon.com.br'), 'Decathlon');
  });
});
