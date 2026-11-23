import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sportsProfileDetails} from '@/lib/sports-profile';
import type {SportsRecord} from '@/lib/sports';
const record=(kind:SportsRecord['kind'],data:Record<string,string>):SportsRecord=>({id:'1',owner:'owner',kind,data});
it('mostra detalhes preenchidos de atleta sem inventar campos nem expor chaves extras',()=>{
 const fields=sportsProfileDetails(record('athlete',{sport:'Vôlei',position:'Levantador',achievements:'Campeão estadual',history:'Equipe local',contact:'Contato escolhido pelo atleta',email:'privado@example.com',availability:'  '}));
 assert.deepEqual(fields.map(field=>field.label),['Esporte','Posição / especialidade','Medalhas e conquistas','Equipes anteriores e estatísticas','Contato para treinadores']);
 assert.equal(fields[2].value,'Campeão estadual');
 assert.ok(!fields.some(field=>field.value==='privado@example.com'));
});
it('mostra formação, metodologia e horários do treinador e não os campos de atleta',()=>{
 const fields=sportsProfileDetails(record('coach',{qualifications:'Educação Física',methodology:'Treinamento funcional',availability:'Segunda a sexta',achievements:'Não é campo do treinador'}));
 assert.deepEqual(fields.map(field=>field.value),['Educação Física','Treinamento funcional','Segunda a sexta']);
 assert.deepEqual(sportsProfileDetails(record('invite',{name:'Convite privado'})),[]);
 assert.deepEqual(sportsProfileDetails(record('athlete',{})),[]);
});
it('consulta apenas registros autorizados por RLS e renomeia o acesso para Perfil atleta',()=>{
 const source=readFileSync('components/community-sports-profile.tsx','utf8');
 assert.match(source,/\.eq\('owner',authorId\)\.in\('kind',\['athlete','coach'\]\)/);
 assert.doesNotMatch(source,/service_role|\.from\('profiles'\)/i);
 assert.match(source,/Tentar novamente/);
 assert.match(source,/useRealtimeRefresh/);
 for(const path of ['components/shared/Sidebar.tsx','components/SportsHub.tsx']){
  const content=readFileSync(path,'utf8');assert.match(content,/Perfil atleta/);assert.doesNotMatch(content,/Meu currículo esportivo/);
 }
 assert.match(readFileSync('components/community-author-profile.tsx','utf8'),/<CommunitySportsProfile/);
});
