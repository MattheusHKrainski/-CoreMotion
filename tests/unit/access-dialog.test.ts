import { it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { ADMIN_LOGIN_EMAIL } from '@/lib/admin-account';
import { readSavedAdminProfile } from '@/lib/admin-session';
import { quickStorageKey, temporaryProfileFromSearch } from '@/lib/quick-access';
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
it('oferece quatro atalhos, sem botão Google, com scroll interno e bloqueio do fundo', () => {
  const modal = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.doesNotMatch(modal, /Continuar com Google|handleGoogleAuth|signInWithGoogle/);
  assert.match(modal, /\['admin', 'athlete', 'coach', 'casual'\]/);
  assert.match(modal, /useDialogScrollLock\(isAuthModalOpen\)/);
  assert.match(modal, /data-auth-scroll.*overflow-y-auto overscroll-contain/);
  assert.match(modal, /max-h-\[calc\(100dvh-2rem\)\]/);
  assert.match(modal, /role="dialog" aria-modal="true"/);
  const store = readFileSync('lib/store.tsx', 'utf8');
  assert.match(store, /await sb.auth.getUser\(\)/);
  assert.match(store, /setTimeout\(async \(\) =>/);
});
it('isola o armazenamento dos perfis temporários e nunca cria Admin temporário', () => {
  assert.equal(temporaryProfileFromSearch('?acesso-rapido=admin'), null);
  const keys = ['athlete', 'coach', 'casual'].map(type => quickStorageKey('state', temporaryProfileFromSearch(`?acesso-rapido=${type}`)));
  assert.equal(new Set(keys).size, 3);
});
it('cada perfil rápido funciona com Supabase configurado sem criar cliente ou enviar alterações reais', () => {
  for (const kind of ['athlete', 'coach', 'casual']) {
    execFileSync(process.execPath, ['--import', 'tsx', '-e', `
      const assert = require('node:assert/strict');
      global.window = { location: { search: '?acesso-rapido=${kind}' } };
      global.fetch = () => { throw new Error('Network must not be called'); };
      const { getSupabaseClient } = require('./services/supabaseClient.ts');
      const { temporaryIdentity } = require('./lib/quick-access.ts');
      const { ProductService } = require('./services/products.ts');
      const { CommunityService } = require('./services/communityService.ts');
      (async () => {
        assert.equal(getSupabaseClient(), null);
        assert.equal(temporaryIdentity('${kind}').account_type, '${kind}');
        const items = await ProductService.getProducts();
        assert.ok(items.length > 0);
        const result = await ProductService.createProduct({...items[0], title:'Local'}, 'quick-${kind}');
        assert.ok(result.success);
        assert.equal(result.data.seller_id, 'quick-${kind}');
        await CommunityService.likePost('post');
      })().catch(e => { console.error(e); process.exit(1); });
    `], { env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key-for-isolation', NEXT_PUBLIC_DEMO_MODE: 'false' } });
  }
});
