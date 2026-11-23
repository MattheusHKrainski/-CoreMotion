import { it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DemoPaymentPanel from '@/components/commerce/DemoPaymentPanel';
import {
  DEMO_TEST_CARDS, demoCardBrand, demoInstallmentValues, demoSampleExpiry,
  formatDemoCardNumber, formatDemoExpiry, isFutureDemoExpiry, validateDemoCard,
} from '@/lib/demo-card';

it('aceita apenas os números de cartão fictícios explícitos e não pede cartão real', () => {
  const today = new Date('2026-11-23T15:00:00');
  assert.equal(DEMO_TEST_CARDS.length, 2);
  assert.equal(formatDemoCardNumber(DEMO_TEST_CARDS[0].number), '4242 4242 4242 4242');
  assert.equal(formatDemoExpiry('1230'), '12/30');
  assert.equal(demoCardBrand('5555 5555 5555 4444'), 'Mastercard');
  assert.equal(demoCardBrand('4111111111111111'), null);
  const valid = { holder: 'CLIENTE TESTE', number: '4242 4242 4242 4242', expiry: '12/30', cvc: '123' };
  assert.equal(validateDemoCard(valid,today), null);
  assert.match(validateDemoCard({ ...valid, number: '4111 1111 1111 1111' },today) || '', /Cartões reais não são aceitos/);
  assert.match(validateDemoCard({ ...valid, expiry: '01/25' },today) || '', /validade fictícia/);
  assert.match(validateDemoCard({ ...valid, cvc: '12' },today) || '', /CVV fictício/);
  assert.equal(isFutureDemoExpiry('11/26',today), true);
  assert.equal(isFutureDemoExpiry('10/26',today), false);
  assert.equal(isFutureDemoExpiry('13/30',today), false);
  assert.equal(demoSampleExpiry(today), '12/28');
});

it('parcelamento em centavos mantém o total exato mesmo com divisão não inteira', () => {
  const subtotal = 20990;
  for (let count = 1; count <= 6; count++) {
    const result = demoInstallmentValues(subtotal,count);
    assert.equal(result.regular * (count - 1) + result.last, subtotal);
  }
  assert.throws(() => demoInstallmentValues(-1,3));
});

it('renderiza campos próximos ao checkout real, preservando rótulos de ambiente demonstrativo', () => {
  const props = { onMethodChange() {}, subtotal: 20990, available: true, busy: false, async onConfirm() {} };
  const credit = renderToStaticMarkup(React.createElement(DemoPaymentPanel,{...props,method:'credit'}));
  for(const fragment of ['Número do cartão de teste','Nome impresso no cartão','Validade (MM/AA)','CVV fictício','Parcelamento sem juros','Cartões reais não são aceitos','Confirmar pedido simulado'])assert.ok(credit.includes(fragment), fragment);
  assert.match(credit, /type="password"/);
  const pix = renderToStaticMarkup(React.createElement(DemoPaymentPanel,{...props,method:'pix'}));
  assert.match(pix,/Gerar Pix de demonstração/);
  assert.doesNotMatch(pix,/000201[a-z0-9]/i);
  const boleto = renderToStaticMarkup(React.createElement(DemoPaymentPanel,{...props,method:'boleto'}));
  assert.match(boleto,/Emitir boleto de demonstração/);
  assert.match(boleto,/Vencimento ilustrativo/);
});
