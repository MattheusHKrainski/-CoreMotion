import { getSupabaseClient } from './supabaseClient';
import { Store } from '@/lib/types';
import { INITIAL_STORES } from '@/lib/initial-data';

export class StoreService {
  /**
   * Fetches official stores from Supabase.
   */
  static async getStores(): Promise<Store[]> {
    const sb = getSupabaseClient();
    if (!sb) {
      return INITIAL_STORES;
    }

    try {
      const { data, error } = await sb
        .from('stores')
        .select('*')
        .order('is_verified', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_STORES;
      }

      return data.map(this.mapDbStoreToModel);
    } catch {
      return INITIAL_STORES;
    }
  }

  /**
   * Fetches a store by slug.
   */
  static async getStoreBySlug(slug: string): Promise<Store | null> {
    const sb = getSupabaseClient();
    if (!sb) {
      return INITIAL_STORES.find((s) => s.slug === slug) || null;
    }

    try {
      const { data, error } = await sb
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        return INITIAL_STORES.find((s) => s.slug === slug) || null;
      }

      return this.mapDbStoreToModel(data);
    } catch {
      return INITIAL_STORES.find((s) => s.slug === slug) || null;
    }
  }

  /**
   * Creates a new store for merchant/seller.
   */
  static async createStore(
    storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'sales_count' | 'products_count' | 'is_verified' | 'verification_status'>,
    ownerId?: string
  ): Promise<{ success: boolean; data?: Store; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: false, error: 'Supabase indisponível' };

    try {
      const isUuid = Boolean(
        ownerId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ownerId)
      );

      const { data, error } = await sb
        .from('stores')
        .insert([
          {
            name: storeData.name,
            slug: storeData.slug,
            description: storeData.description,
            logo_url: storeData.logo_url,
            banner_url: storeData.banner_url,
            category: storeData.category,
            contact_email: storeData.contact_email,
            contact_phone: storeData.contact_phone,
            location: storeData.location,
            owner_id: isUuid ? ownerId : null,
            is_verified: false,
            verification_status: 'none',
          },
        ])
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: this.mapDbStoreToModel(data) };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Requests verification with CNPJ and commercial data.
   */
  static async requestVerification(
    storeId: string,
    docs: NonNullable<Store['verification_docs']>
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: false, error: 'Supabase indisponível' };

    try {
      const { error } = await sb
        .from('stores')
        .update({
          verification_status: 'pending',
          verification_requested_at: new Date().toISOString(),
          verification_docs: docs,
          cnpj: docs.cnpj,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Admin approves or rejects store official verification.
   */
  static async adminReviewStore(
    storeId: string,
    approve: boolean
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: false, error: 'Supabase indisponível' };

    try {
      const { error } = await sb
        .from('stores')
        .update({
          is_verified: approve,
          verification_status: approve ? 'verified' : 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  private static mapDbStoreToModel(dbRow: any): Store {
    return {
      id: String(dbRow.id),
      owner_id: dbRow.owner_id ? String(dbRow.owner_id) : 'owner-1',
      name: dbRow.name || '',
      slug: dbRow.slug || '',
      description: dbRow.description || '',
      logo_url: dbRow.logo_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80',
      banner_url: dbRow.banner_url || 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80',
      category: dbRow.category || 'Geral',
      is_verified: Boolean(dbRow.is_verified),
      verification_status: dbRow.verification_status || 'none',
      verification_requested_at: dbRow.verification_requested_at,
      verification_docs: dbRow.verification_docs || { cnpj: dbRow.cnpj },
      contact_email: dbRow.contact_email || '',
      contact_phone: dbRow.contact_phone,
      location: dbRow.location || 'Brasil',
      rating: Number(dbRow.rating) || 5.0,
      sales_count: Number(dbRow.sales_count) || 0,
      products_count: Number(dbRow.products_count) || 0,
      created_at: dbRow.created_at || new Date().toISOString(),
    };
  }
}
