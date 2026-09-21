import { queryDb } from './db';
import { Product, Store, UserProfile, UserRole } from './types';

export const ADMIN_MASTER_EMAILS = [
  'mattheusxmljz@gmail.com',
  'professorchines2026@gmail.com',
  'operacaoamd@gmail.com',
  'admin@coremotiom.com',
];

export function isMasterAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    ADMIN_MASTER_EMAILS.includes(clean) ||
    clean.startsWith('mattheusxmljz') ||
    clean.startsWith('professorchines')
  );
}

export function toSafeUuid(val?: string | null): string | null {
  if (!val) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) ? val : null;
}

export interface DbUserRow {
  id: number;
  name: string;
  handle: string;
  email: string;
  password_hash: string;
  role: string;
  sport: string;
  city: string;
  bio: string;
  avatar: string;
  level: string;
  followers: number;
  rating: number | string;
  price_per_hour: number | null;
  verified: boolean;
  is_demo: boolean;
  banned: boolean;
  ban_reason: string;
  report_count: number;
  last_login_at: Date | string | null;
  created_at: Date | string;
  supabase_id: string | null;
  status: string;
  updated_at: Date | string;
}

export function mapDbUserToProfile(row: DbUserRow): UserProfile {
  const isAdmin = isMasterAdminEmail(row.email) || row.role === 'admin';
  const role: UserRole = isAdmin ? 'admin' : (row.role as UserRole) || 'user';

  return {
    id: String(row.id),
    supabase_id: row.supabase_id || undefined,
    name: row.name || 'Atleta CoreMotiom',
    email: row.email,
    avatar_url: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    role,
    city: row.city || 'São Paulo',
    state: 'SP',
    sport_interests: row.sport ? [row.sport] : ['Corrida', 'Alta Performance'],
    created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at?.toISOString() || new Date().toISOString(),
  };
}

// ----------------------------------------------------
// USER QUERIES & SYNCHRONIZATION
// ----------------------------------------------------

export async function findUserBySupabaseId(supabaseId: string): Promise<UserProfile | null> {
  const rows = await queryDb<DbUserRow>(
    `SELECT * FROM public.users WHERE supabase_id = $1 LIMIT 1`,
    [supabaseId]
  );
  if (rows.length === 0) return null;
  return mapDbUserToProfile(rows[0]);
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const rows = await queryDb<DbUserRow>(
    `SELECT * FROM public.users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email.trim()]
  );
  if (rows.length === 0) return null;
  return mapDbUserToProfile(rows[0]);
}

export async function getAllUsersFromDb(): Promise<UserProfile[]> {
  const rows = await queryDb<DbUserRow>(
    `SELECT * FROM public.users ORDER BY id ASC`
  );
  return rows.map(mapDbUserToProfile);
}

export async function syncSupabaseUser(
  supabaseId: string,
  email: string,
  metadata?: {
    name?: string;
    role?: string;
    avatar?: string;
    city?: string;
    sport?: string;
  }
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = isMasterAdminEmail(cleanEmail) || metadata?.role === 'admin';
  const assignedRole = isAdmin ? 'admin' : metadata?.role || 'athlete';

  // 1. Check if user already exists by supabase_id
  const bySupabaseId = await queryDb<DbUserRow>(
    `SELECT * FROM public.users WHERE supabase_id = $1 LIMIT 1`,
    [supabaseId]
  );

  if (bySupabaseId.length > 0) {
    const existing = bySupabaseId[0];
    const updateRole = isAdmin ? 'admin' : existing.role;
    const updated = await queryDb<DbUserRow>(
      `UPDATE public.users 
       SET last_login_at = NOW(), 
           role = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [updateRole, existing.id]
    );
    return mapDbUserToProfile(updated[0]);
  }

  // 2. Check if user already exists by email (link supabase_id)
  const byEmail = await queryDb<DbUserRow>(
    `SELECT * FROM public.users WHERE LOWER(email) = $1 LIMIT 1`,
    [cleanEmail]
  );

  if (byEmail.length > 0) {
    const existing = byEmail[0];
    const updateRole = isAdmin ? 'admin' : existing.role;
    const updated = await queryDb<DbUserRow>(
      `UPDATE public.users 
       SET supabase_id = $1,
           last_login_at = NOW(),
           role = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [supabaseId, updateRole, existing.id]
    );
    return mapDbUserToProfile(updated[0]);
  }

  // 3. New user - Insert into public.users
  const name = metadata?.name?.trim() || cleanEmail.split('@')[0];
  const handle = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(100 + Math.random() * 900)}`;
  const avatar = metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80';
  const city = metadata?.city || 'São Paulo';
  const sport = metadata?.sport || 'Multi-esportes';

  const inserted = await queryDb<DbUserRow>(
    `INSERT INTO public.users (
      name, handle, email, password_hash, role, sport, city, bio, avatar, level, 
      followers, rating, verified, is_demo, banned, report_count, 
      last_login_at, created_at, supabase_id, status, updated_at
    ) VALUES (
      $1, $2, $3, 'supabase_auth', $4, $5, $6, '', $7, 'Iniciante',
      0, 5.0, false, false, false, 0,
      NOW(), NOW(), $8, 'active', NOW()
    ) RETURNING *`,
    [name, handle, cleanEmail, assignedRole, sport, city, avatar, supabaseId]
  );

  return mapDbUserToProfile(inserted[0]);
}

export async function updateUserRoleInDb(userIdOrSupabaseId: string, newRole: UserRole): Promise<boolean> {
  const isNumeric = /^\d+$/.test(userIdOrSupabaseId);
  const query = isNumeric
    ? `UPDATE public.users SET role = $1, updated_at = NOW() WHERE id = $2`
    : `UPDATE public.users SET role = $1, updated_at = NOW() WHERE supabase_id = $2`;

  await queryDb(query, [newRole, isNumeric ? parseInt(userIdOrSupabaseId, 10) : userIdOrSupabaseId]);
  return true;
}

export async function banUserInDb(userIdOrSupabaseId: string, reason: string = 'Violação das diretrizes da comunidade'): Promise<boolean> {
  const isNumeric = /^\d+$/.test(userIdOrSupabaseId);
  const query = isNumeric
    ? `UPDATE public.users SET banned = true, ban_reason = $1, status = 'banned', updated_at = NOW() WHERE id = $2`
    : `UPDATE public.users SET banned = true, ban_reason = $1, status = 'banned', updated_at = NOW() WHERE supabase_id = $2`;

  await queryDb(query, [reason, isNumeric ? parseInt(userIdOrSupabaseId, 10) : userIdOrSupabaseId]);
  return true;
}

export async function unbanUserInDb(userIdOrSupabaseId: string): Promise<boolean> {
  const isNumeric = /^\d+$/.test(userIdOrSupabaseId);
  const query = isNumeric
    ? `UPDATE public.users SET banned = false, ban_reason = '', status = 'active', updated_at = NOW() WHERE id = $1`
    : `UPDATE public.users SET banned = false, ban_reason = '', status = 'active', updated_at = NOW() WHERE supabase_id = $1`;

  await queryDb(query, [isNumeric ? parseInt(userIdOrSupabaseId, 10) : userIdOrSupabaseId]);
  return true;
}

export async function deleteUserFromDb(userIdOrSupabaseId: string): Promise<boolean> {
  const isNumeric = /^\d+$/.test(userIdOrSupabaseId);
  
  // Find email first to ensure we don't accidentally delete master admin
  const userCheck = isNumeric
    ? await queryDb<DbUserRow>(`SELECT * FROM public.users WHERE id = $1`, [parseInt(userIdOrSupabaseId, 10)])
    : await queryDb<DbUserRow>(`SELECT * FROM public.users WHERE supabase_id = $1`, [userIdOrSupabaseId]);

  if (userCheck.length > 0 && isMasterAdminEmail(userCheck[0].email)) {
    throw new Error('A conta do Administrador Master / Desenvolvedor não pode ser removida.');
  }

  const userRow = userCheck[0];

  // 1. Delete from public.users
  if (isNumeric) {
    await queryDb(`DELETE FROM public.users WHERE id = $1`, [parseInt(userIdOrSupabaseId, 10)]);
  } else {
    await queryDb(`DELETE FROM public.users WHERE supabase_id = $1`, [userIdOrSupabaseId]);
  }

  // 2. Also remove from auth.users if supabase_id or email is known
  if (userRow?.email) {
    try {
      await queryDb(`DELETE FROM auth.identities WHERE email = $1`, [userRow.email]);
      await queryDb(`DELETE FROM auth.users WHERE email = $1`, [userRow.email]);
    } catch {
      // Best effort deletion from auth schema
    }
  }

  return true;
}

export async function updateUserProfileInDb(
  userIdOrSupabaseId: string,
  updates: { name?: string; bio?: string; city?: string; sport?: string; avatar?: string }
): Promise<UserProfile | null> {
  const isNumeric = /^\d+$/.test(userIdOrSupabaseId);
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(updates.name.trim());
  }
  if (updates.bio !== undefined) {
    fields.push(`bio = $${idx++}`);
    values.push(updates.bio.trim());
  }
  if (updates.city !== undefined) {
    fields.push(`city = $${idx++}`);
    values.push(updates.city.trim());
  }
  if (updates.sport !== undefined) {
    fields.push(`sport = $${idx++}`);
    values.push(updates.sport.trim());
  }
  if (updates.avatar !== undefined) {
    fields.push(`avatar = $${idx++}`);
    values.push(updates.avatar.trim());
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(isNumeric ? parseInt(userIdOrSupabaseId, 10) : userIdOrSupabaseId);

  const whereClause = isNumeric ? `id = $${idx}` : `supabase_id = $${idx}`;
  const query = `UPDATE public.users SET ${fields.join(', ')} WHERE ${whereClause} RETURNING *`;

  const rows = await queryDb<DbUserRow>(query, values);
  if (rows.length === 0) return null;
  return mapDbUserToProfile(rows[0]);
}

// ----------------------------------------------------
// PRODUCT & LISTING QUERIES
// ----------------------------------------------------

export interface DbProductRow {
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

export function mapDbProductToModel(row: DbProductRow): Product {
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
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
    ],
    seller_id: row.seller_id || 'system',
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
    created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at?.toISOString() || new Date().toISOString(),
  };
}

export async function getProductsFromDb(filters?: {
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
}): Promise<Product[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (filters?.status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(filters.status);
  } else {
    conditions.push(`status = 'active'`);
  }

  if (filters?.product_type) {
    conditions.push(`product_type = $${paramIdx++}`);
    params.push(filters.product_type);
  }

  if (filters?.category && filters.category !== 'all' && filters.category !== 'Todos') {
    conditions.push(`category = $${paramIdx++}`);
    params.push(filters.category);
  }

  if (filters?.sport && filters.sport !== 'all' && filters.sport !== 'Todos') {
    conditions.push(`sport = $${paramIdx++}`);
    params.push(filters.sport);
  }

  if (filters?.condition) {
    conditions.push(`condition = $${paramIdx++}`);
    params.push(filters.condition);
  }

  if (filters?.store_id) {
    conditions.push(`store_id = $${paramIdx++}`);
    params.push(filters.store_id);
  }

  if (filters?.seller_id) {
    conditions.push(`seller_id = $${paramIdx++}`);
    params.push(filters.seller_id);
  }

  if (filters?.minPrice !== undefined) {
    conditions.push(`price >= $${paramIdx++}`);
    params.push(filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    conditions.push(`price <= $${paramIdx++}`);
    params.push(filters.maxPrice);
  }

  if (filters?.search && filters.search.trim().length > 0) {
    conditions.push(`(title ILIKE $${paramIdx} OR description ILIKE $${paramIdx} OR category ILIKE $${paramIdx} OR sport ILIKE $${paramIdx})`);
    params.push(`%${filters.search.trim()}%`);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM public.products ${whereClause} ORDER BY created_at DESC`;

  const rows = await queryDb<DbProductRow>(query, params);
  return rows.map(mapDbProductToModel);
}

export async function getProductByIdFromDb(id: string): Promise<Product | null> {
  const rows = await queryDb<DbProductRow>(
    `SELECT * FROM public.products WHERE id = $1 LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  return mapDbProductToModel(rows[0]);
}

export async function createProductInDb(
  product: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count'>,
  sellerId?: string
): Promise<Product> {
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'];

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
      product.product_type || 'c2c',
      images,
      toSafeUuid(sellerId || product.seller_id),
      product.seller_name || 'Atleta CoreMotiom',
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

export async function deleteProductInDb(id: string): Promise<boolean> {
  await queryDb(`DELETE FROM public.products WHERE id = $1`, [id]);
  return true;
}

// ----------------------------------------------------
// STORE QUERIES
// ----------------------------------------------------

export interface DbStoreRow {
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

export function mapDbStoreToModel(row: DbStoreRow): Store {
  return {
    id: row.id,
    owner_id: row.owner_id ? String(row.owner_id) : 'system',
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    logo_url: row.logo_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
    banner_url: row.banner_url || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80',
    category: row.category,
    is_verified: Boolean(row.is_verified),
    verification_status: (row.verification_status as Store['verification_status']) || 'verified',
    verification_requested_at: row.verification_requested_at
      ? typeof row.verification_requested_at === 'string'
        ? row.verification_requested_at
        : row.verification_requested_at.toISOString()
      : undefined,
    verification_docs: row.verification_docs || (row.cnpj ? { cnpj: row.cnpj } : undefined),
    contact_email: row.contact_email,
    contact_phone: row.contact_phone || undefined,
    location: row.location || 'São Paulo, SP',
    rating: row.rating ? Number(row.rating) : 5.0,
    sales_count: row.sales_count ?? 0,
    products_count: row.products_count ?? 0,
    created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at?.toISOString() || new Date().toISOString(),
  };
}

export async function getStoresFromDb(): Promise<Store[]> {
  const rows = await queryDb<DbStoreRow>(
    `SELECT * FROM public.stores ORDER BY is_verified DESC, name ASC`
  );
  return rows.map(mapDbStoreToModel);
}

export async function getStoreBySlugFromDb(slug: string): Promise<Store | null> {
  const rows = await queryDb<DbStoreRow>(
    `SELECT * FROM public.stores WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  if (rows.length === 0) return null;
  return mapDbStoreToModel(rows[0]);
}

export async function createStoreInDb(
  storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'sales_count' | 'products_count' | 'is_verified' | 'verification_status'>,
  ownerId?: string
): Promise<Store> {
  const cnpj = (storeData.verification_docs?.cnpj as string) || null;
  const rows = await queryDb<DbStoreRow>(
    `INSERT INTO public.stores (
      owner_id, name, slug, description, logo_url, banner_url, category,
      is_verified, verification_status, verification_docs, cnpj,
      contact_email, contact_phone, location, rating, sales_count, products_count,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      false, 'pending', $8, $9,
      $10, $11, $12, 5.0, 0, 0,
      NOW(), NOW()
    ) RETURNING *`,
    [
      toSafeUuid(ownerId),
      storeData.name,
      storeData.slug,
      storeData.description || null,
      storeData.logo_url || null,
      storeData.banner_url || null,
      storeData.category,
      storeData.verification_docs ? JSON.stringify(storeData.verification_docs) : null,
      cnpj,
      storeData.contact_email,
      storeData.contact_phone || null,
      storeData.location || null,
    ]
  );

  return mapDbStoreToModel(rows[0]);
}

export async function updateStoreVerificationInDb(
  storeId: string,
  approve: boolean,
  notes?: string
): Promise<boolean> {
  const status = approve ? 'verified' : 'rejected';
  await queryDb(
    `UPDATE public.stores 
     SET is_verified = $1,
         verification_status = $2,
         updated_at = NOW()
     WHERE id = $3`,
    [approve, status, storeId]
  );
  return true;
}
