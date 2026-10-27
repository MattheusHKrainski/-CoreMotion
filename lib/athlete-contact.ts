import type { Product } from './types';

/** Shared contact expressly supplied for the platform's existing athlete catalog. */
export const ATHLETE_CATALOG_PHONE = '5541988918146';

/** Refresh only known catalog listings; never copy this contact to a new seller. */
export function refreshSeededContacts(products: Product[], catalog: Product[]): Product[] {
  const contacts = new Map(catalog.filter(p => p.product_type === 'c2c' && p.contact_phone).map(p => [p.id, p.contact_phone]));
  return products.map(product => {
    const phone = contacts.get(product.id);
    return product.product_type === 'c2c' && !product.contact_phone?.trim() && phone
      ? { ...product, contact_phone: phone }
      : product;
  });
}
