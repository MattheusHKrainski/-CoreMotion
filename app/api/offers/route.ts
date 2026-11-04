import { NextRequest, NextResponse } from 'next/server';
import { isStaffRole } from '@/lib/permissions';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { readJson, str } from '@/lib/api-utils';
import { offerCreateSchema, offerUpdateSchema } from '@/lib/schemas/offer.schema';
import {
  createExternalOfferInDb,
  deleteExternalOfferInDb,
  getExternalOffersFromDb,
  resetExternalOffersInDb,
  updateExternalOfferInDb,
} from '@/lib/offer-db';

export const dynamic = 'force-dynamic';

/** Lista ofertas ativas (público) ou todas incluindo pausadas (equipe admin/supervisor). */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const includeInactive = sp.get('includeInactive') === 'true';

  if (includeInactive) {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    if (!isStaffRole(auth.ctx.role)) {
      return errorResponse('Acesso restrito à administração.', 403);
    }
  }

  try {
    const offers = await getExternalOffersFromDb(includeInactive);
    return NextResponse.json({ success: true, offers });
  } catch (error: unknown) {
    console.warn('[API /api/offers GET] Database unavailable or fallback mode:', error);
    return errorResponse('Banco de ofertas indisponível neste ambiente.', 503);
  }
}

/** Cria nova oferta ou restaura curadoria padrão (restrito a admin/supervisor). */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (!isStaffRole(auth.ctx.role)) {
    return errorResponse('Somente administradores podem gerenciar ofertas.', 403);
  }

  const action = new URL(req.url).searchParams.get('action');
  if (action === 'reset') {
    try {
      const offers = await resetExternalOffersInDb();
      return NextResponse.json({ success: true, offers });
    } catch (error: unknown) {
      console.error('[API /api/offers POST reset]', error);
      return errorResponse('Falha ao restaurar ofertas padrão.');
    }
  }

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return errorResponse('Corpo da requisição inválido.', 400);

  const parsed = offerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Dados da oferta inválidos.', 400);
  }

  try {
    const offer = await createExternalOfferInDb(parsed.data, auth.ctx.userId);
    return NextResponse.json({ success: true, offer });
  } catch (error: unknown) {
    console.error('[API /api/offers POST]', error);
    return errorResponse('Falha ao salvar oferta no banco de dados.');
  }
}

/** Atualiza qualquer campo de uma oferta existente (link de afiliado, foto, preço, loja, status). */
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (!isStaffRole(auth.ctx.role)) {
    return errorResponse('Somente administradores podem editar ofertas.', 403);
  }

  const id = str(new URL(req.url).searchParams.get('id'), 96);
  if (!id) return errorResponse('ID da oferta é obrigatório.', 400);

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return errorResponse('Corpo da requisição inválido.', 400);

  const parsed = offerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Dados da oferta inválidos.', 400);
  }

  try {
    const offer = await updateExternalOfferInDb(id, parsed.data);
    if (!offer) return errorResponse('Oferta não encontrada.', 404);
    return NextResponse.json({ success: true, offer });
  } catch (error: unknown) {
    console.error('[API /api/offers PATCH]', error);
    return errorResponse('Falha ao atualizar oferta.');
  }
}

/** Exclui oferta permanentemente (restrito a admin/supervisor). */
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (!isStaffRole(auth.ctx.role)) {
    return errorResponse('Somente administradores podem excluir ofertas.', 403);
  }

  const id = str(new URL(req.url).searchParams.get('id'), 96);
  if (!id) return errorResponse('ID da oferta é obrigatório.', 400);

  try {
    const deleted = await deleteExternalOfferInDb(id);
    if (!deleted) return errorResponse('Oferta não encontrada.', 404);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API /api/offers DELETE]', error);
    return errorResponse('Falha ao excluir oferta.');
  }
}
