import { NextRequest, NextResponse } from 'next/server';
import {
  createStoreInDb,
  getStoreById,
  getStoreBySlugFromDb,
  getStoreOwnerId,
  getStoresFromDb,
  promoteUserToSellerIfNeeded,
  requestStoreVerificationInDb,
  reviewStoreVerificationInDb,
} from '@/lib/db-queries';
import { hasCapability } from '@/lib/permissions';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { readJson, str } from '@/lib/api-utils';
import type { Store } from '@/lib/types';

export const dynamic = 'force-dynamic';

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Lojas oficiais: leitura pública. */
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug');
  try {
    if (slug) {
      const store = await getStoreBySlugFromDb(slug);
      if (!store) return errorResponse('Loja não encontrada.', 404);
      return NextResponse.json({ success: true, store });
    }
    const stores = await getStoresFromDb();
    return NextResponse.json({ success: true, stores });
  } catch (error: unknown) {
    console.error('[API /api/stores GET]', error);
    return errorResponse('Falha ao buscar lojas.');
  }
}

/** Cadastro de loja: o dono é o usuário autenticado. O primeiro cadastro torna o atleta lojista. */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;
  if (!hasCapability(actor.role, 'store.create')) {
    return errorResponse('Seu papel não pode cadastrar lojas.', 403);
  }

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return errorResponse('Corpo da requisição inválido.', 400);

  const name = str(body.name, 120);
  const category = str(body.category, 60);
  const contactEmail = str(body.contact_email, 160);
  if (name.length < 3 || !category || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
    return errorResponse('Informe nome, categoria e um e-mail de contato válido.', 400);
  }

  const cnpj = str(body.cnpj, 18);
  const docs: Store['verification_docs'] | undefined = cnpj ? { cnpj } : undefined;

  try {
    const slugBase = slugify(name) || 'loja';
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
    const store = await createStoreInDb(
      {
        name,
        slug,
        description: str(body.description, 2000),
        logo_url: str(body.logo_url, 2048) || undefined,
        banner_url: str(body.banner_url, 2048) || undefined,
        category,
        contact_email: contactEmail,
        contact_phone: str(body.contact_phone, 30) || undefined,
        location: str(body.location, 120) || undefined,
        verification_docs: docs,
      },
      actor.userId
    );
    await promoteUserToSellerIfNeeded(actor.userId, store.id);
    return NextResponse.json({ success: true, store });
  } catch (error: unknown) {
    console.error('[API /api/stores POST]', error);
    const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : '';
    if (code === '23505') return errorResponse('Já existe uma loja com este nome.', 409);
    return errorResponse('Falha ao cadastrar a loja.');
  }
}

/**
 * Verificação de lojas:
 *  - lojista (dono) envia documentos → status 'pending'
 *  - supervisor/administrador aprova ou reprova → 'verified' / 'rejected'
 */
export async function PATCH(req: NextRequest) {
  // Autenticação antes de ler o corpo. Revisões de verificação exigem papel de staff (abaixo).
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const actor = auth.ctx;

  const body = await readJson<{
    storeId?: unknown;
    action?: unknown;
    approve?: unknown;
    notes?: unknown;
    docs?: Record<string, unknown>;
  }>(req);
  if (!body) return errorResponse('Corpo da requisição inválido.', 400);

  const storeId = str(body.storeId, 64);
  if (!storeId) return errorResponse('ID da loja obrigatório.', 400);

  const isReview = typeof body.approve === 'boolean';
  if (isReview && !hasCapability(actor.role, 'stores.verify')) {
    return errorResponse('Seu papel não pode revisar verificações.', 403);
  }

  try {
    if (isReview) {
      if (!hasCapability(actor.role, 'stores.verify')) {
        return errorResponse('Seu papel não pode revisar verificações.', 403);
      }
      const store = await reviewStoreVerificationInDb(storeId, body.approve as boolean, str(body.notes, 500), actor.userId);
      if (!store) return errorResponse('Loja não encontrada.', 404);
      return NextResponse.json({ success: true, store });
    }

    if (str(body.action, 40) !== 'request_verification' && !body.docs) {
      return errorResponse('Ação não reconhecida.', 400);
    }

    const ownerId = await getStoreOwnerId(storeId);
    if (!ownerId) return errorResponse('Loja não encontrada.', 404);
    if (ownerId !== actor.userId && actor.role !== 'admin') {
      return errorResponse('Somente o dono da loja pode solicitar verificação.', 403);
    }

    const docs = body.docs || {};
    const cleanDocs: NonNullable<Store['verification_docs']> = {
      cnpj: str(docs.cnpj, 18) || undefined,
      company_name: str(docs.company_name, 160) || undefined,
      website: str(docs.website, 200) || undefined,
      document_url: str(docs.document_url, 2048) || undefined,
      notes: str(docs.notes, 1000) || undefined,
    };
    const store = await requestStoreVerificationInDb(storeId, cleanDocs);
    if (!store) return errorResponse('Loja não encontrada.', 404);
    return NextResponse.json({ success: true, store: store ?? (await getStoreById(storeId)) });
  } catch (error: unknown) {
    console.error('[API /api/stores PATCH]', error);
    return errorResponse('Falha ao processar a verificação da loja.');
  }
}
