// ============================================================================
// CORE MOTIOM — CLIENTE SUPABASE
// Inicialização segura (sem crash sem credenciais).
// Schema do banco: supabase/migrations/20261007000000_initial_schema.sql
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20 &&
  !supabaseUrl.includes('MY_SUPABASE_URL')
);

let supabaseInstance: SupabaseClient | null = null;

/* ===========================================================
   OBTER CLIENTE SUPABASE
=========================================================== */

/**
 * Cliente Supabase único da aplicação.
 * Retorna `null` quando as credenciais não estão configuradas no .env.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Error initializing Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}
