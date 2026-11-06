import {it} from 'node:test';
import assert from 'node:assert/strict';
import { MULTI_STORE_OFFERS } from '@/fixtures/multi-store-offers';
import {INITIAL_EXTERNAL_OFFERS} from '@/fixtures/real-offers';
import {appendMultiStoreOffers} from '@/lib/offer-catalog';
import {offerCreateSchema} from '@/lib/schemas/offer.schema';
it('adiciona oito produtos específicos de quatro lojas sem duplicar fotos ou destinos',()=>{
 assert.equal(MULTI_STORE_OFFERS.length,8);
 assert.deepEqual([...new Set(MULTI_STORE_OFFERS.map(o=>o.store_name))].sort(),['Adidas','Centauro','Netshoes','Olympikus']);
 for(const field of ['id','image_url','source_url'] as const)assert.equal(new Set(INITIAL_EXTERNAL_OFFERS.map(o=>o[field])).size,INITIAL_EXTERNAL_OFFERS.length);
 for(const offer of MULTI_STORE_OFFERS){assert.equal(offerCreateSchema.safeParse(offer).success,true);assert.ok(offer.price>0);if(offer.original_price)assert.ok(offer.original_price>offer.price);assert.equal(offer.is_demo,false);assert.equal(offer.coupon_code,undefined);}
});
it('instala nova leva uma vez sem sobrescrever alterações, status ou exclusões',()=>{
 const edited={...MULTI_STORE_OFFERS[0],title:'Editado no painel',price:321,is_active:false};
 const before=[edited];const added=appendMultiStoreOffers(before,false);
 assert.equal(added.length,8);assert.equal(added.find(o=>o.id===edited.id),edited);
 assert.deepEqual(appendMultiStoreOffers([],true),[]);
 const removed=added.filter(o=>o.id!==MULTI_STORE_OFFERS[1].id);
 assert.equal(appendMultiStoreOffers(removed,true),removed);
 const custom={...edited,id:'custom-id'};
 assert.equal(appendMultiStoreOffers([custom],false).filter(o=>o.source_url===custom.source_url).length,1);
});
