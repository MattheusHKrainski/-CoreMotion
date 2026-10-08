// ============================================================================
// CORE MOTIOM — TIPOS DO ESTADO GLOBAL
// Cada "fatia" (slice) abaixo corresponde a um hook em lib/store/.
// ============================================================================

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
} from '../types';

export interface Toast {
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

// UI: navegação, modais, busca e notificações
export interface UiSlice {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  selectedStore: Store | null;
  setSelectedStore: (s: Store | null) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot' | 'switch' | 'reset';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot' | 'switch' | 'reset') => void;
  isCheckoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  isCreateStoreModalOpen: boolean;
  setCreateStoreModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toasts: Toast[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

// Autenticação: Supabase como único backend (sem fallback local)
export interface AuthResult {
  success: boolean;
  error?: string;
  /** Mensagem informativa para a UI (ex.: link de confirmação enviado) */
  info?: string;
}

export interface AuthSlice {
  user: UserProfile | null;
  role: UserRole;
  isVisitor: boolean;
  isAuthenticated: boolean;
  isSupabaseLive: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
}

// Carrinho, pedidos/checkout e favoritos
export interface CartSlice {
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
  favorites: string[];
  toggleFavorite: (productId: string) => void;
}

// Catálogo: produtos, lojas, comunidade e conteúdo estático
export interface CatalogSlice {
  products: Product[];
  createProduct: (product: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  stores: Store[];
  createStore: (storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'sales_count' | 'products_count' | 'is_verified' | 'verification_status'>) => Promise<Store>;
  requestStoreVerification: (storeId: string, docs: NonNullable<Store['verification_docs']>) => Promise<void>;
  adminVerifyStore: (storeId: string, approve: boolean, notes?: string) => Promise<void>;
  communityPosts: CommunityPost[];
  createCommunityPost: (post: { title: string; content: string; category: CommunityPost['category']; image_url?: string }) => void;
  likeCommunityPost: (postId: string) => void;
  addCommunityComment: (postId: string, content: string) => void;
  reportCommunityPost: (postId: string, reason: string) => void;
  adminDeleteCommunityPost: (postId: string) => void;
  coaches: Coach[];
  athletes: Athlete[];
  news: NewsArticle[];
}

export type CoreMotiomContextType = UiSlice & AuthSlice & CartSlice & CatalogSlice;
