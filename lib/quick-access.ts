/** Real remembered accounts are opt-in. Legacy query-based profiles are retired. */
export const QUICK_ACCESS_ENABLED = process.env.NEXT_PUBLIC_QUICK_ACCESS_ENABLED !== 'false';
export type QuickProfile = 'admin' | 'athlete' | 'coach' | 'casual';
export function quickProfileFromSearch(search: string): QuickProfile | null {
  // Retired: old URLs must never create a local identity or disable real Supabase Auth.
  void search;
  return null;
}
export const QUICK_PROFILE = typeof window !== 'undefined' ? quickProfileFromSearch(window.location.search) : null;
export const IS_QUICK_ACCESS = QUICK_PROFILE !== null;

/** v2 intentionally does not migrate the old shared temporary state. */
export function quickStorageKey(key: string, profile: QuickProfile | null = QUICK_PROFILE): string {
  return profile ? `coremotion_quick_v2_${profile}_${key}` : key;
}
export function scopedQuickStorage(storage: Pick<Storage, 'getItem' | 'setItem'>) {
  return {
    getItem: (key: string) => storage.getItem(quickStorageKey(key)),
    setItem: (key: string, value: string) => storage.setItem(quickStorageKey(key), value),
  };
}
