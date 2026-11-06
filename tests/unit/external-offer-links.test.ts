import {it} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {externalOfferDestination} from '@/lib/external-offer-link';
import {INITIAL_EXTERNAL_OFFERS} from '@/fixtures/real-offers';
import {CoreMotiomProvider} from '@/lib/store';
import ExternalOfferCard from '@/components/marketplace/ExternalOfferCard';
import ExternalOfferModal from '@/components/marketplace/ExternalOfferModal';
it('preserva os 22 destinos específicos de todas as lojas e aceita afiliados HTTPS',()=>{
 for(const offer of INITIAL_EXTERNAL_OFFERS)assert.equal(externalOfferDestination(offer.source_url),offer.source_url);
 assert.equal(externalOfferDestination('  https://amzn.to/valid-affiliate  '),'https://amzn.to/valid-affiliate');
});
it('não transforma links ausentes, inseguros ou de exemplo em navegação local',()=>{
 for(const value of [null,undefined,'',42,'javascript:alert(1)','data:text/html,test','/produto','//loja.com/produto','http://loja.com/produto','https://shop.example.test/produto','https://user:password@loja.com/item','https://www.centauro.com.br/busca/bola','https://localhost/item'])assert.equal(externalOfferDestination(value),null,String(value));
});
it('card e modal expõem âncoras reais, não popups JavaScript ou bloqueio por is_demo antigo',()=>{
 const offer={...INITIAL_EXTERNAL_OFFERS[0],is_demo:true};
 const card=renderToStaticMarkup(React.createElement(ExternalOfferCard,{offer,onSelect:()=>{}}));
 const modal=renderToStaticMarkup(React.createElement(CoreMotiomProvider,null,React.createElement(ExternalOfferModal,{offer,onClose:()=>{}})));
 for(const html of [card,modal]){assert.ok(html.includes(`href="${offer.source_url}"`));assert.match(html,/target="_blank"/);assert.match(html,/rel="noopener noreferrer sponsored"/);}
 assert.match(modal,/Copiar link da oferta/);
 const source=readFileSync('components/marketplace/ExternalOfferModal.tsx','utf8');
 assert.doesNotMatch(source,/window.open|if \(offer.is_demo\) return/);
 assert.match(source,/copyText\(destination\)/);
});
it('link inválido é sinalizado sem criar âncora perigosa',()=>{
 const offer={...INITIAL_EXTERNAL_OFFERS[0],source_url:'javascript:alert(1)'};
 const card=renderToStaticMarkup(React.createElement(ExternalOfferCard,{offer,onSelect:()=>{}}));
 const modal=renderToStaticMarkup(React.createElement(CoreMotiomProvider,null,React.createElement(ExternalOfferModal,{offer,onClose:()=>{}})));
 assert.match(card,/Link indisponível/);assert.match(modal,/sem um link válido/);
 for(const html of [card,modal])assert.doesNotMatch(html,/href="javascript:/);
});
