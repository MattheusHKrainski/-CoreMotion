import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('CoreShop shows categories and clubs without exposing how many products or offers are available', () => {
  const catalog = read('components/marketplace/MarketplaceView.tsx');
  const teams = read('components/marketplace/CatalogTeams.tsx');
  assert.doesNotMatch(catalog, /\{displayedCount\} resultado\(s\)/);
  assert.doesNotMatch(catalog, /\{filteredC2CProducts\.length\}<\/span>/);
  assert.doesNotMatch(catalog, /\{filteredOffers\.length\}<\/span>/);
  assert.doesNotMatch(catalog, /\{categoryCount\(category\)\}/);
  assert.doesNotMatch(catalog, /Mostrar mais \(\{/);
  assert.doesNotMatch(teams, /contagem|counts\.get|ofertas na CoreMotion/i);
  assert.match(teams, /Campeonato e clube/);
  assert.match(catalog, /Mostrar mais/);
});

test('Home and landing hide offer totals while keeping product navigation intact', () => {
  const home = read('components/HomeHeroAndHighlights.tsx');
  const campaigns = read('components/HomeVerifiedCampaigns.tsx');
  const landing = read('components/WelcomeLandingPage.tsx');
  const carousel = read('components/HomeProductCarousel.tsx');
  assert.doesNotMatch(home, /\{resultCount\}|\{filteredOffers\.length\}<\/span>|\{filteredC2CProducts\.length\}<\/span>/);
  assert.doesNotMatch(campaigns, /produtos no cat[áa]logo|\{index % campaigns\.length \+ 1\} \/ \{campaigns\.length\}/i);
  assert.doesNotMatch(carousel, /\{index \+ 1\} \/ \{slides\.length\}/);
  assert.doesNotMatch(landing, /\{c2cCount\}|\{activeOffers\.length\}/);
  assert.match(landing, /Ofertas Verificadas/);
  assert.match(home, /Equipamentos de Atletas/);
});

test('Listing management labels omit totals without altering filtering and pagination', () => {
  const sales=read('components/SellC2CView.tsx');
  const dashboard=read('components/admin/AdminDashboard.tsx');
  const manager=read('components/admin/AdminOffersManager.tsx');
  assert.match(sales, /Meus Anúncios/);
  assert.doesNotMatch(sales, /Meus Anúncios \(/);
  assert.doesNotMatch(dashboard, /Anúncios de atletas \(/);
  assert.doesNotMatch(dashboard, /diagnostics\.offers|diagnostics\.products/);
  assert.doesNotMatch(manager, /Todas \(\{offers\.length\}\)|\{activeCount\}|\{pausedCount\}/);
  assert.match(manager, /Mostrar mais/);
});

test('User-submitted photo preview gallery is removed, while real club merchandise remains', () => {
  const marketplace = read('components/marketplace/MarketplaceView.tsx');
  assert.doesNotMatch(marketplace, /ClubUniformPreviewGrid|uniformes identificados aparecem acima/);
  assert.equal(existsSync('components/marketplace/ClubUniformPreviewGrid.tsx'), false);
  for (const name of ['dentil-praia-womens-black.png','monte-carmelo-blue-orange.png','montes-claros-black-gold.png','norde-blue-pink.png']) {
    assert.equal(existsSync('public/catalog/club-uniforms/'+name), false, name);
  }
  const migration=read('supabase/migrations/20261123065334_remove_submitted_uniform_preview_gallery.sql');
  assert.match(migration,/DROP TABLE public\.catalog_team_uniform_previews/);
  assert.match(read('components/marketplace/ExternalOfferCard.tsx'),/offer\.title/);
});
