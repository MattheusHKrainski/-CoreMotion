import { it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoreMotiomProvider } from '@/lib/store';
import Sidebar from '@/components/shared/Sidebar';
import { readFileSync } from 'node:fs';

it('recolhe a navegação por padrão e preserva os grupos no menu', () => {
  const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(Sidebar, { onOpenFavorites: () => {} })));
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-label="Abrir barra de funções"/);
  assert.match(html, /aria-label="Ver favoritos e salvos"/);
  assert.match(html, /aria-label="Ver carrinho"/);
  assert.doesNotMatch(html, /aria-label="Navegação da plataforma"/);
  assert.match(html, /CoreShop/);
  const source = readFileSync('components/shared/Sidebar.tsx', 'utf8');
  assert.match(source, /aria-label="Navegação da plataforma"/);
  assert.match(source, /Publique e gerencie anúncios/);
  assert.match(source, /if \(!items.length\) return null/);
  assert.match(source, /canAccessSports\(user\)/);
  assert.match(source, /<Menu className="h-6 w-6"/);
  assert.match(source, /aria-label="Voltar à tela principal"/);
  assert.match(source, /whitespace-normal/);
});
