import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INITIAL_EXTERNAL_OFFERS, LEGACY_SEARCH_OFFERS } from '@/fixtures/real-offers';
import { isProductDestination, refreshLegacyOffers } from '@/lib/offer-catalog';
import { offerCreateSchema, offerUpdateSchema } from '@/lib/schemas/offer.schema';

it('cada oferta revisada tem link de produto, foto da loja e descrição do modelo', () => {
  for (const offer of INITIAL_EXTERNAL_OFFERS) {
    assert.equal(offerCreateSchema.safeParse(offer).success, true);
    assert.equal(isProductDestination(offer.source_url), true);
    assert.match(offer.source_url, /\/p$/);
    assert.match(offer.image_url, /^https:\/\/decathlonpro\.vtexassets\.com\/arquivos\/ids\/\d+\/.+\.jpg$/);
    assert.ok(offer.description.includes(offer.id.split('-').at(-1)!));
    assert.equal(offer.coupon_code, undefined);
  }
});
it('recusa os links legados de busca e categorias no cadastro e na edição', () => {
  for (const source_url of Object.values(LEGACY_SEARCH_OFFERS)) {
    assert.equal(isProductDestination(source_url), false, source_url);
    assert.equal(offerUpdateSchema.safeParse({ source_url }).success, false);
  }
  assert.equal(isProductDestination('https://www.amazon.com.br/'), false);
  assert.equal(isProductDestination('https://www.amazon.com.br/dp/B012345678'), true);
  assert.equal(isProductDestination('https://amzn.to/affiliate'), true);
  assert.equal(isProductDestination('javascript:alert(1)'), false);
});
it('atualiza a curadoria legada sem apagar ofertas personalizadas ou edições administrativas', () => {
  const [id, source_url] = Object.entries(LEGACY_SEARCH_OFFERS)[0];
  const legacy = { ...INITIAL_EXTERNAL_OFFERS[0], id, source_url };
  const custom = { ...INITIAL_EXTERNAL_OFFERS[1], id: 'custom', title: 'Oferta administrativa' };
  const managed = { ...legacy, source_url: 'https://www.amazon.com.br/dp/B012345678' };
  const refreshed = refreshLegacyOffers([legacy, custom]);
  assert.equal(refreshed.some(offer => offer.id === legacy.id), false);
  assert.deepEqual(refreshed.find(offer => offer.id === custom.id), custom);
  assert.deepEqual(refreshLegacyOffers([managed, custom]), [managed, custom]);
  assert.deepEqual(refreshLegacyOffers(refreshed), refreshed);
  // Não restaurar ofertas excluídas por quem administra o catálogo.
  assert.deepEqual(refreshLegacyOffers([]), []);
});
it('não substitui imagens indisponíveis por um produto sem relação', () => {
  const image = readFileSync('components/shared/ProductImage.tsx', 'utf8');
  assert.match(image, /Imagem indisponível/);
  for (const filename of ['ExternalOfferCard', 'ExternalOfferModal']) {
    const source = readFileSync(`components/marketplace/${filename}.tsx`, 'utf8');
    assert.match(source, /ProductImage/);
    assert.doesNotMatch(source, /gps-ciclocomputador-bike/);
  }
  const card = readFileSync('components/marketplace/ProductCard.tsx', 'utf8');
  assert.doesNotMatch(card, /nike-pegasus-1/);
});
