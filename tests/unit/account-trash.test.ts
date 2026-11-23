import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(name:string)=>readFileSync(name,'utf8');
it('separa ativas, suspensas e excluídas e impede edição na lixeira',()=>{
 const ui=read('components/admin/AdminDashboard.tsx');
 assert.match(ui,/Excluídas · lixeira/);assert.match(ui,/Restaurar conta/);
 assert.match(ui,/Date.parse\(archived.purge_after\)<=Date.now\(\)/);
 assert.match(ui,/!archived && !protectedAccount/);
 assert.doesNotMatch(ui,/removeAccountMedia/);
 const api=read('app/api/users/route.ts');
 assert.match(api,/rpc\('moderate_account', \{ p_target:userId, p_action:'delete' \}/);
 assert.doesNotMatch(api,/await deleteAuthUser|await removeAccountMedia/);
});
it('restauração é administrativa, respeita prazo e preserva suspensão anterior',()=>{
 const sql=read('supabase/migrations/20261123010000_account_trash.sql');
 assert.match(sql,/interval '30 days'/);assert.match(sql,/NOT public.is_admin\(\) OR p_target=auth.uid\(\) OR public.is_master_email/);
 assert.match(sql,/archived.purge_after<=now\(\)/);
 assert.match(sql,/is_banned=archived.previous_banned/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public.moderate_account_before_trash/);
 assert.match(sql,/AS RESTRICTIVE FOR SELECT/);
 assert.match(sql,/DELETE FROM auth.sessions/);
 assert.doesNotMatch(sql,/DELETE FROM auth.users/);
});
it('limpeza automática só escolhe entradas expiradas e remove mídia antes da identidade',()=>{
 const fn=read('supabase/functions/purge-account-trash/index.js');
 assert.match(fn,/\.lte\('purge_after',new Date\(\).toISOString\(\)\)/);
 assert.doesNotMatch(fn,/req\.json|req\.url|req\.text/);
 assert.ok(fn.indexOf('await bucket.remove')<fn.indexOf('await sb.auth.admin.deleteUser'));
 assert.match(read('supabase/migrations/20261123011000_schedule_account_trash_cleanup.sql'),/17 \* \* \* \*/);
});
