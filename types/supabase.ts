/**
 * CoreMotiom Supabase Generated Database Types
 * Generated representation of public schema tables, views, and functions.
 * Run `npm run types:supabase` to regenerate against local or remote Supabase instance.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          phone: string | null;
          role: 'admin' | 'merchant' | 'seller' | 'user';
          city: string | null;
          state: string | null;
          sport_interests: string[] | null;
          store_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          phone?: string | null;
          role?: 'admin' | 'merchant' | 'seller' | 'user';
          city?: string | null;
          state?: string | null;
          sport_interests?: string[] | null;
          store_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          role?: 'admin' | 'merchant' | 'seller' | 'user';
          city?: string | null;
          state?: string | null;
          sport_interests?: string[] | null;
          store_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          category: string;
          is_verified: boolean;
          verification_status: 'none' | 'pending' | 'verified' | 'rejected';
          verification_requested_at: string | null;
          verification_docs: Json | null;
          cnpj: string | null;
          business_type: string | null;
          contact_email: string;
          contact_phone: string | null;
          location: string | null;
          rating: number;
          sales_count: number;
          products_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          category: string;
          is_verified?: boolean;
          verification_status?: 'none' | 'pending' | 'verified' | 'rejected';
          verification_requested_at?: string | null;
          verification_docs?: Json | null;
          cnpj?: string | null;
          business_type?: string | null;
          contact_email: string;
          contact_phone?: string | null;
          location?: string | null;
          rating?: number;
          sales_count?: number;
          products_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          category?: string;
          is_verified?: boolean;
          verification_status?: 'none' | 'pending' | 'verified' | 'rejected';
          verification_requested_at?: string | null;
          verification_docs?: Json | null;
          cnpj?: string | null;
          business_type?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          location?: string | null;
          rating?: number;
          sales_count?: number;
          products_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          original_price: number | null;
          category: string;
          sport: string;
          condition: string;
          product_type: 'b2c' | 'c2c';
          images: string[];
          seller_id: string | null;
          seller_name: string;
          seller_avatar: string | null;
          store_id: string | null;
          store_name: string | null;
          is_verified_store: boolean;
          stock: number;
          views: number;
          likes_count: number;
          location: string | null;
          shipping_available: boolean;
          status: 'active' | 'draft' | 'sold' | 'suspended';
          brand: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          original_price?: number | null;
          category: string;
          sport: string;
          condition?: string;
          product_type?: 'b2c' | 'c2c';
          images?: string[];
          seller_id?: string | null;
          seller_name: string;
          seller_avatar?: string | null;
          store_id?: string | null;
          store_name?: string | null;
          is_verified_store?: boolean;
          stock?: number;
          views?: number;
          likes_count?: number;
          location?: string | null;
          shipping_available?: boolean;
          status?: 'active' | 'draft' | 'sold' | 'suspended';
          brand?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          original_price?: number | null;
          category?: string;
          sport?: string;
          condition?: string;
          product_type?: 'b2c' | 'c2c';
          images?: string[];
          seller_id?: string | null;
          seller_name?: string;
          seller_avatar?: string | null;
          store_id?: string | null;
          store_name?: string | null;
          is_verified_store?: boolean;
          stock?: number;
          views?: number;
          likes_count?: number;
          location?: string | null;
          shipping_available?: boolean;
          status?: 'active' | 'draft' | 'sold' | 'suspended';
          brand?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string;
          items: Json;
          subtotal: number;
          shipping_fee: number;
          discount: number;
          total: number;
          payment_method: string;
          payment_status: 'pending' | 'approved' | 'paid' | 'cancelled' | 'refunded';
          pix_code: string | null;
          pix_qr_base64: string | null;
          shipping_address: Json;
          shipping_method: string;
          order_status: 'pending_payment' | 'escrow_locked' | 'preparing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
          tracking_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email: string;
          items?: Json;
          subtotal: number;
          shipping_fee?: number;
          discount?: number;
          total: number;
          payment_method: string;
          payment_status?: 'pending' | 'approved' | 'paid' | 'cancelled' | 'refunded';
          pix_code?: string | null;
          pix_qr_base64?: string | null;
          shipping_address?: Json;
          shipping_method?: string;
          order_status?: 'pending_payment' | 'escrow_locked' | 'preparing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
          tracking_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_email?: string;
          items?: Json;
          subtotal?: number;
          shipping_fee?: number;
          discount?: number;
          total?: number;
          payment_method?: string;
          payment_status?: 'pending' | 'approved' | 'paid' | 'cancelled' | 'refunded';
          pix_code?: string | null;
          pix_qr_base64?: string | null;
          shipping_address?: Json;
          shipping_method?: string;
          order_status?: 'pending_payment' | 'escrow_locked' | 'preparing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
          tracking_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: string;
          author_id: string | null;
          author_name: string;
          author_avatar: string | null;
          author_badge: string | null;
          category: string;
          title: string;
          content: string;
          image_url: string | null;
          likes_count: number;
          comments_count: number;
          comments: Json | null;
          is_reported: boolean;
          report_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          author_name: string;
          author_avatar?: string | null;
          author_badge?: string | null;
          category: string;
          title: string;
          content: string;
          image_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          comments?: Json | null;
          is_reported?: boolean;
          report_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          author_name?: string;
          author_avatar?: string | null;
          author_badge?: string | null;
          category?: string;
          title?: string;
          content?: string;
          image_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          comments?: Json | null;
          is_reported?: boolean;
          report_reason?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
