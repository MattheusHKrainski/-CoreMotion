import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://erpwfjdycdlygxwkdakv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycHdmamR5Y2RseWd4d2tkYWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDc5MDYsImV4cCI6MjEwMzA4MzkwNn0.iX2IpAtEkmEeFGLmtnnzcznSpXXhw1k_UoUqgeWcEmU';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 15 &&
  !supabaseUrl.includes('MY_SUPABASE_URL')
);

let browserClient: SupabaseClient | null = null;

/**
 * Returns the shared browser Supabase client instance with auto-refresh and session persistence.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (typeof window === 'undefined') {
    // Server-side execution
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (!browserClient) {
    try {
      browserClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
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
 * Tests direct Supabase connectivity.
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { connected: false, error: 'Credenciais do Supabase não configuradas no ambiente.' };
  }

  const start = Date.now();
  try {
    const { data, error } = await client.from('products').select('id').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, latencyMs: Date.now() - start };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, error: message };
  }
}
