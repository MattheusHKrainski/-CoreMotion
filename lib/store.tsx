'use client';
import { accountListsKey, readAccountLists } from './account-lists';
import { MULTI_STORE_STORAGE_MARKER } from '@/fixtures/multi-store-offers';
import { ADMIN_LOGIN_EMAIL } from './admin-account';
import { readSavedAdminProfile } from './admin-session';
import { quickStorageKey } from './quick-access';
import { isAccountRemembered, rememberCurrentAccount, restoreSavedAccount, rotateSavedSession, savedAccountVault } from '@/services/savedAccounts';
import { detachRememberedSession } from '@/services/supabaseClient';
import { type AccountType } from './sports';

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
import { appendExpansionOffers, appendMultiStoreOffers, refreshLegacyOffers } from './offer-catalog';
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
  | 'admin'
  | 'trials'
  | 'talents'
  | 'sports-profile'
  | 'sports-activity';

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
  authAccountType: AccountType;
  setAuthAccountType: (type: AccountType) => void;
  resumeAdminSession: () => Promise<boolean>;
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
  adminSyncSupabase: (silent?: boolean) => Promise<{ success: boolean; count?: number; error?: string }>;
  loginAsMasterAdmin: () => void;
  loginWithEmail: (email: string, pass: string, remember?: boolean) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  signUpWithEmail: (email: string, pass: string, name: string, accountType?: AccountType, sport?: string, remember?: boolean) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  loginSavedAccount: (id: string) => Promise<{ success: boolean; error?: string; email?: string; requiresLogin?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole, accountType?: AccountType) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;

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
  likedCommunityPosts: string[];
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

const LOCAL_STORAGE_KEY = quickStorageKey('coremotiom_state_v1');
const OFFERS_STORAGE_KEY = quickStorageKey('coremotion_managed_offers_v1');
const ENTERED_SESSION_KEY = quickStorageKey('coremotion_entered_session_v2');

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
  const [isAuthModalOpen, setAuthModalOpenState] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'switch'>('login');
  const [authAccountType, setAuthAccountType] = useState<AccountType>('casual');
  const [prefillAuthEmail, setPrefillAuthEmail] = useState('');
  const [hasEnteredPlatform, setHasEnteredPlatform] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isSupabaseConfigOpen, setSupabaseConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('entrar') === '1') {
      setHasEnteredPlatform(false);
      setAuthModalMode('login');
      setAuthModalOpenState(true);
      sessionStorage.removeItem(ENTERED_SESSION_KEY);
      window.history.replaceState(null, '', '/');
    }
  }, []);

  // Core entities with resilient initializers - SSR safe
  const [user, setUser] = useState<UserProfile | null>(null);
  // C9: estado inicial de demonstração só com NEXT_PUBLIC_DEMO_MODE=true (fixtures/); padrão: vazio.
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_MODE ? INITIAL_USERS : []);
  const [products, setProducts] = useState<Product[]>(isSupabaseConfigured ? [] : INITIAL_PRODUCTS.filter((product) => product.product_type === 'c2c'));
  const [offers, setOffers] = useState<ExternalOffer[]>(isSupabaseConfigured ? [] : INITIAL_EXTERNAL_OFFERS);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likedCommunityPosts, setLikedCommunityPosts] = useState<string[]>([]);
  const likesInFlight = useRef(new Set<string>());
  const likesReady = useRef(false);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(DEMO_MODE ? INITIAL_COMMUNITY_POSTS : []);
  const [coaches] = useState<Coach[]>(INITIAL_COACHES);
  const [athletes] = useState<Athlete[]>(INITIAL_ATHLETES);
  const [news] = useState<NewsArticle[]>(DEMO_MODE ? INITIAL_NEWS : []);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // userRef: o listener de auth lê o usuário atual sem ser recriado a cada mudança.
  // manualAuthRef: true durante login/cadastro manual, que já sincronizam o próprio perfil.
  const userRef = useRef<UserProfile | null>(null);
  const manualAuthRef = useRef(false);
  const authGeneration = useRef(0);
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

  const restoreAccountLists = useCallback((id: string | null) => {
    try {
      const lists = readAccountLists(localStorage, id);
      setCart(lists.cart);
      setFavorites(lists.favorites);
    } catch { setCart([]); setFavorites([]); }
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
        if (savedOffers && isMounted && !isSupabaseConfigured) {
          const parsedOffers = JSON.parse(savedOffers);
          if (Array.isArray(parsedOffers)) {
            const refreshed = appendExpansionOffers(refreshLegacyOffers(parsedOffers), localStorage.getItem(quickStorageKey('coremotion_offers_expansion_2026_11_03')) === '1');
            const expanded = appendMultiStoreOffers(refreshed, localStorage.getItem(quickStorageKey(MULTI_STORE_STORAGE_MARKER)) === '1');
            setOffers(expanded);
            localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(expanded));
          }
        }

        localStorage.setItem(quickStorageKey('coremotion_offers_expansion_2026_11_03'), '1');
        localStorage.setItem(quickStorageKey(MULTI_STORE_STORAGE_MARKER), '1');

        if (isSupabaseConfigured) restoreAccountLists(null);
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (!isSupabaseConfigured && Array.isArray(parsed.cart)) setCart(parsed.cart.filter((item: CartItem) => item?.product?.product_type === 'c2c'));
          if (!isSupabaseConfigured && Array.isArray(parsed.favorites)) setFavorites(parsed.favorites);
          // Com o Supabase ativo a sessão vem do Auth: nunca restaurar usuário/pedidos do navegador.
          if (!isSupabaseConfigured) {
            if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
          }
        }

        // Sessions are restored only through Supabase Auth.

        // Prefer Supabase's public REST reads when configured; no separate SQL password is needed to read.
        if (isSupabaseConfigured) {
          const client = getSupabase();
          if (client) {
            const { data, error } = await client.from('external_offers').select('*').eq('is_active', true).order('created_at', { ascending: false });
            if (error) addToast('Ofertas indisponíveis', 'Não foi possível carregar as ofertas do Supabase.', 'error');
            else if (isMounted) setOffers(data || []);
          }
        } else {
          try {
            const response = await fetch('/api/offers');
            if (response.ok) {
              const data = await response.json();
              if (isMounted && Array.isArray(data.offers)) setOffers(data.offers);
            }
          } catch { /* local catalog remains available without a connected database */ }
        }

        const conn = await testSupabaseConnection();
        if (isMounted) setIsSupabaseLive(conn.connected);

        const [liveProducts, livePosts] = await Promise.all([
          ProductService.getProducts(),
          CommunityService.getPosts(),
        ]);

        if (isMounted) {
          if (isSupabaseConfigured) {
            // The database is authoritative, including empty results and older published listings.
            setProducts(liveProducts);
            setCommunityPosts(livePosts);
          }
          if (!isSupabaseConfigured && livePosts.length > 0) {
            const liveIds = new Set(livePosts.map((p) => p.id));
            setCommunityPosts([...livePosts, ...INITIAL_COMMUNITY_POSTS.filter((p) => !liveIds.has(p.id))]);
          }
        }
      } catch (err) {
        console.warn('[CoreMotiom] Error loading live database records:', err);
        if (isMounted && isSupabaseConfigured) addToast('Catálogo indisponível', 'Não foi possível carregar o conteúdo do Supabase. Tente recarregar a página.', 'error');
      }
    };

    void initData();

    const sb = isSupabaseConfigured ? getSupabase() : null;
    if (sb) {
      // Único ponto de restauração/entrada de sessão (INITIAL_SESSION cobre o F5; SIGNED_IN cobre o OAuth).
      // O Supabase não pode ser chamado dentro do callback (deadlock): o sync roda em setTimeout.
      const { data } = sb.auth.onAuthStateChange((event, session) => {
        if (session) rotateSavedSession(session);
        if (event === 'SIGNED_OUT') {
          userRef.current = null;
          setHasEnteredPlatform(false);
          setAuthModalMode('login');
          setAuthModalOpenState(true);
          try { sessionStorage.removeItem(ENTERED_SESSION_KEY); } catch {}
          setUser(null);
          resetPrivateState();
          restoreAccountLists(null);
          return;
        }
        if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') return;
        const sessionUser = session?.user;
        if (!sessionUser || manualAuthRef.current || userRef.current?.id === sessionUser.id) return;

        const generation = authGeneration.current;
        setTimeout(async () => {
          const email = sessionUser.email || '';
          const result = await AuthService.getProfileOrCreate(sessionUser.id, email, {
            name: sessionUser.user_metadata?.name || sessionUser.user_metadata?.full_name || email.split('@')[0],
            avatar_url: sessionUser.user_metadata?.avatar_url,
            sport_interests: sessionUser.user_metadata?.sport ? [sessionUser.user_metadata.sport] : [],
          });
          if (!isMounted || manualAuthRef.current || generation !== authGeneration.current) return;
          if (result.success && result.data) {
            if (userRef.current?.id !== result.data.id) restoreAccountLists(result.data.id);
            userRef.current = result.data;
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
  }, [addToast, resetPrivateState, restoreAccountLists]);

  // Atualizações em tempo real para dados compartilhados. O RLS continua controlando as linhas visíveis.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const client = getSupabase();
    if (!client) return;
    let disposed = false;
    const refreshSharedData = async (table: 'products' | 'external_offers' | 'community_posts') => {
      try {
        if (table === 'products') {
          const rows = await ProductService.getProducts();
          if (!disposed) setProducts(rows);
        } else if (table === 'external_offers') {
          const { data, error } = await client.from('external_offers').select('*').eq('is_active', true).order('created_at', { ascending: false });
          if (!error && !disposed) setOffers(data || []);
        } else {
          const rows = await CommunityService.getPosts();
          if (!disposed) setCommunityPosts(rows);
        }
      } catch (error) { console.warn('[CoreMotion Realtime] Falha ao atualizar', table, error); }
    };
    const channel = client.channel('coremotion-live-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { void refreshSharedData('products'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'external_offers' }, () => { void refreshSharedData('external_offers'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => { void refreshSharedData('community_posts'); })
      .subscribe((status) => { if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') console.warn('[CoreMotion Realtime] Canal indisponível:', status); });
    return () => { disposed = true; void client.removeChannel(channel); };
  }, []);

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
          const { data, error } = await getSupabase()!.from('external_offers').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (!cancelled && data) setOffers(data.map(o => ({ ...o, is_demo: false })));

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

    void loadPrivateData().catch(err => { if (!cancelled) addToast('Dados não carregados', err instanceof Error ? err.message : 'Verifique sua conexão.', 'error'); });
    return () => {
      cancelled = true;
    };
  }, [userId, userRole, addToast]);

  // Persistência local: carrinho e favoritos sempre; sessão e pedidos apenas no modo demonstração sem banco.
  useEffect(() => {
    try {
      const payload = isSupabaseConfigured ? { cart, favorites } : { user, orders, cart, favorites };
      localStorage.setItem(isSupabaseConfigured ? accountListsKey(user?.id || null) : LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [user, orders, cart, favorites, products, communityPosts]);

  const sportsSessionId = user?.id;
  const sportsAccountType = user?.account_type;
  useEffect(() => {
    if (!sportsSessionId || !isSupabaseConfigured) return;
    let active = true;
    import('@/services/supabaseClient').then(async ({ getSupabaseClient }) => {
      const result = await getSupabaseClient()?.auth.getUser();
      const kind = result?.data.user?.user_metadata?.account_type;
      if (active && sportsAccountType !== kind && ['athlete', 'coach', 'casual'].includes(kind)) {
        setUser(current => current ? { ...current, account_type: kind } : current);
      }
    });
    return () => { active = false; };
  }, [sportsSessionId, sportsAccountType]);

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

  // Visitors authenticate over welcome. Signed-in users keep their current screen
  // and session when opening (or dismissing) the account selector.
  const setAuthModalOpen = useCallback((open: boolean) => {
    if (open && (!userRef.current || userRef.current.role === 'visitor')) {
      openWelcomePage();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    setAuthModalOpenState(open);
  }, [openWelcomePage]);

  // Role switching cannot create identities or change real account permissions.
  const switchRole = useCallback(() => {
    addToast('Entre na sua conta', 'As permissões são verificadas na conta autenticada.', 'info');
  }, [addToast]);

  // ---------------------------------------------------------------------------
  // Ações administrativas. Com o banco conectado, cada ação é gravada no servidor
  // (que revalida o papel) ANTES de alterar a tela. Sem banco (modo demonstração),
  // a alteração é somente local e isso é informado ao usuário.
  // ---------------------------------------------------------------------------
  const errorText = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

  const callUsersApi = useCallback(async (
    method: 'PATCH' | 'DELETE',
    payload: Record<string, unknown> = {},
    query = ''
  ): Promise<void> => {
    const sb = getSupabase();
    if (!sb) throw new Error('Conexão indisponível.');
    const targetId = method === 'DELETE' ? new URLSearchParams(query.replace(/^\?/, '')).get('userId') : payload.userId;
    const { error } = await sb.rpc('moderate_account', {
      p_target: targetId,
      p_action: method === 'DELETE' ? 'delete' : payload.action === 'updateRole' ? 'role' : payload.action,
      p_role: payload.newRole || null,
      p_account_type: allUsers.find(u => u.id === targetId)?.account_type || 'casual',
      p_reason: payload.reason || null,
    });
    if (error) throw new Error(error.message);
  }, [allUsers]);

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
  }, [user, addToast, callUsersApi]);

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
      if (userId === user?.id || !canDeleteTarget(user?.role, target?.email)) {
        addToast('Operação Não Permitida', 'Somente administradores podem excluir outras contas.', 'error');
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
    [user, allUsers, addToast, callUsersApi]
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
    [user, allUsers, addToast, callUsersApi]
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
    [user, allUsers, addToast, callUsersApi]
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

  const adminSyncSupabase = useCallback(async (silent = false) => {
    const actorId = userRef.current?.id;
    try {
      const client = getSupabase();
      if (!client) throw new Error('Conexão indisponível.');
      const [liveProducts, postsResult, ordersResult, usersResult, offersResult] = await Promise.all([
        ProductService.getProducts({ status: 'all' }),
        client.from('community_posts').select('*').order('created_at', { ascending: false }),
        client.from('orders').select('*').order('created_at', { ascending: false }),
        client.from('profiles').select('*').order('created_at', { ascending: false }),
        client.from('external_offers').select('*').order('created_at', { ascending: false }),
      ]);
      for (const result of [postsResult, ordersResult, usersResult, offersResult]) {
        if (result.error) throw new Error(result.error.message);
      }
      if (!actorId || userRef.current?.id !== actorId) throw new Error('A sessão mudou durante a consulta.');
      setProducts(liveProducts);
      setCommunityPosts((postsResult.data || []).map(CommunityService.mapDbPostToModel));
      setOrders(ordersResult.data || []);
      setAllUsers(usersResult.data || []);
      setOffers((offersResult.data || []).map(o => ({ ...o, is_demo: false })));
      setIsSupabaseLive(true);
      if (!silent) addToast('Dados atualizados', 'As consultas autenticadas foram concluídas.', 'success');
      return { success: true, count: liveProducts.length + (postsResult.data?.length || 0) };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao consultar o banco';
      setIsSupabaseLive(false);
      if (!silent) addToast('Atualização não concluída', msg, 'error');
      return { success: false, error: msg };
    }
  }, [addToast]);

  const loginAsMasterAdmin = useCallback(() => {
    window.location.assign('/?login=admin');
  }, []);


  const resumeAdminSession = useCallback(async () => {
    const sb = isSupabaseConfigured ? getSupabase() : null;
    if (!sb) return false;
    const profile = await readSavedAdminProfile(
      async () => {
        const { data, error } = await sb.auth.getUser();
        return error ? null : data.user;
      },
      async (id, email) => {
        const result = await AuthService.getProfileOrCreate(id, email);
        return result.success && result.data ? result.data : null;
      },
    );
    if (!profile) return false;
    if (userRef.current?.id !== profile.id) { resetPrivateState(); restoreAccountLists(profile.id); }
    userRef.current = profile;
    setUser(profile);
    enterPlatform('home');
    setAuthModalOpen(false);
    return true;
  }, [enterPlatform, setAuthModalOpen, resetPrivateState, restoreAccountLists]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('login') !== 'admin') return;
    let cancelled = false;
    void (async () => {
      if (await resumeAdminSession() || cancelled) return;
      setPrefillAuthEmail(ADMIN_LOGIN_EMAIL);
      setAuthModalMode('login');
      setAuthModalOpen(true);
    })();
    return () => { cancelled = true; };
  }, [setAuthModalOpen, resumeAdminSession]);

  // Auth: Email Login
  const loginWithEmail = async (email: string, pass: string, remember = false): Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }> => {
    authGeneration.current += 1;
    manualAuthRef.current = true;
    let res: Awaited<ReturnType<typeof AuthService.loginWithEmail>>;
    try {
      res = await AuthService.loginWithEmail(email, pass);
    } finally {
      manualAuthRef.current = false;
    }
    if (res.success && res.data) {
      const profile = res.data;
      if (remember || isAccountRemembered(profile.id)) {
        if (!await rememberCurrentAccount(profile)) addToast('Acesso rápido não salvo', 'Você entrou, mas o navegador não permitiu salvar a conta neste dispositivo.', 'info');
      }
      if (userRef.current?.id !== profile.id) { resetPrivateState(); restoreAccountLists(profile.id); }
      userRef.current = profile;
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
    name: string,
    accountType: AccountType = 'casual',
    sport?: string,
    remember = false
  ): Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }> => {
    if (accountType !== 'casual' && (!sport?.trim() || sport.trim().length > 60)) return { success: false, error: 'Escolha sua modalidade principal.' };
    authGeneration.current += 1;
    manualAuthRef.current = true;
    let res: Awaited<ReturnType<typeof AuthService.signUpWithEmail>>;
    try {
      res = await AuthService.signUpWithEmail(email, pass, name, accountType, sport);
    } finally {
      manualAuthRef.current = false;
    }
    if (res.confirmationRequired) return { success: true, confirmationRequired: true };
    if (res.success && res.data) {
      const profile = { ...res.data, account_type: accountType, sport_interests: sport ? [sport.trim()] : res.data.sport_interests };
      if (remember && !await rememberCurrentAccount(profile)) addToast('Acesso rápido não salvo', 'A conta foi criada, mas o navegador não permitiu salvá-la neste dispositivo.', 'info');
      if (userRef.current?.id !== profile.id) { resetPrivateState(); restoreAccountLists(profile.id); }
      userRef.current = profile;
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

  const loginSavedAccount = async (id: string) => {
    if (manualAuthRef.current) return { success: false, error: 'Aguarde a autenticação em andamento.' };
    authGeneration.current += 1;
    manualAuthRef.current = true;
    try {
      const result = await restoreSavedAccount(id);
      if (!result.success) return result;
      if (userRef.current?.id !== result.profile.id) { resetPrivateState(); restoreAccountLists(result.profile.id); }
      userRef.current = result.profile;
      setUser(result.profile);
      enterPlatform('home');
      setAuthModalOpen(false);
      addToast('Conta conectada', `Bem-vindo, ${result.profile.name}!`, 'success');
      return { success: true };
    } finally { manualAuthRef.current = false; }
  };

  // Remembered accounts retain their refresh session until removed or revoked.
  const logout = async () => {
    authGeneration.current += 1;
    const current = userRef.current;
    let remembered = false;
    try { remembered = Boolean(current && savedAccountVault().tokens(current.id)); } catch { /* storage denied */ }
    if (remembered && current) {
      await rememberCurrentAccount(current);
      try {
        await detachRememberedSession();
        try { sessionStorage.removeItem(ENTERED_SESSION_KEY); } catch { /* unavailable */ }
        window.location.assign('/?entrar=1');
        return;
      } catch {
        // Storage failure must never prevent leaving the account. Revoke below instead.
      }
    }
    userRef.current = null;
    await AuthService.signOut();
    setUser(null);
    resetPrivateState();
    setCart([]); setFavorites([]);
    openWelcomePage();
    setActiveView('home');
    setAuthModalMode('login');
    setAuthModalOpen(true);
    addToast('Sessão Encerrada', 'Você saiu da sua conta.', 'info');
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    let saved: Partial<UserProfile> = data;
    if (isSupabaseConfigured) {
      const res = await AuthService.updateProfile(user.id, data);
      if (!res.success) {
        addToast('Perfil não salvo', res.error || 'Não foi possível salvar as alterações.', 'error');
        return false;
      }
      if (res.user) saved = res.user;
    }
    setUser((prev) => (prev ? { ...prev, ...saved } : null));
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...saved } : u)));
    addToast('Perfil Salvo', 'Suas informações foram atualizadas.', 'success');
    return true;
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

  useEffect(() => {
    let active = true;
    likesReady.current = false;
    setLikedCommunityPosts([]);
    if (!user?.id) return;
    if (isSupabaseConfigured) {
      CommunityService.getMyLikes().then(ids => { if (active) { setLikedCommunityPosts(ids); likesReady.current = true; } }).catch(() => { if (active) addToast('Curtidas indisponíveis', 'Não foi possível carregar suas curtidas. Tente recarregar a página.', 'error'); });
    } else {
      try { const ids = JSON.parse(localStorage.getItem(quickStorageKey(`community_likes_${user.id}`)) || '[]'); setLikedCommunityPosts(Array.isArray(ids) ? ids : []); } catch { setLikedCommunityPosts([]); }
      likesReady.current = true;
    }
    return () => { active = false; };
  }, [user?.id, addToast]);

  const likeCommunityPost = async (postId: string): Promise<void> => {
    if (!requireLogin('Entre para curtir publicações da comunidade.')) return;
    if (!likesReady.current || likesInFlight.current.has(postId)) return;
    likesInFlight.current.add(postId);
    const liked = !likedCommunityPosts.includes(postId);
    try {
      const result = await CommunityService.likePost(postId, liked);
      if (!result.success) { addToast('Curtida não registrada', result.error || 'Tente novamente.', 'error'); return; }
      setLikedCommunityPosts(prev => {
        const next = liked ? [...new Set([...prev, postId])] : prev.filter(id => id !== postId);
        if (!isSupabaseConfigured && user) { try { localStorage.setItem(quickStorageKey(`community_likes_${user.id}`), JSON.stringify(next)); } catch { /* storage unavailable */ } }
        return next;
      });
      setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: result.likes_count ?? Math.max(0, p.likes_count + (liked ? 1 : -1)) } : p));
    } finally { likesInFlight.current.delete(postId); }
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
        const { data, error } = await getSupabase()!.from('external_offers').insert({ ...input, id: crypto.randomUUID(), created_by: user!.id }).select('*').single();
        if (error || !data) throw new Error(error?.message || 'Oferta não salva.');
        const saved = { ...data, is_demo: false } as ExternalOffer;
        persistOffersLocally([saved, ...offers]);
        addToast('Oferta publicada', saved.title, 'success');
        return saved;
      } catch (err) {
        addToast('Oferta não salva', errorText(err, 'Verifique sua conexão.'), 'error');
        return null;
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
        const { data, error } = await getSupabase()!.from('external_offers').update(input).eq('id', id).select('*').single();
        if (error || !data) throw new Error(error?.message || 'Oferta não encontrada ou sem permissão.');
        persistOffersLocally(offers.map(o => o.id === id ? { ...data, is_demo: false } as ExternalOffer : o));
        addToast('Oferta atualizada', 'Alterações salvas no banco.', 'success');
        return true;
      } catch (err) {
        addToast('Oferta não salva', errorText(err, 'Verifique sua conexão.'), 'error');
        return false;
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
        const { data, error } = await getSupabase()!.from('external_offers').delete().eq('id', id).select('id');
        if (error || !data?.length) throw new Error(error?.message || 'Oferta não encontrada ou sem permissão.');
      } catch (err) {
        addToast('Oferta não excluída', errorText(err, 'Verifique sua conexão.'), 'error');
        return false;
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
      addToast('Catálogo preservado', 'Edite ou remova ofertas individualmente. A restauração não substitui dados publicados.', 'info');
      return;
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
        authAccountType,
        setAuthAccountType,
        resumeAdminSession,
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
        loginSavedAccount,
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
        likedCommunityPosts,
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
