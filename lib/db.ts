import pg from 'pg';

const { Pool } = pg;

// Singleton Postgres connection pool for Next.js server-side operations
let poolInstance: pg.Pool | null = null;

export const DEFAULT_DATABASE_URL =
  'postgresql://postgres.erpwfjdycdlygxwkdakv:processadorryzen5600gt@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

/**
 * Resolves the PostgreSQL connection string intelligently:
 * 1. Handles accidental HTTP/HTTPS URL inputs (e.g. Supabase project dashboard URL).
 * 2. If a Supabase direct domain (db.<ref>.supabase.co:5432) is provided, automatically
 *    routes through the IPv4/IPv6 Supabase pooler (aws-0-us-east-1.pooler.supabase.com)
 *    so connections never fail in IPv4-only cloud environments (Cloud Run, Vercel, Docker).
 * 3. Supports transaction (6543) and session (5432) modes.
 */
export function resolveDatabaseUrl(rawUrl?: string): string {
  const urlStr = (rawUrl || process.env.DATABASE_URL || '').trim();

  // If missing or if user accidentally pasted the Supabase HTTP URL into DATABASE_URL
  if (!urlStr || urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
    return DEFAULT_DATABASE_URL;
  }

  try {
    const parsed = new URL(urlStr);
    const supabaseMatch = parsed.hostname.match(/^db\.([a-z0-9_-]+)\.supabase\.co$/i);
    if (supabaseMatch) {
      const projectRef = supabaseMatch[1];
      const username = parsed.username.includes('.')
        ? parsed.username
        : `${parsed.username || 'postgres'}.${projectRef}`;
      return `postgresql://${username}:${parsed.password}@aws-0-us-east-1.pooler.supabase.com:5432${parsed.pathname || '/postgres'}`;
    }
  } catch {
    // If not a valid URL, return as-is
  }

  return urlStr;
}

export function getDbPool(): pg.Pool | null {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    return null;
  }

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000,
    });

    poolInstance.on('error', (err) => {
      console.error('[DB Pool Error]', err);
    });
  }

  return poolInstance;
}

export async function queryDb<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('DATABASE_URL not configured');
  }

  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}
