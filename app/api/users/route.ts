import { NextRequest, NextResponse } from 'next/server';
import {
  deleteAuthUser,
  getProfileById,
  listProfiles,
  setUserBan,
  setUserRole,
  updateProfileFields,
} from '@/lib/db-queries';
import { canChangeRoleOf, canDeleteTarget, canSuspendTarget, isAssignableRole, isStaffRole } from '@/lib/permissions';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { readJson, str, strArray } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

/** Listagem de contas: somente administradores e supervisores. */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'supervisor']);
  if (!auth.ok) return auth.response;

  try {
    const users = await listProfiles();
    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    console.error('[API /api/users GET]', err);
    return errorResponse('Falha ao listar usuários.');
  }
}

/**
 * Ações de moderação e de perfil:
 *  - updateRole     → somente administrador
 *  - ban / unban    → administrador (qualquer conta não-mestre) ou supervisor (atletas e lojistas)
 *  - updateProfile  → o próprio usuário, ou administrador
 */
export async function PATCH(req: NextRequest) {
  // Autenticação antes de ler o corpo; ações administrativas exigem papel de staff (abaixo).
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;

  const body = await readJson<{
    action?: string;
    userId?: string;
    newRole?: unknown;
    reason?: unknown;
    updates?: Record<string, unknown>;
  }>(req);
  if (!body) return errorResponse('Corpo da requisição inválido.', 400);

  const userId = str(body.userId, 64);
  if (!userId) return errorResponse('Identificador do usuário obrigatório.', 400);

  const action = str(body.action, 40);
  if (action !== 'updateProfile' && !isStaffRole(actor.role)) {
    return errorResponse('Seu papel não pode executar esta ação.', 403);
  }

  try {
    if (action === 'updateProfile') {
      if (actor.userId !== userId && actor.role !== 'admin') {
        return errorResponse('Você só pode alterar o seu próprio perfil.', 403);
      }
      const u = body.updates || {};
      const updated = await updateProfileFields(userId, {
        name: typeof u.name === 'string' ? str(u.name, 120) : undefined,
        phone: typeof u.phone === 'string' ? str(u.phone, 30) : undefined,
        city: typeof u.city === 'string' ? str(u.city, 80) : undefined,
        state: typeof u.state === 'string' ? str(u.state, 2) : undefined,
        avatar_url: typeof u.avatar_url === 'string' ? str(u.avatar_url, 2048) : undefined,
        sport_interests: Array.isArray(u.sport_interests) ? strArray(u.sport_interests, 10, 60) : undefined,
      });
      if (!updated) return errorResponse('Usuário não encontrado.', 404);
      return NextResponse.json({ success: true, user: updated, message: 'Perfil atualizado.' });
    }

    const target = await getProfileById(userId);
    if (!target) return errorResponse('Usuário não encontrado.', 404);

    if (action === 'updateRole') {
      if (!canChangeRoleOf(actor.role, target.email)) {
        return errorResponse('Somente administradores podem alterar papéis (contas-mestre são protegidas).', 403);
      }
      if (!isAssignableRole(body.newRole)) {
        return errorResponse('Papel inválido. Use user, seller, supervisor ou admin.', 400);
      }
      if (target.id === actor.userId && body.newRole !== 'admin') {
        return errorResponse('Você não pode remover o seu próprio papel de administrador.', 400);
      }
      const updated = await setUserRole(userId, body.newRole);
      return NextResponse.json({ success: true, user: updated, message: 'Papel atualizado.' });
    }

    if (action === 'ban' || action === 'unban') {
      if (target.id === actor.userId) {
        return errorResponse('Você não pode suspender a própria conta.', 400);
      }
      if (!canSuspendTarget(actor.role, target.role, target.email)) {
        return errorResponse('Seu papel não pode suspender esta conta.', 403);
      }
      const reason = str(body.reason, 300);
      const updated = await setUserBan(userId, action === 'ban', reason || undefined);
      return NextResponse.json({
        success: true,
        user: updated,
        message: action === 'ban' ? 'Conta suspensa.' : 'Suspensão revogada.',
      });
    }

    return errorResponse('Ação não reconhecida.', 400);
  } catch (err: unknown) {
    console.error('[API /api/users PATCH]', err);
    return errorResponse('Falha ao atualizar o usuário.');
  }
}

/** Exclusão definitiva de conta: somente administradores (nunca contas-mestre). */
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;

  const userId = str(new URL(req.url).searchParams.get('userId'), 64);
  if (!userId) return errorResponse('ID do usuário para exclusão é obrigatório.', 400);

  try {
    const target = await getProfileById(userId);
    if (!target) return errorResponse('Usuário não encontrado.', 404);
    if (target.id === actor.userId) return errorResponse('Você não pode excluir a própria conta.', 400);
    if (!canDeleteTarget(actor.role, target.email)) {
      return errorResponse('Esta conta não pode ser excluída.', 403);
    }

    await deleteAuthUser(userId);
    return NextResponse.json({ success: true, message: 'Conta removida da plataforma.' });
  } catch (err: unknown) {
    console.error('[API /api/users DELETE]', err);
    return errorResponse('Falha ao excluir o usuário.');
  }
}
