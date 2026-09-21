import { NextRequest, NextResponse } from 'next/server';
import {
  getAllUsersFromDb,
  updateUserRoleInDb,
  banUserInDb,
  unbanUserInDb,
  deleteUserFromDb,
  updateUserProfileInDb,
  isMasterAdminEmail,
} from '@/lib/db-queries';
import { UserRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInternal = searchParams.get('include_internal') === 'true';

    const users = await getAllUsersFromDb();

    // Unless authenticated internal admin query, filter out private developer/master accounts
    const filteredUsers = includeInternal
      ? users
      : users.filter((u) => !isMasterAdminEmail(u.email));

    return NextResponse.json({
      success: true,
      users: filteredUsers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, newRole, reason, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Identificador do usuário obrigatório.' },
        { status: 400 }
      );
    }

    if (action === 'updateRole') {
      if (!newRole) {
        return NextResponse.json(
          { success: false, error: 'Papel do usuário (role) é obrigatório.' },
          { status: 400 }
        );
      }
      await updateUserRoleInDb(userId, newRole as UserRole);
      return NextResponse.json({
        success: true,
        message: 'Papel do usuário atualizado no banco de dados.',
      });
    }

    if (action === 'ban') {
      await banUserInDb(userId, reason || 'Suspensão aplicada pela administração');
      return NextResponse.json({
        success: true,
        message: 'Usuário suspenso e restrito no banco de dados.',
      });
    }

    if (action === 'unban') {
      await unbanUserInDb(userId);
      return NextResponse.json({
        success: true,
        message: 'Suspensão do usuário revogada com sucesso.',
      });
    }

    if (action === 'updateProfile') {
      const updated = await updateUserProfileInDb(userId, updates || {});
      return NextResponse.json({
        success: true,
        user: updated,
        message: 'Perfil atualizado e sincronizado no banco de dados.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Ação não reconhecida.' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');

    if (!userId) {
      const body = await req.json().catch(() => ({}));
      userId = body.userId;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário para exclusão é obrigatório.' },
        { status: 400 }
      );
    }

    await deleteUserFromDb(userId);

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído e purgado permanentemente do banco de dados.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
