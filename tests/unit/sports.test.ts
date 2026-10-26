import { it } from 'node:test';
import assert from 'node:assert/strict';
import { ACCOUNT_TYPES, canAccessSports, canRecruit } from '@/lib/sports';
import type { UserProfile } from '@/lib/types';
const base: UserProfile = { id: '1', name: 'Ana', email: 'ana@example.test', role: 'user', created_at: '' };
it('casual e visitante não acessam recrutamento', () => {
  assert.equal(canAccessSports(null), false);
  assert.equal(canAccessSports({ ...base, account_type: 'casual' }), false);
  assert.equal(canRecruit({ ...base, account_type: 'casual' }), false);
});
it('atleta acessa as áreas esportivas mas não publica seletivas', () => {
  assert.equal(canAccessSports({ ...base, account_type: 'athlete' }), true);
  assert.equal(canRecruit({ ...base, account_type: 'athlete' }), false);
});
it('treinador e administrador recrutam; conta banida não', () => {
  assert.equal(canRecruit({ ...base, account_type: 'coach' }), true);
  assert.equal(canRecruit({ ...base, role: 'admin' }), true);
  assert.equal(canRecruit({ ...base, role: 'admin', is_banned: true }), false);
  assert.equal(canAccessSports({ ...base, account_type: 'athlete', is_banned: true }), false);
});
it('cadastro público não oferece administrador', () => {
  assert.deepEqual(Object.keys(ACCOUNT_TYPES), ['athlete', 'coach', 'casual']);
});
