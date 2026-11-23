import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
it('oferece Geral em todos os seletores sem Eventos, mantém esquerda e remove bloco direito',()=>{
 const source=readFileSync('components/CommunityView.tsx','utf8');
 assert.match(source,/value: 'geral', label: 'Geral'/);
 assert.doesNotMatch(source,/label: 'Eventos'|aria-label="Descubra conversas"|Descubra assuntos/);
 assert.match(source,/aria-label="Explorar assuntos"/);
 assert.match(source,/lg:grid-cols-\[200px_minmax\(0,760px\)\]/);
 assert.match(source,/CATEGORIES.map\(topic/);
 assert.equal((source.match(/CATEGORIES.map\(item/g)||[]).length,2);
 assert.match(source,/post.category === 'evento' \? 'geral' : post.category/);
});
it('migra assunto antigo sem excluir publicações',()=>{
 const sql=readFileSync('supabase/migrations/20261123030000_community_general_topic.sql','utf8');
 assert.match(sql,/SET category='geral' WHERE category='evento'/);
 assert.doesNotMatch(sql,/DELETE FROM/);
});
