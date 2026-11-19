import type { ExternalOffer, Product } from './types';

export type WelcomeCatalogFilter = 'all' | 'athletes' | 'offers';
export type WelcomeCatalogItem = { kind: 'product'; value: Product } | { kind: 'offer'; value: ExternalOffer };

/** Use the live catalog only; never restore seeds over edits or deleted listings. */
export function welcomeCatalogItems(products: Product[], offers: ExternalOffer[], filter: WelcomeCatalogFilter): WelcomeCatalogItem[] {
  const listings: WelcomeCatalogItem[] = products.filter(product => product.product_type === 'c2c' && product.status === 'active').slice(0, 4).map(value => ({ kind: 'product', value }));
  const deals: WelcomeCatalogItem[] = offers.filter(offer => offer.is_active !== false).slice(0, 4).map(value => ({ kind: 'offer', value }));
  if (filter === 'athletes') return listings;
  if (filter === 'offers') return deals;
  const items: WelcomeCatalogItem[] = [];
  for (let index = 0; index < 4; index++) {
    if (listings[index]) items.push(listings[index]);
    if (deals[index]) items.push(deals[index]);
  }
  return items.slice(0, 4);
}
