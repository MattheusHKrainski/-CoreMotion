import { it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SupportFAQ from '@/components/shared/SupportFAQ';
import { SUPPORT_FAQ } from '@/lib/support-faq';
import { matchesCatalogSearch } from '@/lib/catalog-search';
it('FAQ tem respostas completas, temas distintos e não exige autenticação',()=>{
 assert.equal(new Set(SUPPORT_FAQ.map(item=>item.id)).size,SUPPORT_FAQ.length);
 assert.ok(SUPPORT_FAQ.length>=14);
 assert.ok(SUPPORT_FAQ.every(item=>item.answer.length>90));
 const html=renderToStaticMarkup(React.createElement(SupportFAQ,{onContact:()=>{}}));
 assert.equal((html.match(/<details/g)||[]).length,SUPPORT_FAQ.length);
 assert.match(html,/Perguntas frequentes/);
 assert.match(html,/Falar com a equipe/);
 assert.match(html,/Pesquisar nas perguntas frequentes/);
});
it('busca da FAQ encontra palavras sem acento em perguntas e respostas',()=>{
 const results=SUPPORT_FAQ.filter(item=>matchesCatalogSearch('recupero senha',item.question,item.answer));
 assert.ok(results.some(item=>item.id==='password'));
 assert.ok(SUPPORT_FAQ.find(item=>item.id==='core-payment')?.answer.includes('Não.'));
});
