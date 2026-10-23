/**
 * Persistência SQL da vitrine de Ofertas externas / links de afiliados (public.external_offers).
 * Auto-inicializa a tabela e semeia a curadoria real inicial na primeira consulta caso o banco
 * em produção ainda não tenha recebido a migração manualmente.
 */
import crypto from 'node:crypto';
import { queryDb } from './db';
import type { ExternalOffer } from './types';
import { INITIAL_EXTERNAL_OFFERS } from '@/fixtures/real-offers';
import type { OfferCreateInput, OfferUpdateInput } from './schemas/offer.schema';

interface DbExternalOfferRow {
  id: string;
  title: string;
  description: string;
  store_name: string;
  category: string;
  sport: string;
  price: string | number;
  original_price: string | number | null;
  image_url: string;
  source_url: string;
  coupon_code: string | null;
  is_active: boolean | null;
  created_at: Date | string;
}

let tableBootstrapped = false;

function toIso(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  return typeof value === 'string' ? value : value.toISOString();
}

function mapOfferRow(row: DbExternalOfferRow): ExternalOffer {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    store_name: row.store_name,
    category: row.category,
    sport: row.sport,
    price: Number(row.price),
    original_price: row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : undefined,
    image_url: row.image_url,
    source_url: row.source_url,
    coupon_code: row.coupon_code || undefined,
    is_active: row.is_active ?? true,
    is_demo: false,
    created_at: toIso(row.created_at),
  };
}

export async function ensureExternalOffersTable(): Promise<void> {
  if (tableBootstrapped) return;

  await queryDb(`
    CREATE TABLE IF NOT EXISTS public.external_offers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL CHECK (char_length(btrim(title)) >= 3),
      description TEXT NOT NULL DEFAULT '',
      store_name TEXT NOT NULL CHECK (char_length(btrim(store_name)) >= 2),
      category TEXT NOT NULL DEFAULT 'Equipamentos',
      sport TEXT NOT NULL DEFAULT 'Corrida',
      price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
      original_price NUMERIC(12, 2),
      image_url TEXT NOT NULL,
      source_url TEXT NOT NULL,
      coupon_code TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const countRows = await queryDb<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.external_offers`);
  const total = Number(countRows[0]?.total || '0');

  if (total === 0) {
    for (const offer of INITIAL_EXTERNAL_OFFERS) {
      await queryDb(
        `INSERT INTO public.external_offers
          (id, title, description, store_name, category, sport, price, original_price, image_url, source_url, coupon_code, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          offer.id,
          offer.title,
          offer.description,
          offer.store_name,
          offer.category,
          offer.sport,
          offer.price,
          offer.original_price ?? null,
          offer.image_url,
          offer.source_url,
          offer.coupon_code ?? null,
          offer.is_active ?? true,
          offer.created_at,
        ]
      );
    }
  }

  tableBootstrapped = true;
}

export async function getExternalOffersFromDb(includeInactive = false): Promise<ExternalOffer[]> {
  await ensureExternalOffersTable();
  const whereClause = includeInactive ? '' : 'WHERE is_active = true';
  const rows = await queryDb<DbExternalOfferRow>(
    `SELECT * FROM public.external_offers ${whereClause} ORDER BY created_at DESC`
  );
  return rows.map(mapOfferRow);
}

export async function createExternalOfferInDb(input: OfferCreateInput, actorId?: string): Promise<ExternalOffer> {
  await ensureExternalOffersTable();
  const id = `offer-${crypto.randomUUID()}`;
  const rows = await queryDb<DbExternalOfferRow>(
    `INSERT INTO public.external_offers
      (id, title, description, store_name, category, sport, price, original_price, image_url, source_url, coupon_code, is_active, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      id,
      input.title,
      input.description,
      input.store_name,
      input.category,
      input.sport,
      input.price,
      input.original_price ?? null,
      input.image_url,
      input.source_url,
      input.coupon_code || null,
      input.is_active ?? true,
      actorId && /^[0-9a-f-]{36}$/i.test(actorId) ? actorId : null,
    ]
  );
  return mapOfferRow(rows[0]);
}

export async function updateExternalOfferInDb(id: string, input: OfferUpdateInput): Promise<ExternalOffer | null> {
  await ensureExternalOffersTable();

  const sets: string[] = [];
  const params: unknown[] = [];
  const pushField = (column: string, val: unknown) => {
    params.push(val);
    sets.push(`${column} = $${params.length}`);
  };

  if (input.title !== undefined) pushField('title', input.title);
  if (input.description !== undefined) pushField('description', input.description);
  if (input.store_name !== undefined) pushField('store_name', input.store_name);
  if (input.category !== undefined) pushField('category', input.category);
  if (input.sport !== undefined) pushField('sport', input.sport);
  if (input.price !== undefined) pushField('price', input.price);
  if (input.original_price !== undefined) pushField('original_price', input.original_price ?? null);
  if (input.image_url !== undefined) pushField('image_url', input.image_url);
  if (input.source_url !== undefined) pushField('source_url', input.source_url);
  if (input.coupon_code !== undefined) pushField('coupon_code', input.coupon_code || null);
  if (input.is_active !== undefined) pushField('is_active', input.is_active);

  if (sets.length === 0) {
    const existing = await queryDb<DbExternalOfferRow>(`SELECT * FROM public.external_offers WHERE id = $1 LIMIT 1`, [id]);
    return existing.length > 0 ? mapOfferRow(existing[0]) : null;
  }

  sets.push(`updated_at = NOW()`);
  params.push(id);
  const rows = await queryDb<DbExternalOfferRow>(
    `UPDATE public.external_offers SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows.length > 0 ? mapOfferRow(rows[0]) : null;
}

export async function deleteExternalOfferInDb(id: string): Promise<boolean> {
  await ensureExternalOffersTable();
  const rows = await queryDb<{ id: string }>(
    `DELETE FROM public.external_offers WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows.length > 0;
}

export async function resetExternalOffersInDb(): Promise<ExternalOffer[]> {
  await ensureExternalOffersTable();
  await queryDb(`DELETE FROM public.external_offers`);
  tableBootstrapped = false;
  await ensureExternalOffersTable();
  return getExternalOffersFromDb(true);
}
