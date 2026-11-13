import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

it('login e cadastro compartilham dialog limitado à viewport e scroll interno contido', () => {
  const modal = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.match(modal, /useDialogScrollLock\(isAuthModalOpen\)/);
  assert.match(modal, /role="dialog" aria-modal="true"/);
  assert.match(modal, /max-h-\[calc\(100dvh-2rem\)\]/);
  assert.match(modal, /data-auth-scroll.*min-h-0 overflow-y-auto overscroll-contain/);
  assert.match(modal, /aria-label="Fechar formulário"/);
  assert.match(modal, /<SavedAccounts/);
  const lock = readFileSync('hooks/useDialogScrollLock.ts', 'utf8');
  assert.match(lock, /body.style.position = 'fixed'/);
  assert.match(lock, /root.style.overflow = previous.rootOverflow/);
  assert.match(lock, /window.scrollTo\(\{ top: scrollY/);
});
it('leitura anônima de ofertas não chama funções restritas à equipe', () => {
  const sql = readFileSync('supabase/migrations/20261103180000_fix_public_offers_read_policy.sql', 'utf8');
  assert.match(sql, /FOR SELECT TO anon USING \(is_active = true\)/);
  assert.match(sql, /FOR SELECT TO authenticated USING \(is_active = true OR \(SELECT public.is_staff\(\)\)\)/);
  assert.doesNotMatch(sql, /GRANT|FOR (?:ALL|INSERT|UPDATE|DELETE)/);
});
