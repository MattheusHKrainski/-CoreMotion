import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

it('login e cadastro usam página própria sem bloquear o scroll do navegador', () => {
  const modal = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.doesNotMatch(modal, /useDialogScrollLock|role="dialog"|aria-modal="true"/);
  assert.match(modal, /min-h-screen/);
  assert.match(modal, /\/entrar\?mode=/);
  assert.match(modal, /safeAuthReturn/);
  assert.match(modal, /aria-label="Fechar formulário"/);
  assert.match(modal, /<SavedAccounts/);
  assert.match(readFileSync('app/entrar/page.tsx','utf8'), /<AuthModal page/);
});
it('leitura anônima de ofertas não chama funções restritas à equipe', () => {
  const sql = readFileSync('supabase/migrations/20261103180000_fix_public_offers_read_policy.sql', 'utf8');
  assert.match(sql, /FOR SELECT TO anon USING \(is_active = true\)/);
  assert.match(sql, /FOR SELECT TO authenticated USING \(is_active = true OR \(SELECT public.is_staff\(\)\)\)/);
  assert.doesNotMatch(sql, /GRANT|FOR (?:ALL|INSERT|UPDATE|DELETE)/);
});
