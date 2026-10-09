'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { CommunityPost } from '@/lib/types';
import {
  MessageSquare,
  Heart,
  Send,
  Share2,
  Filter,
  Flag,
} from 'lucide-react';

/** Motivos fixos para denúncias (enviados ao moderador junto com a publicação). */
const REPORT_REASONS = ['Spam', 'Conteúdo ofensivo', 'Informação falsa', 'Outro'];

export default function CommunityView() {
  const {
    communityPosts,
    createCommunityPost,
    likeCommunityPost,
    addCommunityComment,
    reportCommunityPost,
    isVisitor,
    setAuthModalOpen,
    addToast,
  } = useCoreMotiom();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<CommunityPost['category']>('equipamento');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const categories: { label: string; value: CommunityPost['category'] }[] = [
    { label: 'Equipamentos & Tênis', value: 'equipamento' },
    { label: 'Dicas de Treino & Planilhas', value: 'treino' },
    { label: 'Eventos & Provas', value: 'evento' },
    { label: 'Dúvidas Técnicas', value: 'duvida' },
    { label: 'Conquistas & Recordes', value: 'conquista' },
  ];

  const filteredPosts = communityPosts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVisitor) {
      setAuthModalOpen(true);
      return;
    }

    if (!newPostContent.trim() || !newPostTitle.trim()) {
      addToast('Atenção', 'Preencha o título e o conteúdo do post.', 'error');
      return;
    }

    createCommunityPost({
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
    });

    setNewPostTitle('');
    setNewPostContent('');
    addToast('Post Publicado', 'Seu relato já está no feed da comunidade.', 'success');
  };

  const handleSendComment = (postId: string) => {
    if (isVisitor) {
      setAuthModalOpen(true);
      return;
    }

    if (!commentText.trim()) return;

    addCommunityComment(postId, commentText);
    setCommentText('');
    setActiveCommentPostId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* Feed Header */}
      <div className="pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comunidade & Feed de Atletas</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
          Feed de Reviews & Experiências
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Compartilhe percepções reais sobre tênis com placa de carbono, ritmos de prova e periodização de treinos.
        </p>
      </div>

      {/* Create Post Card */}
      <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-5 sm:p-6 shadow-xl space-y-4 text-xs">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <input
            type="text"
            placeholder="Título do seu relato (Ex: Testei o Vaporfly 3 nos 21k de SP)"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
          />

          <textarea
            rows={3}
            placeholder={
              isVisitor
                ? 'Faça login para compartilhar sua experiência com outros atletas...'
                : 'Escreva sua análise, relato de prova ou dica de treino...'
            }
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold uppercase text-zinc-400">Categoria:</label>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value as CommunityPost['category'])}
                className="px-3 py-1.5 bg-zinc-950 text-xs text-white rounded-full border border-zinc-800 focus:border-red-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-red-950/50 hover:scale-105 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar Relato</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs in Capsule Dock Style */}
      <div className="flex items-center gap-2 bg-zinc-900/70 p-2 rounded-2xl border border-zinc-800/80 backdrop-blur-md overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Todos os relatos</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 hover:border-zinc-700/80 p-5 sm:p-6 space-y-4 shadow-xl transition-all"
          >
            {/* Author header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                  <img
                    src={
                      post.author_avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
                    }
                    alt={post.author_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                    {post.author_name}
                    {post.author_badge && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold border border-red-500/30">
                        {post.author_badge}
                      </span>
                    )}
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-zinc-950 text-red-400 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                {post.category}
              </span>
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">{post.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
              {post.image_url && (
                <div className="rounded-2xl overflow-hidden max-h-80 border border-zinc-800 mt-2">
                  <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => likeCommunityPost(post.id)}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                  <span className="font-bold text-white text-xs">{post.likes_count}</span>
                </button>

                <button
                  onClick={() =>
                    setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                  }
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-xs">{post.comments?.length || post.comments_count || 0} Respostas</span>
                </button>
              </div>

              {!isVisitor && (
                <button
                  type="button"
                  onClick={() => setReportingPostId(reportingPostId === post.id ? null : post.id)}
                  className="text-zinc-500 hover:text-red-400 p-1 rounded-full hover:bg-zinc-800 transition-colors"
                  aria-label="Denunciar publicação"
                  title="Denunciar publicação"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  addToast('Link Copiado', 'Link do post copiado para a área de transferência.', 'info');
                }}
                className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Report Area: a denúncia marca a publicação para moderação (supervisor ou administrador) */}
            {reportingPostId === post.id && (
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <p className="text-xs text-zinc-400">Por que você está denunciando esta publicação?</p>
                <div className="flex flex-wrap gap-2">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        reportCommunityPost(post.id, reason);
                        setReportingPostId(null);
                      }}
                      className="px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Expand Area */}
            {activeCommentPostId === post.id && (
              <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-2">
                    {post.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{comm.author_name}</span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(comm.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">{comm.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Adicione um comentário técnico ou feedback..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendComment(post.id);
                    }}
                    className="flex-1 px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-full border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendComment(post.id)}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full transition-colors shadow-md shadow-red-950/40"
                  >
                    Responder
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
