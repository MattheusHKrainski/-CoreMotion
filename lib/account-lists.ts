import type { CartItem } from './types';

export function accountListsKey(id: string | null): string { return `coremotion_account_lists_v1_${id || 'visitor'}`; }
export function readAccountLists(storage: Pick<Storage, 'getItem'>, id: string | null): { cart: CartItem[]; favorites: string[] } {
  try {
    const value = JSON.parse(storage.getItem(accountListsKey(id)) || '{}');
    return {
      cart: Array.isArray(value?.cart) ? value.cart.filter((item: CartItem) => item?.product?.product_type === 'c2c' && Number.isFinite(item.quantity) && item.quantity > 0) : [],
      favorites: Array.isArray(value?.favorites) ? value.favorites.filter((item: unknown) => typeof item === 'string') : [],
    };
  } catch { return { cart: [], favorites: [] }; }
}
