/**
 * Regras de totais do checkout. Espelham exatamente a função compute_order_totals do banco
 * (supabase/migrations/20261009000000_security_fixes.sql): o servidor recalcula o pedido ao gravar.
 * Aritmética em centavos inteiros, com arredondamento igual ao ROUND do PostgreSQL.
 */
export type ShippingMethod = 'pac' | 'sedex' | 'express';
export type CheckoutPaymentMethod = 'pix' | 'credit_card' | 'boleto';

/** Valor do frete por método, em reais. */
export const SHIPPING_FEES: Record<ShippingMethod, number> = {
  pac: 24.9,
  sedex: 42.5,
  express: 58,
};

/** Desconto do PIX: 5% sobre o subtotal dos itens (sem frete). */
export const PIX_DISCOUNT_PERCENT = 5;

export interface CheckoutTotals {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

const toCents = (value: number): number => Math.round(value * 100);

export function calculateCheckoutTotals(
  subtotal: number,
  shippingMethod: ShippingMethod,
  paymentMethod: CheckoutPaymentMethod
): CheckoutTotals {
  const subtotalCents = toCents(subtotal);
  // round-half-up em inteiros: floor((c * 5 + 50) / 100) == ROUND(c * 0.05) para valores positivos
  const discountCents =
    paymentMethod === 'pix' ? Math.floor((subtotalCents * PIX_DISCOUNT_PERCENT + 50) / 100) : 0;
  const shippingCents = toCents(SHIPPING_FEES[shippingMethod]);
  const totalCents = subtotalCents - discountCents + shippingCents;
  return {
    subtotal: subtotalCents / 100,
    shippingFee: shippingCents / 100,
    discount: discountCents / 100,
    total: totalCents / 100,
  };
}
