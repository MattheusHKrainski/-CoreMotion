-- ==============================================================
-- CORE MOTIOM - SUPABASE PRODUCTION ARCHITECTURE & RLS MIGRATION
-- Migration: 20250101000000_coremotiom_initial_schema.sql
-- Description: Core schema, tables, triggers, indexes and RLS policies
-- ==============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE: PROFILES (Synchronized with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'merchant', 'seller', 'user')),
    city TEXT DEFAULT 'São Paulo',
    state TEXT DEFAULT 'SP',
    sport_interests TEXT[] DEFAULT ARRAY['Corrida', 'Alta Performance'],
    store_id UUID,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. HELPER FUNCTION: is_admin()
-- Master admin definition strictly matching mattheusxmljz@gmail.com or role = 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    (COALESCE(auth.jwt()->>'email', '') = 'mattheusxmljz@gmail.com')
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND (role = 'admin' OR LOWER(email) = 'mattheusxmljz@gmail.com')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. TABLE: STORES (Official B2C Partner Stores)
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    category TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected')),
    verification_requested_at TIMESTAMPTZ,
    verification_docs JSONB DEFAULT '{}'::jsonb,
    cnpj TEXT,
    business_type TEXT DEFAULT 'store',
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    location TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    sales_count INT DEFAULT 0,
    products_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLE: PRODUCTS (Hybrid B2C Store and C2C Athlete Listings)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2),
    category TEXT NOT NULL,
    sport TEXT NOT NULL,
    condition TEXT NOT NULL DEFAULT 'novo',
    product_type TEXT NOT NULL DEFAULT 'c2c' CHECK (product_type IN ('b2c', 'c2c')),
    images TEXT[] NOT NULL DEFAULT '{}',
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
    brand TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLE: ORDERS & TRANSACTIONS (PIX / Escrow / Sandbox)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL,
    shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'paid', 'cancelled', 'refunded')),
    pix_code TEXT,
    pix_qr_base64 TEXT,
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    shipping_method TEXT NOT NULL DEFAULT 'pac',
    order_status TEXT DEFAULT 'pending_payment' CHECK (order_status IN ('pending_payment', 'escrow_locked', 'preparing', 'shipped', 'delivered', 'completed', 'cancelled')),
    tracking_code TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLE: COMMUNITY POSTS
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. INDEXES FOR HIGH-THROUGHPUT SEARCH
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sport ON public.products(sport);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores(verification_status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_community_category ON public.community_posts(category);

-- 9. AUTOMATIC TRIGGER FOR AUTH.USERS -> PUBLIC.PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
  user_name TEXT;
BEGIN
  -- Super Admin email check
  IF LOWER(NEW.email) = 'mattheusxmljz@gmail.com' OR LOWER(NEW.email) LIKE 'mattheusxmljz%' THEN
    assigned_role := 'admin';
  ELSIF (NEW.raw_user_meta_data->>'role') IN ('admin', 'merchant', 'seller', 'user') THEN
    assigned_role := NEW.raw_user_meta_data->>'role';
    IF assigned_role = 'merchant' THEN
      assigned_role := 'seller';
    END IF;
  ELSE
    assigned_role := 'user';
  END IF;

  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar_url,
    role,
    city,
    state,
    sport_interests,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'),
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'city', 'São Paulo'),
    COALESCE(NEW.raw_user_meta_data->>'state', 'SP'),
    ARRAY['Corrida', 'Alta Performance'],
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    role = CASE 
      WHEN LOWER(EXCLUDED.email) = 'mattheusxmljz@gmail.com' OR LOWER(EXCLUDED.email) LIKE 'mattheusxmljz%' THEN 'admin' 
      ELSE public.profiles.role 
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- Stores Policies
DROP POLICY IF EXISTS "stores_select_policy" ON public.stores;
CREATE POLICY "stores_select_policy" ON public.stores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "stores_insert_policy" ON public.stores;
CREATE POLICY "stores_insert_policy" ON public.stores
  FOR INSERT WITH CHECK (auth.uid() = owner_id OR public.is_admin() OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "stores_update_policy" ON public.stores;
CREATE POLICY "stores_update_policy" ON public.stores
  FOR UPDATE USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "stores_delete_policy" ON public.stores;
CREATE POLICY "stores_delete_policy" ON public.stores
  FOR DELETE USING (auth.uid() = owner_id OR public.is_admin());

-- Products Policies
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
CREATE POLICY "products_select_policy" ON public.products
  FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR public.is_admin());

DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
CREATE POLICY "products_insert_policy" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = seller_id OR public.is_admin() OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "products_update_policy" ON public.products;
CREATE POLICY "products_update_policy" ON public.products
  FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin());

DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
CREATE POLICY "products_delete_policy" ON public.products
  FOR DELETE USING (auth.uid() = seller_id OR public.is_admin());

-- Orders Policies
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
CREATE POLICY "orders_select_policy" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
CREATE POLICY "orders_insert_policy" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;
CREATE POLICY "orders_update_policy" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_delete_policy" ON public.orders;
CREATE POLICY "orders_delete_policy" ON public.orders
  FOR DELETE USING (public.is_admin());

-- Community Policies
DROP POLICY IF EXISTS "community_select_policy" ON public.community_posts;
CREATE POLICY "community_select_policy" ON public.community_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_insert_policy" ON public.community_posts;
CREATE POLICY "community_insert_policy" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id OR public.is_admin() OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "community_update_policy" ON public.community_posts;
CREATE POLICY "community_update_policy" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "community_delete_policy" ON public.community_posts;
CREATE POLICY "community_delete_policy" ON public.community_posts
  FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- 11. PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
