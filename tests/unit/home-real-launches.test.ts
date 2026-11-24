import { it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import HomeRealLaunches from '@/components/HomeRealLaunches';

it('usa a foto do lançamento oficial do Nike Book 3, não a arte conceitual', () => {
  const html = renderToStaticMarkup(React.createElement(HomeRealLaunches, {
    offers: [],
    onExploreSport: () => {},
  }));
  assert.match(html, /nike-inc-world-of-athletes-nike-book-3\.jpg/);
  assert.match(html, /Imagem oficial/);
  assert.match(html, /about\.nike\.com\/en\/newsroom\/releases/);
  assert.doesNotMatch(html, /Arte conceitual|Visão de quadra/);
  assert.match(html, /PREVISTO 2027/);
});
