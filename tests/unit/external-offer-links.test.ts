import {it} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {externalOfferDestination} from '@/lib/external-offer-link';
import {INITIAL_EXTERNAL_OFFERS} from '@/fixtures/real-offers';
import ExternalOfferCard from '@/components/marketplace/ExternalOfferCard';
it('preserva os 22 destinos específicos de todas as lojas e aceita afiliados HTTPS',()=>{
 for(const offer of INITIAL_EXTERNAL_OFFERS)assert.equal(externalOfferDestination(offer.source_url),offer.source_url);
 assert.equal(externalOfferDestination('  https://amzn.to/valid-affiliate  '),'https://amzn.to/valid-affiliate');
});
it('não transforma links ausentes, inseguros ou de exemplo em navegação local',()=>{
 for(const value of [null,undefined,'',42,'javascript:alert(1)','data:text/html,test','/produto','//loja.com/produto','http://loja.com/produto','https://shop.example.test/produto','https://user:password@loja.com/item','https://www.centauro.com.br/busca/bola','https://localhost/item'])assert.equal(externalOfferDestination(value),null,String(value));
});
it('cards compram dentro da CoreMotion e identificam fornecedor sem redirecionar à loja',()=>{
 const offer={...INITIAL_EXTERNAL_OFFERS[0],is_demo:true};
 const card=renderToStaticMarkup(React.createElement(ExternalOfferCard,{offer,onSelect:()=>{}}));
 assert.match(card,/Comprar/);assert.match(card,/Fornecedor: /);assert.ok(card.includes(offer.store_name));
 assert.ok(!card.includes(`href="${offer.source_url}"`));
 const source=readFileSync('components/marketplace/ExternalOfferCard.tsx','utf8');
 assert.match(source,/productPath\('core', offer.id\)/);assert.doesNotMatch(source,/ExternalStoreLink/);
});
it('URL de fornecedor insegura nunca é usada como destino da compra',()=>{
 const offer={...INITIAL_EXTERNAL_OFFERS[0],source_url:'javascript:alert(1)'};
 const card=renderToStaticMarkup(React.createElement(ExternalOfferCard,{offer,onSelect:()=>{}}));
 assert.match(card,/Comprar/);assert.doesNotMatch(card,/href="javascript:/);
});
