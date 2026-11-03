import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Execute the actual atomic query used in production against PostgreSQL.
const source = readFileSync(new URL('../../lib/offer-db.ts', import.meta.url), 'utf8');
const sql = source.match(/await queryDb\(`(\s*WITH retired[\s\S]+?)`, \[JSON.stringify/)[1];
const db = await PGlite.create();
try {
  await db.exec(`CREATE TABLE public.external_offers (
    id text PRIMARY KEY, title text, description text, store_name text, category text, sport text,
    price numeric, original_price numeric, image_url text, source_url text, coupon_code text,
    is_active boolean, created_at timestamptz, created_by uuid
  )`);
  const legacy = { old: 'https://shop.test/busca?q=bola', edited: 'https://shop.test/busca?q=tenis' };
  const seed = { id: 'reviewed', title: 'Produto conferido', price: 100, source_url: 'https://shop.test/produto/p', image_url: 'https://shop.test/photo.jpg', is_active: true, created_at: '2026-10-25T12:00:00Z' };
  const params = [JSON.stringify(legacy), JSON.stringify([seed])];
  await db.query(`INSERT INTO public.external_offers(id,source_url) VALUES ('old',$1),('edited','https://shop.test/produto-corrigido/p'),('custom','https://shop.test/custom/p')`, [legacy.old]);
  await db.query(sql, params);
  let result = await db.query('SELECT id FROM public.external_offers ORDER BY id');
  assert.deepEqual(result.rows.map(row => row.id), ['custom','edited','reviewed']);
  await db.query(`UPDATE public.external_offers SET title='Editado no painel' WHERE id='reviewed'`);
  await db.query(sql, params);
  result = await db.query(`SELECT title FROM public.external_offers WHERE id='reviewed'`);
  assert.equal(result.rows[0].title, 'Editado no painel');
  await db.query(`DELETE FROM public.external_offers WHERE id='reviewed'`);
  await db.query(sql, params);
  result = await db.query(`SELECT id FROM public.external_offers WHERE id='reviewed'`);
  assert.equal(result.rows.length, 0);
  await db.exec('TRUNCATE public.external_offers');
  await db.query(sql, params);
  result = await db.query('SELECT id FROM public.external_offers');
  assert.deepEqual(result.rows, [{ id: 'reviewed' }]);
  console.log('PASS Ofertas: substituição legada, preservação de edições/exclusões e primeira carga (4 cenários).');
} finally { await db.close(); }
