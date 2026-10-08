import { NextRequest, NextResponse } from 'next/server';
import {
  createProductInDb,
  deleteProductInDb,
  getProductOwnerId,
  getProductsFromDb,
  getProfileById,
} from '@/lib/db-queries';
import { hasCapability } from '@/lib/permissions';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { num, PRODUCT_CONDITIONS, readJson, str, strArray } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

/** Anúncios C2C (entre atletas): leitura pública, somente anúncios ativos. */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  try {
    const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined;
    const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined;
    const listings = await getProductsFromDb({
      category: sp.get('category') || undefined,
      sport: sp.get('sport') || undefined,
      condition: sp.get('condition') || undefined,
      product_type: 'c2c',
      seller_id: sp.get('seller_id') || undefined,
      search: sp.get('search') || undefined,
      minPrice,
      maxPrice,
    });
    return NextResponse.json({ success: true, listings });
  } catch (error: unknown) {
    console.error('[API /api/listings GET]', error);
    return errorResponse('Falha ao buscar anúncios.');
  }
}

/** Publica um anúncio C2C em nome do usuário autenticado. */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;
  if (!hasCapability(actor.role, 'listings.create')) {
    return errorResponse('Seu papel não pode criar anúncios.', 403);
  }

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return errorResponse('Corpo da requisição inválido.', 400);

  const title = str(body.title, 150);
  const description = str(body.description, 5000);
  const price = num(body.price);
  const category = str(body.category, 60);
  const sport = str(body.sport, 60);
  const condition = str(body.condition, 30);
  if (title.length < 3 || description.length < 10 || !category || !sport) {
    return errorResponse('Preencha título, descrição, categoria e modalidade.', 400);
  }
  if (price === null || price <= 0 || price > 1_000_000) return errorResponse('Preço inválido.', 400);
  if (!(PRODUCT_CONDITIONS as readonly string[]).includes(condition)) {
    return errorResponse('Condição do produto inválida.', 400);
  }

  try {
    const profile = await getProfileById(actor.userId);
    const listing = await createProductInDb(
      {
        title,
        description,
        price,
        category,
        sport,
        condition,
        product_type: 'c2c',
        images: strArray(body.images, 8, 2048),
        seller_name: profile?.name || actor.email.split('@')[0],
        seller_avatar: profile?.avatar_url || null,
        location: str(body.location, 120) || null,
        shipping_available: body.shipping_available !== false,
        status: 'active',
      },
      actor.userId
    );
    return NextResponse.json({ success: true, listing });
  } catch (error: unknown) {
    console.error('[API /api/listings POST]', error);
    return errorResponse('Falha ao publicar o anúncio.');
  }
}

/** Remove anúncio C2C: somente o próprio vendedor ou um moderador. */
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;

  const id = str(new URL(req.url).searchParams.get('id'), 64);
  if (!id) return errorResponse('ID do anúncio é obrigatório.', 400);

  const ownerId = await getProductOwnerId(id);
  if (!ownerId) return errorResponse('Anúncio não encontrado.', 404);
  if (ownerId !== actor.userId && !hasCapability(actor.role, 'products.moderate')) {
    return errorResponse('Você não pode remover este anúncio.', 403);
  }

  try {
    await deleteProductInDb(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API /api/listings DELETE]', error);
    return errorResponse('Falha ao remover o anúncio.');
  }
}
