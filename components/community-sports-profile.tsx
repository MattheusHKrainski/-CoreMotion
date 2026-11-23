'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useCoreMotiom } from '@/lib/store';
import type { SportsRecord } from '@/lib/sports';
import { sportsProfileDetails } from '@/lib/sports-profile';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
export default function CommunitySportsProfile({authorId}:{authorId:string}) {
 const {user}=useCoreMotiom();
 const [records,setRecords]=useState<SportsRecord[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const generation=useRef(0);
 const client=getSupabaseClient();
 const sources=useMemo(()=>[{table:'sports_records',filter:`owner=eq.${authorId}`}],[authorId]);
 const refresh=useCallback(async()=>{
  const version=++generation.current;
  if(!user||!client||!user.id||user.is_banned){setRecords([]);setLoading(false);return;}
  if(!/^[0-9a-f-]{36}$/i.test(authorId)){setRecords([]);setLoading(false);return;}
  setLoading(true);
  try{
   // RLS remains authoritative: athlete details only for the owner, coaches or staff.
   // No private profiles query, no invites/applications and no service-role access.
   const result=await client.from('sports_records').select('id,owner,kind,data').eq('owner',authorId).in('kind',['athlete','coach']);
   if(result.error)throw new Error('Não foi possível carregar os detalhes esportivos.');
   if(version===generation.current){setRecords(result.data||[]);setError('');}
  }catch(e){if(version===generation.current){setRecords([]);setError(e instanceof Error?e.message:'Dados indisponíveis.');}}
  finally{if(version===generation.current)setLoading(false);}
 },[authorId,client,user?.id,user?.account_type,user?.role,user?.is_banned]);
 useEffect(()=>{setRecords([]);setError('');void refresh();return()=>{generation.current++;};},[refresh]);
 useRealtimeRefresh(client,sources,refresh,Boolean(user&&!user.is_banned),`community-sports-profile-${authorId}-${user?.id||'guest'}`);
 return <section className="mt-6 space-y-4 border-t border-zinc-800 pt-5" aria-label="Detalhes esportivos do perfil">
 <h3 className="font-bold">Informações esportivas e profissionais</h3>
 {loading&&<p role="status" className="text-xs text-zinc-400">Carregando perfil…</p>}
 {error&&<div role="alert" className="text-xs text-red-300">{error}<button type="button" onClick={()=>void refresh()} className="ml-3 underline">Tentar novamente</button></div>}
 {!loading&&!error&&!user&&<p className="text-xs text-zinc-400">Entre na sua conta para consultar os detalhes disponíveis. Os dados de atletas são restritos ao próprio atleta, treinadores e moderação.</p>}
 {!loading&&!error&&user&&!records.length&&<p className="text-xs text-zinc-400">Nenhum detalhe esportivo disponível para você neste perfil. O perfil pode não ter sido preenchido ou ter acesso restrito. Os dados de atletas são visíveis ao próprio atleta, treinadores e moderação.</p>}
 {!loading&&!error&&records.map(record=><section key={record.id} className="rounded-2xl border border-zinc-800 p-4"><h4 className="mb-4 font-bold text-red-400">{record.kind==='athlete'?'Perfil atleta':'Perfil de treinador'}</h4><dl className="grid gap-4 sm:grid-cols-2">{sportsProfileDetails(record).map(field=><div key={field.label} className="min-w-0"><dt className="text-xs text-zinc-500">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-200">{field.value}</dd></div>)}</dl>{!sportsProfileDetails(record).length&&<p className="text-xs text-zinc-400">Este perfil ainda não tem detalhes preenchidos.</p>}</section>)}
 </section>;
}
