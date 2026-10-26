/** Temporary UI-only sessions. Never grants a Supabase token or server permissions. */
export const QUICK_ACCESS_ENABLED = process.env.NEXT_PUBLIC_QUICK_ACCESS_ENABLED !== 'false';
export type QuickProfile = 'admin' | 'athlete' | 'coach' | 'casual';
export function quickProfileFromSearch(search: string): QuickProfile | null {
  if (!QUICK_ACCESS_ENABLED) return null;
  const profile = new URLSearchParams(search).get('acesso-rapido');
  return profile && ['admin', 'athlete', 'coach', 'casual'].includes(profile) ? profile as QuickProfile : null;
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

export function temporaryIdentity(profile: QuickProfile) {
  const identities = {
    admin: { name: 'Mattheus (Admin)', email: 'admin@coremotion.com.br', sport_interests: [] },
    athlete: { name: 'Carlos Eduardo Ramos', email: 'carlos.atleta@coremotion.com.br', sport_interests: ['Corrida', 'Ciclismo'] },
    coach: { name: 'Marina Duarte', email: 'marina.treinadora@coremotion.com.br', sport_interests: ['Preparação física', 'Pilates'] },
    casual: { name: 'Ana Silva', email: 'ana.casual@coremotion.com.br', sport_interests: ['Caminhada', 'Ginástica'] },
  };
  return { ...identities[profile], id: `quick-${profile}`, role: profile === 'admin' ? 'admin' as const : 'user' as const, account_type: profile === 'admin' ? undefined : profile };
}
