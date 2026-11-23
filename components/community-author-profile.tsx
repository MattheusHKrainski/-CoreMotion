'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { CommunityPost } from '@/lib/types';
import UserAvatar from './shared/UserAvatar';
import CommunitySportsProfile from './community-sports-profile';
import { useCoreMotiom } from '@/lib/store';
import CommunityMedia from './shared/CommunityMedia';

export function authorPublications(posts:CommunityPost[],authorId:string):CommunityPost[] {
 return posts.filter(post=>post.author_id===authorId).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
}
export default function CommunityAuthorProfile({authorId,posts,own,following,busy,onFollow,onClose,onSelect}:{authorId:string;posts:CommunityPost[];own?:{name:string;avatar_url?:string};following:boolean;busy:boolean;onFollow:()=>void;onClose:()=>void;onSelect:(postId:string)=>void}) {
 const {user}=useCoreMotiom();
 const dialog=useRef<HTMLDialogElement>(null);
 const [visible,setVisible]=useState(6);
 const publications=authorPublications(posts,authorId), author=publications[0];
 const name=own?.name||author?.author_name||'Perfil indisponível';
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>element?.close();},[]);
 return createPortal(<dialog ref={dialog} onCancel={event=>{event.preventDefault();onClose();}} aria-labelledby="community-profile-name" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-zinc-700 bg-zinc-950 p-5 text-white shadow-2xl backdrop:bg-black/80 sm:p-7">
 <header className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-4"><UserAvatar large name={name} src={own?.avatar_url||author?.author_avatar}/><div className="min-w-0"><p className="text-xs text-zinc-500">Perfil da comunidade</p><h2 id="community-profile-name" className="mt-1 break-words text-xl font-black">{name}</h2>{author?.author_badge&&<p className="mt-1 text-xs text-zinc-400">{author.author_badge}</p>}</div></div><button autoFocus type="button" onClick={onClose} aria-label="Fechar perfil" className="shrink-0 rounded-full p-2 hover:bg-zinc-800"><X className="h-5 w-5"/></button></header>
 {!author?<p className="mt-6 text-sm text-zinc-400">Este perfil não tem publicações disponíveis no feed carregado.</p>:<>
 {!own&&/^[0-9a-f-]{36}$/i.test(authorId)&&<button type="button" disabled={busy} aria-pressed={following} onClick={onFollow} className="mt-5 rounded-full border border-zinc-700 px-5 py-2 text-sm font-bold hover:bg-zinc-800 disabled:opacity-50">{busy?'Salvando…':following?'Deixar de seguir':'Seguir'}</button>}
 <CommunitySportsProfile key={`${authorId}-${user?.id}-${user?.role}-${user?.account_type}-${user?.is_banned}`} authorId={authorId}/>
 <section className="mt-6 space-y-4 border-t border-zinc-800 pt-5" aria-label={`Publicações de ${name}`}><h3 className="font-bold">Publicações</h3><p className="text-xs text-zinc-500">{publications.length} {publications.length===1?'publicação disponível':'publicações disponíveis'} no feed carregado.</p>
 {publications.slice(0,visible).map(post=><article key={post.id} className="space-y-3 rounded-2xl border border-zinc-800 p-4"><time className="text-xs text-zinc-500" dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString('pt-BR')}</time><h4 className="break-words font-bold">{post.title}</h4><p className="line-clamp-4 whitespace-pre-wrap break-words text-sm text-zinc-300">{post.content}</p><CommunityMedia image={post.image_url} video={post.video_url} author={name}/><button type="button" onClick={()=>onSelect(post.id)} className="text-xs font-bold text-red-400">Ver publicação e comentários →</button></article>)}
 {publications.length>visible&&<button type="button" onClick={()=>setVisible(value=>value+6)} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold">Mostrar mais</button>}
 </section></>}
 </dialog>,document.body);
}
