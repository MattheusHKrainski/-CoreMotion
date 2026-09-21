import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromDb, createProductInDb, deleteProductInDb } from '@/lib/db-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const sport = searchParams.get('sport') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const product_type = searchParams.get('product_type') || undefined;
    const store_id = searchParams.get('store_id') || undefined;
    const seller_id = searchParams.get('seller_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

    const products = await getProductsFromDb({
      category,
      sport,
      condition,
      product_type,
      store_id,
      seller_id,
      search,
      minPrice,
      maxPrice,
    });

    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    console.error('[API /api/products GET error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao buscar produtos';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await createProductInDb(body, body.seller_id);
    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    console.error('[API /api/products POST error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao criar produto';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do produto é obrigatório' }, { status: 400 });
    }
    await deleteProductInDb(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API /api/products DELETE error]:', error);
    const message = error instanceof Error ? error.message : 'Falha ao deletar produto';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
