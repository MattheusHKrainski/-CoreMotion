import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ADMIN_LOGIN_EMAIL } from '@/lib/admin-account';
import { readSavedAdminProfile } from '@/lib/admin-session';
import { quickProfileFromSearch } from '@/lib/quick-access';
import type { UserProfile } from '@/lib/types';

const identity = { id: 'verified-id', email: ADMIN_LOGIN_EMAIL };
const profile: UserProfile = { ...identity, name: 'Admin', role: 'admin', created_at: '2026-11-04' };
it('retoma a mesma conta Admin apenas com identidade e perfil validados', async () => {
  assert.equal(await readSavedAdminProfile(async () => identity, async () => profile), profile);
});
it('sem sessão, outra conta ou falha de rede exige login', async () => {
  for (const user of [null, { ...identity, email: 'other@example.com' }]) {
    assert.equal(await readSavedAdminProfile(async () => user, async () => { assert.fail('Não deve ler perfil'); }), null);
  }
  assert.equal(await readSavedAdminProfile(async () => { throw new Error('offline'); }, async () => profile), null);
});
it('não retoma perfil suspenso, rebaixado ou de outra identidade', async () => {
  for (const item of [null, { ...profile, is_banned: true }, { ...profile, role: 'user' as const }, { ...profile, id: 'other' }, { ...profile, email: 'other@example.com' }]) {
    assert.equal(await readSavedAdminProfile(async () => identity, async () => item), null);
  }
});
it('oferece contas reais salvas, sem botão Google, com scroll interno e bloqueio do fundo', () => {
  const modal = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.doesNotMatch(modal, /Continuar com Google|handleGoogleAuth|signInWithGoogle/);
  assert.match(modal, /<SavedAccounts busy=\{loading\} onSelect=\{handleQuickLogin\}/);
  assert.match(modal, /useDialogScrollLock\(isAuthModalOpen\)/);
  assert.match(modal, /data-auth-scroll.*overflow-y-auto overscroll-contain/);
  assert.match(modal, /max-h-\[calc\(100dvh-2rem\)\]/);
  assert.match(modal, /role="dialog" aria-modal="true"/);
  const store = readFileSync('lib/store.tsx', 'utf8');
  assert.match(store, /await sb.auth.getUser\(\)/);
  assert.match(store, /setTimeout\(async \(\) =>/);
});
it('URLs antigas não criam identidades nem desativam Supabase', () => {
  for (const profile of ['admin', 'athlete', 'coach', 'casual']) assert.equal(quickProfileFromSearch(`?acesso-rapido=${profile}`), null);
  assert.doesNotMatch(readFileSync('lib/store.tsx', 'utf8'), /temporaryIdentity/);
});
