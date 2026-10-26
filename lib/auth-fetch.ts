/**
 * Utilitário de cliente: anexa o token de sessão do Supabase às chamadas de API protegidas.
 * Visitantes (sem sessão) recebem a resposta 401 do servidor e o app trata o erro.
 */
import { IS_QUICK_ACCESS } from './quick-access';
import { getSupabaseClient } from '@/services/supabaseClient';

async function getAccessToken(): Promise<string | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export interface ApiResult {
  success: boolean;
  error?: string;
}

/**
 * Normaliza a resposta de uma rota /api: sucesso só com HTTP 2xx e `success: true`;
 * caso contrário devolve a mensagem de erro enviada pelo servidor (ou um texto padrão).
 */
export async function readResult<T extends object = Record<string, never>>(
  res: Response,
  fallbackError = 'Não foi possível concluir a operação.'
): Promise<ApiResult & Partial<T>> {
  const data = (await res.json().catch(() => null)) as (Partial<T> & { success?: boolean; error?: string }) | null;
  if (res.ok && data?.success) return data as ApiResult & Partial<T>;
  return { success: false, error: data?.error || fallbackError } as ApiResult & Partial<T>;
}

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  if (IS_QUICK_ACCESS) {
    return Response.json({ success: false, error: 'O acesso rápido não altera dados reais. Saia do acesso temporário para usar sua conta.' }, { status: 403 });
  }
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = await getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
