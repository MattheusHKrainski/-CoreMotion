'use client';

import { calculateCheckoutTotals, ShippingMethod } from './checkout';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  Product,
  ExternalOffer,
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
  INITIAL_COACHES,
  INITIAL_ATHLETES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_NEWS,
  INITIAL_USERS,
} from '@/fixtures/initial-data';
import { INITIAL_EXTERNAL_OFFERS } from '@/fixtures/real-offers';
import type { OfferCreateInput, OfferUpdateInput } from './schemas/offer.schema';
import { DEMO_MODE } from '@/lib/demo-mode';
import { getSupabaseClient as getSupabase, isSupabaseConfigured } from '@/services/supabaseClient';
import { authedFetch } from './auth-fetch';
import {
  canDeleteTarget,
  canSuspendTarget,
  hasCapability,
  isAdminRole,
  isStaffRole,
} from './permissions';
import {
  AuthService,
  ProductService,
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
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot' | 'switch';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot' | 'switch') => void;
  prefillAuthEmail: string;
  setPrefillAuthEmail: (email: string) => void;
  hasEnteredPlatform: boolean;
  enterPlatform: (targetView?: ActiveView) => void;
  openWelcomePage: () => void;
  isCheckoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
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
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;

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
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // External Offers & Affiliate Links Management
  offers: ExternalOffer[];
  activeOffers: ExternalOffer[];
  editingOfferId: string | null;
  setEditingOfferId: (id: string | null) => void;
  addOffer: (input: OfferCreateInput) => Promise<ExternalOffer | null>;
  updateOffer: (id: string, input: OfferUpdateInput) => Promise<boolean>;
  deleteOffer: (id: string) => Promise<boolean>;
  toggleOfferActive: (id: string, isActive: boolean) => Promise<boolean>;
  resetDefaultOffers: () => Promise<void>;
  fetchOfferMetadata: (url: string) => Promise<{
    store_name?: string;
    title?: string;
    image_url?: string;
    description?: string;
    price?: number;
  } | null>;

  // Community
  communityPosts: CommunityPost[];
  /** Devolve true quando a publicação foi criada (o formulário só é limpo nesse caso). */
  createCommunityPost: (post: { title: string; content: string; category: CommunityPost['category']; image_url?: string }) => Promise<boolean>;
  likeCommunityPost: (postId: string) => Promise<void>;
  addCommunityComment: (postId: string, content: string) => Promise<void>;
  reportCommunityPost: (postId: string, reason: string) => Promise<void>;
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
const OFFERS_STORAGE_KEY = 'coremotion_managed_offers_v1';
const ENTERED_SESSION_KEY = 'coremotion_entered_session_v1';

/** Junta duas listas de anúncios por id; os itens de `incoming` prevalecem. */
function mergeProductsById(current: Product[], incoming: Product[]): Product[] {
  const byId = new Map(current.map((p) => [p.id, p]));
  incoming.forEach((p) => byId.set(p.id, p));
  return Array.from(byId.values());
}

export function CoreMotiomProvider({ children }: { children: ReactNode }) {
  // Navigation & views
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'switch'>('login');
  const [prefillAuthEmail, setPrefillAuthEmail] = useState('');
  const [hasEnteredPlatform, setHasEnteredPlatform] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isSupabaseConfigOpen, setSupabaseConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Core entities with resilient initializers - SSR safe
  const [user, setUser] = useState<UserProfile | null>(null);
  // C9: estado inicial de demonstração só com NEXT_PUBLIC_DEMO_MODE=true (fixtures/); padrão: vazio.
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_MODE ? INITIAL_USERS : []);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS.filter((product) => product.product_type === 'c2c'));
  const [offers, setOffers] = useState<ExternalOffer[]>(INITIAL_EXTERNAL_OFFERS);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [coaches] = useState<Coach[]>(INITIAL_COACHES);
  const [athletes] = useState<Athlete[]>(INITIAL_ATHLETES);
  const [news] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // userRef: o listener de auth lê o usuário atual sem ser recriado a cada mudança.
  // manualAuthRef: true durante login/cadastro manual, que já sincronizam o próprio perfil.
  const userRef = useRef<UserProfile | null>(null);
  const manualAuthRef = useRef(false);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

  // Ao encerrar a sessão, descarta o que só a conta logada podia ver (pedidos, contas, anúncios não ativos).
  const resetPrivateState = useCallback(() => {
    if (!isSupabaseConfigured) return;
    setOrders([]);
    setAllUsers([]);
    setProducts((prev) => prev.filter((p) => p.status === 'active'));
  }, []);

  // Dados públicos (anúncios ativos e comunidade), carrinho/favoritos salvos e sessão do Supabase.
  useEffect(() => {
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initData = async () => {
      try {
        if (sessionStorage.getItem(ENTERED_SESSION_KEY) === '1' && isMounted) {
          setHasEnteredPlatform(true);
        }
        const savedOffers = localStorage.getItem(OFFERS_STORAGE_KEY);
        if (savedOffers && isMounted) {
          const parsedOffers = JSON.parse(savedOffers);
          if (Array.isArray(parsedOffers)) {
            setOffers(parsedOffers);
          }
        }

        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.cart)) setCart(parsed.cart.filter((item: CartItem) => item?.product?.product_type === 'c2c'));
          if (Array.isArray(parsed.favorites)) setFavorites(parsed.favorites);
          // Com o Supabase ativo a sessão vem do Auth: nunca restaurar usuário/pedidos do navegador.
          if (!isSupabaseConfigured) {
            if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
            if (parsed.user) setUser(parsed.user);
          }
        }

        // Busca ofertas reais do banco PostgreSQL quando disponível em produção
        try {
          const offersRes = await fetch('/api/offers');
          if (offersRes.ok) {
            const offersData = await offersRes.json();
            if (isMounted && Array.isArray(offersData.offers)) {
              setOffers(offersData.offers);
              localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offersData.offers));
            }
          }
        } catch {
          // Ambiente local sem DATABASE_URL mantém as ofertas salvas em localStorage / INITIAL_EXTERNAL_OFFERS
        }

        const conn = await testSupabaseConnection();
        if (isMounted) setIsSupabaseLive(conn.connected);

        const [liveProducts, livePosts] = await Promise.all([
          ProductService.getProducts(),
          CommunityService.getPosts(),
        ]);

        if (isMounted) {
          if (liveProducts.length > 0) {
            const curatedC2C = INITIAL_PRODUCTS.filter((product) => product.product_type === 'c2c');
            // Mantém no topo apenas anúncios realmente publicados por usuários recentemente (sem os seeds antigos repetidos).
            const recentUserListings = liveProducts.filter((item) => {
              if (item.id.startsWith('20000000-0000-4000-8000-')) return false;
              if (item.title.endsWith('— Seminovo')) return false;
              const createdMs = new Date(item.created_at).getTime();
              return Number.isFinite(createdMs) && createdMs >= new Date('2026-10-22T00:00:00Z').getTime();
            });
            setProducts((prev) =>
              mergeProductsById(
                prev.filter((p) => p.status !== 'active'),
                mergeProductsById(recentUserListings, curatedC2C)
              )
            );
          }
          if (livePosts.length > 0) {
            const liveIds = new Set(livePosts.map((p) => p.id));
            setCommunityPosts([...livePosts, ...INITIAL_COMMUNITY_POSTS.filter((p) => !liveIds.has(p.id))]);
          }
        }
      } catch (err) {
        console.warn('[CoreMotiom] Error loading live database records:', err);
      }
    };

    void initData();

    const sb = isSupabaseConfigured ? getSupabase() : null;
    if (sb) {
      // Único ponto de restauração/entrada de sessão (INITIAL_SESSION cobre o F5; SIGNED_IN cobre o OAuth).
      // O Supabase não pode ser chamado dentro do callback (deadlock): o sync roda em setTimeout.
      const { data } = sb.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          resetPrivateState();
          return;
        }
        if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') return;
        const sessionUser = session?.user;
        if (!sessionUser || manualAuthRef.current || userRef.current?.id === sessionUser.id) return;

        setTimeout(async () => {
          const email = sessionUser.email || '';
          const result = await AuthService.getProfileOrCreate(sessionUser.id, email, {
            name: sessionUser.user_metadata?.name || sessionUser.user_metadata?.full_name || email.split('@')[0],
            avatar_url: sessionUser.user_metadata?.avatar_url,
          });
          if (!isMounted) return;
          if (result.success && result.data) {
            setUser(result.data);
          } else {
            addToast('Não foi possível entrar', result.error || 'Falha ao carregar o seu perfil.', 'error');
          }
        }, 0);
      });
      authSubscription = data.subscription;
    }

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, [addToast, resetPrivateState]);

  // Dados privados da conta logada: staff vê todos os pedidos/contas/anúncios; os demais, só os seus.
  const userId = user?.id;
  const userRole = user?.role;
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;
    let cancelled = false;

    const loadPrivateData = async () => {
      if (isStaffRole(userRole)) {
        const [allOrders, users, allProducts] = await Promise.all([
          OrderService.getAllOrdersAdmin(),
          AuthService.listUsers(),
          ProductService.getProducts({ status: 'all' }),
        ]);
        try {
          const staffOffersRes = await authedFetch('/api/offers?includeInactive=true');
          if (staffOffersRes.ok) {
            const staffOffersJson = await staffOffersRes.json();
            if (!cancelled && Array.isArray(staffOffersJson.offers)) {
              setOffers(staffOffersJson.offers);
            }
          }
        } catch {
          // ignore if offline
        }
        if (cancelled) return;
        setOrders(allOrders);
        if (users.length > 0) setAllUsers(users);
        if (allProducts.length > 0) setProducts(allProducts);
      } else {
        const [myOrders, myProducts] = await Promise.all([
          OrderService.getMyOrders(userId),
          ProductService.getProducts({ seller_id: userId, status: 'all' }),
        ]);
        if (cancelled) return;
        setOrders(myOrders);
        if (myProducts.length > 0) setProducts((prev) => mergeProductsById(prev, myProducts));
      }
    };

    void loadPrivateData();
    return () => {
      cancelled = true;
    };
  }, [userId, userRole]);

  // Persistência local: carrinho e favoritos sempre; sessão e pedidos apenas no modo demonstração sem banco.
  useEffect(() => {
    try {
      const payload = isSupabaseConfigured ? { cart, favorites } : { user, orders, cart, favorites };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [user, orders, cart, favorites]);

  // Derived Auth info
  const role: UserRole = user?.role || 'visitor';
  const isVisitor = !user || role === 'visitor';
  const isAuthenticated = Boolean(user && role !== 'visitor');

  const enterPlatform = useCallback((targetView?: ActiveView) => {
    setHasEnteredPlatform(true);
    if (targetView) {
      setActiveView(targetView);
    }
    try {
      sessionStorage.setItem(ENTERED_SESSION_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  const openWelcomePage = useCallback(() => {
    setHasEnteredPlatform(false);
    try {
      sessionStorage.removeItem(ENTERED_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setHasEnteredPlatform(true);
      try {
        sessionStorage.setItem(ENTERED_SESSION_KEY, '1');
      } catch {
        // ignore
      }
    }
  }, [isAuthenticated]);

  // Role switching (for live testing of Admin, Seller, User and Visitor flows)
  const switchRole = useCallback((newRole: UserRole) => {
    if (isSupabaseConfigured) {
      addToast('Alteração indisponível', 'Com o banco conectado, o papel vem da sua conta autenticada.', 'info');
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
        email: 'mattheus@coremotion.com.br',
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
        email: 'marina.duarte@coremotion.com.br',
        name: 'Marina Duarte',
        avatar_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&q=80',
        role: 'seller',
        city: 'São Paulo',
        state: 'SP',
        sport_interests: ['Alta Performance', 'Corrida'],
        created_at: '2026-01-10T08:00:00Z',
      },
      supervisor: {
        id: 'usr-supervisor-1',
        email: 'rafael.nogueira@coremotion.com.br',
        name: 'Rafael Nogueira',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        role: 'supervisor',
        city: 'São Paulo',
        state: 'SP',
        sport_interests: ['Corrida', 'Ciclismo'],
        created_at: '2026-02-01T00:00:00Z',
      },
      user: {
        id: 'user-c2c-1',
        email: 'carlos.ramos@coremotion.com.br',
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
      `Agora você está operando com permissões de ${newRole === 'admin' ? 'Administrador' : newRole === 'supervisor' ? 'Supervisor' : newRole === 'seller' ? 'Anunciante C2C' : 'Atleta'}.`,
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
        'Papel de acesso atualizado com sucesso.',
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
      addToast('Usuário Cadastrado', `Conta de ${userData.name} criada com sucesso.`, 'success');
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
          const result = await ProductService.updateProduct(productId, { status: newStatus });
          if (!result.success) throw new Error(result.error || 'Falha ao atualizar o status do anúncio.');
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
      const [liveProducts, livePosts] = await Promise.all([
        ProductService.getProducts(),
        CommunityService.getPosts(),
      ]);
      const c2cProducts = liveProducts.filter((product) => product.product_type === 'c2c');
      if (c2cProducts.length > 0) {
        setProducts((prev) => mergeProductsById(prev.filter((p) => p.status !== 'active'), c2cProducts));
      }
      if (livePosts && livePosts.length > 0) setCommunityPosts(livePosts);
      setIsSupabaseLive(true);
      addToast(
        'Supabase Sincronizado',
        `Carregados ${c2cProducts.length} anúncios C2C e ${livePosts?.length || 0} publicações da comunidade.`,
        'success'
      );
      return { success: true, count: c2cProducts.length + (livePosts?.length || 0) };
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
    addToast('Sessão Super Admin', 'Conectado como Administrador da plataforma.', 'success');
  }, [addToast]);

  // Auth: Email Login
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    manualAuthRef.current = true;
    let res: Awaited<ReturnType<typeof AuthService.loginWithEmail>>;
    try {
      res = await AuthService.loginWithEmail(email, pass);
    } finally {
      manualAuthRef.current = false;
    }
    if (res.success && res.data) {
      const profile = res.data;
      setUser(profile);
      if (!isSupabaseConfigured) {
        setAllUsers((prev) => {
          const exists = prev.some((p) => p.email.toLowerCase() === profile.email.toLowerCase());
          return exists ? prev.map((p) => (p.email.toLowerCase() === profile.email.toLowerCase() ? profile : p)) : [profile, ...prev];
        });
      }
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
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    manualAuthRef.current = true;
    let res: Awaited<ReturnType<typeof AuthService.signUpWithEmail>>;
    try {
      res = await AuthService.signUpWithEmail(email, pass, name);
    } finally {
      manualAuthRef.current = false;
    }
    if (res.success && res.data) {
      const profile = res.data;
      setUser(profile);
      if (!isSupabaseConfigured) setAllUsers((prev) => [profile, ...prev]);
      addToast('Conta Criada', `Bem-vindo ao CoreMotion, ${name}! (${profile.role === 'admin' ? 'Administrador' : 'Usuário'})`, 'success');
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
    resetPrivateState();
    setActiveView('home');
    addToast('Sessão Encerrada', 'Você saiu da sua conta com segurança.', 'info');
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    let saved: Partial<UserProfile> = data;
    if (isSupabaseConfigured) {
      const res = await AuthService.updateProfile(user.id, data);
      if (!res.success) {
        addToast('Perfil não salvo', res.error || 'Não foi possível salvar as alterações.', 'error');
        return;
      }
      if (res.user) saved = res.user;
    }
    setUser((prev) => (prev ? { ...prev, ...saved } : null));
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...saved } : u)));
    addToast('Perfil Salvo', 'Suas informações foram atualizadas.', 'success');
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selected_size?: string) => {
    if (product.product_type !== 'c2c') {
      addToast('Oferta externa', 'Ofertas B2C ficam fora do carrinho e do checkout C2C.', 'info');
      return;
    }
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
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
  }): Promise<Order> => {
    if (cart.some((item) => item.product.product_type !== 'c2c')) {
      throw new Error('O checkout está disponível somente para anúncios C2C.');
    }
    if (isSupabaseConfigured && !user) {
      throw new Error('Entre na sua conta para finalizar a compra.');
    }
    // Totais seguem lib/checkout.ts; o banco recalcula o pedido ao gravar.
    const totals = calculateCheckoutTotals(
      cartTotal,
      data.shippingMethod,
      data.paymentMethod === 'pix' ? 'pix' : data.paymentMethod === 'boleto' ? 'boleto' : 'credit_card'
    );

    const res = await OrderService.createOrder({
      userId: user?.id,
      userEmail: user?.email || data.address.phone,
      items: [...cart],
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      discount: totals.discount,
      total: totals.total,
      paymentMethod: data.paymentMethod,
      shippingAddress: data.address,
      shippingMethod: data.shippingMethod,
    });

    // C8: sem confirmação do servidor não existe pedido nem pagamento; o carrinho é mantido.
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Não foi possível registrar o pedido. Tente novamente.');
    }
    const newOrder = res.data;
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  /** Pagamento simulado (equipe): o valor fica retido em custódia (escrow_locked), igual ao que o banco grava. */
  const confirmPaymentSandbox = async (orderId: string) => {
    if (!hasCapability(user?.role, 'orders.manage')) {
      addToast('Acesso Negado', 'Seu papel não pode confirmar pagamentos.', 'error');
      return;
    }
    const result = await OrderService.confirmPaymentSandbox(orderId);
    if (!result.success) {
      addToast('Pagamento não confirmado', result.error || 'Não foi possível confirmar o pagamento.', 'error');
      return;
    }
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, payment_status: 'paid', order_status: 'escrow_locked' } : ord))
    );
    addToast('Pagamento Confirmado', `Pedido ${orderId} confirmado com sucesso.`, 'success');
  };

  // Products CRUD (com o banco ativo, o estado local só muda depois da confirmação do servidor)
  const createProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>
  ): Promise<Product> => {
    if (productData.product_type !== 'c2c') {
      const error = new Error('Produtos B2C são exibidos como ofertas externas e não podem ser publicados como anúncios internos.');
      addToast('Tipo de anúncio indisponível', error.message, 'error');
      throw error;
    }
    let newProduct: Product;
    try {
      newProduct = (await ProductService.createProduct(productData, user?.id)).data;
    } catch (err: unknown) {
      addToast('Anúncio não publicado', errorText(err, 'Não foi possível publicar o anúncio.'), 'error');
      throw err;
    }

    setProducts((prev) => [newProduct, ...prev]);
    addToast('Anúncio Publicado', `O produto "${newProduct.title}" está disponível no Marketplace.`, 'success');
    return newProduct;
  };

  const updateProduct = async (id: string, data: Partial<Product>): Promise<void> => {
    let saved: Product | undefined;
    if (isSupabaseConfigured) {
      const result = await ProductService.updateProduct(id, data);
      if (!result.success) {
        addToast('Anúncio não atualizado', result.error || 'Não foi possível salvar as alterações.', 'error');
        return;
      }
      saved = result.product;
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? saved ?? { ...p, ...data } : p)));
    addToast('Produto Atualizado', 'As alterações foram salvas com sucesso.', 'success');
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const result = await ProductService.deleteProduct(id);
      if (!result.success) {
        addToast('Anúncio não excluído', result.error || 'Não foi possível excluir o anúncio.', 'error');
        return;
      }
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    addToast('Produto Removido', 'O anúncio foi excluído.', 'info');
  };

  // Community
  const requireLogin = (message: string): boolean => {
    if (user) return true;
    addToast('Entre na sua conta', message, 'info');
    setAuthModalMode('login');
    setAuthModalOpen(true);
    return false;
  };

  const createCommunityPost = async (post: {
    title: string;
    content: string;
    category: CommunityPost['category'];
    image_url?: string;
  }): Promise<boolean> => {
    if (isSupabaseConfigured && !requireLogin('É preciso estar autenticado para publicar na comunidade.')) return false;

    const badge = user?.role === 'admin' ? 'Admin' : user?.role === 'seller' ? 'Anunciante' : 'Atleta';
    const res = await CommunityService.createPost(
      {
        ...post,
        author_name: user?.name || 'Atleta CoreMotion',
        author_avatar: user?.avatar_url,
        author_badge: badge,
      },
      user?.id
    );

    let newPost: CommunityPost;
    if (res.success && res.data) {
      newPost = res.data;
    } else if (!isSupabaseConfigured) {
      newPost = {
        id: `post-${Date.now()}`,
        author_id: user?.id || 'anon',
        author_name: user?.name || 'Atleta CoreMotion',
        author_avatar: user?.avatar_url,
        author_badge: badge,
        category: post.category,
        title: post.title,
        content: post.content,
        image_url: post.image_url,
        likes_count: 0,
        comments_count: 0,
        comments: [],
        created_at: new Date().toISOString(),
      };
    } else {
      addToast('Publicação não criada', res.error || 'Não foi possível publicar. Tente novamente.', 'error');
      return false;
    }

    setCommunityPosts((prev) => [newPost, ...prev]);
    addToast('Publicação Criada', 'Sua postagem está visível para a comunidade esportiva.', 'success');
    return true;
  };

  const likeCommunityPost = async (postId: string): Promise<void> => {
    if (!requireLogin('Entre para curtir publicações da comunidade.')) return;
    const result = await CommunityService.likePost(postId);
    if (!result.success) {
      addToast('Curtida não registrada', result.error || 'Tente novamente.', 'error');
      return;
    }
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: result.likes_count ?? p.likes_count + 1 } : p))
    );
  };

  const addCommunityComment = async (postId: string, content: string): Promise<void> => {
    if (!requireLogin('Entre para comentar nas publicações da comunidade.')) return;
    const comment = {
      id: `comm-${Date.now()}`,
      author_name: user?.name || 'Atleta',
      author_avatar: user?.avatar_url,
      content,
      created_at: new Date().toISOString(),
    };
    const result = await CommunityService.addComment(postId, comment);
    if (!result.success) {
      addToast('Comentário não enviado', result.error || 'Tente novamente.', 'error');
      return;
    }
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

  const reportCommunityPost = async (postId: string, reason: string): Promise<void> => {
    if (!requireLogin('É preciso estar autenticado para denunciar uma publicação.')) return;
    const result = await CommunityService.reportPost(postId, reason);
    if (!result.success) {
      addToast('Denúncia não gravada', result.error || 'Tente novamente.', 'error');
      return;
    }
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_reported: true, report_reason: reason } : p))
    );
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

  // --- GESTÃO DE OFERTAS EXTERNAS & AFILIADOS (ADMIN / SUPERVISOR) ---
  const persistOffersLocally = (next: ExternalOffer[]) => {
    setOffers(next);
    try {
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  const activeOffers = offers.filter((offer) => offer.is_active !== false);

  const addOffer = async (input: OfferCreateInput): Promise<ExternalOffer | null> => {
    if (!isStaffRole(user?.role)) {
      addToast('Acesso restrito', 'Somente administradores podem cadastrar ofertas.', 'error');
      return null;
    }

    if (isSupabaseConfigured) {
      try {
        const res = await authedFetch('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (res.ok && data.offer) {
          persistOffersLocally([data.offer, ...offers]);
          addToast('Oferta publicada', `"${data.offer.title}" já está ativa na vitrine.`, 'success');
          return data.offer as ExternalOffer;
        }
        if (res.status !== 503) {
          addToast('Erro ao salvar oferta', data.error || 'Verifique os campos preenchidos.', 'error');
          return null;
        }
      } catch {
        // Fallback local caso rota esteja offline
      }
    }

    const created: ExternalOffer = {
      id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      store_name: input.store_name.trim(),
      category: input.category || 'Equipamentos',
      sport: input.sport || 'Corrida',
      price: Number(input.price),
      original_price: input.original_price ? Number(input.original_price) : undefined,
      image_url: input.image_url.trim(),
      source_url: input.source_url.trim(),
      coupon_code: input.coupon_code?.trim() || undefined,
      is_active: input.is_active ?? true,
      is_demo: false,
      created_at: new Date().toISOString(),
    };
    persistOffersLocally([created, ...offers]);
    addToast('Oferta publicada', `"${created.title}" já está ativa na vitrine.`, 'success');
    return created;
  };

  const updateOffer = async (id: string, input: OfferUpdateInput): Promise<boolean> => {
    if (!isStaffRole(user?.role)) {
      addToast('Acesso restrito', 'Somente administradores podem alterar ofertas.', 'error');
      return false;
    }

    if (isSupabaseConfigured) {
      try {
        const res = await authedFetch(`/api/offers?id=${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (res.ok && data.offer) {
          persistOffersLocally(offers.map((item) => (item.id === id ? data.offer : item)));
          addToast('Oferta atualizada', 'As alterações já estão visíveis no site.', 'success');
          return true;
        }
        if (res.status !== 503) {
          addToast('Erro ao atualizar', data.error || 'Não foi possível salvar as alterações.', 'error');
          return false;
        }
      } catch {
        // Fallback local
      }
    }

    const next = offers.map((item) =>
      item.id === id
        ? {
            ...item,
            ...(input.title !== undefined ? { title: input.title.trim() } : {}),
            ...(input.description !== undefined ? { description: input.description.trim() } : {}),
            ...(input.store_name !== undefined ? { store_name: input.store_name.trim() } : {}),
            ...(input.category !== undefined ? { category: input.category } : {}),
            ...(input.sport !== undefined ? { sport: input.sport } : {}),
            ...(input.price !== undefined ? { price: Number(input.price) } : {}),
            ...(input.original_price !== undefined
              ? { original_price: input.original_price ? Number(input.original_price) : undefined }
              : {}),
            ...(input.image_url !== undefined ? { image_url: input.image_url.trim() } : {}),
            ...(input.source_url !== undefined ? { source_url: input.source_url.trim() } : {}),
            ...(input.coupon_code !== undefined
              ? { coupon_code: input.coupon_code ? input.coupon_code.trim() : undefined }
              : {}),
            ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
            is_demo: false,
          }
        : item
    );
    persistOffersLocally(next);
    addToast('Oferta atualizada', 'As alterações já estão visíveis no site.', 'success');
    return true;
  };

  const deleteOffer = async (id: string): Promise<boolean> => {
    if (!isStaffRole(user?.role)) {
      addToast('Acesso restrito', 'Somente administradores podem excluir ofertas.', 'error');
      return false;
    }

    if (isSupabaseConfigured) {
      try {
        const res = await authedFetch(`/api/offers?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (!res.ok && res.status !== 503) {
          const data = await res.json().catch(() => ({}));
          addToast('Erro ao excluir', data.error || 'Não foi possível remover a oferta.', 'error');
          return false;
        }
      } catch {
        // Fallback local
      }
    }

    persistOffersLocally(offers.filter((item) => item.id !== id));
    if (editingOfferId === id) setEditingOfferId(null);
    addToast('Oferta removida', 'O item foi excluído da vitrine.', 'info');
    return true;
  };

  const toggleOfferActive = async (id: string, isActive: boolean): Promise<boolean> => {
    return updateOffer(id, { is_active: isActive });
  };

  const resetDefaultOffers = async (): Promise<void> => {
    if (!isStaffRole(user?.role)) return;
    if (isSupabaseConfigured) {
      try {
        const res = await authedFetch('/api/offers?action=reset', { method: 'POST' });
        const data = await res.json();
        if (res.ok && Array.isArray(data.offers)) {
          persistOffersLocally(data.offers);
          addToast('Catálogo restaurado', 'As ofertas iniciais reais foram restauradas.', 'success');
          return;
        }
      } catch {
        // Fallback local
      }
    }
    persistOffersLocally(INITIAL_EXTERNAL_OFFERS);
    addToast('Catálogo restaurado', 'As ofertas iniciais reais foram restauradas.', 'success');
  };

  const fetchOfferMetadata = async (url: string) => {
    if (!url.trim()) return null;
    try {
      const res = await authedFetch('/api/offers/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.metadata) return data.metadata;
      }
    } catch {
      // Fallback client detection below
    }
    try {
      const hostname = new URL(url.trim()).hostname.toLowerCase();
      if (hostname.includes('aliexpress')) return { store_name: 'AliExpress' };
      if (hostname.includes('mercadolivre') || hostname.includes('mercadolibre')) return { store_name: 'Mercado Livre' };
      if (hostname.includes('amazon') || hostname.includes('amzn.to')) return { store_name: 'Amazon Brasil' };
      if (hostname.includes('shopee')) return { store_name: 'Shopee' };
      if (hostname.includes('netshoes')) return { store_name: 'Netshoes' };
      if (hostname.includes('centauro')) return { store_name: 'Centauro' };
      if (hostname.includes('decathlon')) return { store_name: 'Decathlon' };
      return { store_name: hostname.replace(/^www\./, '').split('.')[0] };
    } catch {
      return null;
    }
  };

  return (
    <CoreMotiomContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedProduct,
        setSelectedProduct,
        isAuthModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        prefillAuthEmail,
        setPrefillAuthEmail,
        hasEnteredPlatform,
        enterPlatform,
        openWelcomePage,
        isCheckoutOpen,
        setCheckoutOpen,
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
        offers,
        activeOffers,
        editingOfferId,
        setEditingOfferId,
        addOffer,
        updateOffer,
        deleteOffer,
        toggleOfferActive,
        resetDefaultOffers,
        fetchOfferMetadata,
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
