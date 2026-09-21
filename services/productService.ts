import { getSupabaseClient } from './supabaseClient';
import { Product, ProductCondition, ProductType } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/initial-data';

export interface ProductFilters {
  category?: string;
  sport?: string;
  condition?: ProductCondition;
  product_type?: ProductType;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  store_id?: string;
  seller_id?: string;
}

export class ProductService {
  /**
   * Fetches products from Supabase with optional filters.
   * Falls back to initial data gracefully if table is empty or offline.
   */
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const sb = getSupabaseClient();
    if (!sb) {
      return this.applyLocalFilters(INITIAL_PRODUCTS, filters);
    }

    try {
      let query = sb
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'active');
      }

      if (filters?.category && filters.category !== 'all' && filters.category !== 'Todos') {
        query = query.eq('category', filters.category);
      }

      if (filters?.sport && filters.sport !== 'all' && filters.sport !== 'Todos') {
        query = query.eq('sport', filters.sport);
      }

      if (filters?.condition) {
        query = query.eq('condition', filters.condition);
      }

      if (filters?.product_type) {
        query = query.eq('product_type', filters.product_type);
      }

      if (filters?.store_id) {
        query = query.eq('store_id', filters.store_id);
      }

      if (filters?.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.search && filters.search.trim()) {
        const term = `%${filters.search.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term},brand.ilike.${term}`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[ProductService] Supabase error, fallback:', error.message);
        return this.applyLocalFilters(INITIAL_PRODUCTS, filters);
      }

      if (!data || data.length === 0) {
        // Return empty array if database has 0 matching products
        return [];
      }

      return data.map(this.mapDbProductToModel);
    } catch (err) {
      console.warn('[ProductService] Unexpected error, fallback:', err);
      return this.applyLocalFilters(INITIAL_PRODUCTS, filters);
    }
  }

  /**
   * Fetches single product by ID.
   */
  static async getProductById(id: string): Promise<Product | null> {
    const sb = getSupabaseClient();
    if (!sb) {
      return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
    }

    try {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
      }

      return this.mapDbProductToModel(data);
    } catch {
      return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
    }
  }

  /**
   * Creates a new hybrid product (B2C or C2C).
   */
  static async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>,
    sellerId?: string
  ): Promise<{ success: boolean; data?: Product; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Supabase indisponível.' };
    }

    try {
        const toUuid = (v?: string | null) => (v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? v : null);

        const payload: Record<string, unknown> = {
          title: productData.title,
          description: productData.description,
          price: productData.price,
          original_price: productData.original_price || null,
          category: productData.category,
          sport: productData.sport,
          condition: productData.condition || 'novo',
          product_type: productData.product_type || 'c2c',
          images: productData.images || [],
          seller_id: toUuid(sellerId || productData.seller_id),
          seller_name: productData.seller_name || 'Atleta CoreMotiom',
          seller_avatar: productData.seller_avatar || null,
          store_id: toUuid(productData.store_id),
          store_name: productData.store_name || null,
        is_verified_store: Boolean(productData.is_verified_store),
        stock: productData.stock ?? 1,
        location: productData.location || 'São Paulo, SP',
        shipping_available: productData.shipping_available ?? true,
        status: productData.status || 'active',
        brand: productData.brand || null,
        tags: productData.tags || [],
      };

      const { data, error } = await sb
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: this.mapDbProductToModel(data) };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Updates an existing product.
   */
  static async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<{ success: boolean; data?: Product; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: false, error: 'Supabase indisponível' };

    try {
      const { data, error } = await sb
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: this.mapDbProductToModel(data) };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Deletes a product.
   */
  static async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: false, error: 'Supabase indisponível' };

    try {
      const { error } = await sb.from('products').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Maps Database snake_case to Client Product model.
   */
  private static mapDbProductToModel(dbRow: any): Product {
    return {
      id: String(dbRow.id),
      title: dbRow.title || '',
      description: dbRow.description || '',
      price: Number(dbRow.price) || 0,
      original_price: dbRow.original_price ? Number(dbRow.original_price) : undefined,
      category: dbRow.category || 'Geral',
      sport: dbRow.sport || 'Multiesporte',
      condition: (dbRow.condition as ProductCondition) || 'novo',
      product_type: (dbRow.product_type as ProductType) || 'c2c',
      images: Array.isArray(dbRow.images) ? dbRow.images : [],
      seller_id: dbRow.seller_id ? String(dbRow.seller_id) : 'seller-official',
      seller_name: dbRow.seller_name || 'Vendedor',
      seller_avatar: dbRow.seller_avatar,
      store_id: dbRow.store_id ? String(dbRow.store_id) : undefined,
      store_name: dbRow.store_name,
      is_verified_store: Boolean(dbRow.is_verified_store),
      stock: Number(dbRow.stock) || 1,
      views: Number(dbRow.views) || 0,
      likes_count: Number(dbRow.likes_count) || 0,
      location: dbRow.location || 'Brasil',
      shipping_available: dbRow.shipping_available !== false,
      status: dbRow.status || 'active',
      created_at: dbRow.created_at || new Date().toISOString(),
      brand: dbRow.brand,
      tags: Array.isArray(dbRow.tags) ? dbRow.tags : [],
    };
  }

  private static applyLocalFilters(items: Product[], filters?: ProductFilters): Product[] {
    if (!filters) return items;
    return items.filter((p) => {
      if (filters.category && filters.category !== 'all' && filters.category !== 'Todos' && p.category !== filters.category) {
        return false;
      }
      if (filters.sport && filters.sport !== 'all' && filters.sport !== 'Todos' && p.sport !== filters.sport) {
        return false;
      }
      if (filters.condition && p.condition !== filters.condition) {
        return false;
      }
      if (filters.product_type && p.product_type !== filters.product_type) {
        return false;
      }
      if (filters.store_id && p.store_id !== filters.store_id) {
        return false;
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }
}
