'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { canRecruit } from '@/lib/sports';
import { scopedQuickStorage } from '@/lib/quick-access';
import { getSupabaseClient } from '@/services/supabaseClient';
import { ACTIVITY_TYPES, ACTIVITY_LIMITS, validateCoachActivity, canManageCoachActivity, matchesCoachActivity, type CoachActivity, type CoachActivityData } from '@/lib/coach-activities';
import SportPicker from '@/components/shared/SportPicker';
const KEY = 'coremotion_coach_activities_v1';
const blank: CoachActivityData = { title:'', type:'class', organizer:'', sport:'', city:'', schedule:'', contact:'', description:'' };
const input = 'block w-full mt-2 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-white';
const button = 'rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold disabled:opacity-40 hover:bg-zinc-800';
function loadLocal(): CoachActivity[] {
 const value: unknown = JSON.parse(scopedQuickStorage(localStorage).getItem(KEY) || '[]');
 if (!Array.isArray(value)) throw new Error('Não foi possível ler as publicações locais.');
 return value;
}
export default function CoachActivities({ sport, search }: { sport: string; search: string }) {
 const { user, addToast } = useCoreMotiom();
 const client = getSupabaseClient();
 const owner = user?.supabase_id || user?.id || '';
 const [rows,setRows] = useState<CoachActivity[]>([]);
 const [form,setForm] = useState<CoachActivityData | null>(null);
 const [editing,setEditing] = useState<CoachActivity | null>(null);
 const [error,setError] = useState('');
 const [busy,setBusy] = useState(false);
 const [loading,setLoading] = useState(false);
 const [mine,setMine] = useState(false);
 const version = useRef(0);
 const refresh = useCallback(async () => {
  const current = ++version.current; setLoading(true);
  try {
   let records: CoachActivity[];
   if (client) {
    const { data,error } = await client.from('coach_activities').select('*').order('created_at',{ascending:false});
    if(error) throw new Error('Não foi possível carregar as aulas e associações. Tente atualizar a lista.');
    records=data||[];
   } else records=loadLocal();
   if(current===version.current){setRows(records);setError('');}
  } catch(err){if(current===version.current)setError(err instanceof Error ? err.message : 'Consulta indisponível.');}
  finally {if(current===version.current)setLoading(false);}
 },[client]);
 useEffect(()=>{
  setRows([]);setForm(null);setEditing(null);setMine(false);void refresh();
  const focus=()=>void refresh();window.addEventListener('focus',focus);
  const invalidate=()=>{version.current++;};
  return ()=>{invalidate();window.removeEventListener('focus',focus);};
 },[owner,refresh]);
 function open(activity?: CoachActivity){
  if(!canRecruit(user) || (activity && !canManageCoachActivity(user,activity)))return;
  setEditing(activity||null);setError('');
  setForm(activity ? {title:activity.title,type:activity.type,organizer:activity.organizer,sport:activity.sport,city:activity.city,schedule:activity.schedule,contact:activity.contact,description:activity.description} : {...blank,organizer:user?.name||'',sport:user?.sport_interests?.[0]||'',city:user?.city||''});
 }
 async function save(event: React.FormEvent){
  event.preventDefault();if(!form||busy||!canRecruit(user))return;
  const data = {...form};
  for(const key of Object.keys(ACTIVITY_LIMITS) as (keyof typeof ACTIVITY_LIMITS)[])data[key]=data[key].trim();
  const invalid=validateCoachActivity(data);if(invalid){setError(invalid);return;}
  if(editing && !canManageCoachActivity(user,editing))return;
  setBusy(true);
  try {
   let saved: CoachActivity;
   if(client){
    const result=editing ? await client.from('coach_activities').update(data).eq('id',editing.id).select('*').single() : await client.from('coach_activities').insert({...data,owner}).select('*').single();
    if(result.error||!result.data)throw new Error('Não foi possível salvar. Confira sua sessão e tente novamente.');
    saved=result.data;
   }else{
    saved={...data,id:editing?.id||crypto.randomUUID(),owner:editing?.owner||owner,created_at:editing?.created_at||new Date().toISOString()};
    const all=loadLocal();scopedQuickStorage(localStorage).setItem(KEY,JSON.stringify([saved,...all.filter(r=>r.id!==saved.id)]));
   }
   version.current++;setLoading(false);setRows(prev=>[saved,...prev.filter(r=>r.id!==saved.id)]);setForm(null);setEditing(null);setError('');
   addToast('Publicação salva','Sua publicação está disponível em Treinadores e associações.','success');
  }catch(err){setError(err instanceof Error?err.message:'Não foi possível salvar.');}
  finally{setBusy(false);}
 }
 async function remove(activity:CoachActivity){
  if(busy||!canManageCoachActivity(user,activity)||!window.confirm('Excluir esta publicação?'))return;
  setBusy(true);
  try{
   if(client){const {data,error}=await client.from('coach_activities').delete().eq('id',activity.id).select('id').single();if(error||!data)throw new Error('Não foi possível excluir a publicação.');}
   else scopedQuickStorage(localStorage).setItem(KEY,JSON.stringify(loadLocal().filter(r=>r.id!==activity.id)));
   version.current++;setLoading(false);setRows(prev=>prev.filter(r=>r.id!==activity.id));setError('');
   if(editing?.id===activity.id){setForm(null);setEditing(null);}
   addToast('Publicação excluída','A publicação foi removida.','success');
  }catch(err){setError(err instanceof Error?err.message:'Não foi possível excluir.');}
  finally{setBusy(false);}
 }
 const visible=rows.filter(r=>(!mine||r.owner===owner)&&matchesCoachActivity(r,sport,search));
 return <section aria-label="Aulas, grupos e associações da comunidade" className="space-y-4">
  <header className="flex flex-wrap justify-between items-start gap-3"><div><h2 className="text-xl font-bold">Aulas, grupos e associações da comunidade</h2><p className="text-sm text-zinc-400 mt-2">Encontre atividades recreativas, horários e pessoas para praticar no seu ritmo. Combine a participação diretamente com quem organiza.</p></div><div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={loading||busy} onClick={()=>void refresh()}>Atualizar publicações</button>{canRecruit(user)&&<button type="button" className={`${button} bg-red-600 text-white`} disabled={busy} onClick={()=>open()}>Publicar aula, grupo ou associação</button>}</div></header>
  {canRecruit(user)&&<label className="flex gap-2 text-sm text-zinc-400"><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)}/>Somente minhas publicações</label>}
  {error&&<p role="alert" className="rounded-xl border border-red-500/40 p-4 text-sm text-red-300">{error}</p>}
  {form&&<form aria-label={editing?'Editar publicação':'Nova publicação'} onSubmit={save} className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
   <h3 className="text-lg font-bold">{editing?'Editar publicação':'Nova publicação'}</h3>
   <label className="block text-xs text-zinc-400">Tipo de publicação<select className={input} value={form.type} onChange={e=>setForm({...form,type:e.target.value as CoachActivityData['type']})}>{Object.entries(ACTIVITY_TYPES).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   <div className="grid sm:grid-cols-2 gap-4">{([['title','Título'],['organizer','Treinador ou associação'],['city','Cidade / UF'],['schedule','Dias e horários'],['contact','Contato público']] as const).map(([key,label])=><label key={key} className="block text-xs text-zinc-400">{label}<input className={input} required maxLength={ACTIVITY_LIMITS[key]} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<SportPicker required value={form.sport} onChange={sport=>setForm({...form,sport})}/></div>
   <label className="block text-xs text-zinc-400">Descrição, local e como participar<textarea className={input} required rows={4} maxLength={ACTIVITY_LIMITS.description} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
   <p className="text-xs text-zinc-500">Os dados desta publicação, incluindo o contato, ficam visíveis na comunidade.</p>
   <div className="flex gap-3"><button type="submit" disabled={busy} className={`${button} bg-red-600 text-white`}>{busy?'Salvando…':'Salvar publicação'}</button><button type="button" disabled={busy} className={button} onClick={()=>{setForm(null);setEditing(null);}}>Cancelar</button></div>
  </form>}
  {loading&&<p role="status" className="text-sm text-zinc-500">Carregando publicações…</p>}
  {!loading&&!error&&!visible.length&&<p className="rounded-2xl border border-zinc-800 p-5 text-sm text-zinc-400">Nenhuma publicação encontrada{mine?' entre as suas atividades':' para esta busca'}.</p>}
  <div className="grid md:grid-cols-2 gap-4">{visible.map(activity=><article key={activity.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3"><p className="text-xs text-red-400 font-bold">{ACTIVITY_TYPES[activity.type]}</p><h3 className="text-xl font-bold break-words">{activity.title}</h3><p className="text-sm text-zinc-400">{activity.organizer} • {activity.sport} • {activity.city}</p><p className="text-sm whitespace-pre-wrap break-words">{activity.description}</p><p className="text-sm whitespace-pre-wrap">Dias e horários: {activity.schedule}</p><p className="text-sm break-words">Contato: {activity.contact}</p>{canManageCoachActivity(user,activity)&&<div className="flex gap-2"><button type="button" className={button} disabled={busy} onClick={()=>open(activity)}>Editar publicação</button><button type="button" className={`${button} text-red-400`} disabled={busy} onClick={()=>void remove(activity)}>Excluir publicação</button></div>}</article>)}</div>
 </section>;
}
