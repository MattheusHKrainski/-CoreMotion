import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('supabase/migrations/20261123100000_product_moderation_trash.sql','utf8');
it('arquiva exclusões administrativas de atletas e loja, não as próprias ou cascatas',()=>{
 assert.match(sql,/BEFORE DELETE ON public.products/);assert.match(sql,/BEFORE DELETE ON public.external_offers/);
 assert.match(sql,/pg_trigger_depth\(\)>1/);assert.match(sql,/item_owner=auth.uid\(\)/);assert.match(sql,/NOT public.is_staff\(\)/);
 assert.match(sql,/to_jsonb\(OLD\)/);assert.match(sql,/interval '30 days'/);
});
it('restauração é restrita à equipe, transacional e preserva os dados originais',()=>{
 assert.match(sql,/FOR UPDATE/);assert.match(sql,/item.purge_after<=now\(\)/);
 assert.match(sql,/jsonb_populate_record\(NULL::public.products,item.snapshot\)/);
 assert.match(sql,/jsonb_populate_record\(NULL::public.external_offers,item.snapshot\)/);
 assert.match(sql,/is_account_trashed\(item.owner_id\)/);
 assert.match(sql,/DELETE FROM public.product_moderation_trash WHERE owner_id=OLD.id/);
 assert.match(sql,/DELETE FROM public.product_moderation_trash WHERE purge_after<=now\(\)/);
});
it('painel permite consultar produto e restaurar com confirmação',()=>{
 const dashboard=readFileSync('components/admin/AdminDashboard.tsx','utf8');
 assert.match(dashboard,/Lixeira de produtos/);assert.match(dashboard,/<ProductTrash/);
 const ui=readFileSync('components/admin/ProductTrash.tsx','utf8');
 assert.match(ui,/Ver dados do produto/);assert.match(ui,/Restaurar produto/);assert.match(ui,/window.confirm/);assert.match(ui,/restore_moderated_product/);
});
