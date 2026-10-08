// ============================================================================
// CORE MOTIOM — COMUNIDADE (Feed de atletas)
// Criação de posts com categoria, likes, comentários e compartilhamento.
// ============================================================================

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
} from 'lucide-react';

/* ===========================================================
   VISTA DA COMUNIDADE
=========================================================== */

export default function CommunityView() {
  const {
    communityPosts,
    createCommunityPost,
    likeCommunityPost,
    addCommunityComment,
    user,
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

  /* ===========================================================
     CRIAR PUBLICAÇÃO
  =========================================================== */

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

  /* ===========================================================
     ENVIAR COMENTÁRIO
  =========================================================== */

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Feed Header */}
      <div className="pb-4 border-b border-[#1E232F]">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comunidade & Feed de Atletas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Feed de Reviews & Experiências
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Compartilhe percepções sobre equipamentos, treinos de ritmo, tênis com placa e resultados de provas.
        </p>
      </div>

      {/* Create Post Card */}
      <div className="bg-[#12151C] rounded-xl border border-[#232836] p-5 shadow-sm space-y-4 text-xs">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <input
            type="text"
            placeholder="Título do seu relato (Ex: Testei o Vaporfly 3 nos 21k de SP)"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
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
            className="w-full px-3.5 py-2.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#94A3B8]">Categoria:</label>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value as CommunityPost['category'])}
                className="px-2.5 py-1.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
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
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white font-medium shadow-sm'
              : 'bg-[#12151C] text-[#94A3B8] hover:text-white border border-[#232836]'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Todos os posts</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
              selectedCategory === cat.value
                ? 'bg-red-600 text-white font-medium shadow-sm'
                : 'bg-[#12151C] text-[#94A3B8] hover:text-white border border-[#232836]'
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
            className="bg-[#12151C] rounded-xl border border-[#232836] hover:border-[#2B3545] p-5 space-y-4 shadow-sm transition-all"
          >
            {/* Author header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E1017] border border-[#232836] overflow-hidden shrink-0">
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
                  <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                    {post.author_name}
                    {post.author_badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20">
                        {post.author_badge}
                      </span>
                    )}
                  </h4>
                  <span className="text-[11px] text-[#64748B]">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded bg-[#0E1017] text-red-400 border border-[#232836] text-[10px] font-medium uppercase">
                {post.category}
              </span>
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-white">{post.title}</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
              {post.image_url && (
                <div className="rounded-lg overflow-hidden max-h-72 border border-[#232836] mt-2">
                  <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1E232F] text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => likeCommunityPost(post.id)}
                  className="flex items-center gap-1.5 text-[#94A3B8] hover:text-red-400 transition-colors"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                  <span className="font-semibold text-white text-xs">{post.likes_count}</span>
                </button>

                <button
                  onClick={() =>
                    setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                  }
                  className="flex items-center gap-1.5 text-[#94A3B8] hover:text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-xs">{post.comments?.length || post.comments_count || 0} Respostas</span>
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  addToast('Link Copiado', 'Link do post copiado para a área de transferência.', 'info');
                }}
                className="text-[#64748B] hover:text-white"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Comments Expand Area */}
            {activeCommentPostId === post.id && (
              <div className="pt-3 border-t border-[#1E232F] space-y-3">
                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-2">
                    {post.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 rounded-lg bg-[#0E1017] border border-[#232836] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white text-xs">{comm.author_name}</span>
                          <span className="text-[10px] text-[#64748B]">
                            {new Date(comm.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-[#94A3B8] text-xs">{comm.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Adicione um comentário construtivo..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendComment(post.id);
                    }}
                    className="flex-1 px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendComment(post.id)}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors"
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

