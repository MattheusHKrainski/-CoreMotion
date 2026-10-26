import { NextRequest, NextResponse } from 'next/server';
import {
  createProductInDb,
  deleteProductInDb,
  getProductByIdFromDb,
  getProductOwnerId,
  getProductStatus,
  getProductsFromDb,
  getProfileById,
  OWNER_EDITABLE_PRODUCT_FIELDS,
  updateProductInDb,
} from '@/lib/db-queries';
import { hasCapability, isStaffRole } from '@/lib/permissions';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { PRODUCT_STATUSES, readJson, str } from '@/lib/api-utils';
import { productCreateSchema, productUpdateSchema } from '@/lib/schemas/product.schema';

export const dynamic = 'force-dynamic';

function readFilters(sp: URLSearchParams) {
  const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined;
  const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined;
  return {
    category: sp.get('category') || undefined,
    sport: sp.get('sport') || undefined,
    condition: sp.get('condition') || undefined,
    product_type: sp.get('product_type') || undefined,
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
      if (!product || product.product_type !== 'c2c') return errorResponse('Anúncio não encontrado.', 404);
      if (product.status !== 'active') {
        const auth = await requireAuth(req);
        if (!auth.ok) return auth.response;
        if (auth.ctx.userId !== product.seller_id && !isStaffRole(auth.ctx.role)) {
          return errorResponse('Produto não disponível.', 404);
        }
      }
      return NextResponse.json({ success: true, product });
    }

    const filters = { ...readFilters(sp), product_type: 'c2c' };
    if (filters.status && filters.status !== 'all' && !(PRODUCT_STATUSES as readonly string[]).includes(filters.status)) {
      return errorResponse('Status de anúncio inválido.', 400);
    }
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
 * O catálogo interno aceita somente anúncios C2C; B2C é uma vitrine de ofertas externas.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return errorResponse('Corpo da requisição inválido.', 400);

  if (body.product_type !== undefined && body.product_type !== 'c2c') {
    return errorResponse('Somente anúncios C2C podem ser publicados no catálogo interno.', 400);
  }
  if (!hasCapability(actor.role, 'listings.create')) {
    return errorResponse('Seu papel não pode publicar anúncios.', 403);
  }

  const parsed = productCreateSchema.safeParse({ ...body, product_type: 'c2c' });
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Dados do anúncio inválidos.', 400);
  }
  const input = parsed.data;
  const { title, description, price, category, sport, condition } = input;

  try {
    const profile = await getProfileById(actor.userId);
    const product = await createProductInDb(
      {
        title,
        description,
        price,
        original_price: input.original_price ?? null,
        category,
        sport,
        condition,
        product_type: 'c2c',
        images: input.images,
        seller_name: profile?.name || actor.email.split('@')[0],
        seller_avatar: profile?.avatar_url || null,
        stock: input.stock,
        location: input.location || null,
        contact_phone: input.contact_phone,
        shipping_available: input.shipping_available,
        status: 'active',
        brand: input.brand || null,
        tags: input.tags,
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
  // C3: anúncio suspenso pela moderação só volta a ser ativado pela equipe.
  const currentStatus = await getProductStatus(id);
  if (currentStatus === 'suspended' && !moderator) {
    return errorResponse('Anúncio suspenso pela moderação. Somente a equipe pode reativá-lo.', 403);
  }

  const body = (await readJson<Record<string, unknown>>(req)) || {};
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Dados do anúncio inválidos.', 400);
  }
  const data = parsed.data;
  const fields: Record<string, unknown> = {};
  for (const key of OWNER_EDITABLE_PRODUCT_FIELDS) {
    const value = (data as Record<string, unknown>)[key];
    if (value !== undefined) fields[key] = value;
  }

  if (data.status !== undefined) {
    // Vendedor: active/draft/sold. Moderador: qualquer status (inclui suspended).
    const ownerStatuses = ['active', 'draft', 'sold'];
    if (moderator || ownerStatuses.includes(data.status)) {
      fields.status = data.status;
    } else {
      return errorResponse('Apenas moderadores podem suspender anúncios.', 403);
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
