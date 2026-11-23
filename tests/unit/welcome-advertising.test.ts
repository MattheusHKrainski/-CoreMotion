import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoreMotiomProvider } from '@/lib/store';
import CoreMotiomApp from '@/app/page';

it('abre o catálogo sem tutorial ou tela obrigatória de visitante', () => {
  const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(CoreMotiomApp)));
  assert.match(html, /CoreShop/);
  assert.match(html, /Entrar/);
  assert.doesNotMatch(html, /Entrar como visitante/);
  assert.doesNotMatch(html, /Prefere só conhecer primeiro|Entrando como Visitante|Entrar agora como visitante/);
  const source = readFileSync('components/WelcomeLandingPage.tsx', 'utf8');
  assert.doesNotMatch(source, /setSelectedRoleTab\('visitante'\)/);
});
it('os módulos de perfis acendem apenas na interação e respeitam movimento reduzido', () => {
  const source = readFileSync('components/WelcomeLandingPage.tsx', 'utf8');
  const profiles = source.slice(source.indexOf('id="perfis"'), source.indexOf('id="comecar"'));
  assert.equal((profiles.match(/hover:border-red-500\/70/g) || []).length, 3);
  assert.equal((profiles.match(/focus-within:border-red-500\/70/g) || []).length, 3);
  assert.equal((profiles.match(/motion-reduce:transition-none/g) || []).length, 3);
});
it('as superfícies de venda não prometem garantia ou custódia da plataforma', () => {
  for (const filename of [
    'components/WelcomeLandingPage.tsx', 'components/shared/Footer.tsx',
    'components/HomeHeroAndHighlights.tsx', 'components/marketplace/MarketplaceView.tsx',
    'components/marketplace/ProductCard.tsx', 'components/marketplace/ProductDetailModal.tsx',
    'components/SellC2CView.tsx', 'components/ProfileView.tsx', 'components/CheckoutModal.tsx',
  ]) {
    assert.doesNotMatch(readFileSync(filename, 'utf8'), /compra (?:100% )?garantida|compra com garantia|compra protegida|pagamento protegido|pagamento seguro|custódia|frete.*protegido|equipamentos com garantia/i, filename);
  }
  const footer = readFileSync('components/shared/Footer.tsx', 'utf8');
  assert.doesNotMatch(footer, /confirmação de pagamento é uma experiência de teste, sem cobrança bancária/);
  // Keep financial transparency where the user confirms the transaction, not a site-wide banner.
  const checkout = readFileSync('components/commerce/CheckoutPage.tsx', 'utf8');
  assert.match(checkout, /Ambiente de demonstração: nenhuma cobrança financeira é realizada/);
  assert.match(checkout, /Pagamento de teste CoreMotion/);
});

it('mantém as mesmas bordas neutras em todos os módulos de perfil', () => {
  const source = readFileSync('components/WelcomeLandingPage.tsx', 'utf8');
  const profiles = source.slice(source.indexOf('id="perfis"'), source.indexOf('id="comecar"'));
  assert.equal((profiles.match(/border-zinc-700/g) || []).length, 3);
  assert.doesNotMatch(profiles, /border-zinc-600|bg-gradient-to-b/);
  assert.match(source, /aria-label="Conheça a CoreMotion"/);
  assert.match(profiles, /Conheça as ferramentas de cada caminho/);
});
