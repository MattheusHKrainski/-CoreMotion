/**
 * Utilitário de cliente: anexa o token de sessão do Supabase às chamadas de API protegidas.
 * Visitantes (sem sessão) recebem a resposta 401 do servidor e o app trata o erro.
 */
import { getSupabaseClient } from '@/services/supabaseClient';

export async function getAccessToken(): Promise<string | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = await getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
