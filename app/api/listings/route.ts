import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromDb, createProductInDb, deleteProductInDb } from '@/lib/db-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const sport = searchParams.get('sport') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const seller_id = searchParams.get('seller_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

    // C2C listings between athletes
    const listings = await getProductsFromDb({
      category,
      sport,
      condition,
      product_type: 'c2c',
      seller_id,
      search,
      minPrice,
      maxPrice,
    });

    return NextResponse.json({ success: true, listings });
  } catch (error: unknown) {
    console.error('[API /api/listings GET error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao buscar anúncios C2C';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const listing = await createProductInDb({
      ...body,
      product_type: 'c2c',
    }, body.seller_id);
    return NextResponse.json({ success: true, listing });
  } catch (error: unknown) {
    console.error('[API /api/listings POST error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao criar anúncio';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do anúncio é obrigatório' }, { status: 400 });
    }
    await deleteProductInDb(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API /api/listings DELETE error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao deletar anúncio';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
