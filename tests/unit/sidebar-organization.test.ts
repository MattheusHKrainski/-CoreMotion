import { it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoreMotiomProvider } from '@/lib/store';
import Sidebar from '@/components/shared/Sidebar';
import { readFileSync } from 'node:fs';

it('separa a navegação em grupos com descrições visíveis', () => {
  const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(Sidebar)));
  assert.match(html, /aria-label="Navegação da plataforma"/);
  assert.match(html, /aria-label="Explorar"/);
  assert.match(html, /aria-label="Anunciar e treinar"/);
  assert.match(html, /Minhas compras/);
  assert.match(html, /Publique e gerencie anúncios/);
  assert.match(html, /aria-current="page"/);
  const source = readFileSync('components/shared/Sidebar.tsx', 'utf8');
  assert.match(source, /if \(!items.length\) return null/);
  assert.match(source, /canAccessSports\(user\)/);
  assert.match(source, /whitespace-normal/);
  assert.doesNotMatch(source, /text-\[10px\] truncate/);
});
