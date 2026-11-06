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
it('o atalho Admin retoma a conta oficial sem criar administrador local', () => {
  const source = readFileSync('components/auth/AuthModal.tsx','utf8');
  assert.doesNotMatch(source, /Admin temporário/);
  assert.match(source, /await resumeAdminSession\(\)/);
  assert.doesNotMatch(source, /requestAdminAccessLink/);
  assert.match(source, /setEmail\(ADMIN_LOGIN_EMAIL\)/);
  assert.doesNotMatch(source, /Entre na conta Admin uma vez/);
  assert.match(source, /window.location.assign\(`\/\?acesso-rapido=\$\{type\}`\)/);
  const store = readFileSync('lib/store.tsx','utf8');
  assert.match(store, /QUICK_PROFILE === 'admin'.*window.location.replace/);
  assert.match(store, /const identity = temporaryIdentity\(QUICK_PROFILE\)/);
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
