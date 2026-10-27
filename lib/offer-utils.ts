import type { ExternalOffer } from './types';

/** Calcula o percentual de desconto sem depender de fixtures de demonstração. */
export function getOfferDiscountPercent(offer: Pick<ExternalOffer, 'price' | 'original_price'>): number | null {
  if (!offer.original_price || offer.original_price <= offer.price) return null;
  return Math.round(((offer.original_price - offer.price) / offer.original_price) * 100);
}
