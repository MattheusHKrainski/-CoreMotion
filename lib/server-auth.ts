/**
 * Autenticação e autorização nas rotas de API (somente servidor).
 *
 * 1. O cliente envia "Authorization: Bearer <access_token>" (JWT emitido pelo Supabase Auth).
 * 2. O token é validado pelo próprio Supabase (auth.getUser), sem confiar em dados do navegador.
 * 3. O papel (role) é lido da tabela public.profiles. Contas-mestre são sempre administradoras.
 */
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from './db';
import { isMasterAdminEmail } from './permissions';
import type { UserRole } from './types';

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
}

export function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

async function verifyAccessToken(token: string): Promise<{ id: string; email: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? '' };
}

/** Retorna o contexto do usuário autenticado ou null (token ausente, inválido ou expirado). */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const verified = await verifyAccessToken(token);
  if (!verified) return null;

  const rows = await queryDb<{ email: string; role: string; is_banned: boolean }>(
    `SELECT email, role, is_banned FROM public.profiles WHERE id = $1 LIMIT 1`,
    [verified.id]
  );
  const profile = rows[0];
  const email = profile?.email || verified.email;
  const role: UserRole = isMasterAdminEmail(email) ? 'admin' : ((profile?.role as UserRole) || 'user');

  return {
    userId: verified.id,
    email,
    role,
    isBanned: Boolean(profile?.is_banned),
  };
}

export type AuthResult = { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse };

/**
 * Exige usuário autenticado, não suspenso e (opcionalmente) com um dos papéis informados.
 * Uso típico:  const auth = await requireAuth(req, ['admin']); if (!auth.ok) return auth.response;
 */
export async function requireAuth(req: NextRequest, allowedRoles?: UserRole[]): Promise<AuthResult> {
  let ctx: AuthContext | null = null;
  try {
    ctx = await getAuthContext(req);
  } catch (err) {
    console.error('[server-auth] falha ao validar sessão:', err);
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Não foi possível validar a sessão.' }, { status: 503 }),
    };
  }

  if (!ctx) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Autenticação necessária.' }, { status: 401 }),
    };
  }

  if (ctx.isBanned) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Conta suspensa pela moderação.' }, { status: 403 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(ctx.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Seu papel não tem permissão para esta operação.' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, ctx };
}

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}
