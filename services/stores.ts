import { Store } from '@/lib/types';
import { INITIAL_STORES } from '@/fixtures/initial-data';
import { DEMO_MODE } from '@/lib/demo-mode';
import { authedFetch } from '@/lib/auth-fetch';
import { isSupabaseConfigured } from './supabaseClient';

type StoreInput = Omit<Store, 'id' | 'created_at' | 'rating' | 'sales_count' | 'products_count' | 'is_verified' | 'verification_status'>;

/**
 * Serviço de lojas oficiais e verificação. Leitura pública; escrita autenticada no servidor.
 */
export class StoreService {
  /** Lista lojas do banco (ou dados de demonstração quando o banco não está configurado). */
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
    return DEMO_MODE ? INITIAL_STORES : [];
  }

  static async getStoreBySlug(slug: string): Promise<Store | null> {
    try {
      const res = await fetch(`/api/stores?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.store) return data.store as Store;
      }
    } catch (err) {
      console.warn('[StoreService] Fetch store by slug failed:', err);
    }
    return INITIAL_STORES.find((s) => s.slug === slug) || null;
  }

  /** Cadastra a loja do usuário autenticado (o servidor define o dono). */
  static async createStore(storeData: StoreInput): Promise<{ success: boolean; data: Store } & Store> {
    const res = await authedFetch('/api/stores', { method: 'POST', body: JSON.stringify(storeData) });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success && data.store) {
      const store = data.store as Store;
      return { success: true, data: store, ...store };
    }
    if (isSupabaseConfigured) {
      throw new Error(data?.error || 'Não foi possível cadastrar a loja.');
    }
    // Modo demonstração (sem banco): a loja existe apenas na sessão local.
    const fallbackStore: Store = {
      ...storeData,
      id: `store_${Date.now()}`,
      rating: 5.0,
      sales_count: 0,
      products_count: 0,
      is_verified: false,
      verification_status: 'none',
      created_at: new Date().toISOString(),
    };
    return { success: true, data: fallbackStore, ...fallbackStore };
  }

  /** O lojista envia os documentos e a loja passa ao status 'pending'. */
  static async requestVerification(storeId: string, docs: NonNullable<Store['verification_docs']>): Promise<void> {
    const res = await authedFetch('/api/stores', {
      method: 'PATCH',
      body: JSON.stringify({ storeId, action: 'request_verification', docs }),
    });
    if (!res.ok && isSupabaseConfigured) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Não foi possível enviar a verificação.');
    }
  }

  /** Supervisor ou administrador aprova ('verified') ou reprova ('rejected') a loja. */
  static async adminVerifyStore(storeId: string, approve: boolean, notes?: string): Promise<void> {
    const res = await authedFetch('/api/stores', {
      method: 'PATCH',
      body: JSON.stringify({ storeId, approve, notes }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Não foi possível revisar a loja.');
    }
  }

  static async adminReviewStore(storeId: string, approve: boolean, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.adminVerifyStore(storeId, approve, notes);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}
