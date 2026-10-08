export type UserRole = 'visitor' | 'user' | 'seller' | 'supervisor' | 'admin';

export interface UserProfile {
  id: string;
  supabase_id?: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  city?: string;
  state?: string;
  sport_interests?: string[];
  created_at: string;
  store_id?: string;
  is_banned?: boolean;
  ban_reason?: string;
  verified?: boolean;
}

export type ProductCondition = 'novo' | 'como_novo' | 'seminovo' | 'usado_excelente' | 'usado_bom';

export type ProductType = 'b2c' | 'c2c';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  sport: string;
  condition: ProductCondition;
  product_type: ProductType;
  images: string[];
  seller_id?: string | null;
  seller_name: string;
  seller_avatar?: string | null;
  store_id?: string | null;
  store_name?: string | null;
  is_verified_store?: boolean;
  stock: number;
  views?: number;
  likes_count?: number;
  location?: string | null;
  shipping_available?: boolean;
  status: 'active' | 'draft' | 'sold' | 'suspended';
  created_at: string;
  tags?: string[];
  brand?: string;
  rating?: number;
  reviews_count?: number;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  category: string;
  is_verified: boolean;
  verification_status: 'none' | 'pending' | 'verified' | 'rejected';
  verification_requested_at?: string;
  verification_docs?: {
    cnpj?: string;
    company_name?: string;
    website?: string;
    document_url?: string;
    notes?: string;
  };
  contact_email: string;
  contact_phone?: string;
  location?: string;
  rating: number;
  sales_count: number;
  products_count: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

/** Valores idênticos aos da coluna orders.order_status (migração SQL). */
export type OrderStatus =
  | 'pending_payment'
  | 'escrow_locked'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface ShippingAddress {
  recipient_name: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  items: CartItem[];
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  /** Valores idênticos aos da coluna orders.payment_status (migração SQL). */
  payment_status: 'pending' | 'approved' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  pix_code?: string;
  pix_qr_url?: string;
  pix_expires_at?: string;
  shipping_address: ShippingAddress;
  shipping_method: 'pac' | 'sedex' | 'express';
  order_status: OrderStatus;
  tracking_code?: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_badge?: string;
  category: 'treino' | 'equipamento' | 'evento' | 'duvida' | 'conquista';
  title: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  comments: {
    id: string;
    author_name: string;
    author_avatar?: string;
    content: string;
    created_at: string;
  }[];
  is_reported?: boolean;
  report_reason?: string;
  created_at: string;
}

export interface Coach {
  id: string;
  name: string;
  title: string;
  specialty: string;
  sports: string[];
  avatar_url: string;
  bio: string;
  rating: number;
  reviews_count: number;
  hourly_rate: number;
  location: string;
  is_certified: boolean;
  cref_number?: string;
  availability: string;
}

export interface Athlete {
  id: string;
  name: string;
  sport: string;
  category: string;
  avatar_url: string;
  bio: string;
  achievements: string[];
  location: string;
  sponsorship_status: 'seeking' | 'sponsored';
  instagram?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string;
  published_at: string;
  read_time: string;
  author: string;
}
