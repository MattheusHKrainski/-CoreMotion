export type TemporaryProfile = 'athlete' | 'coach' | 'casual';
export const QUICK_ACCESS_ENABLED = process.env.NEXT_PUBLIC_QUICK_ACCESS_ENABLED !== 'false';
export function temporaryProfileFromSearch(search: string): TemporaryProfile | null {
  if (!QUICK_ACCESS_ENABLED) return null;
  const value = new URLSearchParams(search).get('acesso-rapido');
  return value === 'athlete' || value === 'coach' || value === 'casual' ? value : null;
}
export const QUICK_PROFILE = typeof window === 'undefined' ? null : temporaryProfileFromSearch(window.location.search);
export const IS_QUICK_ACCESS = QUICK_PROFILE !== null;
export function quickStorageKey(key: string, profile = QUICK_PROFILE) {
  return profile ? `coremotion_quick_v3_${profile}_${key}` : key;
}
export function temporaryIdentity(profile: TemporaryProfile) {
  const names = { athlete: 'Carlos Ramos', coach: 'Marina Duarte', casual: 'Ana Silva' };
  const sports = { athlete: ['Corrida'], coach: ['Preparação física', 'Pilates'], casual: ['Caminhada'] };
  return { id: `quick-${profile}`, email: `${profile}@exemplo.test`, name: names[profile], role: 'user' as const,
    account_type: profile, sport_interests: sports[profile], city: 'Curitiba', state: 'PR', created_at: '2026-11-04T00:00:00Z' };
}
