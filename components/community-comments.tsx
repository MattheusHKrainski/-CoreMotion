'use client';
import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import { Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CommunityService } from '@/services/communityService';
import type { CommunityPost } from '@/lib/types';
import { useCoreMotiom } from '@/lib/store';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { commentThreads } from '@/lib/comment-threads';
import UserAvatar from './shared/UserAvatar';
type Comment=CommunityPost['comments'][number];
export default function CommunityComments({post}:{post:CommunityPost}) {
 const {addCommunityComment}=useCoreMotiom();
 const [comments,setComments]=useState(post.comments||[]),[reply,setReply]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const [visible,setVisible]=useState(5),[target,setTarget]=useState<Comment|null>(null),[expanded,setExpanded]=useState<Set<string>>(new Set());
 const input=useRef<HTMLInputElement>(null);
 const attempt=useRef<{content:string;parent?:string;key:string}|null>(null);
 const threads=useMemo(()=>commentThreads(comments),[comments]);
 const byId=useMemo(()=>new Map(comments.map(comment=>[comment.id,comment])),[comments]);
 const refresh=useCallback(async()=>{if(!isSupabaseConfigured)return;setLoading(true);setError('');try{setComments((await CommunityService.getPost(post.id)).comments);}catch(reason){setError(reason instanceof Error?reason.message:'Comentários indisponíveis.');}finally{setLoading(false);}},[post.id]);
 useEffect(()=>{let active=true;if(isSupabaseConfigured){setLoading(true);CommunityService.getPost(post.id).then(fresh=>{if(active)setComments(fresh.comments);}).catch(()=>{if(active)setError('Não foi possível carregar os comentários.');}).finally(()=>{if(active)setLoading(false);});}return()=>{active=false;};},[post.id]);
 useEffect(()=>{setComments(post.comments||[]);},[post.comments]);
 const renderComment=(comment:Comment)=>{
  const parent=comment.parent_id?byId.get(comment.parent_id):undefined;
  return <article key={comment.id} className="flex items-start gap-2 py-2">
   <span className="origin-top-left scale-75 -mr-2 -mb-2"><UserAvatar src={comment.author_avatar} name={comment.author_name}/></span>
   <div className="min-w-0 flex-1">
    <p className="text-xs font-bold leading-5">{comment.author_name}</p>
    {comment.parent_id&&<p className="truncate text-[11px] text-zinc-500">Em resposta a {parent?.author_name||'comentário removido'}{parent?`: ${parent.content.slice(0,90)}`:''}</p>}
    <p className="whitespace-pre-wrap break-words text-sm leading-5 text-zinc-300 [overflow-wrap:anywhere]">{comment.content}</p>
    <button type="button" disabled={busy} onClick={()=>{setTarget(comment);input.current?.focus();}} className="mt-1 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-50" aria-label={`Responder a ${comment.author_name}`}>Responder</button>
   </div>
  </article>;
 };
 return <section id={`comments-${post.id}`} aria-label="Comentários da publicação" className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
  <div className="flex items-center justify-between gap-3"><h3 className="text-xs font-bold">Comentários ({comments.length})</h3></div>
  {loading&&<p role="status" className="text-xs text-zinc-500">Carregando comentários…</p>}
  {error&&<p role="alert" className="text-xs text-red-300">{error}</p>}
  {!loading&&!error&&!comments.length&&<p className="py-2 text-xs text-zinc-500">Nenhum comentário ainda. Seja o primeiro a responder.</p>}
  <div className="divide-y divide-zinc-800/50">{threads.slice(0,visible).map(thread=><div key={thread.root.id}>
   {renderComment(thread.root)}
   {!!thread.replies.length&&<div className="mb-2 ml-4 border-l border-zinc-800 pl-4 sm:ml-5">
    <button type="button" className="inline-flex items-center gap-1 py-1 text-xs font-semibold text-red-400" aria-expanded={expanded.has(thread.root.id)} aria-controls={`replies-${post.id}-${thread.root.id}`} onClick={()=>setExpanded(previous=>{const next=new Set(previous);if(next.has(thread.root.id))next.delete(thread.root.id);else next.add(thread.root.id);return next;})}>
     {expanded.has(thread.root.id)?<ChevronUp className="h-3 w-3"/>:<ChevronDown className="h-3 w-3"/>}{expanded.has(thread.root.id)?'Ocultar': 'Ver'} {thread.replies.length} {thread.replies.length===1?'resposta':'respostas'}
    </button>
    {expanded.has(thread.root.id)&&<div id={`replies-${post.id}-${thread.root.id}`} className="max-h-72 overflow-y-auto overscroll-contain pr-1">{thread.replies.map(renderComment)}</div>}
   </div>}
  </div>)}</div>
  <div className="flex gap-4">{threads.length>visible&&<button type="button" onClick={()=>setVisible(count=>count+5)} className="py-2 text-xs font-bold text-zinc-300">Ver mais comentários ({threads.length-visible})</button>}{visible>5&&<button type="button" onClick={()=>setVisible(5)} className="py-2 text-xs text-zinc-500">Mostrar menos</button>}</div>
  <form className="rounded-xl border border-zinc-700 bg-zinc-950 focus-within:border-zinc-500" onSubmit={async event=>{
   event.preventDefault();if(busy||!reply.trim())return;setBusy(true);setError('');
   try{
    const content=reply.trim(),parent=target?.id;
    if(attempt.current?.content!==content||attempt.current?.parent!==parent)attempt.current={content,parent,key:crypto.randomUUID()};
    const saved=await addCommunityComment(post.id,content,attempt.current.key,parent);
    if(saved){attempt.current=null;setReply('');setTarget(null);if(target){const thread=threads.find(item=>item.root.id===target.id||item.replies.some(item=>item.id===target.id));if(thread){setExpanded(previous=>new Set([...previous,thread.root.id]));setVisible(count=>Math.max(count,threads.indexOf(thread)+1));}}else setVisible(threads.length+1);await refresh();}
    else setError('Resposta não enviada. O texto foi preservado para tentar novamente.');
   }catch{setError('Resposta não enviada. Tente novamente.');}finally{setBusy(false);}
  }}>
   {target&&<div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400"><span className="truncate">Respondendo a <strong className="text-zinc-200">{target.author_name}</strong>: {target.content.slice(0,80)}</span><button type="button" disabled={busy} onClick={()=>{setTarget(null);input.current?.focus();}} aria-label="Cancelar resposta"><X className="h-4 w-4"/></button></div>}
   <div className="flex items-center gap-2 p-1"><input ref={input} disabled={busy} aria-label="Escrever resposta" maxLength={2000} value={reply} onChange={event=>setReply(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" placeholder={target?`Responder a ${target.author_name}…`:'Adicione um comentário…'}/><button type="submit" disabled={busy||!reply.trim()} aria-label="Enviar resposta" className="rounded-lg bg-red-600 p-2.5 disabled:opacity-50"><Send className="h-4 w-4"/></button></div>
  </form>
 </section>;
}
