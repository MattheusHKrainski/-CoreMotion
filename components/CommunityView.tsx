'use client';

import CommunityComments from './community-comments';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Search, Flame, MessageCircle, Plus, Share2, X } from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import type { CommunityPost } from '@/lib/types';
import { copyText } from '@/lib/clipboard';
import { validImageUrl } from '@/lib/media';
import { getFollowing, setFollowing } from '@/services/communityFollows';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import ImageEditor from './shared/ImageEditor';
import UserAvatar from './shared/UserAvatar';
import ProductImage from './shared/ProductImage';
import ReportButton from './shared/ReportButton';

const CATEGORIES: { value: CommunityPost['category']; label: string }[] = [
  { value: 'treino', label: 'Treinos e técnica' }, { value: 'equipamento', label: 'Equipamentos' },
  { value: 'evento', label: 'Eventos' }, { value: 'duvida', label: 'Dúvidas' }, { value: 'conquista', label: 'Conquistas' },
];

const FOLLOW_LIVE_SOURCES = [{ table: 'community_follows' }] as const;

export default function CommunityView() {
  const { user, communityPosts, createCommunityPost, likedCommunityPosts, likeCommunityPost, isVisitor, setAuthModalOpen, addToast } = useCoreMotiom();
  const [feed, setFeed] = useState<'all' | 'following' | 'mine'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [category, setCategory] = useState('all');
  const [following, setFollowingIds] = useState<string[]>([]);
  const [followBusy, setFollowBusy] = useState<string | null>(null);
  const [followError, setFollowError] = useState('');
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('treino');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const composer = useRef<HTMLDialogElement>(null);
  const userId = user?.id;
  const client = getSupabaseClient();
  const refreshFollowing = useCallback(async () => {
    if (!userId) return;
    try {
      const ids = await getFollowing();
      setFollowingIds(ids);
      setFollowError('');
    } catch (error) {
      setFollowError(error instanceof Error ? error.message : 'Não foi possível atualizar os perfis seguidos.');
    }
  }, [userId]);
  useEffect(() => {
    setFollowingIds([]);
    setFollowError('');
    if (userId) void refreshFollowing();
  }, [userId, refreshFollowing]);
  useRealtimeRefresh(client, FOLLOW_LIVE_SOURCES, refreshFollowing, Boolean(userId), 'community-follows-' + (userId || 'visitor'));
  useEffect(() => {
    if (!composing) return;
    const dialog = composer.current; dialog?.showModal();
    return () => { dialog?.close(); };
  }, [composing]);
  const loginRequired = () => { if (!isVisitor) return false; setAuthModalOpen(true); return true; };
  const toggleFollow = async (id: string) => {
    if (loginRequired() || followBusy) return;
    setFollowBusy(id);
    const next = !following.includes(id);
    try { await setFollowing(id, next); setFollowingIds(ids => next ? [...new Set([...ids, id])] : ids.filter(item => item !== id)); }
    catch (reason) { addToast('Não foi possível seguir', reason instanceof Error ? reason.message : 'Tente novamente.', 'error'); }
    finally { setFollowBusy(null); }
  };
  const publish = async (event: React.FormEvent) => {
    event.preventDefault(); if (publishing || uploading || loginRequired()) return;
    if (!content.trim()) return;
    if (image && !validImageUrl(image)) { addToast('Imagem inválida', 'Use um link HTTPS válido.', 'error'); return; }
    setPublishing(true);
    try {
      const saved = await createCommunityPost({ title: title.trim() || content.trim().slice(0, 100), content: content.trim(), category: postCategory, image_url: image || undefined });
      if (saved) { setComposing(false); setTitle(''); setContent(''); setImage(''); setFeed('all'); setCategory('all'); }
    } finally { setPublishing(false); }
  };
  const visible = communityPosts.filter(post => (category === 'all' || post.category === category) && (feed !== 'following' || following.includes(post.author_id)) && (feed !== 'mine' || post.author_id === userId) && `${post.title} ${post.content} ${post.author_name}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))).sort((a,b) => sort === 'popular' ? b.likes_count - a.likes_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return <div className="mx-auto grid max-w-[1440px] items-start gap-6 pb-12 text-white lg:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,760px)_260px]">
    <aside aria-label="Explorar assuntos" className="hidden space-y-5 lg:sticky lg:top-24 lg:block"><div className="px-3"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sua comunidade esportiva</p><h2 className="mt-3 text-xl font-black">Encontre sua<br/>próxima conversa.</h2></div><button type="button" onClick={()=>{setCategory('all');setFeed('all');setQuery('');}} className="flex w-full items-center gap-3 rounded-xl bg-zinc-800/60 p-3 text-left text-sm font-bold"><Flame className="h-4 w-4 text-red-400"/>Feed principal</button><p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Assuntos</p>{CATEGORIES.map(topic=><button type="button" key={topic.value} onClick={()=>setCategory(topic.value)} className={`block w-full rounded-xl p-3 text-left text-sm hover:bg-zinc-900 ${category===topic.value?'bg-red-950/30 text-red-400':'text-zinc-400'}`}>c/{topic.label}</button>)}<div className="rounded-2xl border border-zinc-800 p-4"><p className="text-sm font-bold">O esporte conecta.</p><p className="mt-2 text-xs leading-relaxed text-zinc-500">Compartilhe experiências, peça dicas e conheça outros atletas.</p><button type="button" onClick={()=>{if(!loginRequired())setComposing(true);}} className="mt-4 text-xs font-bold text-red-400">Começar conversa →</button></div></aside>
    <div className="min-w-0">

    <header className="border-b border-zinc-800 bg-zinc-950/70 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-red-400">CoreMotion / Comunidade</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Comunidade</h1><p className="mt-2 text-sm text-zinc-400">Seu ponto de encontro para falar de esporte.</p></div>
        <button type="button" onClick={() => { if (!loginRequired()) setComposing(true); }} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500"><Plus className="h-4 w-4" />Publicar</button>
      </div>
      <div role="tablist" aria-label="Feeds da comunidade" className="mt-6 grid grid-cols-3 border-b border-zinc-800">
        {([['all', 'Para você'], ['following', 'Seguindo'], ['mine', 'Minhas publicações']] as const).map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={feed === id} onClick={() => { if (id !== 'all' && loginRequired()) return; setFeed(id); }} className={`border-b-2 px-1 py-3 text-xs font-bold sm:text-sm ${feed === id ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}>{label}</button>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-3"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3"><Search className="h-4 w-4 shrink-0 text-zinc-500"/><input aria-label="Buscar na comunidade" placeholder="Buscar nas conversas" value={query} onChange={event=>setQuery(event.target.value)} className="min-w-0 w-full bg-transparent py-2.5 text-xs outline-none"/></label><select aria-label="Ordenar publicações" value={sort} onChange={event=>setSort(event.target.value as 'recent'|'popular')} className="rounded-full border border-zinc-700 bg-zinc-900 px-3 text-xs"><option value="recent">Mais recentes</option><option value="popular">Mais curtidas</option></select></div>
      <label className="mt-4 flex items-center gap-3 text-xs text-zinc-400">Assunto<select aria-label="Filtrar publicações por assunto" value={category} onChange={event => setCategory(event.target.value)} className="min-w-0 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"><option value="all">Todos os assuntos</option>{CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      {followError && <p role="alert" className="mt-3 text-xs text-red-300">{followError}</p>}
    </header>
    <div className="divide-y divide-zinc-800 overflow-hidden border-b border-zinc-800">
      {visible.length === 0 && <div className="p-10 text-center"><p className="font-bold">{feed === 'following' ? 'Seu feed começa com uma conexão' : 'A conversa pode começar com você'}</p><p className="mt-2 text-sm text-zinc-400">{feed === 'following' ? 'Siga pessoas na aba Para você para ver as próximas publicações delas aqui.' : 'Nenhuma publicação nesta seleção. Compartilhe um treino, uma dúvida ou uma conquista.'}</p></div>}
      {visible.map(post => <article key={post.id} className="p-4 sm:p-5 hover:bg-zinc-900/60 transition-colors">
        <div className="flex items-start gap-3">
          <UserAvatar src={post.author_id === userId ? user?.avatar_url : post.author_avatar} name={post.author_name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><span className="text-sm font-bold">{post.author_name}</span><p className="text-xs text-zinc-500">{post.author_badge} · {new Date(post.created_at).toLocaleDateString('pt-BR')}</p></div>
              {post.author_id !== userId && /^[0-9a-f-]{36}$/i.test(post.author_id) && <button type="button" aria-pressed={following.includes(post.author_id)} disabled={Boolean(followBusy)} onClick={() => void toggleFollow(post.author_id)} className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-bold hover:bg-zinc-800 disabled:opacity-50">{followBusy === post.author_id ? 'Salvando…' : following.includes(post.author_id) ? 'Deixar de seguir' : 'Seguir'}</button>}
            </div>
            {post.title !== post.content.trim().slice(0, 100) && <h2 className="mt-3 break-words text-base font-bold">{post.title}</h2>}
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300">{post.content}</p>
            {post.image_url && <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-zinc-800"><ProductImage src={post.image_url} alt={`Imagem de ${post.author_name}`} sizes="(max-width: 640px) 85vw, 640px" /></div>}
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-400">
              <button type="button" onClick={() => void likeCommunityPost(post.id)} aria-label={likedCommunityPosts.includes(post.id) ? 'Remover curtida' : 'Curtir publicação'} aria-pressed={likedCommunityPosts.includes(post.id)} className="flex items-center gap-2 rounded-full bg-zinc-800/70 px-3 py-2 hover:text-red-400"><ArrowUp className={`h-4 w-4 ${likedCommunityPosts.includes(post.id) ? 'fill-red-500 text-red-500' : ''}`} />{post.likes_count}</button>
              <button type="button" aria-expanded={replyTo===post.id} aria-controls={`comments-${post.id}`} onClick={() => { setReplyTo(replyTo === post.id ? null : post.id); }} className="flex items-center gap-2 rounded-full bg-zinc-800/70 px-3 py-2 hover:text-white"><MessageCircle className="h-4 w-4" />{post.comments?.length ?? 0} respostas</button>
              <button type="button" aria-label="Compartilhar comunidade" onClick={async () => { const copied = await copyText(window.location.href); addToast(copied ? 'Link copiado' : 'Cópia indisponível', copied ? 'Endereço da página copiado.' : 'Copie o endereço na barra do navegador.', copied ? 'success' : 'info'); }}><Share2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-3"><ReportButton category="community" targetId={post.id} title={post.title} /></div>
            {replyTo === post.id && <CommunityComments key={post.id} post={post}/>}
          </div>
        </div>
      </article>)}
    </div>
    </div>
    <aside aria-label="Descubra conversas" className="hidden space-y-4 xl:sticky xl:top-24 xl:block"><section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><h2 className="text-xs font-black uppercase tracking-wide text-zinc-400">Descubra assuntos</h2><div className="mt-4 space-y-4">{CATEGORIES.map(topic=><button type="button" key={topic.value} onClick={()=>{setCategory(topic.value);setFeed('all');}} className="flex w-full items-center gap-3 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-950 text-sm font-black text-red-400">{topic.label[0]}</span><span><strong className="block text-xs">c/{topic.label}</strong><span className="mt-1 block text-[10px] text-zinc-500">{communityPosts.filter(post=>post.category===topic.value).length} publicações no feed carregado</span></span></button>)}</div></section><section className="rounded-2xl border border-zinc-800 p-5"><h2 className="text-sm font-bold">Jogue junto, respeite sempre.</h2><p className="mt-3 text-xs leading-relaxed text-zinc-500">Troque experiências sem ataques pessoais. Não compartilhe dados sensíveis. Denuncie conteúdos suspeitos pelo botão da publicação.</p></section></aside>
    {composing && createPortal(<dialog ref={composer} onCancel={event => { if (publishing || uploading) event.preventDefault(); else setComposing(false); }} aria-labelledby="compose-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-zinc-700 bg-zinc-950 p-6 text-white shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between"><h2 id="compose-title" className="text-xl font-black">Criar publicação</h2><button type="button" disabled={publishing || uploading} onClick={() => setComposing(false)} aria-label="Fechar publicação" className="rounded-full p-2 hover:bg-zinc-800"><X className="h-5 w-5" /></button></div>
      <form onSubmit={publish} className="space-y-4">
        <div className="flex items-center gap-3"><UserAvatar src={user?.avatar_url} name={user?.name || 'Sua conta'} /><span className="text-sm font-bold">{user?.name}</span></div>
        <input aria-label="Título (opcional)" maxLength={120} placeholder="Título (opcional)" value={title} onChange={event => setTitle(event.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm" />
        <textarea autoFocus required aria-label="Conteúdo da publicação" rows={6} maxLength={5000} placeholder="O que está acontecendo no seu esporte?" value={content} onChange={event => setContent(event.target.value)} className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm" />
        <label className="block text-xs text-zinc-400">Assunto<select value={postCategory} onChange={event => setPostCategory(event.target.value as CommunityPost['category'])} className="ml-3 rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-white">{CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <ImageEditor purpose="community" value={image} onChange={setImage} onBusyChange={setUploading} />
        <button type="submit" disabled={publishing || uploading || !content.trim()} className="w-full rounded-full bg-red-600 py-3 text-sm font-bold disabled:opacity-50">{publishing ? 'Publicando…' : 'Publicar'}</button>
      </form>
    </dialog>, document.body)}
  </div>;
}
