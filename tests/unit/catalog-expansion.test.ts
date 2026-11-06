import { it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { INITIAL_PRODUCTS } from '@/fixtures/initial-data';
import { CATALOG_EXPANSION } from '@/fixtures/catalog-expansion';
import { INITIAL_EXTERNAL_OFFERS, EXPANSION_OFFERS } from '@/fixtures/real-offers';
import { ATHLETE_C2C_LISTINGS } from '@/fixtures/athlete-listings';
import { LEGACY_ATHLETE_SIGNATURES } from '@/fixtures/legacy-athlete-signatures';
import { refreshAthleteCatalog } from '@/lib/athlete-catalog';
import { appendExpansionOffers } from '@/lib/offer-catalog';

it('amplia para 22 ofertas e mantém 24 anúncios com imagens únicas e preços positivos', () => {
  assert.equal(INITIAL_EXTERNAL_OFFERS.length, 22);
  assert.equal(ATHLETE_C2C_LISTINGS.length, 24);
  const images = [...INITIAL_EXTERNAL_OFFERS.map(p => p.image_url), ...ATHLETE_C2C_LISTINGS.flatMap(p => p.images)];
  assert.equal(new Set(images).size, images.length);
  for (const p of ATHLETE_C2C_LISTINGS) {
    assert.ok(p.price > 0);
    assert.ok(p.description.includes('referência'));
    for (const image of p.images) if (image.startsWith('/')) assert.ok(existsSync(`public${image}`), image);
  }
  for (const entry of CATALOG_EXPANSION) {
    const athlete = INITIAL_PRODUCTS.find(p => p.id === `c2c-${entry.key}`)!;
    assert.equal(athlete.title, entry.title);
    assert.equal(athlete.images[0], entry.athlete_image);
    assert.ok(athlete.price < entry.price);
    assert.equal(athlete.contact_phone, '5541988918146');
  }
});
it('corrige divergências de cor e marca e remove imagens sem relação da galeria', () => {
  const nike = ATHLETE_C2C_LISTINGS.find(p => p.id === 'c2c-tenis-asics-nimbus-26-42')!;
  assert.match(nike.title, /Nike Cinza/);
  assert.doesNotMatch(nike.title, /Asics|Nimbus/);
  const bottle = ATHLETE_C2C_LISTINGS.find(p => p.id === 'c2c-garrafa-termica-inox-750ml')!;
  assert.match(bottle.title, /Verde/);
  assert.doesNotMatch(bottle.title, /Preta|Stanley|750ml/);
  const cap = ATHLETE_C2C_LISTINGS.find(p => p.id === 'c2c-bone-nike-aerobill-preto')!;
  assert.match(cap.title, /Branco/);
  assert.equal(cap.brand, undefined);
  const shirt = ATHLETE_C2C_LISTINGS.find(p => p.id === 'c2c-camisa-selecao-torcedor-g')!;
  assert.equal(shirt.images.length, 1);
});
it('a atualização local é única e preserva edições, status e exclusões posteriores', () => {
  const current = ATHLETE_C2C_LISTINGS.find(p => p.id === 'c2c-tenis-asics-nimbus-26-42')!;
  const [title, description, price, images, brand, usage_time, original_price] = JSON.parse(LEGACY_ATHLETE_SIGNATURES[current.id]);
  const legacy = { ...current, title, description, price, images, brand, usage_time, original_price, status: 'sold' as const };
  const result = refreshAthleteCatalog([legacy], false);
  assert.equal(result.find(p => p.id === current.id)?.title, current.title);
  assert.equal(result.find(p => p.id === current.id)?.status, 'sold');
  const edited = { ...legacy, price: 310 };
  assert.equal(refreshAthleteCatalog([edited], false).find(p => p.id === edited.id), edited);
  assert.deepEqual(refreshAthleteCatalog([], true), []);
  assert.deepEqual(appendExpansionOffers([], true), []);
  const offer = { ...EXPANSION_OFFERS[0], title: 'Editado pelo administrador' };
  assert.equal(appendExpansionOffers([offer], false).find(p => p.id === offer.id), offer);
});
