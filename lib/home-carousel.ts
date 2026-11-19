import type { ExternalOffer, Product } from './types';
export type HomeSlide = { kind: 'product'; value: Product } | { kind: 'offer'; value: ExternalOffer };

export function homeCarouselSlides(products: Product[], offers: ExternalOffer[]): HomeSlide[] {
  const listings = products.filter(item => item.product_type === 'c2c' && item.status === 'active');
  const deals = offers.filter(item => item.is_active !== false);
  const result: HomeSlide[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < Math.max(listings.length, deals.length) && result.length < 8; index++) {
    for (const item of [{ kind: 'product', value: listings[index] }, { kind: 'offer', value: deals[index] }] as HomeSlide[]) {
      if (!item.value || seen.has(`${item.kind}-${item.value.id}`)) continue;
      seen.add(`${item.kind}-${item.value.id}`); result.push(item);
      if (result.length === 8) break;
    }
  }
  return result;
}
