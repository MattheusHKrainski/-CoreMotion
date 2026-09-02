import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if valid credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20 &&
  !supabaseUrl.includes('MY_SUPABASE_URL')
);

// Graceful client initialization (prevents "Your project's URL and API key are required" crashes)
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Error initializing Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

// Complete SQL Schema and Row Level Security (RLS) template for Supabase
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- CORE MOTIOM - SUPABASE PRODUCTION DATABASE SCHEMA & RLS
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('visitor', 'user', 'seller', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role user_role DEFAULT 'user',
    city TEXT,
    state TEXT,
    sport_interests TEXT[],
    store_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    category TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'none',
    verification_requested_at TIMESTAMP WITH TIME ZONE,
    verification_docs JSONB,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    location TEXT,
    rating NUMERIC(3,2) DEFAULT 5.0,
    sales_count INT DEFAULT 0,
    products_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PRODUCTS TABLE (B2C & C2C)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2),
    category TEXT NOT NULL,
    sport TEXT NOT NULL,
    condition TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('b2c', 'c2c')),
    images TEXT[] NOT NULL,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    seller_avatar TEXT,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    store_name TEXT,
    is_verified_store BOOLEAN DEFAULT false,
    stock INT DEFAULT 1,
    views INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    location TEXT,
    shipping_available BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'sold', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    shipping_fee NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    pix_code TEXT,
    shipping_address JSONB NOT NULL,
    shipping_method TEXT NOT NULL,
    order_status TEXT DEFAULT 'pending_payment',
    tracking_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_badge TEXT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    comments JSONB DEFAULT '[]'::jsonb,
    is_reported BOOLEAN DEFAULT false,
    report_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, only owner or admin can update
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Stores: Anyone can view active stores, store owner can manage
CREATE POLICY "Stores are viewable by everyone." ON public.stores FOR SELECT USING (true);
CREATE POLICY "Users can create stores." ON public.stores FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Store owners can update their store." ON public.stores FOR UPDATE USING (auth.uid() = owner_id);

-- Products: Anyone can view active products, sellers can insert/update their products
CREATE POLICY "Active products are viewable by everyone." ON public.products FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "Users can insert their own products." ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their products." ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete their products." ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- Orders: Users can only view and manage their own orders
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community: Viewable by all, insert by authenticated users
CREATE POLICY "Posts viewable by everyone." ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts." ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts." ON public.community_posts FOR UPDATE USING (auth.uid() = author_id);
`;
