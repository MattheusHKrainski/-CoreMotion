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
  const expansionSql = source.match(/await queryDb\(`(\s*WITH claimed[\s\S]+?)`, \[JSON.stringify/)[1];
  await db.exec('CREATE TABLE public.catalog_seed_batches(id text PRIMARY KEY, applied_at timestamptz DEFAULT NOW())');
  const added = { ...seed, id: 'expansion' };
  const expansionParams = [JSON.stringify([added])];
  await Promise.all([db.query(expansionSql, expansionParams), db.query(expansionSql, expansionParams)]);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.external_offers WHERE id='expansion'")).rows[0].n, 1);
  await db.query("UPDATE public.external_offers SET title='Alteração administrativa' WHERE id='expansion'");
  await db.query(expansionSql, expansionParams);
  assert.equal((await db.query("SELECT title FROM public.external_offers WHERE id='expansion'")).rows[0].title, 'Alteração administrativa');
  await db.query("DELETE FROM public.external_offers WHERE id='expansion'");
  await db.query(expansionSql, expansionParams);
  assert.equal((await db.query("SELECT id FROM public.external_offers WHERE id='expansion'")).rows.length, 0);
  // A separate batch can be installed without replaying the previous release.
  const multiSql=[...source.matchAll(/await queryDb\(`(\s*WITH claimed[\s\S]+?)`, \[JSON.stringify\((\w+)\)\]\);/g)].find(match=>match[2]==='MULTI_STORE_OFFERS')[1];
  const multi=[{...seed,id:'multi-edited',source_url:'https://new-store.test/one',original_price:150},{...seed,id:'multi-new',source_url:'https://new-store.test/two',original_price:170},{...seed,id:'multi-duplicate',source_url:'https://new-store.test/three'}];
  await db.query("INSERT INTO external_offers(id,title,source_url,is_active) VALUES ('multi-edited','Editado e inativo','https://new-store.test/one',false),('custom-duplicate','Personalizado','https://new-store.test/three',true)");
  await db.query(multiSql,[JSON.stringify(multi)]);
  assert.equal((await db.query("SELECT title,is_active FROM external_offers WHERE id='multi-edited'")).rows[0].title,'Editado e inativo');
  assert.equal((await db.query("SELECT is_active FROM external_offers WHERE id='multi-edited'")).rows[0].is_active,false);
  assert.equal(Number((await db.query("SELECT original_price FROM external_offers WHERE id='multi-new'")).rows[0].original_price),170);
  assert.equal((await db.query("SELECT id FROM external_offers WHERE id='multi-duplicate'")).rows.length,0);
  await db.exec("DELETE FROM external_offers WHERE id='multi-new'");
  await db.query(multiSql,[JSON.stringify(multi)]);
  assert.equal((await db.query("SELECT id FROM external_offers WHERE id='multi-new'")).rows.length,0);
  // Execute the actual deployment migration twice, including a manual edit and deletion.
  await db.exec("CREATE ROLE anon; CREATE ROLE authenticated; TRUNCATE external_offers; DELETE FROM catalog_seed_batches WHERE id='offers-multi-store-2026-11-05'");
  const migration=readFileSync(new URL('../../supabase/migrations/20261105040000_multistore_external_offers.sql',import.meta.url),'utf8');
  await db.exec(migration);
  const ids=(await db.query('SELECT id FROM external_offers ORDER BY id')).rows.map(r=>r.id);
  assert.equal(ids.length,8);
  assert.equal((await db.query('SELECT DISTINCT store_name FROM external_offers')).rows.length,4);
  await db.query("UPDATE external_offers SET title='Edição mantida' WHERE id=$1",[ids[0]]);
  await db.query('DELETE FROM external_offers WHERE id=$1',[ids[1]]);
  await db.exec(migration);
  assert.equal((await db.query('SELECT title FROM external_offers WHERE id=$1',[ids[0]])).rows[0].title,'Edição mantida');
  assert.equal((await db.query('SELECT id FROM external_offers WHERE id=$1',[ids[1]])).rows.length,0);
  console.log('PASS Ofertas: substituição legada, preservação de edições/exclusões e primeira carga (leva multiloja, preços originais e preservação de edições/exclusões).');
} finally { await db.close(); }
