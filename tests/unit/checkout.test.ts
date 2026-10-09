/** Regras de totais do checkout (espelham compute_order_totals no banco). */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCheckoutTotals } from '../../lib/checkout';

describe('calculateCheckoutTotals', () => {
  it('PIX aplica 5% sobre os itens e soma o frete PAC', () => {
    // 2 x R$ 100,00 = 200,00; desconto 10,00; frete 24,90; total 214,90
    assert.deepEqual(calculateCheckoutTotals(200, 'pac', 'pix'), {
      subtotal: 200,
      shippingFee: 24.9,
      discount: 10,
      total: 214.9,
    });
  });

  it('cartão e boleto não têm desconto', () => {
    const t = calculateCheckoutTotals(200, 'sedex', 'credit_card');
    assert.equal(t.discount, 0);
    assert.equal(t.total, 242.5);
    assert.equal(calculateCheckoutTotals(200, 'express', 'boleto').total, 258);
  });

  it('arredondamento do desconto PIX é igual ao ROUND do PostgreSQL (meio para cima, sem erro de ponto flutuante)', () => {
    // 10,10 x 5% = 0,505 -> PostgreSQL ROUND = 0,51 (ponto flutuante puro daria 0,50)
    assert.equal(calculateCheckoutTotals(10.1, 'pac', 'pix').discount, 0.51);
    // 0,30 x 5% = 0,015 -> 0,02
    assert.equal(calculateCheckoutTotals(0.3, 'pac', 'pix').discount, 0.02);
  });
});
