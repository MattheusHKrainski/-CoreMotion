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
  it('mantém a ordem (Tudo, De Atletas, Ofertas) na Home e no Marketplace', () => {
    const homeHtml = renderToStaticMarkup(
      React.createElement(CoreMotiomProvider, null, React.createElement(HomeHeroAndHighlights))
    );
    const homeFilters = homeHtml.slice(homeHtml.indexOf('aria-label="Filtrar catálogo"'));
    const homeTudoIdx = homeFilters.indexOf('>Tudo<');
    const homeAtletasIdx = homeFilters.indexOf('>De Atletas<');
    const homeOfertasIdx = homeFilters.indexOf('>Ofertas<');
    assert.ok(homeTudoIdx > -1 && homeAtletasIdx > homeTudoIdx && homeOfertasIdx > homeAtletasIdx);

    const mpHtml = renderToStaticMarkup(
      React.createElement(CoreMotiomProvider, null, React.createElement(MarketplaceView))
    );
    const mpTudoIdx = mpHtml.indexOf('Tudo (');
    const mpAtletasIdx = mpHtml.indexOf('De Atletas (');
    const mpOfertasIdx = mpHtml.indexOf('Ofertas (');
    assert.ok(mpTudoIdx > -1 && mpAtletasIdx > mpTudoIdx && mpOfertasIdx > mpAtletasIdx);
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
