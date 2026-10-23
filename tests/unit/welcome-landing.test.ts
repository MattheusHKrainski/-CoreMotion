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
    const homeTudoIdx = homeHtml.indexOf('>Tudo<');
    const homeAtletasIdx = homeHtml.indexOf('>De Atletas<');
    const homeOfertasIdx = homeHtml.indexOf('>Ofertas<');
    assert.ok(homeTudoIdx > -1 && homeAtletasIdx > homeTudoIdx && homeOfertasIdx > homeAtletasIdx);

    const mpHtml = renderToStaticMarkup(
      React.createElement(CoreMotiomProvider, null, React.createElement(MarketplaceView))
    );
    const mpTudoIdx = mpHtml.indexOf('Tudo (');
    const mpAtletasIdx = mpHtml.indexOf('De Atletas (');
    const mpOfertasIdx = mpHtml.indexOf('Ofertas (');
    assert.ok(mpTudoIdx > -1 && mpAtletasIdx > mpTudoIdx && mpOfertasIdx > mpAtletasIdx);
  });
  it('renderiza na entrada inicial as 3 opções de acesso (logar, cadastrar e visitante), proposta, funcionamento e perfis', () => {
    const html = renderToStaticMarkup(
      React.createElement(CoreMotiomProvider, null, React.createElement(CoreMotiomApp))
    );

    // 3 opções claras de acesso logo na entrada
    assert.match(html, /Cadastrar-se grátis/);
    assert.match(html, /Entrar como visitante/);
    assert.match(html, /Fazer login/);

    // Seções explicativas pedidas pelo usuário
    assert.match(html, /Nossa proposta/);
    assert.match(html, /Como funciona a CoreMotion/);
    assert.match(html, /Para Clientes e Atletas/);
    assert.match(html, /Para Treinadores e Assessorias/);
    assert.match(html, /Custódia Protegida/);

    // Zero formulários/inputs na tela inicial pública para nunca acionar falso-positivo de Safe Browsing
    assert.equal(/<form[\s>]/i.test(html), false);
    assert.equal(/<input[\s>]/i.test(html), false);

    // Zero termos artificiais ou jargão interno
    const forbidden = ['simulado', 'demonstração', 'fictício', 'Marca Demo', 'B2C', 'C2C', '⌘K'];
    for (const term of forbidden) {
      assert.equal(
        html.toLowerCase().includes(term.toLowerCase()),
        false,
        `Termo indesejado encontrado na página inicial: ${term}`
      );
    }
  });
});
