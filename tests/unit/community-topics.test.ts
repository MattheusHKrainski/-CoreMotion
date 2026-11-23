import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
it('oferece Geral em todos os seletores sem Eventos ou coluna lateral esquerda',()=>{
 const source=readFileSync('components/CommunityView.tsx','utf8');
 assert.match(source,/value: 'geral', label: 'Geral'/);
 assert.doesNotMatch(source,/label: 'Eventos'|aria-label="Explorar assuntos"|Encontre sua<br\/>próxima conversa/);
 assert.match(source,/xl:grid-cols-\[minmax\(0,760px\)_260px\]/);
 assert.match(source,/CATEGORIES.map\(topic/);
 assert.equal((source.match(/CATEGORIES.map\(item/g)||[]).length,2);
 assert.match(source,/post.category === 'evento' \? 'geral' : post.category/);
});
it('migra assunto antigo sem excluir publicações',()=>{
 const sql=readFileSync('supabase/migrations/20261123030000_community_general_topic.sql','utf8');
 assert.match(sql,/SET category='geral' WHERE category='evento'/);
 assert.doesNotMatch(sql,/DELETE FROM/);
});
