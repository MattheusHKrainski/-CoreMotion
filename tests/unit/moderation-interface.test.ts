import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (file: string) => readFileSync(file, 'utf8');
it('organizes all staff functions into tabs without the obsolete services/distribution cards', () => {
  const dashboard = read('components/admin/AdminDashboard.tsx');
  for (const key of ['accounts','products','offers','community','sports','reports','orders','diagnostics']) assert.match(dashboard, new RegExp(`\\['${key}',`));
  assert.match(dashboard, /role="tablist"/); assert.match(dashboard, /role="tabpanel"/);
  assert.doesNotMatch(dashboard, /Serviços da Plataforma|Distribuição do Catálogo|confirmPaymentSandbox/);
  assert.match(dashboard, /setInterval\([^\n]+15000/);
  assert.match(dashboard, /admin && !protectedAccount &&\s*\(\s*<AccountRoleEditor/);
  assert.match(dashboard, /rpc\('moderate_account'/);
});
it('offers reporting at every requested content surface and a recipient notification inbox', () => {
  const files = ['components/marketplace/ProductDetailModal.tsx','components/marketplace/ExternalOfferModal.tsx','components/CommunityView.tsx','components/SportsHub.tsx'];
  for (const file of files) assert.match(read(file), /<ReportButton\s/);
  const categories = read('services/moderation.ts');
  for (const category of ['external_offer','athlete_listing','athlete_profile','trial','community']) assert.match(categories, new RegExp(`${category}:`));
  assert.match(read('components/shared/NotificationsInbox.tsx'), /account_notifications/);
  assert.match(read('app/page.tsx'), /<NotificationsInbox \/>/);
});
it('consolidates welcome profile navigation and always opens login over welcome on logout', () => {
  const welcome = read('components/WelcomeLandingPage.tsx');
  assert.match(welcome, /Atletas, Clientes & Treinadores/);
  assert.doesNotMatch(welcome, /selectedRoleTab|setSelectedRoleTab|Cliente \/ Atleta/);
  const store = read('lib/store.tsx');
  const logout = store.slice(store.indexOf('  const logout = async'), store.indexOf('  const updateUserProfile = async'));
  assert.match(logout, /setAuthModalMode\('login'\)/); assert.match(logout, /setAuthModalOpen\(true\)/);
  assert.match(logout, /\/\?entrar=1/);
});
it('does not fall back to a local success after a failed connected offer save', () => {
  const store = read('lib/store.tsx');
  const offers = store.slice(store.indexOf('  const addOffer = async'), store.indexOf('  const toggleOfferActive'));
  assert.doesNotMatch(offers, /authedFetch|res\.status !== 503|Fallback local/);
  assert.match(offers, /crypto.randomUUID\(\)/);
  assert.match(offers, /\.select\('\*'\)\.single\(\)/);
  assert.match(offers, /\.select\('id'\)/);
});
