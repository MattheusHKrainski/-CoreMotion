import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('Campeonato e clube uses neutral styles instead of the highlighted red panel', () => {
  const component = read('components/marketplace/CatalogTeams.tsx');
  assert.match(component, /Filtros de campeonato e clube/);
  assert.match(component, /border-t border-zinc-800 pt-4/);
  assert.doesNotMatch(component, /border-red-900\/40|bg-gradient-to-b from-red-950|Filtro específico/);
  assert.match(component, /focus:border-zinc-500/);
});

test('Clearing the selected team restores both catalog sections and avoids dead external collection CTA', () => {
  const marketplace = read('components/marketplace/MarketplaceView.tsx');
  assert.match(marketplace, /setSelectedTab\(team \? 'offers' : 'all'\)/);
  assert.match(marketplace, /setSelectedTeam\(null\); setSelectedTab\('all'\)/);
  assert.doesNotMatch(marketplace, /Acesse a coleção na loja indicada acima/);
});

test('Extra basketball shirts use unique source URLs, exact photos and team IDs', () => {
  const sql = read('supabase/migrations/20261123053400_verified_additional_brazilian_basket_jerseys.sql');
  for (const id of [
    'verified-br-botafogo-basket-jogo3-2526',
    'verified-br-flamengo-basquete-adidas-ii-2627',
    'verified-br-franca-larulp-jogador-vermelha',
  ]) assert.ok(sql.includes(id), id);
  assert.match(sql, /image_urls/);
  assert.match(sql, /variant_options/);
  assert.match(sql, /NOT EXISTS/);
  assert.match(sql, /ON CONFLICT/);
});
