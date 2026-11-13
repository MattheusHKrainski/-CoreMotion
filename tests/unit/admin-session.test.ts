import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSavedAdminProfile } from '@/lib/admin-session';
import { ADMIN_LOGIN_EMAIL } from '@/lib/admin-account';
import type { UserProfile } from '@/lib/types';

const identity = { id: 'authenticated-admin', email: ADMIN_LOGIN_EMAIL };
const profile: UserProfile = {
  id: identity.id, email: identity.email, name: 'Administrador', role: 'admin',
  created_at: '2026-11-03T12:00:00Z',
};
it('reutiliza a mesma conta Admin com sessão validada sem pedir senha novamente', async () => {
  const result = await readSavedAdminProfile(async () => identity, async (id, email) => {
    assert.equal(id, identity.id);
    assert.equal(email, ADMIN_LOGIN_EMAIL);
    return profile;
  });
  assert.equal(result, profile);
});
it('sem sessão ou com outra conta não carrega um perfil Admin', async () => {
  for (const user of [null, { id: 'another', email: 'other@example.com' }]) {
    const result = await readSavedAdminProfile(async () => user, async () => {
      assert.fail('Não deve consultar perfil Admin para esta sessão');
    });
    assert.equal(result, null);
  }
});
it('não retoma perfil suspenso, rebaixado ou de outra identidade', async () => {
  for (const item of [null, { ...profile, role: 'user' as const },
    { ...profile, is_banned: true }, { ...profile, id: 'other' },
    { ...profile, email: 'other@example.com' }]) {
    assert.equal(await readSavedAdminProfile(async () => identity, async () => item), null);
  }
});
it('falha de autenticação ou de leitura do perfil volta ao login', async () => {
  assert.equal(await readSavedAdminProfile(async () => { throw new Error('expired'); }, async () => profile), null);
  assert.equal(await readSavedAdminProfile(async () => identity, async () => { throw new Error('offline'); }), null);
});
it('atalho valida usuário no servidor e usa a sessão persistente do Supabase', () => {
  const store = readFileSync('lib/store.tsx', 'utf8');
  assert.match(store, /await sb.auth.getUser\(\)/);
  assert.match(store, /await readSavedAdminProfile/);
  const modal = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.match(modal, /await loginSavedAccount\(id\)/);
  assert.match(store, /await resumeAdminSession\(\)/);
  const client = readFileSync('services/supabaseClient.ts', 'utf8');
  assert.match(client, /persistSession: true/);
  assert.match(client, /autoRefreshToken: true/);
});

it('trocar conta mantém a sessão oficial e não exige campos de senha no seletor', () => {
 const profile = readFileSync('components/ProfileView.tsx', 'utf8');
 assert.match(profile, /setAuthModalMode\('switch'\)/);
 assert.match(profile, /Trocar conta/);
 assert.doesNotMatch(readFileSync('components/shared/Sidebar.tsx', 'utf8'), /Trocar conta/);
 const modal = readFileSync('components/auth/AuthModal.tsx', 'utf8');
 assert.match(modal, /authModalMode !== 'switch' && <form/);
 const handler = modal.slice(modal.indexOf('const handleQuickLogin'), modal.indexOf('const handleSubmit'));
 assert.doesNotMatch(handler, /signOut|logout|requestAdminAccessLink/);
});

it('abrir e fechar o seletor não troca usuário nem retorna a conta conectada à página pública', () => {
 const store=readFileSync('lib/store.tsx','utf8');
 const handler=store.slice(store.indexOf('  const setAuthModalOpen = useCallback'),store.indexOf('  // Role switching'));
 assert.match(handler, /open && \(!userRef.current \|\| userRef.current.role === 'visitor'\)/);
 assert.doesNotMatch(handler, /setUser|signOut|logout|setActiveView/);
 const modal=readFileSync('components/auth/AuthModal.tsx','utf8');
 assert.match(modal, /onClick=\{\(\) => setAuthModalOpen\(false\)\}\s*aria-label="Fechar formulário"/);
});
