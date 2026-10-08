// ============================================================================
// CORE MOTIOM — FATIA CATALOG: produtos, lojas, comunidade e conteúdo
// ============================================================================

'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { Product, Store, CommunityPost, UserProfile } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_STORES,
  INITIAL_COACHES,
  INITIAL_ATHLETES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_NEWS,
} from '../initial-data';
import { readPersistedState } from './persistence';
import { CatalogSlice, Toast } from './types';

interface UseCatalogDeps {
  addToast: (title: string, message: string, type?: Toast['type']) => void;
  user: UserProfile | null;
  // Exposto pelo slice de auth: criar loja promove o usuário a vendedor
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
}

export function useCatalog({ addToast, user, setUser }: UseCatalogDeps): CatalogSlice {
  const [products, setProducts] = useState<Product[]>(
    () => (readPersistedState()?.products as Product[]) || INITIAL_PRODUCTS
  );
  const [stores, setStores] = useState<Store[]>(
    () => (readPersistedState()?.stores as Store[]) || INITIAL_STORES
  );
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(
    () => (readPersistedState()?.communityPosts as CommunityPost[]) || INITIAL_COMMUNITY_POSTS
  );
  const [coaches] = useState(() => INITIAL_COACHES);
  const [athletes] = useState(() => INITIAL_ATHLETES);
  const [news] = useState(() => INITIAL_NEWS);

  // Produtos (B2C & C2C)
  const createProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>
  ): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      views: 1,
      likes_count: 0,
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('Anúncio Publicado', `O produto "${newProduct.title}" está disponível no Marketplace.`, 'success');
    return newProduct;
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    addToast('Produto Atualizado', 'As alterações foram salvas com sucesso.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Produto Removido', 'O anúncio foi excluído.', 'info');
  };

  // Lojas & verificação oficial
  const createStore = async (
    storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'sales_count' | 'products_count' | 'is_verified' | 'verification_status'>
  ): Promise<Store> => {
    const newStore: Store = {
      ...storeData,
      id: `store-${Date.now()}`,
      is_verified: false,
      verification_status: 'none',
      rating: 5.0,
      sales_count: 0,
      products_count: 0,
      created_at: new Date().toISOString(),
    };
    setStores((prev) => [...prev, newStore]);
    if (user) {
      setUser((prev) => (prev ? { ...prev, store_id: newStore.id, role: 'seller' } : null));
    }
    addToast('Loja Criada!', `Sua loja "${newStore.name}" foi inaugurada no CoreMotiom.`, 'success');
    return newStore;
  };

  const requestStoreVerification = async (storeId: string, docs: NonNullable<Store['verification_docs']>) => {
    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId
          ? {
              ...s,
              verification_status: 'pending',
              verification_requested_at: new Date().toISOString(),
              verification_docs: docs,
            }
          : s
      )
    );
    addToast(
      'Solicitação Enviada',
      'Nossa equipe de compliance analisará a documentação e CNPJ em até 24 horas.',
      'info'
    );
  };

  const adminVerifyStore = async (storeId: string, approve: boolean, notes?: string) => {
    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId
          ? {
              ...s,
              is_verified: approve,
              verification_status: approve ? 'verified' : 'rejected',
              verification_docs: s.verification_docs
                ? { ...s.verification_docs, notes }
                : { notes },
            }
          : s
      )
    );

    // Atualiza produtos da loja para exibir o selo "Verificado"
    if (approve) {
      setProducts((prev) =>
        prev.map((p) => (p.store_id === storeId ? { ...p, is_verified_store: true } : p))
      );
      addToast('Loja Verificada', 'Selo "✓ Verificado" concedido à loja.', 'success');
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.store_id === storeId ? { ...p, is_verified_store: false } : p))
      );
      addToast('Verificação Recusada', 'A solicitação foi indeferida.', 'info');
    }
  };

  // Comunidade
  const createCommunityPost = (post: {
    title: string;
    content: string;
    category: CommunityPost['category'];
    image_url?: string;
  }) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author_id: user?.id || 'anon',
      author_name: user?.name || 'Atleta CoreMotiom',
      author_avatar: user?.avatar_url,
      author_badge: user?.role === 'admin' ? 'Admin' : user?.role === 'seller' ? 'Loja Oficial ✓' : 'Atleta',
      category: post.category,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      likes_count: 0,
      comments_count: 0,
      comments: [],
      created_at: new Date().toISOString(),
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
    addToast('Publicação Criada', 'Sua postagem está visível para a comunidade esportiva.', 'success');
  };

  const likeCommunityPost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p))
    );
  };

  const addCommunityComment = (postId: string, content: string) => {
    const comment = {
      id: `comm-${Date.now()}`,
      author_name: user?.name || 'Atleta',
      author_avatar: user?.avatar_url,
      content,
      created_at: new Date().toISOString(),
    };
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments_count: p.comments_count + 1,
              comments: [...p.comments, comment],
            }
          : p
      )
    );
    addToast('Comentário Adicionado', 'Sua resposta foi enviada.', 'success');
  };

  const reportCommunityPost = (postId: string, reason: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_reported: true, report_reason: reason } : p))
    );
    addToast('Denúncia Registrada', 'O post foi encaminhado para moderação administrativa.', 'info');
  };

  const adminDeleteCommunityPost = (postId: string) => {
    setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
    addToast('Post Excluído', 'A publicação foi removida pelo Administrador.', 'info');
  };

  return {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    stores,
    createStore,
    requestStoreVerification,
    adminVerifyStore,
    communityPosts,
    createCommunityPost,
    likeCommunityPost,
    addCommunityComment,
    reportCommunityPost,
    adminDeleteCommunityPost,
    coaches,
    athletes,
    news,
  };
}
