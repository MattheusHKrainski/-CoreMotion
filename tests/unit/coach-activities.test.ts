import {it} from 'node:test';
import assert from 'node:assert/strict';
import {validateCoachActivity,canManageCoachActivity,matchesCoachActivity,type CoachActivity} from '@/lib/coach-activities';
import {canRecruit} from '@/lib/sports';
import type {UserProfile} from '@/lib/types';
const activity:CoachActivity={id:'activity',owner:'coach',created_at:'2026-11-05',type:'class',title:'Pilates no parque',organizer:'Marina',sport:'Pilates',city:'São José',schedule:'Sábado às 9h',contact:'Contato público',description:'Aula leve para iniciantes.'};
const user=(id:string,account_type:UserProfile['account_type']='coach',role:UserProfile['role']='user'):UserProfile=>({id,name:id,email:`${id}@gmail.com`,created_at:'2026-11-05',account_type,role});
it('valida tipo, limites e campos públicos obrigatórios',()=>{
 assert.equal(validateCoachActivity(activity),null);
 for(const key of ['title','organizer','sport','city','schedule','contact','description'])assert.ok(validateCoachActivity({...activity,[key]:' '}));
 assert.ok(validateCoachActivity({...activity,title:'x'.repeat(121)}));
 assert.ok(validateCoachActivity({...activity,type:'toString' as 'class'}));
 for(const type of ['class','group','association'] as const)assert.equal(validateCoachActivity({...activity,type}),null);
});
it('treinadores gerenciam só seus anúncios; atletas, casuais e banidos não publicam',()=>{
 assert.equal(canManageCoachActivity(user('coach'),activity),true);
 assert.equal(canManageCoachActivity({...user('local'),supabase_id:'coach'},activity),true);
 assert.equal(canManageCoachActivity(user('another'),activity),false);
 for(const type of ['athlete','casual'] as const){assert.equal(canRecruit(user('coach',type)),false);assert.equal(canManageCoachActivity(user('coach',type),activity),false);}
 assert.equal(canManageCoachActivity(null,activity),false);
 assert.equal(canManageCoachActivity({...user('coach'),is_banned:true},activity),false);
 for(const role of ['admin','supervisor'] as const)assert.equal(canManageCoachActivity(user('staff','casual',role),activity),true);
});
it('publicações acompanham a busca e o filtro de modalidade da aba',()=>{
 assert.equal(matchesCoachActivity(activity,'Pilates','sao jose'),true);
 assert.equal(matchesCoachActivity(activity,'all','MARINA'),true);
 assert.equal(matchesCoachActivity(activity,'Vôlei',''),false);
 assert.equal(matchesCoachActivity(activity,'all','natação'),false);
});
