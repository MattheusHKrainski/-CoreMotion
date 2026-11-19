'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Plus, Send, Share2, X } from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import type { CommunityPost } from '@/lib/types';
import { copyText } from '@/lib/clipboard';
import { validImageUrl } from '@/lib/media';
import { getFollowing, setFollowing } from '@/services/communityFollows';
import ImageEditor from './shared/ImageEditor';
import UserAvatar from './shared/UserAvatar';
import ProductImage from './shared/ProductImage';
import ReportButton from './shared/ReportButton';

const CATEGORIES: { value: CommunityPost['category']; label: string }[] = [
  { value: 'treino', label: 'Treinos e técnica' }, { value: 'equipamento', label: 'Equipamentos' },
  { value: 'evento', label: 'Eventos' }, { value: 'duvida', label: 'Dúvidas' }, { value: 'conquista', label: 'Conquistas' },
];

export default function CommunityView() {
  const { user, communityPosts, createCommunityPost, likedCommunityPosts, likeCommunityPost, addCommunityComment, isVisitor, setAuthModalOpen, addToast } = useCoreMotiom();
  const [feed, setFeed] = useState<'all' | 'following' | 'mine'>('all');
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
  const [reply, setReply] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const composer = useRef<HTMLDialogElement>(null);
  const userId = user?.id;
  useEffect(() => {
    let active = true; setFollowingIds([]); setFollowError('');
    if (userId) getFollowing().then(ids => { if (active) setFollowingIds(ids); }).catch(error => { if (active) setFollowError(error.message); });
    return () => { active = false; };
  }, [userId]);
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
  const visible = communityPosts.filter(post => (category === 'all' || post.category === category) && (feed !== 'following' || following.includes(post.author_id)) && (feed !== 'mine' || post.author_id === userId));
  return <div className="mx-auto max-w-3xl pb-12 text-white">
    <header className="rounded-t-3xl border border-zinc-800 bg-zinc-950/95 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-red-400">Conecte-se pelo esporte</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Comunidade</h1><p className="mt-2 text-sm text-zinc-400">Treinos, conquistas e conversas com quem se move como você.</p></div>
        <button type="button" onClick={() => { if (!loginRequired()) setComposing(true); }} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500"><Plus className="h-4 w-4" />Publicar</button>
      </div>
      <div role="tablist" aria-label="Feeds da comunidade" className="mt-6 grid grid-cols-3 border-b border-zinc-800">
        {([['all', 'Para você'], ['following', 'Seguindo'], ['mine', 'Minhas publicações']] as const).map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={feed === id} onClick={() => { if (id !== 'all' && loginRequired()) return; setFeed(id); }} className={`border-b-2 px-1 py-3 text-xs font-bold sm:text-sm ${feed === id ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}>{label}</button>)}
      </div>
      <label className="mt-4 flex items-center gap-3 text-xs text-zinc-400">Assunto<select aria-label="Filtrar publicações por assunto" value={category} onChange={event => setCategory(event.target.value)} className="min-w-0 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"><option value="all">Todos os assuntos</option>{CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      {followError && <p role="alert" className="mt-3 text-xs text-red-300">{followError}</p>}
    </header>
    <div className="divide-y divide-zinc-800 overflow-hidden rounded-b-3xl border-x border-b border-zinc-800 bg-zinc-900/30">
      {visible.length === 0 && <div className="p-10 text-center"><p className="font-bold">{feed === 'following' ? 'Seu feed começa com uma conexão' : 'A conversa pode começar com você'}</p><p className="mt-2 text-sm text-zinc-400">{feed === 'following' ? 'Siga pessoas na aba Para você para ver as próximas publicações delas aqui.' : 'Nenhuma publicação nesta seleção. Compartilhe um treino, uma dúvida ou uma conquista.'}</p></div>}
      {visible.map(post => <article key={post.id} className="p-4 sm:p-6 hover:bg-zinc-900/60 transition-colors">
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
              <button type="button" onClick={() => void likeCommunityPost(post.id)} aria-label={likedCommunityPosts.includes(post.id) ? 'Remover curtida' : 'Curtir publicação'} aria-pressed={likedCommunityPosts.includes(post.id)} className="flex items-center gap-2 hover:text-red-400"><Heart className={`h-4 w-4 ${likedCommunityPosts.includes(post.id) ? 'fill-red-500 text-red-500' : ''}`} />{post.likes_count}</button>
              <button type="button" onClick={() => { setReplyTo(replyTo === post.id ? null : post.id); setReply(''); }} className="flex items-center gap-2 hover:text-white"><MessageCircle className="h-4 w-4" />{post.comments?.length || post.comments_count || 0} respostas</button>
              <button type="button" aria-label="Compartilhar comunidade" onClick={async () => { const copied = await copyText(window.location.href); addToast(copied ? 'Link copiado' : 'Cópia indisponível', copied ? 'Endereço da página copiado.' : 'Copie o endereço na barra do navegador.', copied ? 'success' : 'info'); }}><Share2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-3"><ReportButton category="community" targetId={post.id} title={post.title} /></div>
            {replyTo === post.id && <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
              {post.comments?.map(comment => <div key={comment.id} className="flex gap-2 rounded-xl bg-zinc-950/70 p-3"><UserAvatar src={comment.author_avatar} name={comment.author_name} /><div className="min-w-0"><p className="text-xs font-bold">{comment.author_name}</p><p className="mt-1 break-words text-sm text-zinc-300">{comment.content}</p></div></div>)}
              <form className="flex gap-2" onSubmit={async event => { event.preventDefault(); if (replyBusy || !reply.trim() || loginRequired()) return; setReplyBusy(true); try { await addCommunityComment(post.id, reply.trim()); setReply(''); } finally { setReplyBusy(false); } }}><input aria-label="Escrever resposta" maxLength={2000} value={reply} onChange={event => setReply(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm" placeholder="Escreva uma resposta…" /><button type="submit" disabled={replyBusy} aria-label="Enviar resposta" className="rounded-xl bg-red-600 px-3 disabled:opacity-50"><Send className="h-4 w-4" /></button></form>
            </div>}
          </div>
        </div>
      </article>)}
    </div>
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
