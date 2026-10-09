import pg from 'pg';
import { pgSsl } from './lib/pg-ssl.mjs';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: pgSsl()
});

async function main() {
  await client.connect();
  console.log('Connected to DB');

  const tables = ['users', 'stores', 'products', 'orders', 'order_items'];
  for (const table of tables) {
    const res = await client.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = $1 
       ORDER BY ordinal_position`,
      [table]
    );
    console.log(`\nTable: ${table}`);
    res.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`));
  }

  // Check auth users if accessible
  try {
    const authUsers = await client.query(`SELECT id, email, created_at FROM auth.users LIMIT 5;`);
    console.log('\nAuth Users in Supabase:', authUsers.rows);
  } catch (err) {
    console.log('\nAuth.users query:', err.message);
  }

  // Check public.users
  const pubUsers = await client.query(`SELECT id, email, role, name FROM public.users LIMIT 5;`);
  console.log('\nPublic Users:', pubUsers.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
