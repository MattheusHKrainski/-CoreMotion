import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ADMIN_LOGIN_EMAIL } from '@/lib/admin-account';
import { isMasterAdminEmail, hasCapability } from '@/lib/permissions';
it('a conta solicitada tem as mesmas permissões administrativas', () => {
  assert.equal(ADMIN_LOGIN_EMAIL, 'mattheus.h.krainski@gmail.com');
  assert.ok(isMasterAdminEmail(ADMIN_LOGIN_EMAIL.toUpperCase()));
  assert.ok(hasCapability('admin', 'users.change_role'));
  assert.ok(hasCapability('admin', 'products.moderate'));
});
it('administradores também só entram por sessão real validada, sem perfis temporários', () => {
  const modal = readFileSync('components/auth/AuthModal.tsx','utf8');
  assert.match(modal, /await loginSavedAccount\(id\)/);
  assert.doesNotMatch(modal, /temporaryIdentity|acesso-rapido=/);
  const service = readFileSync('services/savedAccounts.ts','utf8');
  assert.match(service, /verifier.auth.getUser\(\)/);
  assert.match(service, /profile.is_banned/);
});
it('recuperação chama Supabase e não confirma envios inexistentes', () => {
  const source = readFileSync('components/auth/AuthModal.tsx','utf8');
  assert.match(source, /resetPasswordForEmail/);
  assert.doesNotMatch(source, /Instruções de recuperação de senha preparadas/);
  const reset = readFileSync('app/auth/reset-password/page.tsx','utf8');
  assert.match(reset, /auth.updateUser\(\{password\}\)/);
});
it('o formulário não oferece botão Google nem criação automática por esse provedor', () => {
  const source = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.doesNotMatch(source, /Continuar com Google|No primeiro acesso, seu perfil será criado automaticamente|signInWithGoogle|signInWithOAuth/);
});
