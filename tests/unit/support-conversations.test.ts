import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=(path:string)=>readFileSync(path,'utf8');
it('conversas privadas com autoria do servidor, repetição segura e exclusão em cascata',()=>{
 const sql=read('supabase/migrations/20261122230000_support_conversations.sql');
 assert.match(sql,/ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/GRANT SELECT ON public.support_messages TO authenticated/);
 assert.match(sql,/REFERENCES public.support_tickets\(id\) ON DELETE CASCADE/);
 assert.match(sql,/REFERENCES public.profiles\(id\) ON DELETE CASCADE/);
 assert.match(sql,/id=auth.uid\(\)/);
 assert.match(sql,/t.owner<>actor.id AND NOT team/);
 assert.match(sql,/NOT team OR p_status NOT IN/);
 assert.match(sql,/FOR UPDATE/);
 assert.match(sql,/existing.author_id<>actor.id/);
 assert.match(sql,/ELSE 'open'/);
 assert.match(sql,/SET search_path=pg_catalog/);
});
it('interface preserva rascunho em falhas, salva pelo RPC e tem acesso na gestão',()=>{
 const component=read('components/shared/SupportConversation.tsx');
 assert.match(component,/request.current.id/);
 assert.match(component,/setDraft\(''\);request.current=null/);
 assert.match(component,/setError\(e instanceof Error/);
 assert.match(component,/useRealtimeRefresh/);
 assert.match(read('services/support.ts'),/rpc\('send_support_message'/);
 assert.match(read('components/admin/AdminDashboard.tsx'),/'support', 'Atendimento'/);
 assert.match(read('components/shared/HelpCenter.tsx'),/Mostrar mais solicitações/);
 assert.ok(!read('components/shared/Footer.tsx').includes('Seg. a Sex. das 8h'));
});
