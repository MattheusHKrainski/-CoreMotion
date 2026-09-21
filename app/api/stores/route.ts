import { NextRequest, NextResponse } from 'next/server';
import { getStoresFromDb, getStoreBySlugFromDb, createStoreInDb, updateStoreVerificationInDb } from '@/lib/db-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const store = await getStoreBySlugFromDb(slug);
      return NextResponse.json({ success: true, store });
    }

    const stores = await getStoresFromDb();
    return NextResponse.json({ success: true, stores });
  } catch (error: unknown) {
    console.error('[API /api/stores GET error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao buscar lojas';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = await createStoreInDb(body, body.owner_id);
    return NextResponse.json({ success: true, store });
  } catch (error: unknown) {
    console.error('[API /api/stores POST error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao cadastrar loja';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, approve, notes } = body;
    if (!storeId) {
      return NextResponse.json({ success: false, error: 'ID da loja obrigatório' }, { status: 400 });
    }
    await updateStoreVerificationInDb(storeId, Boolean(approve), notes);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API /api/stores PATCH error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao verificar loja';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
