import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuração do Supabase lida exclusivamente de variáveis de ambiente públicas
 * (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY). Nenhum projeto é
 * embutido no código. Sem configuração, o app roda em modo demonstração.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** HTTPS é obrigatório; HTTP só é aceito para loopback (desenvolvimento local e testes). */
function isAllowedSupabaseUrl(url: string): boolean {
  if (url.startsWith('https://')) return true;
  return /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(url);
}

export const isSupabaseConfigured = Boolean(isAllowedSupabaseUrl(supabaseUrl) && supabaseAnonKey.length > 15);

export const SUPABASE_AUTH_STORAGE_KEY = (() => {
  try { return `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`; } catch { return 'coremotion-auth-token'; }
})();
let browserClient: SupabaseClient | null = null;

/** Isolated verification never replaces the currently connected account on failure. */
let verificationIndex = 0;
export function createSessionVerifier(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: `${SUPABASE_AUTH_STORAGE_KEY}-verify-${++verificationIndex}` },
  });
}

/** Forget only the active browser context, keeping explicitly remembered sessions valid. */
export async function detachRememberedSession(): Promise<void> {
  await browserClient?.auth.stopAutoRefresh();
  await browserClient?.removeAllChannels();
  window.localStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
  window.localStorage.removeItem(`${SUPABASE_AUTH_STORAGE_KEY}-code-verifier`);
  browserClient = null;
}

/**
 * Retorna o cliente Supabase compartilhado (navegador) ou um cliente sem persistência (servidor).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (typeof window === 'undefined') {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  if (!browserClient) {
    try {
      browserClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: SUPABASE_AUTH_STORAGE_KEY,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          flowType: 'pkce',
        },
      });
    } catch (err) {
      console.error('[SupabaseClient] Initialization error:', err);
      return null;
    }
  }

  return browserClient;
}

/**
 * Testa a conectividade com o Supabase (leitura pública de produtos).
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { connected: false, error: 'Credenciais do Supabase não configuradas no ambiente.' };
  }

  const start = Date.now();
  try {
    const { error } = await client.from('products').select('id').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, latencyMs: Date.now() - start };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, error: message };
  }
}
