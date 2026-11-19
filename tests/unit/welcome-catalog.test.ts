import { it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_PRODUCTS } from '@/fixtures/initial-data';
import { INITIAL_EXTERNAL_OFFERS } from '@/fixtures/real-offers';
import { welcomeCatalogItems } from '@/lib/welcome-catalog';
import { CoreMotiomProvider } from '@/lib/store';
import WelcomeCatalog from '@/components/WelcomeCatalog';

const products = INITIAL_PRODUCTS.filter(p => p.product_type === 'c2c' && p.status === 'active');
const offers = INITIAL_EXTERNAL_OFFERS;
it('mescla produtos e ofertas atuais sem ultrapassar quatro cards', () => {
 const items = welcomeCatalogItems(products, offers, 'all');
 assert.equal(items.length, 4);
 assert.deepEqual(items.map(item => item.kind), ['product', 'offer', 'product', 'offer']);
 assert.equal(items[0].value, products[0]);
 assert.equal(items[1].value, offers[0]);
});
it('filtra De Atletas e Ofertas sem inventar catálogo se o banco estiver vazio', () => {
 assert.ok(welcomeCatalogItems(products, offers, 'athletes').every(item => item.kind === 'product'));
 assert.ok(welcomeCatalogItems(products, offers, 'offers').every(item => item.kind === 'offer'));
 assert.deepEqual(welcomeCatalogItems([], [], 'all'), []);
 assert.equal(welcomeCatalogItems([], offers, 'all').length, 4);
 assert.equal(welcomeCatalogItems(products, [], 'all').length, 4);
});
it('não exibe anúncios inativos, produtos de outros tipos ou ofertas desativadas', () => {
 assert.deepEqual(welcomeCatalogItems([{ ...products[0], status: 'sold' }, { ...products[0], product_type: 'b2c' }], [{ ...offers[0], is_active: false }], 'all'), []);
});
it('usa edições de título e preço recebidas, sem substituir por fixtures', () => {
 const edited = { ...products[0], title: 'Equipamento atualizado', price: 123.45 };
 assert.equal(welcomeCatalogItems([edited], [], 'all')[0].value, edited);
});
it('mostra fotos, preços, filtros e acesso ao catálogo sem exigir formulário', () => {
 const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(WelcomeCatalog, { products, offers, onExplore() {} })));
 assert.match(html, /Encontre seu próximo equipamento/);
 assert.match(html, /Ver catálogo completo/);
 for (const item of welcomeCatalogItems(products, offers, 'all')) assert.ok(html.includes(item.value.title));
 assert.match(html, /<img/);
 assert.match(html, /R\$/);
 assert.ok(html.indexOf('>Tudo<') < html.indexOf('>De Atletas<'));
 assert.ok(html.indexOf('>De Atletas<') < html.indexOf('>Ofertas<'));
 assert.doesNotMatch(html, /<form|<input/);
});
it('apresenta estado vazio explícito em vez de inserir produtos excluídos', () => {
 const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(WelcomeCatalog, { products: [], offers: [], onExplore() {} })));
 assert.match(html, /Nenhum item disponível/);
 assert.doesNotMatch(html, /<img/);
});
