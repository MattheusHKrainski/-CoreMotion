import { it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_EXTERNAL_OFFERS } from '@/fixtures/real-offers';
import HomeBlackFriday, { discountedOffers } from '@/components/HomeBlackFriday';
import { getOfferDiscountPercent } from '@/lib/offer-utils';

it('Black Friday usa somente descontos positivos de ofertas ativas e preços válidos', () => {
  const item = INITIAL_EXTERNAL_OFFERS[0];
  assert.deepEqual(discountedOffers([
    { ...item, is_active: false, price: 50, original_price: 100 },
    { ...item, price: 100, original_price: 50 },
    { ...item, price: 100, original_price: undefined },
    { ...item, price: -10, original_price: 100 },
    { ...item, price: 10, original_price: Infinity },
  ]), []);
  const results = discountedOffers(INITIAL_EXTERNAL_OFFERS);
  assert.ok(results.length > 0);
  assert.ok(results.every((item, index) => index === 0 || getOfferDiscountPercent(results[index - 1])! >= getOfferDiscountPercent(item)!));
});
it('vitrine de campanha não fabrica percentuais ou produtos quando não há ofertas', () => {
  const html = renderToStaticMarkup(React.createElement(HomeBlackFriday, { offers: [], onExplore() {} }));
  assert.match(html, /BLACK/);
  assert.match(html, /Nenhum desconto informado/);
  assert.doesNotMatch(html, /\d+% OFF|contagem regressiva/i);
});
it('destaque exibe o mesmo produto, preço e percentual do catálogo', () => {
  const first = discountedOffers(INITIAL_EXTERNAL_OFFERS)[0];
  const html = renderToStaticMarkup(React.createElement(HomeBlackFriday, { offers: INITIAL_EXTERNAL_OFFERS, onExplore() {} }));
  assert.ok(html.includes(first.title));
  assert.ok(html.includes(`ATÉ ${getOfferDiscountPercent(first)}% OFF`));
  assert.match(html, /Descontos calculados sobre preços de referência dos fornecedores/);
});
