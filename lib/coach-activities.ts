import { canRecruit } from './sports';
import type { UserProfile } from './types';
import { matchesSport } from './modalities';
export const ACTIVITY_TYPES = { class: 'Aula', group: 'Grupo de prática', association: 'Associação esportiva' } as const;
export type CoachActivityData = { title: string; type: keyof typeof ACTIVITY_TYPES; organizer: string; sport: string; city: string; schedule: string; contact: string; description: string };
export type CoachActivity = CoachActivityData & { id: string; owner: string; created_at: string };
export const ACTIVITY_LIMITS = { title: 120, organizer: 120, sport: 60, city: 120, schedule: 300, contact: 200, description: 3000 } as const;
export function validateCoachActivity(data: CoachActivityData): string | null {
  if (!Object.hasOwn(ACTIVITY_TYPES, data.type)) return 'Escolha o tipo de publicação.';
  for (const key of Object.keys(ACTIVITY_LIMITS) as (keyof typeof ACTIVITY_LIMITS)[]) {
    if (!data[key]?.trim() || data[key].trim().length > ACTIVITY_LIMITS[key]) return 'Preencha todos os campos e respeite os limites de tamanho.';
  }
  return null;
}
export function canManageCoachActivity(user: UserProfile | null, activity: CoachActivity): boolean {
  return canRecruit(user) && (['admin','supervisor'].includes(user!.role) || activity.owner === (user!.supabase_id || user!.id));
}
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function matchesCoachActivity(activity: CoachActivity, sport: string, search: string): boolean {
  return matchesSport(activity.sport, sport) && normalize([activity.title,activity.organizer,activity.city,activity.description,activity.sport,ACTIVITY_TYPES[activity.type]].join(' ')).includes(normalize(search));
}
