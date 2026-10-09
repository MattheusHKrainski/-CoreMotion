import pg from 'pg';

const { Pool } = pg;

/**
 * Pool singleton de conexões PostgreSQL usado SOMENTE no servidor (rotas de API).
 *
 * A string de conexão vem exclusivamente da variável de ambiente DATABASE_URL.
 * Nenhuma credencial é versionada no código. Use a URI "Session pooler" ou
 * "Transaction pooler" do painel do Supabase (compatível com IPv4).
 */
let poolInstance: pg.Pool | null = null;

export function getDbPool(): pg.Pool | null {
  const connectionString = (process.env.DATABASE_URL || '').trim();
  if (!connectionString) {
    return null;
  }

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
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

export function isDatabaseConfigured(): boolean {
  return Boolean((process.env.DATABASE_URL || '').trim());
}

export async function queryDb<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('DATABASE_URL não configurada no servidor.');
  }

  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}
