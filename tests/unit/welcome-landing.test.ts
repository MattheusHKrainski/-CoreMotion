import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoreMotiomProvider } from '@/lib/store';
import CoreMotiomApp from '@/app/page';
import HomeHeroAndHighlights from '@/components/HomeHeroAndHighlights';
import MarketplaceView from '@/components/marketplace/MarketplaceView';

describe('Welcome Landing Page (Página Inicial de Boas-Vindas)', () => {
  it('remove as abas Tudo, De Atletas e Ofertas da Home e do Marketplace', () => {
    const homeHtml = renderToStaticMarkup(
      React.createElement(CoreMotiomProvider, null, React.createElement(HomeHeroAndHighlights))
    );
    assert.doesNotMatch(homeHtml, /aria-label="Filtrar catálogo"/);
    const mpHtml = renderToStaticMarkup(
      React.createElement(CoreMotiomProvider, null, React.createElement(MarketplaceView))
    );
    assert.doesNotMatch(mpHtml, /Tudo \(|De Atletas \(|Ofertas \(/);
    assert.match(mpHtml, /Pesquisar no CoreShop/);
  });
  it('abre diretamente a vitrine com navegação e catálogo, sem a página de boas-vindas', () => {
    const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(CoreMotiomApp)));
    assert.match(html, /CoreShop/);
    assert.match(html, /Ofertas/);
    assert.match(html, /Entrar/);
    assert.doesNotMatch(html, /Cadastrar-se grátis|Entrar como visitante|Seu esporte, suas conexões, seu próximo passo/);
    assert.doesNotMatch(readFileSync('app/page.tsx', 'utf8'), /WelcomeLandingPage|if \(!hasEnteredPlatform\)/);
  });
});

it('remove o atalho lateral e abre a autenticação em uma página separada sem trocar a identidade', () => {
  const sidebar = readFileSync('components/shared/Sidebar.tsx', 'utf8');
  const store = readFileSync('lib/store.tsx', 'utf8');
  assert.doesNotMatch(sidebar, /Página inicial & Como funciona/);
  assert.match(store, /setAuthModalOpenState\(open\)/);
});
