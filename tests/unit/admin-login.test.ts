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
it('o atalho Admin abre login sem incluir senha e os outros acessos rápidos permanecem', () => {
  const source = readFileSync('components/auth/AuthModal.tsx','utf8');
  assert.match(source, /setEmail\(ADMIN_LOGIN_EMAIL\)/);
  assert.match(source, /setPassword\(''\)/);
  assert.match(source, /window.location.assign\(`\/\?acesso-rapido=\$\{type\}`\)/);
  const store = readFileSync('lib/store.tsx','utf8');
  assert.match(store, /QUICK_PROFILE === 'admin'.*window.location.replace\('\/\?login=admin'\)/);
});
it('recuperação chama Supabase e não confirma envios inexistentes', () => {
  const source = readFileSync('components/auth/AuthModal.tsx','utf8');
  assert.match(source, /resetPasswordForEmail/);
  assert.doesNotMatch(source, /Instruções de recuperação de senha preparadas/);
  const reset = readFileSync('app/auth/reset-password/page.tsx','utf8');
  assert.match(reset, /auth.updateUser\(\{password\}\)/);
});
it('o formulário oferece Google OAuth e mantém o callback de sessão Supabase', () => {
  const source = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.match(source, /Continuar com Google/);
  assert.match(source, /signInWithGoogle/);
  const callback = readFileSync('app/auth/callback/page.tsx', 'utf8');
  assert.match(callback, /exchangeCodeForSession\(code\)/);
});
