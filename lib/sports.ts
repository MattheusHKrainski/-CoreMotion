import type { UserProfile } from './types';
export type AccountType = 'athlete' | 'coach' | 'casual';
export const ACCOUNT_TYPES: Record<AccountType, { label: string; description: string }> = {
  athlete: { label: 'Atleta', description: 'Monte seu currículo esportivo, publique suas conquistas, encontre seletivas e receba convocações. Não publica seletivas.' },
  coach: { label: 'Treinador', description: 'Personalize sua formação e modalidades, publique seletivas e treinos, filtre talentos e convide atletas para sua equipe.' },
  casual: { label: 'Casual', description: 'Explore equipamentos, ofertas, comunidade e aulas como pilates e ginástica. Não acessa seletivas nem o banco de atletas.' },
};
export function canRecruit(user: UserProfile | null | undefined) { return !!user && !user.is_banned && (user.role === 'admin' || user.account_type === 'coach'); }
export function canAccessSports(user: UserProfile | null | undefined) { return !!user && !user.is_banned && (user.role === 'admin' || ['athlete', 'coach'].includes(user.account_type || '')); }
export interface SportsRecord { id: string; owner: string; kind: 'athlete' | 'coach' | 'trial' | 'application' | 'invite'; data: Record<string, string>; }
