import { it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { quickProfileFromSearch } from '@/lib/quick-access';

it('todos os perfis temporários anteriores foram aposentados, inclusive Admin', () => {
  for (const profile of ['admin', 'athlete', 'coach', 'casual', 'superadmin']) assert.equal(quickProfileFromSearch(`?acesso-rapido=${profile}`), null);
  assert.doesNotMatch(readFileSync('lib/store.tsx', 'utf8'), /temporaryIdentity/);
});
it('URLs antigas não desativam Supabase nem restauram identidade local', () => {
  execFileSync(process.execPath, ['--import', 'tsx', '-e', `
    const assert = require('node:assert/strict');
    global.window = { location: { search: '?acesso-rapido=admin' } };
    const { isSupabaseConfigured } = require('./services/supabaseClient.ts');
    const { DEMO_MODE } = require('./lib/demo-mode.ts');
    const { QUICK_PROFILE, IS_QUICK_ACCESS } = require('./lib/quick-access.ts');
    assert.equal(isSupabaseConfigured, true);
    assert.equal(DEMO_MODE, false);
    assert.equal(QUICK_PROFILE, null);
    assert.equal(IS_QUICK_ACCESS, false);
  `], { env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key-for-isolation-check', NEXT_PUBLIC_DEMO_MODE: 'false' } });
});
it('a opção de salvar é desmarcada por padrão e é oferecida no login e cadastro', () => {
  const modal = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.match(modal, /\[rememberAccount, setRememberAccount\] = useState\(false\)/);
  assert.match(modal, /authModalMode === 'login' \|\| authModalMode === 'register'/);
  assert.match(modal, /type="checkbox" checked=\{rememberAccount\}/);
  assert.match(modal, /loginWithEmail\(email, password, rememberAccount\)/);
  assert.match(modal, /sport.trim\(\), rememberAccount\)/);
  assert.match(modal, /dispositivo de confiança/);
  assert.doesNotMatch(modal, /perfis temporários|window.location.assign/);
});
it('remoção exige confirmação e não chama exclusão de conta ou logout', () => {
  const cards = readFileSync('components/auth/SavedAccounts.tsx', 'utf8');
  assert.match(cards, /role="alertdialog"/);
  assert.match(cards, /Confirmar remoção/);
  assert.match(cards, /Cancelar/);
  assert.match(cards, /savedAccountVault\(\).remove\(removing.id\)/);
  assert.doesNotMatch(cards, /signOut|deleteUser|logout/);
});
it('permite ocultar acessos salvos por variável de ambiente', () => {
  execFileSync(process.execPath, ['--import', 'tsx', '-e', `
    const assert = require('node:assert/strict');
    assert.equal(require('./lib/quick-access.ts').QUICK_ACCESS_ENABLED, false);
  `], { env: { ...process.env, NEXT_PUBLIC_QUICK_ACCESS_ENABLED: 'false' } });
});
it('a sessão inicial mantém a fronteira de hidratação', async () => {
  const React = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { default: SessionProvider } = await import('@/components/SessionProvider');
  const html = renderToString(React.createElement(SessionProvider, null, React.createElement('div', null, 'conteúdo dependente de perfil')));
  assert.match(html, /Carregando CoreMotion/);
  assert.doesNotMatch(html, /conteúdo dependente de perfil/);
});
