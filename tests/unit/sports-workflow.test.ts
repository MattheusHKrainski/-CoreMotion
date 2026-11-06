import { it } from 'node:test';
import assert from 'node:assert/strict';
import { activityGroups, matchesSportsRecord, canCancelApplication, type SportsFilters } from '@/lib/sports-workflow';
import type { SportsRecord } from '@/lib/sports';
const filters: SportsFilters = { name: '', sport: '', age: '', city: '', category: '' };
const record = (id: string, kind: SportsRecord['kind'], owner: string, data: Record<string,string> = {}): SportsRecord => ({id, kind, owner, data});
it('filtra atletas por nome sem acento, modalidade e idade exata', () => {
 const athlete = record('a','athlete','a',{name:'João Silva',sport:'Futebol',age:'17',city:'Curitiba'});
 assert.equal(matchesSportsRecord(athlete,{...filters,name:'joao',sport:'Futebol',age:'17'}),true);
 assert.equal(matchesSportsRecord(athlete,{...filters,name:'Maria'}),false);
 assert.equal(matchesSportsRecord(athlete,{...filters,age:'18'}),false);
 assert.equal(matchesSportsRecord(athlete,{...filters,sport:'Basquete'}),false);
});
it('filtra seletivas por modalidade, cidade e SUB sem depender de idade/nome', () => {
 const trial = record('t','trial','c',{sport:'Futebol',city:'São José',category:'SUB-17'});
 assert.equal(matchesSportsRecord(trial,{...filters,sport:'Futebol',city:'sao jose',category:'sub 17',age:'90',name:'outra'}),true);
 assert.equal(matchesSportsRecord(trial,{...filters,city:'Curitiba'}),false);
 assert.equal(matchesSportsRecord(trial,{...filters,category:'SUB-20'}),false);
});
it('isola convocações e inscrições por remetente e destinatário', () => {
 const rows = [record('i','invite','coach',{recipient:'athlete'}),record('a','application','athlete',{recipient:'coach',status:'Aceito'}),record('other','application','stranger',{recipient:'another'})];
 assert.deepEqual(activityGroups(rows,'athlete').receivedInvites.map(r=>r.id),['i']);
 assert.deepEqual(activityGroups(rows,'athlete').applications.map(r=>r.id),['a']);
 assert.deepEqual(activityGroups(rows,'coach').sentInvites.map(r=>r.id),['i']);
 assert.equal(activityGroups(rows,'coach').trialApplications[0].data.status,'Aceito');
 assert.equal(activityGroups(rows,'stranger').receivedInvites.length,0);
});

it('permite cancelar apenas a própria inscrição pendente', () => {
 const application=record('a','application','athlete',{recipient:'coach'});
 assert.equal(canCancelApplication(application,'athlete'),true);
 for(const owner of ['coach','other','']) assert.equal(canCancelApplication(application,owner),false);
 for(const status of ['Aceito','Recusado']) assert.equal(canCancelApplication({...application,data:{...application.data,status}},'athlete'),false);
 assert.equal(canCancelApplication(record('i','invite','athlete'),'athlete'),false);
});
