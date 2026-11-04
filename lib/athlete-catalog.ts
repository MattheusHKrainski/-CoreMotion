import { ATHLETE_C2C_LISTINGS, ADDED_ATHLETE_LISTINGS } from '@/fixtures/athlete-listings';
import { LEGACY_ATHLETE_SIGNATURES } from '@/fixtures/legacy-athlete-signatures';
import { ATHLETE_CATALOG_PHONE } from './athlete-contact';
import type { Product } from './types';
const signature = (p: Product) => JSON.stringify([p.title,p.description,p.price,p.images,p.brand,p.usage_time,p.original_price]);

/** One-time review for untouched seed copies; preserve edited/deleted listings on later visits. */
export function refreshAthleteCatalog(products: Product[], alreadyUpdated: boolean): Product[] {
  if (alreadyUpdated) return products;
  const seeds = new Map(ATHLETE_C2C_LISTINGS.map(p => [p.id, p]));
  const refreshed = products.map(p => {
    const seed = seeds.get(p.id);
    if (!seed || signature(p) !== LEGACY_ATHLETE_SIGNATURES[p.id]) return p;
    return { ...seed, contact_phone: p.contact_phone || ATHLETE_CATALOG_PHONE, condition: p.condition, status: p.status, stock: p.stock, views: p.views, likes_count: p.likes_count };
  });
  return [...ADDED_ATHLETE_LISTINGS.filter(p => !refreshed.some(r => r.id === p.id)).map(p => ({...p, contact_phone: ATHLETE_CATALOG_PHONE})), ...refreshed];
}
