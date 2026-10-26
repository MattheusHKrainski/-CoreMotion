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
