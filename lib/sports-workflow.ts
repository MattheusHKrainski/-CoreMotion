import { matchesSport } from './modalities';
import type { SportsRecord } from './sports';
export type SportsFilters = { name: string; sport: string; age: string; city: string; category: string };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function matchesSportsRecord(record: SportsRecord, filters: SportsFilters) {
  const d = record.data;
  if (!matchesSport(d.sport, filters.sport)) return false;
  if (record.kind === 'trial') {
    const sub = (value: string) => normalize(value).replace(/[\s-]/g, '');
    return (!filters.city || normalize(d.city || '').includes(normalize(filters.city))) && (!filters.category || sub(d.category || '').includes(sub(filters.category)));
  }
  return (!filters.name || normalize(d.name || '').includes(normalize(filters.name))) && (!filters.age || Number(d.age) === Number(filters.age));
}
export function activityGroups(records: SportsRecord[], owner: string) {
  return {
    receivedInvites: records.filter(r => r.kind === 'invite' && r.data.recipient === owner),
    applications: records.filter(r => r.kind === 'application' && r.owner === owner),
    sentInvites: records.filter(r => r.kind === 'invite' && r.owner === owner),
    trialApplications: records.filter(r => r.kind === 'application' && r.data.recipient === owner),
  };
}

export function canCancelApplication(record: SportsRecord, owner: string): boolean {
  return !!owner && record.kind === 'application' && record.owner === owner && !record.data.status;
}
