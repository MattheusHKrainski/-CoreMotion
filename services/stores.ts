import { Store } from '@/lib/types';
import { INITIAL_STORES } from '@/lib/initial-data';

/**
 * Modular service for official stores and partner brands.
 */
export class StoreService {
  /**
   * Fetches official stores from database via /api/stores.
   */
  static async getStores(): Promise<Store[]> {
    try {
      const res = await fetch('/api/stores');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.stores) && data.stores.length > 0) {
          return data.stores as Store[];
        }
      }
    } catch (err) {
      console.warn('[StoreService] Fetch /api/stores failed, using local cache:', err);
    }

    return INITIAL_STORES;
  }

  /**
   * Fetches store by slug.
   */
  static async getStoreBySlug(slug: string): Promise<Store | null> {
    try {
      const res = await fetch(`/api/stores?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.store) {
          return data.store as Store;
        }
      }
    } catch (err) {
      console.warn('[StoreService] Fetch store by slug failed:', err);
    }

    return INITIAL_STORES.find((s) => s.slug === slug) || null;
  }

  /**
   * Registers a new store.
   */
  static async createStore(
    storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'sales_count' | 'products_count' | 'is_verified' | 'verification_status'>,
    ownerId?: string
  ): Promise<{ success: boolean; data: Store } & Store> {
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...storeData, owner_id: ownerId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.store) {
          const store = data.store as Store;
          return { success: true, data: store, ...store };
        }
      }
    } catch (err) {
      console.warn('[StoreService] Create store error:', err);
    }

    const fallbackStore: Store = {
      ...storeData,
      id: `store_${Date.now()}`,
      rating: 5.0,
      sales_count: 0,
      products_count: 0,
      is_verified: false,
      verification_status: 'pending',
      created_at: new Date().toISOString(),
    };
    return { success: true, data: fallbackStore, ...fallbackStore };
  }

  /**
   * Submits documents for store verification.
   */
  static async requestVerification(
    storeId: string,
    docs: NonNullable<Store['verification_docs']>
  ): Promise<void> {
    try {
      await fetch('/api/stores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, approve: false, docs }),
      });
    } catch {
      // ignore
    }
  }

  /**
   * Admin verification approval or rejection.
   */
  static async adminVerifyStore(
    storeId: string,
    approve: boolean,
    notes?: string
  ): Promise<void> {
    try {
      await fetch('/api/stores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, approve, notes }),
      });
    } catch {
      // ignore
    }
  }

  /**
   * Admin review alias for store verification.
   */
  static async adminReviewStore(
    storeId: string,
    approve: boolean,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.adminVerifyStore(storeId, approve, notes);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}

export const getStores = StoreService.getStores.bind(StoreService);
export const getStoreBySlug = StoreService.getStoreBySlug.bind(StoreService);
export const createStore = StoreService.createStore.bind(StoreService);
export const requestStoreVerification = StoreService.requestVerification.bind(StoreService);
export const adminVerifyStore = StoreService.adminVerifyStore.bind(StoreService);
