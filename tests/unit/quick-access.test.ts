import { it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { quickProfileFromSearch } from '@/lib/quick-access';

it('aceita apenas os quatro perfis temporários conhecidos', () => {
  for (const profile of ['admin', 'athlete', 'coach', 'casual']) assert.equal(quickProfileFromSearch(`?acesso-rapido=${profile}`), profile);
  assert.equal(quickProfileFromSearch('?acesso-rapido=superadmin'), null);
  assert.equal(quickProfileFromSearch(''), null);
});
it('acesso rápido com Supabase configurado não cria cliente nem envia chamadas autenticadas', () => {
  execFileSync(process.execPath, ['--import', 'tsx', '-e', `
    const assert = require('node:assert/strict');
    global.window = { location: { search: '?acesso-rapido=admin' } };
    const { isSupabaseConfigured, getSupabaseClient } = require('./services/supabaseClient.ts');
    assert.equal(isSupabaseConfigured, false);
    assert.equal(getSupabaseClient(), null);
    global.fetch = () => { throw new Error('Network must not be used'); };
    require('./lib/auth-fetch.ts').authedFetch('/api/users', { method: 'DELETE' }).then(res => assert.equal(res.status, 403));
  `], { env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key-for-isolation-check' } });
});
it('permite desativar os acessos temporários por variável de ambiente', () => {
  execFileSync(process.execPath, ['--import', 'tsx', '-e', `
    const assert = require('node:assert/strict');
    const { quickProfileFromSearch, QUICK_ACCESS_ENABLED } = require('./lib/quick-access.ts');
    assert.equal(QUICK_ACCESS_ENABLED, false);
    assert.equal(quickProfileFromSearch('?acesso-rapido=admin'), null);
  `], { env: { ...process.env, NEXT_PUBLIC_QUICK_ACCESS_ENABLED: 'false' } });
});
it('remove os cards de garantia e usa bordas neutras nas descrições dos perfis', () => {
  const landing = readFileSync('components/WelcomeLandingPage.tsx', 'utf8');
  assert.doesNotMatch(landing, /Custódia Protegida|5% OFF Automático no PIX|Envio para Todo o Brasil/);
  assert.doesNotMatch(landing.slice(landing.indexOf('id="perfis"')), /border-red-500\/60|shadow-2xl shadow-red-950/);
});

it('isola todas as chaves e identidades dos quatro perfis temporários', async () => {
  const { quickStorageKey, temporaryIdentity } = await import('@/lib/quick-access');
  const profiles = ['admin', 'athlete', 'coach', 'casual'] as const;
  for (const key of ['coremotiom_state_v1', 'coremotion_sports_v1', 'coremotion_sports_content_v1', 'coremotion_managed_offers_v1']) {
    assert.equal(new Set(profiles.map(profile => quickStorageKey(key, profile))).size, 4);
    assert.equal(quickStorageKey(key, null), key);
    assert.ok(profiles.every(profile => quickStorageKey(key, profile) !== 'coremotion_quick_state_v1'));
  }
  assert.equal(new Set(profiles.map(profile => temporaryIdentity(profile).id)).size, 4);
  assert.equal(new Set(profiles.map(profile => temporaryIdentity(profile).email)).size, 4);
  assert.equal(temporaryIdentity('casual').account_type, 'casual');
  assert.equal(temporaryIdentity('coach').account_type, 'coach');
  assert.equal(temporaryIdentity('athlete').account_type, 'athlete');
  assert.equal(temporaryIdentity('admin').role, 'admin');
});

it('o armazenamento esportivo usa o mesmo namespace do perfil temporário', () => {
  execFileSync(process.execPath, ['--import', 'tsx', '-e', `
    const assert = require('node:assert/strict');
    global.window = { location: { search: '?acesso-rapido=casual' } };
    const { scopedQuickStorage, quickStorageKey } = require('./lib/quick-access.ts');
    const values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const scoped = scopedQuickStorage(storage);
    scoped.setItem('coremotion_sports_v1', 'casual-data');
    assert.equal(scoped.getItem('coremotion_sports_v1'), 'casual-data');
    assert.equal(storage.getItem(quickStorageKey('coremotion_sports_v1', 'athlete')), null);
    assert.equal(storage.getItem('coremotion_sports_v1'), null);
  `]);
});
