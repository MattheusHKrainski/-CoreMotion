import { NextRequest, NextResponse } from 'next/server';
import { syncSupabaseUser, findUserBySupabaseId, findUserByEmail, getAllUsersFromDb } from '@/lib/db-queries';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supabaseId, email, name, avatar, role, city, sport } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email é obrigatório' }, { status: 400 });
    }

    const sId = supabaseId || `legacy_${Date.now()}`;
    const user = await syncSupabaseUser(sId, email, {
      name,
      avatar,
      role,
      city,
      sport,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    console.error('[API /api/auth/sync error]:', error);
    const message = error instanceof Error ? error.message : 'Falha na sincronização';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabaseId = searchParams.get('supabase_id');
    const email = searchParams.get('email');
    const all = searchParams.get('all');

    if (all === 'true') {
      const users = await getAllUsersFromDb();
      return NextResponse.json({ success: true, users });
    }

    if (supabaseId) {
      const user = await findUserBySupabaseId(supabaseId);
      return NextResponse.json({ success: true, user });
    }

    if (email) {
      const user = await findUserByEmail(email);
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, error: 'Parâmetro supabase_id ou email ausente' }, { status: 400 });
  } catch (error: unknown) {
    console.error('[API /api/auth/sync GET error]:', error);
    const message = error instanceof Error ? error.message : 'Falha na busca do usuário';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
