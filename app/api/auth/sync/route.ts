import { NextRequest, NextResponse } from 'next/server';
import { getProfileById, listProfiles, upsertOwnProfile } from '@/lib/db-queries';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { readJson, str } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

/**
 * Sincroniza o perfil do usuário autenticado (identificado pelo token, não pelo corpo).
 * O papel nunca é aceito do cliente: contas nascem como 'user' e contas-mestre como 'admin'.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const ctx = auth.ctx;

  const body = (await readJson<Record<string, unknown>>(req)) || {};
  try {
    const user = await upsertOwnProfile({
      id: ctx.userId,
      email: ctx.email,
      name: str(body.name, 120) || undefined,
      avatar: str(body.avatar, 2048) || undefined,
      city: str(body.city, 80) || undefined,
      state: str(body.state, 2) || undefined,
      phone: str(body.phone, 30) || undefined,
      sport: str(body.sport, 60) || undefined,
    });
    return NextResponse.json({ success: true, user });
  } catch (err: unknown) {
    console.error('[API /api/auth/sync POST]', err);
    return errorResponse('Falha na sincronização do perfil.');
  }
}

/** Perfil do próprio usuário; com ?all=true, lista de contas (somente staff). */
export async function GET(req: NextRequest) {
  const wantsAll = new URL(req.url).searchParams.get('all') === 'true';
  const auth = await requireAuth(req, wantsAll ? ['admin', 'supervisor'] : undefined);
  if (!auth.ok) return auth.response;

  try {
    if (wantsAll) {
      return NextResponse.json({ success: true, users: await listProfiles() });
    }
    const user = await getProfileById(auth.ctx.userId);
    return NextResponse.json({ success: true, user });
  } catch (err: unknown) {
    console.error('[API /api/auth/sync GET]', err);
    return errorResponse('Falha ao buscar o perfil.');
  }
}
