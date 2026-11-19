import {it} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {INITIAL_PRODUCTS} from '@/fixtures/initial-data';
import {INITIAL_EXTERNAL_OFFERS} from '@/fixtures/real-offers';
import {homeCarouselSlides} from '@/lib/home-carousel';
import HomeProductCarousel from '@/components/HomeProductCarousel';
const products=INITIAL_PRODUCTS.filter(p=>p.product_type==='c2c'&&p.status==='active');
const offers=INITIAL_EXTERNAL_OFFERS;
it('carrossel mistura anúncios e ofertas atuais, limitado a oito sem duplicatas',()=>{
 const slides=homeCarouselSlides([...products,products[0]],offers);
 assert.equal(slides.length,8);assert.equal(slides[0].kind,'product');assert.equal(slides[1].kind,'offer');
 assert.equal(new Set(slides.map(s=>s.kind+s.value.id)).size,8);
});
it('não restaura anúncios vendidos, ofertas inativas ou dados removidos',()=>{
 assert.deepEqual(homeCarouselSlides([{...products[0],status:'sold'},{...products[0],product_type:'b2c'}],[{...offers[0],is_active:false}]),[]);
 assert.deepEqual(homeCarouselSlides([],[]),[]);
 assert.equal(homeCarouselSlides([],offers).length,8);
});
it('renderiza foto/preço do produto exato e controles acessíveis',()=>{
 const html=renderToStaticMarkup(React.createElement(HomeProductCarousel,{products,offers,onExplore(){}}));
 assert.match(html,/aria-roledescription="carrossel"/);assert.match(html,/Produto anterior/);assert.match(html,/Próximo produto/);assert.match(html,/Pausar carrossel/);
 assert.ok(html.includes(products[0].title));assert.match(html,/R\$/);assert.match(html,/Conhecer produto/);
});
it('catálogo vazio não fabrica destaque e um item não exibe controles de rotação',()=>{
 const empty=renderToStaticMarkup(React.createElement(HomeProductCarousel,{products:[],offers:[],onExplore(){}}));assert.match(empty,/Nenhum destaque disponível/);assert.doesNotMatch(empty,/Produto anterior/);
 const single=renderToStaticMarkup(React.createElement(HomeProductCarousel,{products:[products[0]],offers:[],onExplore(){}}));assert.doesNotMatch(single,/Próximo produto|Pausar carrossel/);
});
