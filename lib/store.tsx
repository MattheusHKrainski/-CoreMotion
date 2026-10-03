// ============================================================================
// CORE MOTIOM — ESTADO GLOBAL DA APLICAÇÃO (React Context)
// Responsável por TODO o estado compartilhado:
//   - Navegação, modais e busca
//   - Autenticação (Supabase + fallback local) e papéis (visitor/user/seller/admin)
//   - Carrinho, pedidos e checkout (PIX sandbox)
//   - Produtos, lojas e verificação oficial
//   - Comunidade, favoritos e notificações (toasts)
// ============================================================================

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  Product,
  Store,
  CartItem,
  Order,
  PaymentMethod,
  ShippingAddress,
  CommunityPost,
  Coach,
  Athlete,
  NewsArticle,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_STORES,
  INITIAL_COACHES,
  INITIAL_ATHLETES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_NEWS,
} from './initial-data';
import { getSupabase, isSupabaseConfigured } from './supabase';

// ----------------------------------------------------------------------------
// TIPOS: Views disponíveis, Toast e contrato do Contexto
// ----------------------------------------------------------------------------
interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ActiveView =
  | 'home'
  | 'marketplace'
  | 'stores'
  | 'sell'
  | 'smartscan'
  | 'coaches'
  | 'community'
  | 'admin';

interface CoreMotiomContextType {
  // Navigation & UI Modals
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  selectedStore: Store | null;
  setSelectedStore: (s: Store | null) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot' | 'switch';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot' | 'switch') => void;
  isCheckoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  isCreateStoreModalOpen: boolean;
  setCreateStoreModalOpen: (open: boolean) => void;
  isSupabaseConfigOpen: boolean;
  setSupabaseConfigOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Authentication & Roles
  user: UserProfile | null;
  role: UserRole;
  isVisitor: boolean;
  isAuthenticated: boolean;
  isSupabaseLive: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;

  // Cart & Orders
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selected_size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  createOrder: (data: {
    address: ShippingAddress;
    shippingMethod: 'pac' | 'sedex' | 'express';
    paymentMethod: PaymentMethod;
  }) => Promise<Order>;
  confirmPaymentSandbox: (orderId: string) => Promise<void>;

  // Products
  products: Product[];
  createProduct: (product: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Stores & Official Verification
  stores: Store[];
  createStore: (storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'sales_count' | 'products_count' | 'is_verified' | 'verification_status'>) => Promise<Store>;
  requestStoreVerification: (storeId: string, docs: NonNullable<Store['verification_docs']>) => Promise<void>;
  adminVerifyStore: (storeId: string, approve: boolean, notes?: string) => Promise<void>;

  // Community
  communityPosts: CommunityPost[];
  createCommunityPost: (post: { title: string; content: string; category: CommunityPost['category']; image_url?: string }) => void;
  likeCommunityPost: (postId: string) => void;
  addCommunityComment: (postId: string, content: string) => void;
  reportCommunityPost: (postId: string, reason: string) => void;
  adminDeleteCommunityPost: (postId: string) => void;

  // Coaches & Athletes & News
  coaches: Coach[];
  athletes: Athlete[];
  news: NewsArticle[];

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const CoreMotiomContext = createContext<CoreMotiomContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'coremotiom_state_v1';

export function CoreMotiomProvider({ children }: { children: ReactNode }) {
  // ----------------------------------------------------------------------------
  // SEÇÃO: ESTADO — Navegação, modais e busca
  // ----------------------------------------------------------------------------
  // Navigation & views
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'switch'>('login');
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isCreateStoreModalOpen, setCreateStoreModalOpen] = useState(false);
  const [isSupabaseConfigOpen, setSupabaseConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ----------------------------------------------------------------------------
  // SEÇÃO: INICIALIZAÇÃO PERSISTENTE (lê estado salvo no localStorage)
  // ----------------------------------------------------------------------------
  // Helper for safe client state init
  const getInitialState = () => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Core entities with resilient initializers
  const [user, setUser] = useState<UserProfile | null>(() => getInitialState()?.user || null);
  const [products, setProducts] = useState<Product[]>(() => getInitialState()?.products || INITIAL_PRODUCTS);
  const [stores, setStores] = useState<Store[]>(() => getInitialState()?.stores || INITIAL_STORES);
  const [orders, setOrders] = useState<Order[]>(() => getInitialState()?.orders || []);
  const [cart, setCart] = useState<CartItem[]>(() => getInitialState()?.cart || []);
  const [favorites, setFavorites] = useState<string[]>(() => getInitialState()?.favorites || []);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => getInitialState()?.communityPosts || INITIAL_COMMUNITY_POSTS);
  const [coaches] = useState<Coach[]>(INITIAL_COACHES);
  const [athletes] = useState<Athlete[]>(INITIAL_ATHLETES);
  const [news] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // ----------------------------------------------------------------------------
  // SEÇÃO: TOASTS — Notificações visuais globais
  // ----------------------------------------------------------------------------
  // Toast system
  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ----------------------------------------------------------------------------
  // SEÇÃO: SESSÃO SUPABASE — Restaura usuário logado ao carregar
  // ----------------------------------------------------------------------------
  // Check Supabase connection
  useEffect(() => {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        sb.auth.getSession().then(({ data, error }) => {
          if (!error) {
            setIsSupabaseLive(true);
            if (data.session?.user) {
              const u = data.session.user;
              setUser({
                id: u.id,
                email: u.email || '',
                name: u.user_metadata?.name || u.email?.split('@')[0] || 'Atleta CoreMotiom',
                avatar_url: u.user_metadata?.avatar_url,
                role: (u.user_metadata?.role as UserRole) || 'user',
                created_at: u.created_at,
              });
            }
          }
        }).catch(() => {
          setIsSupabaseLive(false);
        });
      }
    }
  }, []);

  // ----------------------------------------------------------------------------
  // SEÇÃO: PERSISTÊNCIA — Salva o estado no localStorage
  // ----------------------------------------------------------------------------
  // Save to local storage
  const saveState = useCallback(() => {
    try {
      const payload = {
        user,
        products,
        stores,
        orders,
        cart,
        favorites,
        communityPosts,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [user, products, stores, orders, cart, favorites, communityPosts]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  // ----------------------------------------------------------------------------
  // SEÇÃO: PAPEIS & PERMISSÕES — Roles derivadas e troca de perfil demo
  // ----------------------------------------------------------------------------
  // Derived Auth info
  const role: UserRole = user?.role || 'visitor';
  const isVisitor = !user || role === 'visitor';
  const isAuthenticated = Boolean(user && role !== 'visitor');

  // Role switching (for live testing of Admin, Seller, User and Visitor flows)
  const switchRole = useCallback((newRole: UserRole) => {
    if (newRole === 'visitor') {
      setUser(null);
      addToast('Modo Visitante', 'Você está navegando como visitante.', 'info');
      return;
    }

    const demoProfiles: Record<Exclude<UserRole, 'visitor'>, UserProfile> = {
      admin: {
        id: 'admin-001',
        email: 'admin@coremotiom.com',
        name: 'Administrador CoreMotiom',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        role: 'admin',
        city: 'São Paulo',
        state: 'SP',
        sport_interests: ['Corrida', 'Triatlo', 'Ciclismo'],
        created_at: '2026-01-01T00:00:00Z',
      },
      seller: {
        id: 'seller-pro-1',
        email: 'contato@motiompro.com.br',
        name: 'Motiom Pro Lab (Lojista Oficial)',
        avatar_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&q=80',
        role: 'seller',
        store_id: 'store-1',
        city: 'São Paulo',
        state: 'SP',
        sport_interests: ['Alta Performance', 'Corrida'],
        created_at: '2026-01-10T08:00:00Z',
      },
      user: {
        id: 'user-c2c-1',
        email: 'carlos.ramos@atleta.com',
        name: 'Carlos Eduardo Ramos',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        role: 'user',
        city: 'Campinas',
        state: 'SP',
        sport_interests: ['Maratona', 'Trail Running', 'Ciclismo'],
        created_at: '2026-03-01T10:00:00Z',
      },
    };

    const targetProfile = demoProfiles[newRole];
    setUser(targetProfile);
    addToast(
      'Perfil Atualizado',
      `Agora você está operando com permissões de ${newRole === 'admin' ? 'Administrador' : newRole === 'seller' ? 'Lojista' : 'Usuário Atleta'}.`,
      'success'
    );
  }, [addToast]);

  // ----------------------------------------------------------------------------
  // SEÇÃO: AUTENTICAÇÃO — Login, cadastro, Google OAuth e logout
  // ----------------------------------------------------------------------------
  // Auth: Email Login
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const u = data.user;
          const userProfile: UserProfile = {
            id: u.id,
            email: u.email || email,
            name: u.user_metadata?.name || email.split('@')[0],
            avatar_url: u.user_metadata?.avatar_url,
            role: (u.user_metadata?.role as UserRole) || 'user',
            created_at: u.created_at,
          };
          setUser(userProfile);
          addToast('Login Concluído', `Bem-vindo de volta, ${userProfile.name}!`, 'success');
          setAuthModalOpen(false);
          return { success: true };
        }
      }
    }

    // Direct resilient authentication fallback
    let assignedRole: UserRole = 'user';
    if (email.toLowerCase().includes('admin')) assignedRole = 'admin';
    else if (email.toLowerCase().includes('loja') || email.toLowerCase().includes('seller')) assignedRole = 'seller';

    const userProfile: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      role: assignedRole,
      store_id: assignedRole === 'seller' ? 'store-1' : undefined,
      created_at: new Date().toISOString(),
    };

    setUser(userProfile);
    addToast('Sessão Iniciada', `Autenticado com sucesso como ${userProfile.name}.`, 'success');
    setAuthModalOpen(false);
    return { success: true };
  };

  // Auth: Sign Up
  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    desiredRole: UserRole = 'user'
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.auth.signUp({
          email,
          password: pass,
          options: {
            data: { name, role: desiredRole },
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            email,
            name,
            role: desiredRole,
            created_at: new Date().toISOString(),
          };
          setUser(newUser);
          addToast('Conta Criada', 'Sua conta CoreMotiom foi criada com sucesso.', 'success');
          setAuthModalOpen(false);
          return { success: true };
        }
      }
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name,
      role: desiredRole,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    addToast('Conta Criada', `Bem-vindo ao CoreMotiom, ${name}!`, 'success');
    setAuthModalOpen(false);
    return { success: true };
  };

  // Auth: Google OAuth
  const signInWithGoogle = async () => {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) {
          addToast('Erro no Google OAuth', error.message, 'error');
          return;
        }
        return;
      }
    }

    // Direct Google authentication simulation
    const googleUser: UserProfile = {
      id: `google-user-${Date.now()}`,
      email: 'atleta.google@gmail.com',
      name: 'Atleta Google CoreMotiom',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      role: 'user',
      created_at: new Date().toISOString(),
    };
    setUser(googleUser);
    addToast('Google OAuth Conectado', 'Autenticado com sucesso via Google.', 'success');
    setAuthModalOpen(false);
  };

  // Auth: Logout
  const logout = async () => {
    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        await sb.auth.signOut();
      }
    }
    setUser(null);
    setActiveView('home');
    addToast('Sessão Encerrada', 'Você saiu da sua conta com segurança.', 'info');
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    addToast('Perfil Salvo', 'Suas informações foram atualizadas.', 'success');
  };

  // ----------------------------------------------------------------------------
  // SEÇÃO: CARRINHO — Adicionar, remover, quantidades e totais
  // ----------------------------------------------------------------------------
  // Cart operations
  const addToCart = (product: Product, quantity = 1, selected_size?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.selected_size === selected_size);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selected_size === selected_size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selected_size }];
    });
    addToast('Carrinho Atualizado', `${product.title} adicionado ao seu carrinho.`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('Item Removido', 'Produto retirado do carrinho.', 'info');
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ----------------------------------------------------------------------------
  // SEÇÃO: FAVORITOS — Lista de desejos do usuário
  // ----------------------------------------------------------------------------
  // Favorites
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Favoritos', 'Produto removido da sua lista de favoritos.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast('Favoritos', 'Produto salvo na sua lista de favoritos.', 'success');
        return [...prev, productId];
      }
    });
  };

  // ----------------------------------------------------------------------------
  // SEÇÃO: PEDIDOS & CHECKOUT — Criação de pedido com PIX sandbox e frete
  // ----------------------------------------------------------------------------
  // Checkout & Order creation
  const createOrder = async (data: {
    address: ShippingAddress;
    shippingMethod: 'pac' | 'sedex' | 'express';
    paymentMethod: PaymentMethod;
  }): Promise<Order> => {
    const shippingCosts: Record<string, number> = {
      pac: 24.9,
      sedex: 42.5,
      express: 58.0,
    };
    const shippingFee = shippingCosts[data.shippingMethod] || 25.0;
    const subtotal = cartTotal;
    const total = subtotal + shippingFee;

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const pixCode = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${total.toFixed(2)}5802BR5916COREMOTIOM BRASIL6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      user_id: user?.id || 'guest-user',
      user_email: user?.email || data.address.phone,
      items: [...cart],
      subtotal,
      shipping_fee: shippingFee,
      discount: 0,
      total,
      payment_method: data.paymentMethod,
      payment_status: data.paymentMethod === 'pix' ? 'pending' : 'completed',
      pix_code: pixCode,
      pix_qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`,
      pix_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      shipping_address: data.address,
      shipping_method: data.shippingMethod,
      order_status: data.paymentMethod === 'pix' ? 'pending_payment' : 'preparing',
      tracking_code: `CM${Math.floor(100000000 + Math.random() * 900000000)}BR`,
      created_at: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const confirmPaymentSandbox = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              payment_status: 'completed',
              order_status: 'preparing',
            }
          : ord
      )
    );
    addToast('Pagamento Confirmado (Sandbox)', `Pedido ${orderId} aprovado com sucesso!`, 'success');
  };

  // ----------------------------------------------------------------------------
  // SEÇÃO: PRODUTOS — CRUD de anúncios (B2C e C2C)
  // ----------------------------------------------------------------------------
  // Products CRUD
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

  // ----------------------------------------------------------------------------
  // SEÇÃO: LOJAS & VERIFICAÇÃO OFICIAL — Criação, solicitação e aprovação (admin)
  // ----------------------------------------------------------------------------
  // Stores & Verification
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

    // Update products from this store to show verified store badge
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

  // ----------------------------------------------------------------------------
  // SEÇÃO: COMUNIDADE — Posts, likes, comentários, denúncias e moderação
  // ----------------------------------------------------------------------------
  // Community
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

  // ----------------------------------------------------------------------------
  // SEÇÃO: PROVIDER & HOOK (exposição do contexto para os componentes)
  // ----------------------------------------------------------------------------

  return (
    <CoreMotiomContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedProduct,
        setSelectedProduct,
        selectedStore,
        setSelectedStore,
        isAuthModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isCheckoutOpen,
        setCheckoutOpen,
        isCreateStoreModalOpen,
        setCreateStoreModalOpen,
        isSupabaseConfigOpen,
        setSupabaseConfigOpen,
        searchQuery,
        setSearchQuery,
        user,
        role,
        isVisitor,
        isAuthenticated,
        isSupabaseLive,
        loginWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        switchRole,
        updateUserProfile,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        createOrder,
        confirmPaymentSandbox,
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
        favorites,
        toggleFavorite,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </CoreMotiomContext.Provider>
  );
}

export function useCoreMotiom() {
  const context = useContext(CoreMotiomContext);
  if (!context) {
    throw new Error('useCoreMotiom must be used within a CoreMotiomProvider');
  }
  return context;
}
