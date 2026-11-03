import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = await PGlite.create();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text, raw_user_meta_data jsonb DEFAULT '{}');
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT (auth.jwt()->>'sub')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT auth.jwt()->>'role' $$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;`);
for (const file of ['20250101000000_coremotiom_initial_schema.sql','20261008000000_roles_hierarchy_and_security.sql','20261009000000_security_fixes.sql','20261020000000_retire_store_b2c_marketplace.sql','20261026160000_seller_contact_and_unique_likes.sql']) {
  await db.exec(readFileSync(new URL('../../supabase/migrations/'+file, import.meta.url),'utf8').replace(/CREATE EXTENSION IF NOT EXISTS "(uuid-ossp|pgcrypto)";/g,''));
}
const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222';
await db.query(`INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES ($1,'athlete@test.com','{"account_type":"athlete","sport":"Vôlei"}'),($2,'coach@test.com','{"account_type":"coach","sport":"Pilates"}')`,[a,b]);
assert.deepEqual((await db.query('SELECT sport_interests FROM profiles WHERE id=$1',[a])).rows[0].sport_interests,['Vôlei']);
assert.deepEqual((await db.query('SELECT sport_interests FROM profiles WHERE id=$1',[b])).rows[0].sport_interests,['Pilates']);
const { rows:[post] } = await db.query(`INSERT INTO community_posts(author_id,author_name,category,title,content,likes_count) VALUES ($1,'Atleta','Dicas','Publicação de teste','Conteúdo',0) RETURNING id`,[a]);
async function as(id, sql, params=[]) {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:id,role:'authenticated'})]);
  await db.exec('SET ROLE authenticated');
  try { return await db.query(sql,params); } finally { await db.exec('RESET ROLE'); }
}
async function like(id,desired){ return (await as(id,'SELECT public.set_community_like($1,$2) AS n',[post.id,desired])).rows[0].n; }
assert.equal(await like(a,true),1);
assert.equal(await like(a,true),1); // repeated requests are idempotent
assert.equal(await like(b,true),2);
assert.equal((await as(a,'SELECT * FROM community_likes')).rows.length,1); // only own rows
await assert.rejects(as(a,'UPDATE community_posts SET likes_count=100 WHERE id=$1',[post.id]),/permission denied/);
assert.equal(await like(a,false),1);
assert.equal(await like(a,false),1);
assert.equal(await like(b,false),0);
await db.exec("SELECT set_config('request.jwt.claims','{}',false)");
await db.query('UPDATE profiles SET is_banned=true WHERE id=$1',[b]);
await assert.rejects(like(b,true),/Conta suspensa/);
await db.exec("SELECT set_config('request.jwt.claims','{}',false)");
await assert.rejects(db.query(`INSERT INTO products(title,description,price,category,sport,condition,product_type,seller_id,seller_name) VALUES ('Tênis','Usado',10,'Calçados','Corrida','usado_bom','c2c',$1,'Atleta')`,[a]),/telefone/);
const product = await db.query(`INSERT INTO products(title,description,price,category,sport,condition,product_type,seller_id,seller_name,contact_phone) VALUES ('Tênis','Usado',10,'Calçados','Corrida','usado_bom','c2c',$1,'Atleta','5541999999999') RETURNING contact_phone`,[a]);
assert.equal(product.rows[0].contact_phone,'5541999999999');
await db.close();
console.log('PASS: signup sport, unique/idempotent likes, RLS, count bypass, banned account and required seller phone');
