import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateSportsProfile,sportsSaveError} from '@/lib/sports-validation';
import {canRecruit,canAccessSports} from '@/lib/sports';
import type {UserProfile} from '@/lib/types';
const valid={name:'Atleta',sport:'Basquete',city:'Curitiba',age:'20',height:'180',weight:'75,5',experience:'2'};
it('valida medidas e explica altura em cm em vez de erro genérico',()=>{
 assert.equal(validateSportsProfile('athlete',valid),null);
 assert.match(validateSportsProfile('athlete',{...valid,height:'1.80'})!,/centímetros/);
 assert.match(validateSportsProfile('athlete',{...valid,age:'0'})!,/Idade/);
 assert.equal(validateSportsProfile('coach',{name:'Treinador',sport:'Futebol',city:'Curitiba'}),null);
 assert.match(sportsSaveError({code:'23505'}),/Já existe/);
 assert.match(sportsSaveError({code:'42501'}),/sessão/);
});
it('atleta acessa seletivas mas só treinador recruta; casual não tem recrutamento',()=>{
 const user=(account_type:string)=>({account_type,role:'user'} as UserProfile);
 assert.equal(canAccessSports(user('athlete')),true);assert.equal(canRecruit(user('athlete')),false);
 assert.equal(canRecruit(user('coach')),true);assert.equal(canAccessSports(user('casual')),false);
});
it('exclusão própria usa identidade da sessão, confirmação e limpeza já existente',()=>{
 const sql=readFileSync('supabase/migrations/20261123090000_self_account_deletion.sql','utf8');
 assert.match(sql,/actor uuid:=auth.uid\(\)/);assert.match(sql,/IS DISTINCT FROM 'EXCLUIR'/);assert.match(sql,/DELETE FROM auth.users WHERE id=actor/);assert.match(sql,/is_master_email/);
 assert.match(readFileSync('components/ProfileView.tsx','utf8'),/<DeleteOwnAccount/);
 assert.doesNotMatch(readFileSync('components/community-comments.tsx','utf8'),/Atualizar comentários/);
});
it('equipe não tem currículo pessoal, mesmo com tipo atleta ou treinador',async()=>{
 const {canManageOwnSportsProfile}=await import('@/lib/sports');
 for(const role of ['admin','supervisor'])for(const account_type of ['athlete','coach']){
  const user={role,account_type} as UserProfile;
  assert.equal(canManageOwnSportsProfile(user),false);
  assert.equal(canAccessSports(user),true);
 }
 assert.equal(canManageOwnSportsProfile({role:'user',account_type:'athlete'} as UserProfile),true);
 assert.equal(canManageOwnSportsProfile({role:'user',account_type:'coach'} as UserProfile),true);
 assert.equal(canManageOwnSportsProfile(null),false);
 for(const path of ['components/shared/Sidebar.tsx','components/ProfileView.tsx','components/SportsHub.tsx'])assert.match(readFileSync(path,'utf8'),/canManageOwnSportsProfile\(user\)/);
});
