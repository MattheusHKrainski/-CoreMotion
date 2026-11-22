import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { safeAuthReturn } from '@/lib/auth-navigation';
import { productPresentation, PRODUCT_PRESENTATIONS } from '@/lib/product-presentation';
import { CommunityService } from '@/services/communityService';
it('login retorna apenas para rotas locais e impede redirecionamentos externos e autorretorno',()=>{
 for(const path of [null,'https://evil.test','//evil.test','/\\evil.test','/entrar','/entrar/','/\nevil'])assert.equal(safeAuthReturn(path),'/');
 assert.equal(safeAuthReturn('/compras'),'/compras');assert.equal(safeAuthReturn('/?view=community'),'/?view=community');
});
it('galerias contêm fotos distintas de cinco produtos com fonte identificada',()=>{
 assert.equal(Object.keys(PRODUCT_PRESENTATIONS).length,5);
 for(const data of Object.values(PRODUCT_PRESENTATIONS)){
  assert.ok(data.source.startsWith('https://'));assert.ok(data.images.length>=4);
  assert.equal(new Set(data.images).size,data.images.length);
  assert.ok(data.images.every(url=>url.startsWith('https://')));
 }
 const shoe=productPresentation('offer-olympikus-corremax-43758365')!;
 assert.ok(shoe.options.find(option=>option.label==='Tamanho')?.values.includes('40'));
 assert.equal(productPresentation('offer-olympikus-corremax-43758365','https://different.test/another-model'),undefined);
});
it('contadores representam comentários efetivamente armazenados, sem reproduzir contagens antigas fictícias',()=>{
 const post=CommunityService.mapDbPostToModel({id:'one',comments_count:18,comments:[{id:'c',author_name:'Atleta',content:'Comentário salvo.'}]});
 assert.equal(post.comments_count,1);assert.equal(post.comments[0].content,'Comentário salvo.');
 assert.equal(CommunityService.mapDbPostToModel({id:'two',comments_count:12,comments:[]}).comments_count,0);
});
it('comentários são atômicos, autenticados, idempotentes e não exigem editar publicações alheias',()=>{
 const sql=readFileSync('supabase/migrations/20261106060000_atomic_community_comments.sql','utf8');
 assert.match(sql,/FOR UPDATE/);assert.match(sql,/auth.uid\(\)/);assert.match(sql,/profile.name/);assert.match(sql,/p_request_key/);assert.match(sql,/jsonb_array_length\(entries\)/);
 assert.match(sql,/REVOKE UPDATE\(comments,comments_count\)/);
 const service=readFileSync('services/communityService.ts','utf8');
 assert.match(service,/rpc\('add_community_comment'/);
 const thread=readFileSync('components/community-comments.tsx','utf8');
 assert.match(thread,/CommunityService.getPost/);assert.match(thread,/if\(saved\)/);assert.match(thread,/texto foi preservado/);
});
