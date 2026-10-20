/**
 * Testes de autorização do banco (RLS, triggers e privilégios).
 *
 * Executa em PostgreSQL em memória (PGlite) o esquema inicial e as migrações
 * 20261008000000_roles_hierarchy_and_security.sql, 20261009000000_security_fixes.sql
 * e 20261020000000_retire_store_b2c_marketplace.sql,
 * com um "shim" mínimo do Supabase Auth
 * (schema auth, funções auth.uid()/auth.role()/auth.jwt() e roles anon/authenticated).
 * Cada cenário assume um papel real do PostgreSQL com um JWT, como faz o PostgREST.
 *
 * O shim existe SOMENTE para o teste. Em produção, o Supabase fornece essas funções.
 *
 * Uso:  npm install && npm test   (dentro de database/tests)
 */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(here, '../../supabase/migrations');
const INITIAL = resolve(migrationsDir, '20250101000000_coremotiom_initial_schema.sql');
const HARDENING = resolve(migrationsDir, '20261008000000_roles_hierarchy_and_security.sql');
const SECURITY_FIXES = resolve(migrationsDir, '20261009000000_security_fixes.sql');
const RETIREMENT = resolve(migrationsDir, '20261020000000_retire_store_b2c_marketplace.sql');
const BASELINE_MODE = process.env.BASELINE === '1';

const AUTH_SHIM = `
  CREATE ROLE anon NOLOGIN;
  CREATE ROLE authenticated NOLOGIN;
  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
    SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
    SELECT nullif(auth.jwt() ->> 'sub', '')::uuid $$;
  CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
    SELECT coalesce(nullif(auth.jwt() ->> 'role', ''), 'anon') $$;
  GRANT USAGE ON SCHEMA auth TO anon, authenticated;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated;
`;

const results = [];
let db;
let legacyStoreId = null;
let legacyB2cId = null;

/** Executa SQL como um papel do PostgreSQL com as claims do JWT informadas. */
async function run(role, claims, sql, params = []) {
  await db.query('RESET ROLE');
  await db.query(`SELECT set_config('request.jwt.claims', $1, false)`, [JSON.stringify(claims)]);
  if (role !== 'postgres') await db.query(`SET ROLE ${role}`);
  try {
    const res = await db.query(sql, params);
    return { ok: true, rows: res.rows, affected: res.affectedRows ?? res.rows.length };
  } catch (err) {
    return { ok: false, error: err.message, rows: [], affected: 0 };
  } finally {
    await db.query('RESET ROLE');
  }
}

/** Leitura como superusuário (verificação do estado real do banco, sem RLS). */
async function state(sql, params = []) {
  const r = await db.query(sql, params);
  return r.rows[0] ?? {}; // linha ausente vira objeto vazio: a verificação falha, sem erro fatal
}

/** Escrita de preparo/moderação como superusuário: zera as claims da sessão (auth.uid() fica nulo). */
async function sys(sql, params = []) {
  await db.query(`SELECT set_config('request.jwt.claims', '{}', false)`);
  return db.query(sql, params);
}

function check(name, pass, detail = '') {
  results.push({ name, pass: Boolean(pass), detail });
}

async function main() {
  db = await PGlite.create();
  await db.exec(AUTH_SHIM);
  // gen_random_uuid() é nativa no PostgreSQL 13+, então as extensões uuid-ossp/pgcrypto,
  // que não são usadas pelo esquema, são omitidas apenas neste ambiente de teste.
  const initialSql = readFileSync(INITIAL, 'utf8').replace(
    /CREATE EXTENSION IF NOT EXISTS "(uuid-ossp|pgcrypto)";/g,
    '-- extensão omitida no teste (não utilizada pelo esquema)'
  );
  await db.exec(initialSql);
  // BASELINE=1 executa somente o esquema inicial (linha de base, para comparação antes/depois).
  if (!BASELINE_MODE) {
    await db.exec(readFileSync(HARDENING, 'utf8'));
    await db.exec(readFileSync(SECURITY_FIXES, 'utf8'));

    // Dados criados pela versão anterior: a nova migração deve preservá-los,
    // mas removê-los dos fluxos públicos e impedir novos usos B2C.
    const legacyStore = await db.query(
      `INSERT INTO public.stores (name, slug, category, contact_email, cnpj, verification_status, is_verified, verification_docs)
       VALUES ('Loja legada de teste', 'loja-legada-teste', 'Equipamentos', 'legado@exemplo.test', '00000000000000', 'none', false,
               '{"cnpj":"00000000000000"}'::jsonb)
       RETURNING id`
    );
    legacyStoreId = legacyStore.rows[0].id;
    const legacyProduct = await db.query(
      `INSERT INTO public.products (title, description, price, category, sport, seller_name, product_type, status, store_id, is_verified_store)
       VALUES ('Produto B2C legado de teste', 'Registro preservado apenas para compatibilidade', 100, 'Equipamentos', 'Corrida', 'Loja legada', 'b2c', 'active', $1, false)
       RETURNING id`,
      [legacyStoreId]
    );
    legacyB2cId = legacyProduct.rows[0].id;

    await db.exec(readFileSync(RETIREMENT, 'utf8'));
  }

  // Contas de teste. Cada cadastro dispara handle_new_user, como o Supabase Auth faz.
  const accounts = {
    master: { email: 'mattheusxmljz@gmail.com' },
    spoof: { email: 'mattheusxmljz.fake@gmail.com' },
    hacker: { email: 'hacker@evil.com', meta: { role: 'admin' } },
    sup: { email: 'supervisor@coremotiom.com' },
    seller: { email: 'loja@atleta.com' },
    a1: { email: 'carlos@atleta.com' },
    a2: { email: 'ana@atleta.com' },
    victim: { email: 'vitima@atleta.com' },
  };
  const id = {};
  for (const [key, acc] of Object.entries(accounts)) {
    const r = await db.query(
      `INSERT INTO auth.users (email, raw_user_meta_data) VALUES ($1, $2::jsonb) RETURNING id`,
      [acc.email, JSON.stringify(acc.meta || {})]
    );
    id[key] = r.rows[0].id;
  }
  // Papéis definidos pelo administrador do banco (equivale a um admin via painel).
  try {
    await db.query(`UPDATE public.profiles SET role = 'supervisor' WHERE id = $1`, [id.sup]);
  } catch {
    // Linha de base: o esquema original não aceita o papel 'supervisor' (permanece 'user').
  }
  await db.query(`UPDATE public.profiles SET role = 'seller' WHERE id = $1`, [id.seller]);

  const claims = (key) => ({ sub: id[key], role: 'authenticated', email: accounts[key].email });
  const profile = (key) => state(`SELECT * FROM public.profiles WHERE id = $1`, [id[key]]);

  // ------------------------------------------------------------------ 1. Cadastro e bootstrap
  check('Cadastro com metadado role=admin NÃO gera administrador', (await profile('hacker')).role === 'user');
  check('Conta-mestre recebe papel admin no cadastro', (await profile('master')).role === 'admin');
  check('E-mail com prefixo da conta-mestre NÃO recebe admin (comparação exata)', (await profile('spoof')).role === 'user');

  // ------------------------------------------------------------------ 2. Escalonamento
  await run('authenticated', claims('a1'), `UPDATE public.profiles SET role = 'admin' WHERE id = $1`, [id.a1]);
  check('Atleta não se promove a admin pelo próprio perfil', (await profile('a1')).role === 'user');

  await run('authenticated', claims('a1'), `UPDATE public.profiles SET email = 'mattheusxmljz@gmail.com' WHERE id = $1`, [id.a1]);
  check('Atleta não troca o e-mail para o da conta-mestre', (await profile('a1')).email === accounts.a1.email);

  await run('authenticated', claims('a1'), `UPDATE public.profiles SET is_banned = true, name = 'Carlos Editado' WHERE id = $1`, [id.a1]);
  const a1 = await profile('a1');
  check('Atleta edita o próprio nome, mas não se suspende', a1.name === 'Carlos Editado' && a1.is_banned === false);

  const cross = await run('authenticated', claims('a1'), `UPDATE public.profiles SET name = 'Invadido' WHERE id = $1`, [id.a2]);
  check('Atleta não altera o perfil de outro usuário (RLS)', cross.ok && cross.affected === 0 && (await profile('a2')).name !== 'Invadido');

  const ownOnly = await run('authenticated', claims('a1'), `SELECT id FROM public.profiles`);
  check('Atleta enxerga somente o próprio perfil', ownOnly.ok && ownOnly.rows.length === 1);

  // ------------------------------------------------------------------ 3. Supervisor
  const supView = await run('authenticated', claims('sup'), `SELECT id FROM public.profiles`);
  check('Supervisor enxerga todos os perfis (moderação)', supView.ok && supView.rows.length === Object.keys(accounts).length);

  await run('authenticated', claims('sup'), `UPDATE public.profiles SET is_banned = true, ban_reason = 'spam' WHERE id = $1`, [id.victim]);
  check('Supervisor suspende um atleta', (await profile('victim')).is_banned === true);

  await run('authenticated', claims('sup'), `UPDATE public.profiles SET is_banned = true WHERE id = $1`, [id.master]);
  check('Supervisor NÃO suspende conta-mestre/administrador', (await profile('master')).is_banned === false);

  await run('authenticated', claims('sup'), `UPDATE public.profiles SET role = 'admin' WHERE id = $1`, [id.a2]);
  check('Supervisor NÃO altera papéis', (await profile('a2')).role === 'user');

  const supDelete = await run('authenticated', claims('sup'), `DELETE FROM public.profiles WHERE id = $1`, [id.a2]);
  check('Supervisor NÃO exclui perfis', supDelete.ok && supDelete.affected === 0 && (await profile('a2')).id !== undefined);

  await run('authenticated', claims('sup'), `UPDATE public.profiles SET is_banned = false WHERE id = $1`, [id.victim]);
  check('Supervisor reativa atleta', (await profile('victim')).is_banned === false);

  // ------------------------------------------------------------------ 4. Anúncios
  const forged = await run('authenticated', claims('a1'),
    `INSERT INTO public.products (title, description, price, category, sport, seller_name, seller_id, product_type, status)
     VALUES ('Bola de corrida', 'Bola oficial pouco usada', 120, 'Equipamentos', 'Futebol', 'FORJADO', $1, 'c2c', 'active')`, [id.victim]);
  const forgedCount = await state(`SELECT count(*)::int AS n FROM public.products WHERE seller_name = 'FORJADO' AND seller_id = $1`, [id.victim]);
  check('Anúncio com seller_id de outro é gravado em nome do autor (trigger)', forged.ok ? forgedCount.n === 0 : true);

  const c2c = await run('authenticated', claims('a1'),
    `INSERT INTO public.products (title, description, price, category, sport, seller_name, seller_id, product_type, status)
     VALUES ('Bola de corrida', 'Bola oficial pouco usada', 120, 'Equipamentos', 'Futebol', 'Carlos', $1, 'c2c', 'active') RETURNING id`, [id.a1]);
  check('Atleta publica anúncio C2C', c2c.ok && c2c.rows.length === 1, c2c.error || '');
  const c2cId = c2c.rows[0]?.id;

  const b2c = await run('authenticated', claims('a1'),
    `INSERT INTO public.products (title, description, price, category, sport, seller_name, seller_id, product_type, status)
     VALUES ('Anúncio B2C', 'Oferta externa não publicável como anúncio', 99, 'Equipamentos', 'Corrida', 'Atleta', $1, 'b2c', 'active')`, [id.a1]);
  check('Atleta não publica anúncio B2C', !b2c.ok);

  if (!BASELINE_MODE) {
    const legacySellerB2c = await run('authenticated', claims('seller'),
      `INSERT INTO public.products (title, description, price, category, sport, seller_name, seller_id, product_type, status)
       VALUES ('Novo anúncio B2C', 'Tentativa pelo papel seller legado', 99, 'Equipamentos', 'Corrida', 'Anunciante', $1, 'b2c', 'active')`, [id.seller]);
    check('Papel seller legado também não publica novos anúncios B2C', !legacySellerB2c.ok && /B2C/i.test(legacySellerB2c.error || ''));

    const directB2c = await run('postgres', {},
      `INSERT INTO public.products (title, description, price, category, sport, seller_name, product_type, status)
       VALUES ('Novo anúncio B2C direto', 'Tentativa de escrita direta no banco', 99, 'Equipamentos', 'Corrida', 'Anunciante', 'b2c', 'active')`);
    check('Banco rejeita novas linhas B2C mesmo fora da API', !directB2c.ok && /B2C/i.test(directB2c.error || ''));
    const directB2cUpdate = await run('postgres', {}, `UPDATE public.products SET product_type = 'b2c' WHERE id = $1`, [c2cId]);
    check('Banco impede converter anúncio C2C em B2C', !directB2cUpdate.ok && /B2C/i.test(directB2cUpdate.error || ''));

    const legacyProductRow = await state(`SELECT product_type, store_id FROM public.products WHERE id = $1`, [legacyB2cId]);
    check('Registros B2C e vínculo de loja legados são preservados', legacyProductRow.product_type === 'b2c' && legacyProductRow.store_id === legacyStoreId);
    const anonLegacyProduct = await run('anon', {}, `SELECT id FROM public.products WHERE id = $1`, [legacyB2cId]);
    check('Visitante não recebe anúncios B2C legados pela API pública', anonLegacyProduct.ok && anonLegacyProduct.rows.length === 0);
    const sellerLegacyProduct = await run('authenticated', claims('seller'), `SELECT id FROM public.products WHERE id = $1`, [legacyB2cId]);
    check('Papel seller não consulta anúncios B2C legados', sellerLegacyProduct.ok && sellerLegacyProduct.rows.length === 0);
    const legacyProductUpdate = await run('authenticated', claims('seller'), `UPDATE public.products SET status = 'draft' WHERE id = $1`, [legacyB2cId]);
    check('Papel seller não altera anúncio B2C legado', legacyProductUpdate.ok && legacyProductUpdate.affected === 0);
    const legacyProductDelete = await run('authenticated', claims('seller'), `DELETE FROM public.products WHERE id = $1`, [legacyB2cId]);
    check('Papel seller não exclui anúncio B2C legado', legacyProductDelete.ok && legacyProductDelete.affected === 0);

    const legacyB2cOrder = await run('authenticated', claims('a1'),
      `INSERT INTO public.orders (user_id, user_email, items, subtotal, shipping_fee, discount, total, payment_method, shipping_method)
       VALUES ($1, 'carlos@atleta.com', $2::jsonb, 100, 24.90, 0, 124.90, 'pix', 'pac')`,
      [id.a1, JSON.stringify([{ product: { id: legacyB2cId }, quantity: 1 }])]);
    check('Checkout bloqueia pedidos de anúncios B2C legados', !legacyB2cOrder.ok && /C2C/i.test(legacyB2cOrder.error || ''));

    const legacyStoreRow = await state(`SELECT cnpj FROM public.stores WHERE id = $1`, [legacyStoreId]);
    check('Dados estruturais legados da loja permanecem no banco', legacyStoreRow.cnpj === '00000000000000');
    const anonStores = await run('anon', {}, `SELECT id FROM public.stores`);
    check('Tabela legada de lojas não é acessível a visitantes', !anonStores.ok);
    const sellerStores = await run('authenticated', claims('seller'), `SELECT id FROM public.stores`);
    check('Tabela legada de lojas não é acessível via sessão autenticada', !sellerStores.ok);
    const storeWrite = await run('authenticated', claims('seller'),
      `INSERT INTO public.stores (name, slug, category, contact_email) VALUES ('Nova loja', 'nova-loja', 'Equipamentos', 'nova@exemplo.test')`);
    check('Sessões autenticadas não criam novos perfis de loja', !storeWrite.ok);
  }

  await run('authenticated', claims('a1'), `UPDATE public.products SET status = 'suspended' WHERE id = $1`, [c2cId]);
  check('Dono não se autossuspende (moderação é exclusiva de staff)',
    (await state(`SELECT status FROM public.products WHERE id = $1`, [c2cId])).status === 'active');

  await run('authenticated', claims('sup'), `UPDATE public.products SET status = 'suspended' WHERE id = $1`, [c2cId]);
  check('Supervisor suspende anúncio', (await state(`SELECT status FROM public.products WHERE id = $1`, [c2cId])).status === 'suspended');

  const anonHidden = await run('anon', {}, `SELECT id FROM public.products WHERE id = $1`, [c2cId]);
  check('Anônimo não vê anúncio suspenso', anonHidden.ok && anonHidden.rows.length === 0);

  // Store profiles are legacy data; current access is covered by the retirement checks above.

  // ------------------------------------------------------------------ 6. Pedidos
  const order = await run('authenticated', claims('a2'),
    `INSERT INTO public.orders (user_id, user_email, items, subtotal, shipping_fee, discount, total, payment_method, payment_status, order_status)
     VALUES ($1, 'ana@atleta.com', (SELECT jsonb_agg(jsonb_build_object('product', jsonb_build_object('id', x.id), 'quantity', 1)) FROM (SELECT id FROM public.products WHERE status = 'active' LIMIT 1) x), 100, 10, 0, 110, 'pix', 'paid', 'escrow_locked')
     RETURNING id, payment_status, order_status, total`, [id.a2]);
  check('Cliente não cria pedido já pago ou em custódia',
    order.ok && order.rows[0].payment_status === 'pending' && order.rows[0].order_status === 'pending_payment', order.error || '');
  const orderId = order.rows[0]?.id;

  await run('authenticated', claims('a2'), `UPDATE public.orders SET payment_status = 'paid', total = 1 WHERE id = $1`, [orderId]);
  const afterFraud = await state(`SELECT payment_status, total FROM public.orders WHERE id = $1`, [orderId]);
  check('Cliente não marca o próprio pedido como pago nem altera o total',
    afterFraud.payment_status === 'pending' && Number(afterFraud.total) === Number(order.rows[0].total));

  await run('authenticated', claims('a2'), `UPDATE public.orders SET order_status = 'cancelled' WHERE id = $1`, [orderId]);
  check('Cliente cancela pedido ainda não pago',
    (await state(`SELECT order_status FROM public.orders WHERE id = $1`, [orderId])).order_status === 'cancelled');

  const orderForeign = await run('authenticated', claims('a1'), `UPDATE public.orders SET order_status = 'shipped' WHERE id = $1`, [orderId]);
  check('Outro usuário não altera pedido alheio (RLS)', orderForeign.ok && orderForeign.affected === 0);

  await run('authenticated', claims('sup'), `UPDATE public.orders SET payment_status = 'paid', order_status = 'escrow_locked' WHERE id = $1`, [orderId]);
  check('Supervisor confirma pagamento do pedido',
    (await state(`SELECT payment_status FROM public.orders WHERE id = $1`, [orderId])).payment_status === 'paid');

  // ------------------------------------------------------------------ 7. Comunidade
  const post = await run('authenticated', claims('a1'),
    `INSERT INTO public.community_posts (author_id, author_name, title, content, category)
     VALUES ($1, 'Carlos', 'Treino', 'Treino de hoje', 'Corrida') RETURNING id`, [id.a1]);
  const postId = post.rows[0]?.id;
  check('Atleta publica na comunidade', post.ok && !!postId, post.error || '');

  await run('authenticated', claims('a2'), `UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = $1`, [postId]);
  check('Outro atleta curte a publicação',
    (await state(`SELECT likes_count FROM public.community_posts WHERE id = $1`, [postId])).likes_count === 1);

  await run('authenticated', claims('a2'), `UPDATE public.community_posts SET content = 'Conteúdo alterado' WHERE id = $1`, [postId]);
  check('Outro atleta NÃO altera o conteúdo da publicação',
    (await state(`SELECT content FROM public.community_posts WHERE id = $1`, [postId])).content === 'Treino de hoje');

  await run('authenticated', claims('a2'), `UPDATE public.community_posts SET is_reported = true, report_reason = 'spam' WHERE id = $1`, [postId]);
  check('Atleta denuncia a publicação',
    (await state(`SELECT is_reported FROM public.community_posts WHERE id = $1`, [postId])).is_reported === true);

  const delForeign = await run('authenticated', claims('a2'), `DELETE FROM public.community_posts WHERE id = $1`, [postId]);
  check('Atleta não remove publicação alheia', delForeign.ok && delForeign.affected === 0);

  await run('authenticated', claims('sup'), `DELETE FROM public.community_posts WHERE id = $1`, [postId]);
  check('Supervisor remove publicação denunciada',
    (await state(`SELECT count(*)::int AS n FROM public.community_posts WHERE id = $1`, [postId])).n === 0);

  // ------------------------------------------------------------------ 8. Suspensão efetiva
  await run('authenticated', claims('sup'), `UPDATE public.profiles SET is_banned = true WHERE id = $1`, [id.a2]);
  const bannedWrite = await run('authenticated', claims('a2'),
    `INSERT INTO public.community_posts (author_id, author_name, title, content, category)
     VALUES ($1, 'Ana', 'Post', 'Post de conta suspensa', 'Corrida')`, [id.a2]);
  check('Conta suspensa não consegue publicar na comunidade', !bannedWrite.ok && /row-level security/i.test(bannedWrite.error || ''), bannedWrite.error || '');
  await run('authenticated', claims('sup'), `UPDATE public.profiles SET is_banned = false WHERE id = $1`, [id.a2]);

  // ------------------------------------------------------------------ 9. Anônimo e privilégios
  const anonVitrine = await run('anon', {}, `SELECT id FROM public.products WHERE status = 'active'`);
  check('Anônimo lê a vitrine de anúncios ativos', anonVitrine.ok);

  const anonProfiles = await run('anon', {}, `SELECT id FROM public.profiles`);
  check('Anônimo NÃO lê perfis (e-mails protegidos)', !anonProfiles.ok && /permission denied/i.test(anonProfiles.error));

  const anonInsert = await run('anon', {}, `INSERT INTO public.products (title, description, price, category, sport, seller_name, seller_id)
     VALUES ('x', 'y', 1, 'c', 's', 'n', $1)`, [id.a1]);
  check('Anônimo não escreve em products', !anonInsert.ok && /permission denied/i.test(anonInsert.error));

  const truncate = await run('authenticated', claims('a1'), `TRUNCATE public.community_posts`);
  check('Autenticado não consegue TRUNCATE (RLS não cobre TRUNCATE)', !truncate.ok && /permission denied/i.test(truncate.error));

  const selfDelete = await run('authenticated', claims('a1'), `DELETE FROM public.profiles WHERE id = $1`, [id.a1]);
  check('Atleta não exclui o próprio perfil (somente administrador)', selfDelete.ok && selfDelete.affected === 0 && (await profile('a1')).id !== undefined);

  // ------------------------------------------------------------------ 10. Administrador
  const adminRole = await run('authenticated', claims('master'), `UPDATE public.profiles SET role = 'supervisor' WHERE id = $1`, [id.a1]);
  check('Administrador altera papel de atleta para supervisor', adminRole.ok && (await profile('a1')).role === 'supervisor');
  await run('authenticated', claims('master'), `UPDATE public.profiles SET role = 'user' WHERE id = $1`, [id.a1]);

  await run('authenticated', claims('master'), `UPDATE public.profiles SET is_banned = true, ban_reason = 'teste' WHERE id = $1`, [id.a2]);
  check('Administrador suspende atleta', (await profile('a2')).is_banned === true);
  await run('authenticated', claims('master'), `UPDATE public.profiles SET is_banned = false WHERE id = $1`, [id.a2]);

  const masterSelfDowngrade = await run('authenticated', claims('master'), `UPDATE public.profiles SET role = 'user' WHERE id = $1`, [id.master]);
  const masterStillAdmin = await run('authenticated', claims('master'), `SELECT public.is_admin() AS admin`);
  check('Conta-mestre mantém privilégio de administrador mesmo com papel gravado diferente',
    masterSelfDowngrade.ok && masterStillAdmin.rows[0].admin === true);
  await db.query(`UPDATE public.profiles SET role = 'admin' WHERE id = $1`, [id.master]);

  const adminDeletesProfile = await run('authenticated', claims('master'), `DELETE FROM public.profiles WHERE id = $1`, [id.victim]);
  check('Administrador exclui perfil via RLS', adminDeletesProfile.ok && adminDeletesProfile.affected === 1);

  await db.query(`DELETE FROM auth.users WHERE id = $1`, [id.a2]);
  check('Remoção de auth.users remove o perfil em cascata',
    (await state(`SELECT count(*)::int AS n FROM public.profiles WHERE id = $1`, [id.a2])).n === 0);

  // ------------------------------------------------ Regressões (migração 20261009000000)
  // Anúncio C2C de teste para as verificações de status e cálculo do pedido.
  const regProdIns = await sys(
    `INSERT INTO public.products (title, description, price, category, sport, seller_name, seller_id, product_type, status)
     VALUES ('Anúncio C2C regressão', 'Anúncio usado nos testes de regressão', 100.00, 'Calçados', 'Corrida', 'Atleta', $1, 'c2c', 'active')
     RETURNING id`,
    [id.seller]
  );
  const regProdId = regProdIns.rows[0].id;

  // E1 / C3: o dono não reativa anúncio suspenso; a moderação reativa.
  await sys(`UPDATE public.products SET status = 'suspended' WHERE id = $1`, [regProdId]);
  await run('authenticated', claims('seller'), `UPDATE public.products SET status = 'active' WHERE id = $1`, [regProdId]);
  check('E1 dono não reativa anúncio suspenso',
    (await state(`SELECT status FROM public.products WHERE id = $1`, [regProdId])).status === 'suspended');
  const regModReactivates = await run('authenticated', claims('sup'), `UPDATE public.products SET status = 'active' WHERE id = $1`, [regProdId]);
  check('E1 supervisor reativa anúncio suspenso',
    regModReactivates.ok && (await state(`SELECT status FROM public.products WHERE id = $1`, [regProdId])).status === 'active');

  // E2 / C4 + C11: o total enviado pelo cliente (0,01) é ignorado; o banco recalcula.
  // 2 x R$ 100,00 = 200,00; PIX 5% = 10,00; frete PAC = 24,90; total = 214,90.
  const regOrderIns = await run('authenticated', claims('a1'),
    `INSERT INTO public.orders (user_id, user_email, items, subtotal, shipping_fee, discount, total, payment_method, shipping_method)
     VALUES ($1, 'carlos@atleta.com', $2::jsonb, 0.01, 0, 0, 0.01, 'pix', 'pac') RETURNING id`,
    [id.a1, JSON.stringify([{ product: { id: regProdId }, quantity: 2 }])]);
  const regOrderRow = regOrderIns.ok ? await state(`SELECT subtotal, shipping_fee, discount, total FROM public.orders WHERE id = $1`, [regOrderIns.rows[0].id]) : {};
  check('E2 total do pedido é recalculado pelo banco (PIX, frete PAC)',
    regOrderIns.ok && Number(regOrderRow.subtotal) === 200 && Number(regOrderRow.discount) === 10 && Number(regOrderRow.shipping_fee) === 24.9 && Number(regOrderRow.total) === 214.9,
    regOrderIns.ok ? '' : regOrderIns.error);
  await sys(`UPDATE public.products SET status = 'suspended' WHERE id = $1`, [regProdId]);
  const regOrderSuspended = await run('authenticated', claims('a1'),
    `INSERT INTO public.orders (user_id, user_email, items, subtotal, shipping_fee, discount, total, payment_method, shipping_method)
     VALUES ($1, 'carlos@atleta.com', $2::jsonb, 1, 0, 0, 1, 'boleto', 'pac')`,
    [id.a1, JSON.stringify([{ product: { id: regProdId }, quantity: 1 }])]);
  check('E2 pedido de anúncio suspenso é recusado', !regOrderSuspended.ok);
  await sys(`UPDATE public.products SET status = 'active' WHERE id = $1`, [regProdId]);

  // E3 / C5: não autor não limpa denúncia nem apaga comentário; acrescenta um comentário por vez.
  const regPostIns = await sys(
    `INSERT INTO public.community_posts (author_id, author_name, title, content, category, is_reported, report_reason, comments, comments_count)
     VALUES ($1, 'Loja', 'Post regressão', 'Conteúdo de teste do post', 'Dicas', true, 'spam',
             '[{"id":"c1","author_name":"Ana","content":"Olá"}]'::jsonb, 1)
     RETURNING id`,
    [id.seller]
  );
  const regPostId = regPostIns.rows[0].id;
  const regWipeAttempt = await run('authenticated', claims('a1'),
    `UPDATE public.community_posts SET is_reported = false, report_reason = NULL, comments = '[]'::jsonb, comments_count = 0 WHERE id = $1`, [regPostId]);
  const regAfterWipe = await state(`SELECT is_reported, jsonb_array_length(comments) AS n FROM public.community_posts WHERE id = $1`, [regPostId]);
  check('E3 não autor não apaga comentários nem limpa denúncia (ataque combinado)',
    regWipeAttempt.ok === false && regAfterWipe.is_reported === true && Number(regAfterWipe.n) === 1);
  await run('authenticated', claims('a1'), `UPDATE public.community_posts SET is_reported = false WHERE id = $1`, [regPostId]);
  check('E3 não autor não remove denúncia isoladamente',
    (await state(`SELECT is_reported FROM public.community_posts WHERE id = $1`, [regPostId])).is_reported === true);
  const regAppendOne = await run('authenticated', claims('a1'),
    `UPDATE public.community_posts SET comments = comments || $2::jsonb, comments_count = comments_count + 1 WHERE id = $1`,
    [regPostId, JSON.stringify([{ id: 'c2', author_name: 'Carlos', content: 'Boa!' }])]);
  check('E3 não autor acrescenta um comentário',
    regAppendOne.ok && Number((await state(`SELECT jsonb_array_length(comments) AS n FROM public.community_posts WHERE id = $1`, [regPostId])).n) === 2);

  // Store verification and badges are retired from the app; schema/data stay in place.

  // ------------------------------------------------------------------ Relatório
  const width = Math.max(...results.map((r) => r.name.length));
  let failed = 0;
  console.log(`\nTestes de autorização do banco (RLS, triggers e privilégios) — ${process.env.BASELINE === '1' ? 'LINHA DE BASE (esquema inicial)' : 'esquema endurecido'}\n`);
  for (const r of results) {
    if (!r.pass) failed += 1;
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name.padEnd(width)}${!r.pass && r.detail ? `  — ${r.detail}` : ''}`);
  }
  console.log(`\nTotal: ${results.length}  Aprovados: ${results.length - failed}  Reprovados: ${failed}\n`);
  await db.close();
  process.exitCode = failed === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error('Erro fatal nos testes:', err);
  process.exitCode = 2;
});
