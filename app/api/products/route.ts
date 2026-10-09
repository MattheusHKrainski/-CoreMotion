import { NextRequest, NextResponse } from 'next/server';
import {
  createProductInDb,
  deleteProductInDb,
  getProductByIdFromDb,
  getProductOwnerId,
  getProductsFromDb,
  getProfileById,
  getStoreForSale,
  MODERATOR_PRODUCT_FIELDS,
  OWNER_EDITABLE_PRODUCT_FIELDS,
  updateProductInDb,
} from '@/lib/db-queries';
import { hasCapability, isStaffRole } from '@/lib/permissions';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { num, PRODUCT_CONDITIONS, PRODUCT_STATUSES, readJson, str, strArray } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

function readFilters(sp: URLSearchParams) {
  const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined;
  const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined;
  return {
    category: sp.get('category') || undefined,
    sport: sp.get('sport') || undefined,
    condition: sp.get('condition') || undefined,
    product_type: sp.get('product_type') || undefined,
    store_id: sp.get('store_id') || undefined,
    seller_id: sp.get('seller_id') || undefined,
    search: sp.get('search') || undefined,
    minPrice,
    maxPrice,
    status: sp.get('status') || undefined,
  };
}

/**
 * Catálogo público (somente anúncios ativos). Outros status exigem o próprio vendedor
 * ou um moderador autenticado.
 */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  try {
    const id = sp.get('id');
    if (id) {
      const product = await getProductByIdFromDb(id);
      if (!product) return errorResponse('Produto não encontrado.', 404);
      if (product.status !== 'active') {
        const auth = await requireAuth(req);
        if (!auth.ok) return auth.response;
        if (auth.ctx.userId !== product.seller_id && !isStaffRole(auth.ctx.role)) {
          return errorResponse('Produto não disponível.', 404);
        }
      }
      return NextResponse.json({ success: true, product });
    }

    const filters = readFilters(sp);
    if (filters.status && filters.status !== 'active') {
      const auth = await requireAuth(req);
      if (!auth.ok) return auth.response;
      const isOwnerQuery = filters.seller_id === auth.ctx.userId;
      if (!isOwnerQuery && !isStaffRole(auth.ctx.role)) {
        return errorResponse('Você não pode consultar anúncios com este status.', 403);
      }
    }

    const products = await getProductsFromDb(filters);
    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    console.error('[API /api/products GET]', error);
    return errorResponse('Falha ao buscar produtos.');
  }
}

/**
 * Cria anúncio. O vendedor é sempre o usuário autenticado (o campo seller_id do corpo é ignorado).
 * Atletas publicam apenas C2C; B2C exige papel de lojista ou administrador e loja própria.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return errorResponse('Corpo da requisição inválido.', 400);

  const productType = body.product_type === 'b2c' ? 'b2c' : 'c2c';
  const allowed = productType === 'b2c' ? hasCapability(actor.role, 'store.manage_own') : hasCapability(actor.role, 'listings.create');
  if (!allowed) return errorResponse('Seu papel não pode publicar este tipo de anúncio.', 403);

  const title = str(body.title, 150);
  const description = str(body.description, 5000);
  const price = num(body.price);
  const category = str(body.category, 60);
  const sport = str(body.sport, 60);
  const condition = str(body.condition, 30);
  if (title.length < 3 || description.length < 10 || !category || !sport) {
    return errorResponse('Preencha título, descrição, categoria e modalidade.', 400);
  }
  if (price === null || price <= 0 || price > 1_000_000) {
    return errorResponse('Preço inválido.', 400);
  }
  if (!(PRODUCT_CONDITIONS as readonly string[]).includes(condition)) {
    return errorResponse('Condição do produto inválida.', 400);
  }

  // Nome e selo da loja são lidos do banco, nunca do corpo da requisição (o selo não pode ser forjado).
  let storeId: string | null = null;
  let storeName: string | null = null;
  let storeVerified = false;
  if (productType === 'b2c') {
    const requestedStoreId = str(body.store_id, 64);
    if (!requestedStoreId) return errorResponse('Anúncios B2C precisam de uma loja.', 400);
    const store = await getStoreForSale(requestedStoreId);
    if (!store) return errorResponse('Loja não encontrada.', 404);
    if (store.ownerId !== actor.userId && actor.role !== 'admin') {
      return errorResponse('Você só pode anunciar pela sua própria loja.', 403);
    }
    storeId = requestedStoreId;
    storeName = store.name;
    storeVerified = store.isVerified;
  }

  try {
    const profile = await getProfileById(actor.userId);
    const product = await createProductInDb(
      {
        title,
        description,
        price,
        original_price: num(body.original_price),
        category,
        sport,
        condition,
        product_type: productType,
        images: strArray(body.images, 8, 2048),
        seller_name: profile?.name || actor.email.split('@')[0],
        seller_avatar: profile?.avatar_url || null,
        store_id: storeId,
        store_name: storeName,
        is_verified_store: storeVerified,
        stock: Math.max(1, Math.min(9999, Math.trunc(num(body.stock) ?? 1))),
        location: str(body.location, 120) || null,
        shipping_available: body.shipping_available !== false,
        status: 'active',
        brand: str(body.brand, 80) || null,
        tags: strArray(body.tags, 10, 40),
      },
      actor.userId
    );
    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    console.error('[API /api/products POST]', error);
    return errorResponse('Falha ao criar o anúncio.');
  }
}

/** Atualiza anúncio: o dono altera conteúdo; moderadores também podem alterar o status. */
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;

  const id = str(new URL(req.url).searchParams.get('id'), 64);
  if (!id) return errorResponse('ID do produto é obrigatório.', 400);

  const ownerId = await getProductOwnerId(id);
  if (!ownerId) return errorResponse('Produto não encontrado.', 404);
  const moderator = hasCapability(actor.role, 'products.moderate');
  if (ownerId !== actor.userId && !moderator) {
    return errorResponse('Você não pode alterar este anúncio.', 403);
  }

  const body = (await readJson<Record<string, unknown>>(req)) || {};
  const fields: Record<string, unknown> = {};
  for (const key of OWNER_EDITABLE_PRODUCT_FIELDS) {
    if (body[key] === undefined) continue;
    if (key === 'title') fields.title = str(body.title, 150);
    else if (key === 'description') fields.description = str(body.description, 5000);
    else if (key === 'price') fields.price = num(body.price);
    else if (key === 'original_price') fields.original_price = num(body.original_price);
    else if (key === 'stock') fields.stock = Math.max(0, Math.min(9999, Math.trunc(num(body.stock) ?? 0)));
    else if (key === 'location') fields.location = str(body.location, 120) || null;
    else if (key === 'shipping_available') fields.shipping_available = Boolean(body.shipping_available);
    else if (key === 'brand') fields.brand = str(body.brand, 80) || null;
    else if (key === 'tags') fields.tags = strArray(body.tags, 10, 40);
    else if (key === 'images') fields.images = strArray(body.images, 8, 2048);
    else if (key === 'condition') {
      const c = str(body.condition, 30);
      if ((PRODUCT_CONDITIONS as readonly string[]).includes(c)) fields.condition = c;
    }
  }

  if (body.status !== undefined) {
    const status = str(body.status, 20);
    if (!(PRODUCT_STATUSES as readonly string[]).includes(status)) {
      return errorResponse('Status inválido.', 400);
    }
    // Vendedor: active/draft/sold. Moderador: qualquer status (inclui suspended).
    const ownerStatuses = ['active', 'draft', 'sold'];
    if (moderator || ownerStatuses.includes(status)) {
      if ((MODERATOR_PRODUCT_FIELDS as readonly string[]).includes('status')) fields.status = status;
    } else {
      return errorResponse('Apenas moderadores podem suspender anúncios.', 403);
    }
  }

  for (const key of ['price', 'original_price'] as const) {
    if (key in fields && fields[key] !== null && (typeof fields[key] !== 'number' || (fields[key] as number) <= 0)) {
      return errorResponse('Preço inválido.', 400);
    }
  }

  try {
    const product = await updateProductInDb(id, fields);
    if (!product) return errorResponse('Produto não encontrado.', 404);
    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    console.error('[API /api/products PATCH]', error);
    return errorResponse('Falha ao atualizar o anúncio.');
  }
}

/** Exclui anúncio: o dono ou um moderador (admin/supervisor). */
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;

  const id = str(new URL(req.url).searchParams.get('id'), 64);
  if (!id) return errorResponse('ID do produto é obrigatório.', 400);

  const ownerId = await getProductOwnerId(id);
  if (!ownerId) return errorResponse('Produto não encontrado.', 404);
  if (ownerId !== actor.userId && !hasCapability(actor.role, 'products.moderate')) {
    return errorResponse('Você não pode excluir este anúncio.', 403);
  }

  try {
    await deleteProductInDb(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API /api/products DELETE]', error);
    return errorResponse('Falha ao excluir o anúncio.');
  }
}
