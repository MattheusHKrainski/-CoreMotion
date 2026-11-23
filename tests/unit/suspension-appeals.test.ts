import {it} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import SuspensionAppeal from '@/components/auth/SuspensionAppeal';
it('oferece consulta privada sem revelar motivo antes de autenticar',()=>{
 const html=renderToStaticMarkup(React.createElement(SuspensionAppeal,{email:'account@example.com'}));
 assert.match(html,/Ver motivo e falar com a moderação/);
 assert.match(html,/aria-expanded="false"/);
 assert.doesNotMatch(html,/Motivo da suspensão|account@example.com/);
});
it('usa sessão isolada sem persistir login ou liberar conta suspensa',()=>{
 const source=readFileSync('components/auth/SuspensionAppeal.tsx','utf8');
 assert.match(source,/createSessionVerifier\(\)/);
 assert.match(source,/signInWithPassword/);
 assert.match(source,/signOut\(\{scope:'local'\}\)/);
 assert.doesNotMatch(source,/setUser|localStorage|rememberCurrentAccount/);
 assert.match(source,/send_suspension_appeal/);
 assert.match(source,/suspension_appeal_state/);
 assert.match(source,/request.current.id/);
});
it('recurso não recebe identidade do cliente, protege tabelas e preserva suspensão',()=>{
 const sql=readFileSync('supabase/migrations/20261123000000_suspension_appeals.sql','utf8');
 assert.match(sql,/WHERE id=auth.uid\(\) FOR UPDATE/);
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON public.suspension_appeals FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/existing.author_id=actor.id AND existing.ticket_id=tid/);
 assert.doesNotMatch(sql,/UPDATE public.profiles|CREATE POLICY/);
 assert.match(sql,/ON DELETE CASCADE/);
});
