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
  INITIAL_USERS,
} from './initial-data';
import { getSupabaseClient as getSupabase, isSupabaseConfigured } from '@/services/supabaseClient';
import { authedFetch } from './auth-fetch';
import {
  canDeleteTarget,
  canSuspendTarget,
  hasCapability,
  isAdminRole,
} from './permissions';
import {
  AuthService,
  ProductService,
  StoreService,
  OrderService,
  CommunityService,
  testSupabaseConnection,
} from '@/services';


interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type ActiveView =
  | 'home'
  | 'marketplace'
  | 'stores'
  | 'sell'
  | 'coaches'
  | 'community'
  | 'profile'
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
  allUsers: UserProfile[];
  updateUserRole: (userId: string, newRole: UserRole) => void;
  adminCreateUser: (userData: { name: string; email: string; role: UserRole; city?: string; state?: string }) => void;
  adminDeleteUser: (userId: string) => void;
  adminBanUser: (userId: string, reason: string) => Promise<void>;
  adminUnbanUser: (userId: string) => void;
  adminUpdateOrderStatus: (orderId: string, order_status: Order['order_status'], payment_status?: Order['payment_status']) => void;
  adminToggleProductStatus: (productId: string, newStatus: Product['status']) => void;
  adminSyncSupabase: () => Promise<{ success: boolean; count?: number; error?: string }>;
  loginAsMasterAdmin: () => void;
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

  // Core entities with resilient initializers - SSR safe
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [coaches] = useState<Coach[]>(INITIAL_COACHES);
  const [athletes] = useState<Athlete[]>(INITIAL_ATHLETES);
  const [news] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [, setIsHydrated] = useState(false);

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

  // Check Supabase connection, load live data and listen to auth state
  useEffect(() => {
    let isMounted = true;

    // Listen to OAuth messages from popup window
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const sb = getSupabase();
        if (sb) {
          const { data } = await sb.auth.getSession();
          if (data.session?.user && isMounted) {
            const u = data.session.user;
            const email = u.email || '';
            const profile = await AuthService.getProfileOrCreate(u.id, email, {
              name: u.user_metadata?.name || u.user_metadata?.full_name || email.split('@')[0],
              avatar_url: u.user_metadata?.avatar_url,
            });
            setUser(profile);
            setAllUsers((prev) => {
              const exists = prev.some((p) => p.email.toLowerCase() === email.toLowerCase());
              return exists
                ? prev.map((p) => (p.email.toLowerCase() === email.toLowerCase() ? profile : p))
                : [profile, ...prev];
            });
            addToast('Google OAuth Concluído', `Bem-vindo, ${profile.name}!`, 'success');
            setAuthModalOpen(false);
          }
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        addToast('Erro no Google OAuth', event.data.error || 'Falha na autenticação do Google.', 'error');
      }
    };

    window.addEventListener('message', handleOAuthMessage);

    let authSubscription: { unsubscribe: () => void } | null = null;

    const initData = async () => {
      try {
        // Load saved client storage safely without synchronous effect setState
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (parsed.orders) setOrders(parsed.orders);
          if (parsed.cart) setCart(parsed.cart);
          if (parsed.favorites) setFavorites(parsed.favorites);
          if (parsed.user) setUser(parsed.user);
        }
        if (isMounted) setIsHydrated(true);

        const conn = await testSupabaseConnection();
        if (isMounted) setIsSupabaseLive(conn.connected);

        // Load live products, stores, community posts and database registered users
        const [liveProducts, liveStores, livePosts, usersRes] = await Promise.all([
          ProductService.getProducts(),
          StoreService.getStores(),
          CommunityService.getPosts(),
          fetch('/api/users?include_internal=true').then((r) => r.json()).catch(() => null),
        ]);

        if (isMounted) {
          if (liveProducts && liveProducts.length > 0) {
            setProducts(liveProducts);
          }
          if (liveStores && liveStores.length > 0) {
            setStores(liveStores);
          }
          if (livePosts && livePosts.length > 0) {
            setCommunityPosts(livePosts);
          }
          if (usersRes?.success && Array.isArray(usersRes.users) && usersRes.users.length > 0) {
            setAllUsers(usersRes.users);
          }
        }
      } catch (err) {
        console.warn('[CoreMotiom] Error loading live database records:', err);
      }
    };

    initData();

    if (isSupabaseConfigured) {
      const sb = getSupabase();
      if (sb) {
        sb.auth.getSession().then(async ({ data, error }) => {
          if (!error && data.session?.user && isMounted) {
            const u = data.session.user;
            const email = u.email || '';
            const profile = await AuthService.getProfileOrCreate(u.id, email, {
              name: u.user_metadata?.name || email.split('@')[0],
              avatar_url: u.user_metadata?.avatar_url,
            });
            setUser(profile);
          }
        }).catch(() => {
          if (isMounted) setIsSupabaseLive(false);
        });

        const { data: authListener } = sb.auth.onAuthStateChange(async (event, session) => {
          if (session?.user && isMounted) {
            const u = session.user;
            const email = u.email || '';
            const profile = await AuthService.getProfileOrCreate(u.id, email, {
              name: u.user_metadata?.name || email.split('@')[0],
              avatar_url: u.user_metadata?.avatar_url,
            });
            setUser(profile);
          } else if (event === 'SIGNED_OUT' && isMounted) {
            setUser(null);
          }
        });

        if (authListener?.subscription) {
          authSubscription = authListener.subscription;
        }
      }
    }

    return () => {
      isMounted = false;
      window.removeEventListener('message', handleOAuthMessage);
      authSubscription?.unsubscribe();
    };
  }, [addToast]);

  // Save to local storage
  const saveState = useCallback(() => {
    try {
      const payload = {
        user,
        allUsers,
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
  }, [user, allUsers, products, stores, orders, cart, favorites, communityPosts]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  // Derived Auth info
  const role: UserRole = user?.role || 'visitor';
  const isVisitor = !user || role === 'visitor';
  const isAuthenticated = Boolean(user && role !== 'visitor');

  // Role switching (for live testing of Admin, Seller, User and Visitor flows)
  const switchRole = useCallback((newRole: UserRole) => {
    if (isSupabaseConfigured) {
      addToast('Simulação indisponível', 'Com o banco conectado, o papel vem da sua conta autenticada.', 'info');
      return;
    }
    if (newRole === 'visitor') {
      setUser(null);
      addToast('Modo Visitante', 'Você está navegando como visitante.', 'info');
      return;
    }

    const demoProfiles: Record<Exclude<UserRole, 'visitor'>, UserProfile> = {
      admin: {
        id: 'usr-admin-mattheus',
        email: 'mattheusxmljz@gmail.com',
        name: 'Mattheus (Super Admin)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        role: 'admin',
        city: 'Curitiba',
        state: 'PR',
        sport_interests: ['Maratona', 'Triatlo', 'Ciclismo'],
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
      supervisor: {
        id: 'usr-supervisor-demo',
        email: 'supervisor@coremotiom.com',
        name: 'Supervisor de Moderação (demo)',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        role: 'supervisor',
        city: 'São Paulo',
        state: 'SP',
        sport_interests: ['Corrida', 'Ciclismo'],
        created_at: '2026-02-01T00:00:00Z',
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
      `Agora você está operando com permissões de ${newRole === 'admin' ? 'Administrador' : newRole === 'supervisor' ? 'Supervisor' : newRole === 'seller' ? 'Lojista' : 'Atleta'}.`,
      'success'
    );
  }, [addToast]);

  // ---------------------------------------------------------------------------
  // Ações administrativas. Com o banco conectado, cada ação é gravada no servidor
  // (que revalida o papel) ANTES de alterar a tela. Sem banco (modo demonstração),
  // a alteração é somente local e isso é informado ao usuário.
  // ---------------------------------------------------------------------------
  const errorText = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

  const callUsersApi = async (
    method: 'PATCH' | 'DELETE',
    payload: Record<string, unknown> = {},
    query = ''
  ): Promise<void> => {
    const res = await authedFetch(`/api/users${query}`, {
      method,
      ...(method === 'PATCH' ? { body: JSON.stringify(payload) } : {}),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || 'Operação recusada pelo servidor.');
    }
  };

  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    if (!hasCapability(user?.role, 'users.change_role')) {
      addToast('Acesso Negado', 'Somente administradores podem alterar papéis de usuários.', 'error');
      return;
    }
    try {
      if (isSupabaseConfigured) await callUsersApi('PATCH', { action: 'updateRole', userId, newRole });
      setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      if (user?.id === userId) setUser((prev) => (prev ? { ...prev, role: newRole } : null));
      addToast(
        'Permissão Atualizada',
        isSupabaseConfigured ? 'Papel gravado no banco de dados.' : 'Papel alterado (modo demonstração, apenas local).',
        'success'
      );
    } catch (err: unknown) {
      addToast('Falha ao alterar papel', errorText(err, 'Não foi possível alterar o papel.'), 'error');
    }
  }, [user, addToast]);

  const adminCreateUser = useCallback(
    (userData: { name: string; email: string; role: UserRole; city?: string; state?: string }) => {
      if (!isAdminRole(user?.role)) {
        addToast('Acesso Negado', 'Somente administradores podem cadastrar usuários.', 'error');
        return;
      }
      if (isSupabaseConfigured) {
        addToast(
          'Cadastro indisponível',
          'Com o banco conectado, as contas são criadas pelo próprio usuário na tela de cadastro (Supabase Auth).',
          'info'
        );
        return;
      }
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
        city: userData.city || 'São Paulo',
        state: userData.state || 'SP',
        sport_interests: ['Corrida', 'Alta Performance'],
        created_at: new Date().toISOString(),
      };
      setAllUsers((prev) => [newUser, ...prev]);
      addToast('Usuário Cadastrado (demo)', `Conta de ${userData.name} criada apenas nesta sessão.`, 'success');
    },
    [user, addToast]
  );

  const adminDeleteUser = useCallback(
    async (userId: string) => {
      const target = allUsers.find((u) => u.id === userId);
      if (!canDeleteTarget(user?.role, target?.email)) {
        addToast('Operação Não Permitida', 'Somente administradores podem excluir contas; contas-mestre são protegidas.', 'error');
        return;
      }
      try {
        if (isSupabaseConfigured) await callUsersApi('DELETE', {}, `?userId=${encodeURIComponent(userId)}`);
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        addToast('Usuário Excluído', 'A conta foi removida da plataforma.', 'success');
      } catch (err: unknown) {
        addToast('Falha ao excluir', errorText(err, 'Não foi possível excluir a conta.'), 'error');
      }
    },
    [user, allUsers, addToast]
  );

  const adminBanUser = useCallback(
    async (userId: string, reason: string) => {
      const target = allUsers.find((u) => u.id === userId);
      if (!target || !canSuspendTarget(user?.role, target.role, target.email)) {
        addToast('Acesso Negado', 'Seu papel não pode suspender esta conta.', 'error');
        return;
      }
      try {
        if (isSupabaseConfigured) await callUsersApi('PATCH', { action: 'ban', userId, reason });
        setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_banned: true, ban_reason: reason } : u)));
        addToast('Conta Suspensa', 'A suspensão foi aplicada e registrada.', 'info');
      } catch (err: unknown) {
        addToast('Falha ao suspender', errorText(err, 'Não foi possível suspender a conta.'), 'error');
      }
    },
    [user, allUsers, addToast]
  );

  const adminUnbanUser = useCallback(
    async (userId: string) => {
      const target = allUsers.find((u) => u.id === userId);
      if (!target || !canSuspendTarget(user?.role, target.role, target.email)) {
        addToast('Acesso Negado', 'Seu papel não pode reativar esta conta.', 'error');
        return;
      }
      try {
        if (isSupabaseConfigured) await callUsersApi('PATCH', { action: 'unban', userId });
        setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_banned: false, ban_reason: undefined } : u)));
        addToast('Conta Reativada', 'A conta foi desbloqueada.', 'success');
      } catch (err: unknown) {
        addToast('Falha ao reativar', errorText(err, 'Não foi possível reativar a conta.'), 'error');
      }
    },
    [user, allUsers, addToast]
  );

  const adminUpdateOrderStatus = useCallback(
    async (orderId: string, order_status: Order['order_status'], payment_status?: Order['payment_status']) => {
      if (!hasCapability(user?.role, 'orders.manage')) {
        addToast('Acesso Negado', 'Seu papel não pode alterar pedidos.', 'error');
        return;
      }
      try {
        if (isSupabaseConfigured) {
          const result = await OrderService.updateOrderStatus(orderId, order_status, payment_status);
          if (!result.success) throw new Error(result.error || 'Falha ao atualizar o pedido.');
        }
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status, payment_status: payment_status || o.payment_status } : o))
        );
        addToast('Pedido Atualizado', `Pedido ${orderId} agora está em "${order_status}".`, 'success');
      } catch (err: unknown) {
        addToast('Falha ao atualizar pedido', errorText(err, 'Não foi possível atualizar o pedido.'), 'error');
      }
    },
    [user, addToast]
  );

  const adminToggleProductStatus = useCallback(
    async (productId: string, newStatus: Product['status']) => {
      if (!hasCapability(user?.role, 'products.moderate')) {
        addToast('Acesso Negado', 'Seu papel não pode moderar anúncios.', 'error');
        return;
      }
      try {
        if (isSupabaseConfigured) {
          const ok = await ProductService.updateProduct(productId, { status: newStatus });
          if (!ok) throw new Error('Falha ao atualizar o status do anúncio.');
        }
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p)));
        addToast('Catálogo Atualizado', `Anúncio agora está "${newStatus}".`, 'success');
      } catch (err: unknown) {
        addToast('Falha ao moderar anúncio', errorText(err, 'Não foi possível alterar o anúncio.'), 'error');
      }
    },
    [user, addToast]
  );

  const adminSyncSupabase = useCallback(async () => {
    try {
      const [liveProducts, liveStores, livePosts] = await Promise.all([
        ProductService.getProducts(),
        StoreService.getStores(),
        CommunityService.getPosts(),
      ]);
      if (liveProducts && liveProducts.length > 0) setProducts(liveProducts);
      if (liveStores && liveStores.length > 0) setStores(liveStores);
      if (livePosts && livePosts.length > 0) setCommunityPosts(livePosts);
      setIsSupabaseLive(true);
      addToast(
        'Supabase Sincronizado',
        `Carregados ${liveProducts?.length || 0} produtos e ${liveStores?.length || 0} lojas do banco de dados oficial.`,
        'success'
      );
      return { success: true, count: (liveProducts?.length || 0) + (liveStores?.length || 0) };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na sincronização com Supabase';
      addToast('Aviso de Sincronização', msg, 'info');
      return { success: false, error: msg };
    }
  }, [addToast]);

  const loginAsMasterAdmin = useCallback(() => {
    if (isSupabaseConfigured) {
      addToast('Acesso indisponível', 'Entre com suas credenciais de administrador.', 'info');
      return;
    }
    const masterAdmin = INITIAL_USERS[0];
    setUser(masterAdmin);
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === masterAdmin.email.toLowerCase());
      return exists ? prev : [masterAdmin, ...prev];
    });
    addToast('Sessão Super Admin', 'Conectado como Administrador (perfil de demonstração).', 'success');
  }, [addToast]);

  // Auth: Email Login
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await AuthService.loginWithEmail(email, pass);
    if (res.success && res.data) {
      setUser(res.data);
      setAllUsers((prev) => {
        const exists = prev.some((p) => p.email.toLowerCase() === res.data!.email.toLowerCase());
        return exists
          ? prev.map((p) => (p.email.toLowerCase() === res.data!.email.toLowerCase() ? res.data! : p))
          : [res.data!, ...prev];
      });
      addToast('Login Concluído', `Bem-vindo de volta, ${res.data.name}!`, 'success');
      setAuthModalOpen(false);
      return { success: true };
    }

    return { success: false, error: res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  };

  // Auth: Sign Up
  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    desiredRole: UserRole = 'user'
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await AuthService.signUpWithEmail(email, pass, name, desiredRole);
    if (res.success && res.data) {
      setUser(res.data);
      setAllUsers((prev) => [res.data!, ...prev]);
      addToast('Conta Criada', `Bem-vindo ao CoreMotiom, ${name}! (${res.data.role === 'admin' ? 'Administrador' : 'Usuário'})`, 'success');
      setAuthModalOpen(false);
      return { success: true };
    }

    return { success: false, error: res.error || 'Não foi possível cadastrar a conta.' };
  };

  // Auth: Google OAuth
  const signInWithGoogle = async () => {
    const res = await AuthService.signInWithGoogle();
    if (!res.success) {
      addToast(
        'Aviso de Login Google',
        res.error || 'O provedor Google precisa estar ativado no painel do Supabase (Authentication > Providers > Google).',
        'info'
      );
    } else {
      addToast(
        'Autenticação Google',
        'Janela de autenticação aberta. Caso o provedor Google não esteja ativado no Supabase, utilize o login por E-mail ou o Acesso Rápido.',
        'info'
      );
    }
  };

  // Auth: Logout
  const logout = async () => {
    await AuthService.signOut();
    setUser(null);
    setActiveView('home');
    addToast('Sessão Encerrada', 'Você saiu da sua conta com segurança.', 'info');
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    AuthService.updateProfile(user.id, data).catch(console.warn);
    addToast('Perfil Salvo', 'Suas informações foram atualizadas.', 'success');
  };

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

    const res = await OrderService.createOrder({
      userId: user?.id,
      userEmail: user?.email || data.address.phone,
      items: [...cart],
      subtotal,
      shippingFee,
      discount: 0,
      total,
      paymentMethod: data.paymentMethod,
      shippingAddress: data.address,
      shippingMethod: data.shippingMethod,
    });

    const fallbackOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const fallbackPix = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${total.toFixed(2)}5802BR5916COREMOTIOM BRASIL6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newOrder: Order = (res.success && res.data) ? res.data : {
      id: fallbackOrderId,
      user_id: user?.id || 'guest-user',
      user_email: user?.email || data.address.phone,
      items: [...cart],
      subtotal,
      shipping_fee: shippingFee,
      discount: 0,
      total,
      payment_method: data.paymentMethod,
      payment_status: data.paymentMethod === 'pix' ? 'pending' : 'paid',
      pix_code: fallbackPix,
      pix_qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackPix)}`,
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
    await OrderService.confirmPaymentSandbox(orderId);
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              payment_status: 'paid',
              order_status: 'preparing',
            }
          : ord
      )
    );
    addToast('Pagamento Confirmado (Sandbox)', `Pedido ${orderId} aprovado com custódia garantida!`, 'success');
  };

  // Products CRUD
  const createProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>
  ): Promise<Product> => {
    const res = await ProductService.createProduct(productData, user?.id);
    const newProduct: Product = (res.success && res.data) ? res.data : {
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
    ProductService.updateProduct(id, data).catch(console.warn);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    addToast('Produto Atualizado', 'As alterações foram salvas com sucesso.', 'success');
  };

  const deleteProduct = (id: string) => {
    ProductService.deleteProduct(id).catch(console.warn);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Produto Removido', 'O anúncio foi excluído.', 'info');
  };

  // Stores & Verification
  const createStore = async (
    storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'sales_count' | 'products_count' | 'is_verified' | 'verification_status'>
  ): Promise<Store> => {
    const res = await StoreService.createStore(storeData);
    const newStore: Store = (res.success && res.data) ? res.data : {
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
    await StoreService.requestVerification(storeId, docs);
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
    if (!hasCapability(user?.role, 'stores.verify')) {
      addToast(
        'Acesso Negado',
        'Apenas administradores e supervisores podem homologar lojas.',
        'error'
      );
      return;
    }
    await StoreService.adminReviewStore(storeId, approve);
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
      addToast('Loja Verificada', 'Selo "Verificado" concedido à loja.', 'success');
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.store_id === storeId ? { ...p, is_verified_store: false } : p))
      );
      addToast('Verificação Recusada', 'A solicitação foi indeferida.', 'info');
    }
  };

  // Community
  const createCommunityPost = async (post: {
    title: string;
    content: string;
    category: CommunityPost['category'];
    image_url?: string;
  }) => {
    const res = await CommunityService.createPost(
      {
        ...post,
        author_name: user?.name || 'Atleta CoreMotiom',
        author_avatar: user?.avatar_url,
        author_badge: user?.role === 'admin' ? 'Admin' : user?.role === 'seller' ? 'Loja Oficial' : 'Atleta',
      },
      user?.id
    );

    const newPost: CommunityPost = (res.success && res.data) ? res.data : {
      id: `post-${Date.now()}`,
      author_id: user?.id || 'anon',
      author_name: user?.name || 'Atleta CoreMotiom',
      author_avatar: user?.avatar_url,
      author_badge: user?.role === 'admin' ? 'Admin' : user?.role === 'seller' ? 'Loja Oficial' : 'Atleta',
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

  const likeCommunityPost = async (postId: string) => {
    await CommunityService.likePost(postId);
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p))
    );
  };

  const addCommunityComment = async (postId: string, content: string) => {
    const comment = {
      id: `comm-${Date.now()}`,
      author_name: user?.name || 'Atleta',
      author_avatar: user?.avatar_url,
      content,
      created_at: new Date().toISOString(),
    };
    await CommunityService.addComment(postId, comment);
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
    if (!user) {
      addToast('Entre na sua conta', 'É preciso estar autenticado para denunciar uma publicação.', 'info');
      return;
    }
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_reported: true, report_reason: reason } : p))
    );
    CommunityService.reportPost(postId, reason).then((result) => {
      if (!result.success) addToast('Denúncia não gravada', result.error || 'Tente novamente.', 'error');
    });
    addToast('Denúncia Registrada', 'A publicação foi encaminhada para moderação.', 'info');
  };

  const adminDeleteCommunityPost = async (postId: string) => {
    if (!hasCapability(user?.role, 'community.moderate')) {
      addToast('Acesso Negado', 'Seu papel não pode remover publicações.', 'error');
      return;
    }
    if (isSupabaseConfigured) {
      const result = await CommunityService.deletePost(postId);
      if (!result.success) {
        addToast('Falha ao excluir', result.error || 'Não foi possível excluir a publicação.', 'error');
        return;
      }
    }
    setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
    addToast('Post Excluído', 'A publicação foi removida pela moderação.', 'info');
  };

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
        allUsers,
        updateUserRole,
        adminCreateUser,
        adminDeleteUser,
        adminBanUser,
        adminUnbanUser,
        adminUpdateOrderStatus,
        adminToggleProductStatus,
        adminSyncSupabase,
        loginAsMasterAdmin,
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
