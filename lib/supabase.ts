/**
 * Ponto único de acesso ao cliente Supabase do navegador.
 * A implementação real fica em services/supabaseClient.ts (evita duas instâncias de autenticação).
 */
export { getSupabaseClient as getSupabase, isSupabaseConfigured } from '@/services/supabaseClient';
