/** Real PostgreSQL roles/RLS/triggers, in-memory only. No test account reaches production. */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = await PGlite.create();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),email text,raw_user_meta_data jsonb DEFAULT '{}',email_confirmed_at timestamptz);
CREATE TABLE auth.sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE);
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT (auth.jwt()->>'sub')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT coalesce(auth.jwt()->>'role','anon') $$;
GRANT USAGE ON SCHEMA auth TO authenticated,anon;`);
async function migrate(file) { await db.exec(readFileSync(new URL('../../supabase/migrations/'+file, import.meta.url),'utf8').replace(/CREATE EXTENSION IF NOT EXISTS "(uuid-ossp|pgcrypto)";/g,'')); }
for (const file of ['20250101000000_coremotiom_initial_schema.sql','20261008000000_roles_hierarchy_and_security.sql','20261009000000_security_fixes.sql','20261020000000_retire_store_b2c_marketplace.sql','20261023000000_external_offers_management.sql','20261023130000_sports_recruitment.sql','20261026160000_seller_contact_and_unique_likes.sql','20261103060000_reconcile_current_schema.sql']) await migrate(file);
await db.exec('GRANT SELECT,INSERT,UPDATE,DELETE ON public.external_offers TO authenticated');
// Production's separate AFTER INSERT profile trigger must survive removal of the legacy BEFORE trigger.
await db.exec(`ALTER TRIGGER on_auth_user_created ON auth.users RENAME TO on_auth_user_profile_created;
CREATE FUNCTION public.handle_new_auth_user() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.email_confirmed_at=now(); RETURN NEW; END $$;
CREATE TRIGGER on_auth_user_created BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();`);
for (const file of ['20261104130000_moderation_workspace.sql','20261104131000_supervisor_sports_moderation.sql','20261104132000_validate_sports_records.sql','20261104133000_harden_profile_guard.sql']) await migrate(file);
// Reproduce the legacy production constraint from the reported error.
await db.exec("ALTER TABLE profiles DROP CONSTRAINT profiles_role_check; ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK(role IN ('admin','merchant','seller','user'))");
await migrate('20261104220000_administrator_account_management.sql');
const ids = { admin:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',supervisor:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',athlete:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',coach:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',casual:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' };
for (const [role,id] of Object.entries(ids)) {
 await db.query('INSERT INTO auth.users(id,email) VALUES($1,$2)',[id,`${role}@test.invalid`]);
 await db.query('UPDATE profiles SET role=$2,account_type=$3 WHERE id=$1',[id,['admin','supervisor'].includes(role)?role:'user',['athlete','coach','casual'].includes(role)?role:'casual']);
}
let checks=0;
function check(value) { assert.ok(value); checks++; }
async function as(name,sql,params=[],extraClaims={}) {
 await db.exec('RESET ROLE');
 await db.query("SELECT set_config('request.jwt.claims',$1,false)",[JSON.stringify(name==='anon'?{}:{sub:ids[name],email:`${name}@test.invalid`,role:'authenticated',...extraClaims})]);
 await db.exec(`SET ROLE ${name==='anon'?'anon':'authenticated'}`);
 try { return await db.query(sql,params); } finally { await db.exec('RESET ROLE'); await db.query("SELECT set_config('request.jwt.claims','{}',false)"); }
}
async function denied(name,sql,params=[],pattern=/permission denied|Somente|permitid|restrit|protegid|não moderam|policy|check|privilege/i) { await assert.rejects(as(name,sql,params),pattern); checks++; }
check((await db.query('SELECT count(*)::int AS n FROM profiles')).rows[0].n===5);
check((await db.query('SELECT email_confirmed_at FROM auth.users WHERE id=$1',[ids.athlete])).rows[0].email_confirmed_at===null);
check((await db.query("SELECT count(*)::int AS n FROM pg_trigger WHERE tgrelid='auth.users'::regclass AND tgname='on_auth_user_profile_created'")).rows[0].n===1);
await as('athlete',"UPDATE profiles SET name='Nome salvo',phone='5541999999999',city='Curitiba' WHERE id=$1",[ids.athlete]);
check((await as('athlete','SELECT name FROM profiles WHERE id=$1',[ids.athlete])).rows[0].name==='Nome salvo');
await denied('athlete',"UPDATE profiles SET role='supervisor' WHERE id=$1",[ids.athlete]);
await denied('athlete',"UPDATE profiles SET account_type='coach' WHERE id=$1",[ids.athlete]);
await denied('athlete',"UPDATE profiles SET email='other@test.invalid' WHERE id=$1",[ids.athlete]);
await denied('supervisor',"UPDATE profiles SET role='supervisor' WHERE id=$1",[ids.athlete]);
await denied('supervisor',"UPDATE profiles SET account_type='casual' WHERE id=$1",[ids.athlete]);
await denied('supervisor',"UPDATE profiles SET name='Invadido' WHERE id=$1",[ids.athlete]);
await denied('supervisor',"SELECT moderate_account($1,'role','supervisor','athlete')",[ids.athlete]);
await denied('supervisor',"SELECT moderate_account($1,'delete')",[ids.athlete]);
check((await as('supervisor','DELETE FROM profiles WHERE id=$1 RETURNING id',[ids.athlete])).rows.length===0);
await denied('athlete',"SELECT moderate_account($1,'ban',NULL,NULL,'Tentativa indevida')",[ids.coach]);
await as('supervisor',"SELECT moderate_account($1,'ban',NULL,NULL,'Revisão de conduta')",[ids.athlete]);
check((await as('supervisor','SELECT is_banned FROM profiles WHERE id=$1',[ids.athlete])).rows[0].is_banned);
await denied('athlete',"INSERT INTO moderation_reports(category,target_id,target_title,reason) VALUES('community','x','Postagem','Spam repetido')");
await denied('athlete',"UPDATE profiles SET name='Banned edit' WHERE id=$1",[ids.athlete],/suspensa/i);
await as('supervisor',"SELECT moderate_account($1,'unban')",[ids.athlete]);
check(!(await as('athlete','SELECT is_banned FROM profiles WHERE id=$1',[ids.athlete])).rows[0].is_banned);
await denied('supervisor',"SELECT moderate_account($1,'ban',NULL,NULL,'Revisão de conduta')",[ids.admin]);
await denied('supervisor',"SELECT moderate_account($1,'ban',NULL,NULL,'Revisão de conduta')",[ids.supervisor]);
const report=(await as('athlete',"INSERT INTO moderation_reports(category,target_id,target_title,reason) VALUES('athlete_listing','listing-1','Produto de teste','Preço incorreto') RETURNING id")).rows[0];
check((await as('coach','SELECT * FROM moderation_reports')).rows.length===0);
check((await as('supervisor','SELECT * FROM moderation_reports')).rows.length===1);
await denied('anon','SELECT * FROM moderation_reports');
await denied('athlete',"SELECT review_moderation_report($1,'resolved','Tudo revisado')",[report.id]);
await denied('athlete',"UPDATE moderation_reports SET status='resolved' WHERE id=$1 RETURNING id",[report.id]);
await as('supervisor',"SELECT review_moderation_report($1,'resolved','O anúncio foi revisado pela equipe.')",[report.id]);
check((await as('athlete','SELECT status FROM moderation_reports WHERE id=$1',[report.id])).rows[0].status==='resolved');
const notification=(await as('athlete','SELECT * FROM account_notifications')).rows[0];
check(notification.message==='O anúncio foi revisado pela equipe.');
check((await as('coach','SELECT * FROM account_notifications')).rows.length===0);
await as('coach','SELECT read_account_notification($1)',[notification.id]);
check((await as('athlete','SELECT read_at FROM account_notifications')).rows[0].read_at===null);
await as('athlete','SELECT read_account_notification($1)',[notification.id]);
check((await as('athlete','SELECT read_at FROM account_notifications')).rows[0].read_at!==null);
await denied('athlete',"SELECT notify_content_owner('athlete_listing','listing-1','Corrija o anúncio.')");
const product=(await as('athlete',"INSERT INTO products(title,description,price,category,sport,condition,product_type,seller_id,seller_name,contact_phone) VALUES('Tênis de teste','Descrição',150,'Calçados','Corrida','usado_bom','c2c',$1,'Atleta','5541999999999') RETURNING id",[ids.athlete])).rows[0];
await as('supervisor',"SELECT notify_content_owner('athlete_listing',$1,'Envie fotos atualizadas do produto.')",[product.id]);
check((await as('athlete','SELECT * FROM account_notifications')).rows.length===2);
await as('supervisor',"UPDATE products SET status='suspended' WHERE id=$1",[product.id]);
check((await as('supervisor','SELECT status FROM products WHERE id=$1',[product.id])).rows[0].status==='suspended');
await as('supervisor',"INSERT INTO external_offers(id,title,store_name,price,image_url,source_url) VALUES('test-offer','Oferta de teste','Loja',50,'/test.jpg','https://example.com/produto')");
await as('supervisor',"UPDATE external_offers SET price=60 WHERE id='test-offer'");
check(Number((await as('supervisor',"SELECT price FROM external_offers WHERE id='test-offer'")).rows[0].price)===60);
const profile=(await as('athlete',`INSERT INTO sports_records(owner,kind,data) VALUES($1,'athlete','{"name":"Atleta","sport":"Vôlei","city":"Curitiba","age":"20","height":"180","weight":"75","experience":"3"}') RETURNING id`,[ids.athlete])).rows[0];
await as('supervisor',`UPDATE sports_records SET data=jsonb_set(data,'{city}','"Londrina"') WHERE id=$1`,[profile.id]);
check((await as('supervisor',"SELECT data->>'city' AS city FROM sports_records WHERE id=$1",[profile.id])).rows[0].city==='Londrina');
check((await as('casual','SELECT * FROM sports_records WHERE id=$1',[profile.id])).rows.length===0);
await as('supervisor','DELETE FROM sports_records WHERE id=$1',[profile.id]);
check((await as('supervisor','SELECT * FROM sports_records')).rows.length===0);
await denied('athlete','SELECT moderation_diagnostics()');
const diagnostics=(await as('supervisor','SELECT moderation_diagnostics() AS result')).rows[0].result;
check(diagnostics.profiles===5 && diagnostics.reports_open===0 && diagnostics.rls.moderation_reports===true);
await as('admin',"SELECT moderate_account($1,'role','supervisor','athlete')",[ids.athlete]);
check((await as('admin','SELECT role FROM profiles WHERE id=$1',[ids.athlete])).rows[0].role==='supervisor');
await as('admin',"SELECT moderate_account($1,'role','user','casual')",[ids.athlete]);
check((await as('admin','SELECT account_type FROM profiles WHERE id=$1',[ids.athlete])).rows[0].account_type==='casual');
// Administrators can manage other administrators, but never delete themselves.
await as('admin',"SELECT moderate_account($1,'role','admin','coach')",[ids.coach]);
check((await as('coach','SELECT public.is_admin() AS allowed')).rows[0].allowed===true);
await denied('supervisor',"SELECT moderate_account($1,'delete')",[ids.coach]);
await denied('admin',"SELECT moderate_account($1,'delete')",[ids.admin]);
check((await as('admin','DELETE FROM profiles WHERE id=$1 RETURNING id',[ids.admin])).rows.length===0);
await as('admin',"SELECT moderate_account($1,'role','user','coach')",[ids.coach]);
check((await as('coach','SELECT public.is_admin() AS allowed',[],{email:'professorchines2026@gmail.com'})).rows[0].allowed===false);
await as('admin',"SELECT moderate_account($1,'role','admin','coach')",[ids.coach]);
await as('admin',"SELECT moderate_account($1,'delete')",[ids.coach]);
check((await db.query('SELECT * FROM auth.users WHERE id=$1',[ids.coach])).rows.length===0);
check((await db.query('SELECT * FROM profiles WHERE id=$1',[ids.coach])).rows.length===0);
check((await as('supervisor','SELECT * FROM moderation_audit')).rows.length>=7);
await denied('anon','SELECT moderation_diagnostics()');
// Recreated historical admin email and metadata never auto-promote a new signup.
const recreated='ffffffff-ffff-4fff-8fff-ffffffffffff';
await db.query(`INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES($1,'admin@coremotiom.com','{"role":"admin","account_type":"coach","sport":"Vôlei"}')`,[recreated]);
const recreatedProfile=(await db.query('SELECT role,account_type,sport_interests FROM profiles WHERE id=$1',[recreated])).rows[0];
check(recreatedProfile.role==='user' && recreatedProfile.account_type==='coach');
check(recreatedProfile.sport_interests.includes('Vôlei'));
await db.close();
console.log(`PASS: ${checks} moderation authorization/persistence checks, including real PostgreSQL RLS and supervisor restrictions.`);
