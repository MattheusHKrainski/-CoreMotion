import {it} from 'node:test';
import assert from 'node:assert/strict';
import {commentThreads} from '@/lib/comment-threads';
import {CommunityService} from '@/services/communityService';
const comment=(id:string,parent_id?:string)=>({id,parent_id,author_name:'Membro',content:'Texto',created_at:'2026-10-22'});
it('agrupa respostas e respostas de respostas sem profundidade infinita',()=>{
 const groups=commentThreads([comment('1'),comment('2','1'),comment('3','2'),comment('4')]);
 assert.equal(groups.length,2);assert.deepEqual(groups[0].replies.map(c=>c.id),['2','3']);assert.equal(groups[0].replies[1].parent_id,'2');
});
it('preserva comentários antigos e órfãos e não trava com ciclos',()=>{
 assert.equal(commentThreads([comment('1'),comment('2','missing')]).length,2);
 assert.ok(commentThreads([comment('1','2'),comment('2','1')]).length);
 assert.equal(commentThreads([]).length,0);
});
it('mapeamento conserva vínculo persistido da resposta',()=>{
 const post=CommunityService.mapDbPostToModel({id:'post',comments:[comment('2','1')]});
 assert.equal(post.comments[0].parent_id,'1');
});
