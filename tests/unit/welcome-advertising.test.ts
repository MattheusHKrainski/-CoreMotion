import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoreMotiomProvider } from '@/lib/store';
import CoreMotiomApp from '@/app/page';

it('remove o tutorial de visitante e mantém os botões de acesso sem cadastro', () => {
  const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(CoreMotiomApp)));
  assert.match(html, /Entrar como visitante/);
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
  assert.match(footer, /Não garante as transações, não retém pagamentos e não realiza entregas/);
});
