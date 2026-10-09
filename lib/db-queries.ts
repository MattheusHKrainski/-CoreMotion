/**
 * Consultas SQL usadas pelas rotas de API (somente servidor).
 * Todas seguem o esquema oficial em supabase/migrations/ (tabelas public.profiles,
 * public.products, public.stores, public.orders e public.community_posts).
 * Todas as consultas são parametrizadas (proteção contra SQL injection).
 */
import { queryDb } from './db';
import { Product, Store, UserProfile, UserRole } from './types';
import { isMasterAdminEmail } from './permissions';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80';
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';

function toSafeUuid(val?: string | null): string | null {
  if (!val) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) ? val : null;
}

function toIso(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  return typeof value === 'string' ? value : value.toISOString();
}

// ----------------------------------------------------
// PERFIS / USUÁRIOS  (public.profiles, espelho de auth.users)
// ----------------------------------------------------

interface DbProfileRow {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  city: string | null;
  state: string | null;
  sport_interests: string[] | null;
  store_id: string | null;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapDbProfileToUser(row: DbProfileRow): UserProfile {
  // A conta-mestre é sempre administradora, independentemente do valor gravado.
  const role: UserRole = isMasterAdminEmail(row.email) ? 'admin' : ((row.role as UserRole) || 'user');
  return {
    id: row.id,
    supabase_id: row.id,
    email: row.email,
    name: row.name || row.email.split('@')[0],
    avatar_url: row.avatar_url || DEFAULT_AVATAR,
    phone: row.phone || undefined,
    role,
    city: row.city || undefined,
    state: row.state || undefined,
    sport_interests: row.sport_interests || [],
    created_at: toIso(row.created_at),
    store_id: row.store_id || undefined,
    is_banned: Boolean(row.is_banned),
    ban_reason: row.ban_reason || undefined,
  };
}

export async function getProfileById(id: string): Promise<UserProfile | null> {
  const rows = await queryDb<DbProfileRow>(`SELECT * FROM public.profiles WHERE id = $1 LIMIT 1`, [id]);
  return rows.length > 0 ? mapDbProfileToUser(rows[0]) : null;
}

export async function listProfiles(): Promise<UserProfile[]> {
  const rows = await queryDb<DbProfileRow>(`SELECT * FROM public.profiles ORDER BY created_at DESC`);
  return rows.map(mapDbProfileToUser);
}

/**
 * Cria ou atualiza o perfil do usuário autenticado. O papel NÃO é recebido do cliente:
 * novos perfis nascem como 'user' (ou 'admin' para contas-mestre) e papéis existentes
 * são preservados.
 */
export async function upsertOwnProfile(input: {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  city?: string;
  state?: string;
  phone?: string;
  sport?: string;
}): Promise<UserProfile> {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || email.split('@')[0];
  const role: UserRole = isMasterAdminEmail(email) ? 'admin' : 'user';

  const rows = await queryDb<DbProfileRow>(
    `INSERT INTO public.profiles (id, email, name, avatar_url, phone, role, city, state, sport_interests, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'São Paulo'), COALESCE($8, 'SP'), $9, NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       name = COALESCE(NULLIF($3, ''), public.profiles.name),
       avatar_url = COALESCE($4, public.profiles.avatar_url),
       phone = COALESCE($5, public.profiles.phone),
       city = COALESCE($7, public.profiles.city),
       state = COALESCE($8, public.profiles.state),
       role = CASE WHEN public.is_master_email(EXCLUDED.email) THEN 'admin' ELSE public.profiles.role END,
       updated_at = NOW()
     RETURNING *`,
    [
      input.id,
      email,
      name,
      input.avatar || null,
      input.phone || null,
      role,
      input.city || null,
      input.state || null,
      input.sport ? [input.sport] : ['Corrida', 'Alta Performance'],
    ]
  );
  return mapDbProfileToUser(rows[0]);
}

export async function updateProfileFields(
  id: string,
  fields: { name?: string; phone?: string; city?: string; state?: string; avatar_url?: string; sport_interests?: string[] }
): Promise<UserProfile | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (fields.name !== undefined) push('name', fields.name.trim());
  if (fields.phone !== undefined) push('phone', fields.phone.trim() || null);
  if (fields.city !== undefined) push('city', fields.city.trim());
  if (fields.state !== undefined) push('state', fields.state.trim().toUpperCase());
  if (fields.avatar_url !== undefined) push('avatar_url', fields.avatar_url.trim() || null);
  if (fields.sport_interests !== undefined) push('sport_interests', fields.sport_interests);

  if (sets.length === 0) return getProfileById(id);

  values.push(id);
  const rows = await queryDb<DbProfileRow>(
    `UPDATE public.profiles SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows.length > 0 ? mapDbProfileToUser(rows[0]) : null;
}

export async function setUserRole(id: string, role: UserRole): Promise<UserProfile | null> {
  const rows = await queryDb<DbProfileRow>(
    `UPDATE public.profiles SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [role, id]
  );
  return rows.length > 0 ? mapDbProfileToUser(rows[0]) : null;
}

export async function setUserBan(id: string, banned: boolean, reason?: string): Promise<UserProfile | null> {
  const rows = await queryDb<DbProfileRow>(
    `UPDATE public.profiles
        SET is_banned = $1, ban_reason = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *`,
    [banned, banned ? reason || 'Violação das diretrizes da comunidade' : null, id]
  );
  return rows.length > 0 ? mapDbProfileToUser(rows[0]) : null;
}

/** Remove a conta de autenticação; o perfil é apagado em cascata (ON DELETE CASCADE). */
export async function deleteAuthUser(id: string): Promise<boolean> {
  const rows = await queryDb<{ id: string }>(`DELETE FROM auth.users WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

// ----------------------------------------------------
// PRODUTOS  (public.products — B2C de lojas e C2C entre atletas)
// ----------------------------------------------------

interface DbProductRow {
  id: string;
  title: string;
  description: string;
  price: string | number;
  original_price: string | number | null;
  category: string;
  sport: string;
  condition: string;
  product_type: string;
  images: string[];
  seller_id: string | null;
  seller_name: string;
  seller_avatar: string | null;
  store_id: string | null;
  store_name: string | null;
  is_verified_store: boolean | null;
  stock: number | null;
  views: number | null;
  likes_count: number | null;
  location: string | null;
  shipping_available: boolean | null;
  status: string | null;
  brand: string | null;
  tags: string[] | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapDbProductToModel(row: DbProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    original_price: row.original_price ? Number(row.original_price) : undefined,
    category: row.category,
    sport: row.sport,
    condition: (row.condition as Product['condition']) || 'como_novo',
    product_type: (row.product_type as Product['product_type']) || 'b2c',
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [DEFAULT_PRODUCT_IMAGE],
    seller_id: row.seller_id,
    seller_name: row.seller_name || 'CoreMotiom Parceiro',
    seller_avatar: row.seller_avatar || undefined,
    store_id: row.store_id || undefined,
    store_name: row.store_name || undefined,
    is_verified_store: Boolean(row.is_verified_store),
    stock: row.stock ?? 1,
    views: row.views ?? 0,
    likes_count: row.likes_count ?? 0,
    location: row.location || 'São Paulo, SP',
    shipping_available: row.shipping_available ?? true,
    status: (row.status as Product['status']) || 'active',
    brand: row.brand || undefined,
    tags: row.tags || [],
    created_at: toIso(row.created_at),
  };
}

interface ProductFilters {
  category?: string;
  sport?: string;
  condition?: string;
  product_type?: string;
  store_id?: string;
  seller_id?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export async function getProductsFromDb(filters?: ProductFilters): Promise<Product[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    conditions.push(sql.replace('?', `$${params.length}`));
  };

  // Por padrão só anúncios ativos aparecem; o chamador pode pedir outro status (ex.: o próprio vendedor).
  add('status = ?', filters?.status || 'active');

  if (filters?.product_type) add('product_type = ?', filters.product_type);
  if (filters?.category && filters.category !== 'all' && filters.category !== 'Todos') add('category = ?', filters.category);
  if (filters?.sport && filters.sport !== 'all' && filters.sport !== 'Todos') add('sport = ?', filters.sport);
  if (filters?.condition) add('condition = ?', filters.condition);
  if (filters?.store_id) add('store_id = ?', filters.store_id);
  if (filters?.seller_id) add('seller_id = ?', filters.seller_id);
  if (filters?.minPrice !== undefined && Number.isFinite(filters.minPrice)) add('price >= ?', filters.minPrice);
  if (filters?.maxPrice !== undefined && Number.isFinite(filters.maxPrice)) add('price <= ?', filters.maxPrice);

  if (filters?.search && filters.search.trim().length > 0) {
    params.push(`%${filters.search.trim()}%`);
    const p = `$${params.length}`;
    conditions.push(`(title ILIKE ${p} OR description ILIKE ${p} OR category ILIKE ${p} OR sport ILIKE ${p})`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const rows = await queryDb<DbProductRow>(
    `SELECT * FROM public.products ${whereClause} ORDER BY created_at DESC`,
    params
  );
  return rows.map(mapDbProductToModel);
}

export async function getProductByIdFromDb(id: string): Promise<Product | null> {
  const rows = await queryDb<DbProductRow>(`SELECT * FROM public.products WHERE id = $1 LIMIT 1`, [id]);
  return rows.length > 0 ? mapDbProductToModel(rows[0]) : null;
}

export async function getProductOwnerId(id: string): Promise<string | null> {
  const rows = await queryDb<{ seller_id: string | null }>(
    `SELECT seller_id FROM public.products WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows.length > 0 ? rows[0].seller_id : null;
}

interface NewProductInput {
  title: string;
  description: string;
  price: number;
  original_price?: number | null;
  category: string;
  sport: string;
  condition: string;
  product_type: 'b2c' | 'c2c';
  images?: string[];
  seller_name: string;
  seller_avatar?: string | null;
  store_id?: string | null;
  store_name?: string | null;
  is_verified_store?: boolean;
  stock?: number;
  location?: string | null;
  shipping_available?: boolean;
  status?: 'active' | 'draft';
  brand?: string | null;
  tags?: string[];
}

export async function createProductInDb(product: NewProductInput, sellerId: string): Promise<Product> {
  const images = product.images && product.images.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE];
  const rows = await queryDb<DbProductRow>(
    `INSERT INTO public.products (
      title, description, price, original_price, category, sport, condition,
      product_type, images, seller_id, seller_name, seller_avatar, store_id,
      store_name, is_verified_store, stock, views, likes_count, location,
      shipping_available, status, brand, tags, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15, $16, 0, 0, $17,
      $18, $19, $20, $21, NOW(), NOW()
    ) RETURNING *`,
    [
      product.title,
      product.description,
      product.price,
      product.original_price || null,
      product.category,
      product.sport,
      product.condition,
      product.product_type,
      images,
      sellerId,
      product.seller_name,
      product.seller_avatar || null,
      toSafeUuid(product.store_id),
      product.store_name || null,
      product.is_verified_store ?? false,
      product.stock ?? 1,
      product.location || 'São Paulo, SP',
      product.shipping_available ?? true,
      product.status || 'active',
      product.brand || null,
      product.tags || [],
    ]
  );
  return mapDbProductToModel(rows[0]);
}

/** Campos editáveis pelo dono do anúncio. */
export const OWNER_EDITABLE_PRODUCT_FIELDS = [
  'title',
  'description',
  'price',
  'original_price',
  'stock',
  'location',
  'shipping_available',
  'brand',
  'tags',
  'images',
  'condition',
] as const;

/** Campos que somente moderadores (admin/supervisor) podem alterar. */
export const MODERATOR_PRODUCT_FIELDS = ['status'] as const;

export async function updateProductInDb(id: string, fields: Record<string, unknown>): Promise<Product | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [column, value] of Object.entries(fields)) {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  }
  if (sets.length === 0) return getProductByIdFromDb(id);

  values.push(id);
  const rows = await queryDb<DbProductRow>(
    `UPDATE public.products SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows.length > 0 ? mapDbProductToModel(rows[0]) : null;
}

export async function deleteProductInDb(id: string): Promise<boolean> {
  const rows = await queryDb<{ id: string }>(`DELETE FROM public.products WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

// ----------------------------------------------------
// LOJAS  (public.stores — lojas oficiais e verificação)
// ----------------------------------------------------

interface DbStoreRow {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  category: string;
  is_verified: boolean | null;
  verification_status: string | null;
  verification_requested_at: Date | string | null;
  verification_docs: Record<string, unknown> | null;
  cnpj: string | null;
  business_type: string | null;
  contact_email: string;
  contact_phone: string | null;
  location: string | null;
  rating: string | number | null;
  sales_count: number | null;
  products_count: number | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapDbStoreToModel(row: DbStoreRow): Store {
  return {
    id: row.id,
    owner_id: row.owner_id ? String(row.owner_id) : '',
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    logo_url: row.logo_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
    banner_url: row.banner_url || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80',
    category: row.category,
    is_verified: Boolean(row.is_verified),
    verification_status: (row.verification_status as Store['verification_status']) || 'none',
    verification_requested_at: row.verification_requested_at ? toIso(row.verification_requested_at) : undefined,
    verification_docs: (row.verification_docs as Store['verification_docs']) || undefined,
    contact_email: row.contact_email,
    contact_phone: row.contact_phone || undefined,
    location: row.location || 'São Paulo, SP',
    rating: row.rating ? Number(row.rating) : 5.0,
    sales_count: row.sales_count ?? 0,
    products_count: row.products_count ?? 0,
    created_at: toIso(row.created_at),
  };
}

export async function getStoresFromDb(): Promise<Store[]> {
  const rows = await queryDb<DbStoreRow>(`SELECT * FROM public.stores ORDER BY is_verified DESC, name ASC`);
  return rows.map(mapDbStoreToModel);
}

export async function getStoreBySlugFromDb(slug: string): Promise<Store | null> {
  const rows = await queryDb<DbStoreRow>(`SELECT * FROM public.stores WHERE slug = $1 LIMIT 1`, [slug]);
  return rows.length > 0 ? mapDbStoreToModel(rows[0]) : null;
}

export async function getStoreById(id: string): Promise<Store | null> {
  const rows = await queryDb<DbStoreRow>(`SELECT * FROM public.stores WHERE id = $1 LIMIT 1`, [id]);
  return rows.length > 0 ? mapDbStoreToModel(rows[0]) : null;
}

export async function createStoreInDb(
  storeData: {
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    banner_url?: string;
    category: string;
    contact_email: string;
    contact_phone?: string;
    location?: string;
    verification_docs?: Store['verification_docs'];
  },
  ownerId: string
): Promise<Store> {
  const docs = storeData.verification_docs || null;
  const cnpj = typeof docs?.cnpj === 'string' ? docs.cnpj : null;
  const rows = await queryDb<DbStoreRow>(
    `INSERT INTO public.stores (
      owner_id, name, slug, description, logo_url, banner_url, category,
      is_verified, verification_status, verification_docs, cnpj,
      contact_email, contact_phone, location, rating, sales_count, products_count,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      false, 'none', $8, $9,
      $10, $11, $12, 5.0, 0, 0,
      NOW(), NOW()
    ) RETURNING *`,
    [
      ownerId,
      storeData.name,
      storeData.slug,
      storeData.description || null,
      storeData.logo_url || null,
      storeData.banner_url || null,
      storeData.category,
      docs ? JSON.stringify(docs) : null,
      cnpj,
      storeData.contact_email,
      storeData.contact_phone || null,
      storeData.location || null,
    ]
  );
  return mapDbStoreToModel(rows[0]);
}

export async function getStoreOwnerId(storeId: string): Promise<string | null> {
  const rows = await queryDb<{ owner_id: string | null }>(
    `SELECT owner_id FROM public.stores WHERE id = $1 LIMIT 1`,
    [storeId]
  );
  return rows.length > 0 ? rows[0].owner_id : null;
}

/** Dados da loja usados em anúncios B2C (dono, nome e selo), sempre lidos do banco. */
export async function getStoreForSale(
  storeId: string
): Promise<{ ownerId: string | null; name: string; isVerified: boolean } | null> {
  const safeId = toSafeUuid(storeId);
  if (!safeId) return null;
  const rows = await queryDb<{ owner_id: string | null; name: string; is_verified: boolean }>(
    `SELECT owner_id, name, is_verified FROM public.stores WHERE id = $1 LIMIT 1`,
    [safeId]
  );
  if (rows.length === 0) return null;
  return { ownerId: rows[0].owner_id, name: rows[0].name, isVerified: Boolean(rows[0].is_verified) };
}

/** Lojista solicita verificação oficial: status 'pending' e documentos anexados. */
export async function requestStoreVerificationInDb(
  storeId: string,
  docs: NonNullable<Store['verification_docs']>
): Promise<Store | null> {
  const rows = await queryDb<DbStoreRow>(
    `UPDATE public.stores
        SET verification_status = 'pending',
            verification_requested_at = NOW(),
            verification_docs = $1,
            cnpj = COALESCE($2, cnpj),
            updated_at = NOW()
      WHERE id = $3
      RETURNING *`,
    [JSON.stringify(docs), typeof docs.cnpj === 'string' ? docs.cnpj : null, storeId]
  );
  return rows.length > 0 ? mapDbStoreToModel(rows[0]) : null;
}

/** Moderação: aprova ('verified') ou reprova ('rejected') a verificação de uma loja. */
export async function reviewStoreVerificationInDb(
  storeId: string,
  approve: boolean,
  notes?: string,
  reviewerId?: string
): Promise<Store | null> {
  const rows = await queryDb<DbStoreRow>(
    `UPDATE public.stores
        SET is_verified = $1,
            verification_status = $2,
            verification_docs = COALESCE(verification_docs, '{}'::jsonb) || jsonb_build_object(
              'review_notes', $3::text,
              'reviewed_by', $4::text,
              'reviewed_at', NOW()::text
            ),
            updated_at = NOW()
      WHERE id = $5
      RETURNING *`,
    [approve, approve ? 'verified' : 'rejected', notes || '', reviewerId || '', storeId]
  );
  return rows.length > 0 ? mapDbStoreToModel(rows[0]) : null;
}

/** Ao criar a primeira loja, a conta de atleta passa a ser lojista (nunca rebaixa administradores). */
export async function promoteUserToSellerIfNeeded(userId: string, storeId: string): Promise<void> {
  await queryDb(
    `UPDATE public.profiles
        SET role = 'seller', store_id = $2, updated_at = NOW()
      WHERE id = $1 AND role = 'user'`,
    [userId, storeId]
  );
  await queryDb(
    `UPDATE public.profiles SET store_id = $2, updated_at = NOW() WHERE id = $1 AND role IN ('seller','admin','supervisor')`,
    [userId, storeId]
  );
}
