import { Product, ProductCondition, ProductType } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/fixtures/initial-data';
import { DEMO_MODE } from '@/lib/demo-mode';
import { type ApiResult } from '@/lib/auth-fetch';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

interface ProductFilters {
  category?: string;
  sport?: string;
  condition?: ProductCondition;
  product_type?: ProductType;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  seller_id?: string;
}

/**
 * Service for C2C athlete listings; B2C offers use the separate external-offer feed.
 */
export class ProductService {
  /**
   * Fetches products from database via /api/products.
   * Gracefully falls back to local products if offline.
   */
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    if (!isSupabaseConfigured && DEMO_MODE) {
      return this.applyLocalFilters(INITIAL_PRODUCTS.filter((product) => product.product_type === 'c2c'), filters);
    }

    // Public reads can use Supabase REST if the SQL API is not configured. RLS still applies.
    const client = getSupabaseClient();
    if (client) {
      let request = client.from('products').select('*').eq('product_type', 'c2c');
      if (filters?.status !== 'all') request = request.eq('status', filters?.status || 'active');
      const { data, error } = await request.order('created_at', { ascending: false });
      if (error) throw new Error('Não foi possível carregar os anúncios do Supabase.');
      return this.applyLocalFilters(data as Product[], filters?.status === 'all' ? { ...filters, status: undefined } : filters);
    }

    // C9: dados de demonstração só com NEXT_PUBLIC_DEMO_MODE=true; sem isso, catálogo vazio.
    return DEMO_MODE ? this.applyLocalFilters(INITIAL_PRODUCTS.filter((product) => product.product_type === 'c2c'), filters) : [];
  }

  /**
   * Fetches a single product by ID.
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      return products.find((p) => p.id === id) || null;
    } catch {
      return INITIAL_PRODUCTS.find((p) => p.id === id && p.product_type === 'c2c') || null;
    }
  }

  /**
   * Creates a product in the database.
   */
  static async createProduct(
    product: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>,
    sellerId?: string
  ): Promise<{ success: boolean; data: Product } & Product> {
    if (product.product_type !== 'c2c') {
      throw new Error('Somente anúncios C2C podem ser publicados no catálogo interno.');
    }
    const sb = getSupabaseClient();
    if (sb) {
      const { data: auth, error: authError } = await sb.auth.getUser();
      if (authError || !auth.user) throw new Error('Sua sessão expirou. Entre novamente.');
      if (!product.contact_phone?.trim()) throw new Error('Informe um telefone de contato para publicar.');
      const { data, error } = await sb.from('products').insert({ ...product, seller_id: auth.user.id }).select('*').single();
      if (error || !data) throw new Error(error?.message || 'Não foi possível publicar o anúncio.');
      return { success: true, data, ...data };
    }
    if (isSupabaseConfigured) throw new Error('Conexão indisponível. O anúncio não foi salvo.');

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
  static async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<ApiResult & { product?: Product }> {
    try {
      const sb = getSupabaseClient();
      if (!sb) return { success: false, error: 'Conexão indisponível.' };
      const allowed = ['title','description','price','original_price','category','sport','condition','usage_time','images','stock','location','contact_phone','shipping_available','status','tags','brand'] as const;
      const patch = Object.fromEntries(allowed.filter(key => updates[key] !== undefined).map(key => [key, updates[key]]));
      const { data, error } = await sb.from('products').update(patch).eq('id', id).select('*').single();
      return error || !data ? { success: false, error: error?.message || 'Anúncio não encontrado ou sem permissão.' } : { success: true, product: data };

    } catch {
      return { success: false, error: 'Não foi possível conectar ao servidor.' };
    }
  }

  /**
   * Deletes a product.
   */
  static async deleteProduct(id: string): Promise<ApiResult> {
    try {
      const sb = getSupabaseClient();
      if (!sb) return { success: false, error: 'Conexão indisponível.' };
      const { data, error } = await sb.from('products').delete().eq('id', id).select('id');
      return error || !data?.length ? { success: false, error: error?.message || 'Anúncio não encontrado ou sem permissão.' } : { success: true };

    } catch {
      return { success: false, error: 'Não foi possível conectar ao servidor.' };
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
