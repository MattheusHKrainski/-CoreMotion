import {it} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {ATHLETE_EXAMPLES} from '@/fixtures/athlete-examples';
it('substitui a vitrine local por exemplos novos explicitamente fictícios e sem contatos reais',()=>{
 assert.equal(ATHLETE_EXAMPLES.length,8);
 assert.equal(new Set(ATHLETE_EXAMPLES.map(p=>p.id)).size,8);
 for(const item of ATHLETE_EXAMPLES){assert.match(item.title,/Exemplo fictício/);assert.match(item.description,/preço simulado/);assert.equal(item.contact_phone,undefined);assert.equal(item.stock,0);assert.equal(item.views,0);assert.equal(item.likes_count,0);assert.ok(existsSync('public'+item.images[0]));}
});
