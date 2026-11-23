import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {authorPublications} from '@/components/community-author-profile';
import type {CommunityPost} from '@/lib/types';
const make=(id:string,author_id:string,created_at:string)=>({id,author_id,created_at,author_name:'Atleta',category:'treino',title:'Treino',content:'Minha publicação',likes_count:0,comments_count:0,comments:[]} as CommunityPost);
it('perfil exibe apenas publicações do autor, recentes primeiro, sem mutar o feed',()=>{
 const posts=[make('old','a','2026-01-01'),make('other','b','2026-05-01'),make('new','a','2026-06-01')];
 assert.deepEqual(authorPublications(posts,'a').map(post=>post.id),['new','old']);
 assert.deepEqual(posts.map(post=>post.id),['old','other','new']);
 assert.deepEqual(authorPublications(posts,'missing'),[]);
});
it('nome e foto abrem perfil com fechamento acessível, seguir e paginação',()=>{
 const feed=readFileSync('components/CommunityView.tsx','utf8');
 assert.match(feed,/aria-label=\{`Ver perfil de \$\{post.author_name\}`\}/);
 assert.equal((feed.match(/onClick=\{\(\)=>setProfileAuthor\(post.author_id\)\}/g)||[]).length,2);
 const source=readFileSync('components/community-author-profile.tsx','utf8');
 assert.match(source,/showModal\(\)/);assert.match(source,/onCancel=/);
 assert.match(source,/aria-label="Fechar perfil"/);assert.match(source,/Mostrar mais/);
 assert.match(source,/author.author_badge/);
 assert.doesNotMatch(source,/\.from\('profiles'\)|\.email|\.phone|ban_reason/);
});
