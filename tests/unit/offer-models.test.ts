import { it } from 'node:test';
import assert from 'node:assert/strict';
import { uniqueOfferModels, voltageVariants } from '@/lib/offer-models';
import { INITIAL_EXTERNAL_OFFERS } from '@/fixtures/real-offers';
const first={...INITIAL_EXTERNAL_OFFERS[0],id:'220',title:'Esteira Vollo BT 220V  2 em 1',store_name:'Vollo',source_url:'https://www.vollo.com.br/esteira-bt-220v/p',price:999.9,is_active:true};
const second={...first,id:'110',title:'Esteira Vollo BT 110V 2 em 1',source_url:'https://www.vollo.com.br/esteira-bt-110v/p'};
it('apresenta um modelo com duas voltagens sem apagar seus SKUs',()=>{
 const raw=[first,second]; const grouped=uniqueOfferModels(raw);
 assert.equal(grouped.length,1);
 assert.equal(grouped[0].title,'Esteira Vollo BT 2 em 1');
 assert.deepEqual(grouped[0].voltage_variants?.map(item=>item.label),['220V','110V']);
 assert.equal(raw.length,2);assert.equal(first.title,'Esteira Vollo BT 220V  2 em 1');
 assert.deepEqual(voltageVariants(first,raw).map(item=>item.id),['110','220']);
});
it('não agrupa lojas, modelos, cores ou produtos sem voltagem diferentes',()=>{
 assert.equal(uniqueOfferModels([first,{...second,store_name:'Outra loja'}]).length,2);
 assert.equal(uniqueOfferModels([first,{...second,title:'Esteira Vollo BT 110V 3 em 1'}]).length,2);
 assert.equal(uniqueOfferModels([first,{...second,title:second.title+' Vermelha'}]).length,2);
 assert.equal(uniqueOfferModels([{...first,title:'Bola A'},{...second,title:'Bola A'}]).length,2);
});
it('não oferece a opção de voltagem pausada e não muta dados de origem',()=>{
 assert.equal(voltageVariants(first,[first,{...second,is_active:false}]).length,1);
 assert.equal(uniqueOfferModels([first]).length,1);
});
