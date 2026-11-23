'use client';
import React,{useCallback,useEffect,useState} from 'react';
import ProductImage from '@/components/shared/ProductImage';
import {getSupabaseClient} from '@/services/supabaseClient';
import {useRealtimeRefresh} from '@/hooks/useRealtimeRefresh';
interface ArchivedProduct {id:string;kind:'athlete'|'store';target_id:string;deleted_at:string;purge_after:string;snapshot:Record<string,unknown>}
const sources=[{table:'product_moderation_trash'}] as const;
export default function ProductTrash(){
 const client=getSupabaseClient();
 const [items,setItems]=useState<ArchivedProduct[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[query,setQuery]=useState('');
 const refresh=useCallback(async()=>{if(!client){setError('Conexão indisponível.');setLoading(false);return;}setLoading(true);try{const {data,error}=await client.from('product_moderation_trash').select('*').gt('purge_after',new Date().toISOString()).order('deleted_at',{ascending:false});if(error)throw error;setItems(data||[]);setError('');}catch{setError('Não foi possível carregar a lixeira de produtos. Confira a conexão e a migração do banco.');}finally{setLoading(false);}},[client]);
 useEffect(()=>{void refresh();},[refresh]);
 useRealtimeRefresh(client,sources,refresh,Boolean(client),'product-moderation-trash');
 return <section className="space-y-4"><h2 className="text-xl font-bold">Lixeira de produtos</h2><p className="text-sm text-zinc-400">Produtos de atletas e da loja excluídos pela equipe ficam disponíveis por 30 dias. Exclusões do próprio anunciante são permanentes e não entram aqui. Restaurar recupera o anúncio com seu estado anterior, sem recriar interações apagadas.</p>
 <input aria-label="Buscar produtos excluídos" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar título ou código" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm"/>
 <button type="button" disabled={loading||busy} onClick={()=>void refresh()} className="text-xs text-red-400">Atualizar lixeira</button>
 {loading&&<p role="status">Carregando…</p>}{error&&<p role="alert" className="text-sm text-red-300">{error}</p>}
 {!loading&&!error&&!items.length&&<p className="text-sm text-zinc-500">Nenhum produto na lixeira.</p>}
 {items.filter(item=>`${item.snapshot.title||''} ${item.target_id}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))).map(item=><article key={item.id} className="space-y-3 rounded-xl border border-zinc-700 p-4">
 <h3 className="font-bold">{String(item.snapshot.title||'Produto')}</h3><p className="text-xs text-zinc-400">{item.kind==='athlete'?'Anúncio de atleta':'Produto da loja'} · Excluído em {new Date(item.deleted_at).toLocaleString('pt-BR')} · Disponível até {new Date(item.purge_after).toLocaleString('pt-BR')}</p>
 <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-zinc-100"><ProductImage src={String((Array.isArray(item.snapshot.images)?item.snapshot.images[0]:item.snapshot.image_url)||'')} alt={String(item.snapshot.title||'Produto excluído')} sizes="128px" /></div>
 <details><summary className="cursor-pointer text-sm text-zinc-300">Ver dados do produto</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm text-zinc-400">{String(item.snapshot.description||'Sem descrição')}</p><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all text-xs text-zinc-500">{JSON.stringify(item.snapshot,null,2)}</pre></details>
 <button type="button" disabled={busy||loading} className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-bold disabled:opacity-50" onClick={async()=>{if(!client||!window.confirm('Restaurar este produto com o estado anterior à exclusão?'))return;setBusy(true);setError('');try{const {error}=await client.rpc('restore_moderated_product',{p_id:item.id});if(error)throw error;await refresh();}catch(reason){setError(reason instanceof Error?reason.message:'Não foi possível restaurar. Confira se a conta responsável ainda está disponível.');}finally{setBusy(false);}}}>Restaurar produto</button>
 </article>)}
 </section>;
}
