import { Product, ProductCondition, ProductType } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/fixtures/initial-data';
import { DEMO_MODE } from '@/lib/demo-mode';
import { authedFetch } from '@/lib/auth-fetch';
import { isSupabaseConfigured } from './supabaseClient';

interface ProductFilters {
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

/**
 * Modular service for B2C and official partner products.
 */
export class ProductService {
  /**
   * Fetches products from database via /api/products.
   * Gracefully falls back to local products if offline.
   */
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.sport) params.set('sport', filters.sport);
      if (filters?.condition) params.set('condition', filters.condition);
      if (filters?.product_type) params.set('product_type', filters.product_type);
      if (filters?.store_id) params.set('store_id', filters.store_id);
      if (filters?.seller_id) params.set('seller_id', filters.seller_id);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
      if (filters?.status) params.set('status', filters.status);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          return data.products as Product[];
        }
      }
    } catch (err) {
      console.warn('[ProductService] Fetch from /api/products failed, using local cache:', err);
    }

    // C9: dados de demonstração só com NEXT_PUBLIC_DEMO_MODE=true; sem isso, catálogo vazio.
    return DEMO_MODE ? this.applyLocalFilters(INITIAL_PRODUCTS, filters) : [];
  }

  /**
   * Fetches a single product by ID.
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      return products.find((p) => p.id === id) || null;
    } catch {
      return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
    }
  }

  /**
   * Creates a product in the database.
   */
  static async createProduct(
    product: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>,
    sellerId?: string
  ): Promise<{ success: boolean; data: Product } & Product> {
    // O servidor define o vendedor a partir do token da sessão (sellerId é apenas informativo).
    const res = await authedFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({ ...product, seller_id: sellerId || product.seller_id }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success && data.product) {
      const prod = data.product as Product;
      return { success: true, data: prod, ...prod };
    }
    if (isSupabaseConfigured) {
      throw new Error(data?.error || 'Não foi possível publicar o anúncio.');
    }

    // Modo demonstração (sem banco de dados): criação apenas local.
    const fallbackProd: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
      views: 0,
      likes_count: 0,
      seller_id: sellerId || product.seller_id || 'system',
    };
    return { success: true, data: fallbackProd, ...fallbackProd };
  }

  /**
   * Updates an existing product.
   */
  static async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const res = await authedFetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Deletes a product.
   */
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await authedFetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Applies local filtering when database is offline.
   */
  private static applyLocalFilters(items: Product[], filters?: ProductFilters): Product[] {
    if (!filters) return items;

    return items.filter((p) => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.category && filters.category !== 'all' && filters.category !== 'Todos' && p.category !== filters.category) return false;
      if (filters.sport && filters.sport !== 'all' && filters.sport !== 'Todos' && p.sport !== filters.sport) return false;
      if (filters.condition && p.condition !== filters.condition) return false;
      if (filters.product_type && p.product_type !== filters.product_type) return false;
      if (filters.store_id && p.store_id !== filters.store_id) return false;
      if (filters.seller_id && p.seller_id !== filters.seller_id) return false;
      if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        return (
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.sport.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }
}
