import {it} from 'node:test';
import assert from 'node:assert/strict';
import {groupReports,reportUpdateUnread} from '@/lib/report-groups';
import type {ModerationReport} from '@/services/moderation';
const report=(id:string,owner_id?:string,target_id=id)=>({id,owner_id,target_id,target_title:'Anúncio',category:'athlete_listing',reporter_id:'reporter',reason:'Motivo',status:'reviewing',response:'',created_at:'2026-10-01'} as ModerationReport);
it('agrupa relatos de conteúdos diferentes da mesma conta sem misturar responsáveis ausentes',()=>{
 const groups=groupReports([report('1','owner'),report('2','owner'),report('3','other'),report('4'),report('5')]);
 assert.equal(groups.length,4);assert.equal(groups[0].reports.length,2);
 assert.equal(groupReports([report('a',undefined,'same'),report('b',undefined,'same')]).length,1);
});
it('oculta atualização lida sem apagar histórico e reexibe nova decisão',()=>{
 const item=report('1');assert.equal(reportUpdateUnread(item),true);
 item.reviewed_at='2026-10-02T10:00:00Z';assert.equal(reportUpdateUnread(item),true);
 item.reporter_read_at='2026-10-02T11:00:00Z';assert.equal(reportUpdateUnread(item),false);
 item.reviewed_at='2026-10-02T12:00:00Z';assert.equal(reportUpdateUnread(item),true);
});
it('mensagem privada segue para o responsável e a decisão lida some da caixa',async()=>{
 const {readFileSync}=await import('node:fs');
 const sql=readFileSync('supabase/migrations/20261123070000_report_owner_responses.sql','utf8');
 assert.match(sql,/VALUES\(recipient,report.category,report.target_id,trim\(p_response\)\)/);
 assert.match(sql,/response=''/);
 assert.match(sql,/reporter_id=auth.uid\(\)/);
 assert.match(sql,/NOT public.is_staff\(\) OR public.is_banned_user\(\)/);
 const inbox=readFileSync('components/shared/NotificationsInbox.tsx','utf8');
 assert.match(inbox,/filter\(\(item:AccountNotification\)=>!item.read_at\)/);
 assert.match(inbox,/reportUpdateUnread\(r\)/);
});
