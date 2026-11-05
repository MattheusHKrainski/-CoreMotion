import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
const id = '11111111-1111-4111-8111-111111111111';
const user = { id, email: 'atleta@test.com', role: 'authenticated', aud: 'authenticated', created_at: '2026-01-01T00:00:00Z', user_metadata: {}, app_metadata: {} };
const token = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now()/1000)+3600 })).toString('base64url')}.test-signature`;
let failWrites = false;
let failReads = false;
let failOtp = false;
let otpPayload: Record<string, unknown> = {};
let deniedRow = false;
const writes: { path: string; method: string; payload: Record<string, unknown> }[] = [];
let sqlCalls = 0;
const server = http.createServer(async (req, res) => {
  let body = ''; for await (const chunk of req) body += chunk;
  const path = req.url || '';
  const json = (status: number, data: unknown) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
  if (path.startsWith('/api/')) { sqlCalls++; return json(503, { error: 'SQL unavailable' }); }
  if (path.startsWith('/auth/v1/token')) return json(200, { user, access_token: token, refresh_token: 'refresh', token_type: 'bearer', expires_in: 3600 });
  if (path.startsWith('/auth/v1/otp')) { otpPayload=JSON.parse(body || '{}'); return failOtp ? json(429,{message:'Email rate limit exceeded'}) : json(200,{}); }
  if (path.startsWith('/auth/v1/user')) return json(200, user);
  if (path.startsWith('/auth/v1/logout')) return json(200, {});
  if (req.headers.authorization !== `Bearer ${token}`) return json(401, { message: 'Missing JWT' });
  if (failReads && req.method === 'GET') return json(400, { message: 'Read failed', code: 'PGRST000' });
  const payload = JSON.parse(body || '{}');
  if (req.method !== 'GET') {
    writes.push({ path, method: req.method || '', payload });
    if (failWrites) return json(503, { message: 'Database unavailable', code: '503' });
    if (deniedRow) {
      if (req.method === 'DELETE') return json(200, []);
      return json(406, { message: 'No rows', code: 'PGRST116' });
    }
  }
  if (path.startsWith('/rest/v1/profiles')) {
    const profile = { id, email: user.email, name: 'Atleta', role: 'user', account_type: 'athlete', ...payload };
    return json(200, req.headers.accept?.includes('object') ? profile : [profile]);
  }
  if (path.startsWith('/rest/v1/products')) return json(200, req.method === 'DELETE' ? [{ id }] : { id, ...payload });
  if (path.startsWith('/rest/v1/moderation_reports')) return json(201, { id: 'report-id' });
  if (path.startsWith('/rest/v1/rpc/')) return json(200, null);
  return json(404, { message: 'Unknown request' });
});
let auth: typeof import('../../services/auth');
let products: typeof import('../../services/products');
let moderation: typeof import('../../services/moderation');
let sb: ReturnType<typeof import('../../services/supabaseClient').getSupabaseClient>;
before(async () => {
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  process.env.NEXT_PUBLIC_SUPABASE_URL = base;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-test-key-only';
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { getItem: (key: string) => data.get(key) || null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) }, location: { origin: base, href: base, search: '', hash: '' } } });
  auth = await import('../../services/auth'); products = await import('../../services/products'); moderation = await import('../../services/moderation');
  sb = (await import('../../services/supabaseClient')).getSupabaseClient();
  const login = await auth.AuthService.loginWithEmail('atleta@test.com', 'correct-password');
  assert.equal(login.success, true);
});
after(async () => {
  await sb?.auth.stopAutoRefresh(); await sb?.auth.signOut();
  Reflect.deleteProperty(globalThis, 'window');
  await new Promise<void>(resolve => server.close(() => resolve()));
});
describe('authenticated writes use JWT + RLS, never unavailable SQL or fake success', () => {
  it('saves own profile with JWT, preserves trusted role and strips privilege columns', async () => {
    const result = await auth.AuthService.updateProfile(id, { name: 'Nome alterado', phone: '5541999999999', role: 'admin', account_type: 'coach', is_banned: true });
    assert.equal(result.success, true); assert.equal(result.user?.name, 'Nome alterado'); assert.equal(result.user?.role, 'user');
    assert.deepEqual(writes.at(-1)?.payload, { name: 'Nome alterado', phone: '5541999999999' });
    assert.equal(sqlCalls, 0);
  });
  it('rejects updating a profile that does not match the authenticated identity', async () => {
    const count = writes.length;
    assert.equal((await auth.AuthService.updateProfile('other-account', { name: 'Outra pessoa' })).success, false);
    assert.equal(writes.length, count);
  });
  it('lists accounts directly and does not disguise a connection failure as zero accounts', async () => {
    const accounts = await auth.AuthService.listUsers();
    assert.equal(accounts.length, 1); assert.equal(accounts[0].id, id); assert.equal(sqlCalls, 0);
    failReads = true;
    try { await assert.rejects(auth.AuthService.listUsers(), /Read failed/); } finally { failReads = false; }
  });
  it('returns failure when no row was saved or deleted', async () => {
    deniedRow = true;
    try {
      assert.equal((await auth.AuthService.updateProfile(id, { name: 'Falha' })).success, false);
      assert.equal((await products.ProductService.updateProduct(id, { title: 'Não autorizado' })).success, false);
      assert.equal((await products.ProductService.deleteProduct(id)).success, false);
    } finally { deniedRow = false; }
  });
  it('updates listings through the signed-in client and strips seller reassignment', async () => {
    const result = await products.ProductService.updateProduct(id, { title: 'Tênis revisado', seller_id: 'other-account', product_type: 'b2c' });
    assert.equal(result.success, true);
    assert.deepEqual(writes.at(-1)?.payload, { title: 'Tênis revisado' });
    assert.equal(sqlCalls, 0);
  });
  it('persists categorized reports and uses restricted RPCs for feedback and reviews', async () => {
    await moderation.submitReport('trial', id, 'Seletiva', 'Dados incorretos');
    assert.deepEqual(writes.at(-1)?.payload, { category: 'trial', target_id: id, target_title: 'Seletiva', reason: 'Dados incorretos' });
    await moderation.deleteReport('report-id');
    assert.ok(writes.at(-1)?.path.includes('/rpc/delete_moderation_report'));
    await moderation.reviewReport('report-id', 'resolved', 'Dados revisados');
    assert.ok(writes.at(-1)?.path.includes('/rpc/review_moderation_report'));
    await moderation.notifyOwner('athlete_listing', id, 'Corrija as fotos');
    assert.ok(writes.at(-1)?.path.includes('/rpc/notify_content_owner'));
    assert.equal(sqlCalls, 0);
  });
  it('never reports success on a failed write', async () => {
    failWrites = true;
    try {
      assert.equal((await auth.AuthService.updateProfile(id, { name: 'Falha' })).success, false);
      assert.equal((await products.ProductService.updateProduct(id, { title: 'Falha' })).success, false);
      assert.equal((await products.ProductService.deleteProduct(id)).success, false);
      await assert.rejects(moderation.deleteReport('report-id'), /Database unavailable/);
      await assert.rejects(moderation.submitReport('external_offer', id, 'Oferta', 'Preço incorreto'), /Database unavailable/);
    } finally { failWrites = false; }
  });
});

it('Admin link never creates an account or grants a session merely by requesting email delivery', async () => {
  const before = (await sb!.auth.getSession()).data.session?.access_token;
  assert.equal((await auth.AuthService.requestAdminAccessLink()).success, true);
  assert.equal(otpPayload.email, 'mattheus.h.krainski@gmail.com');
  assert.equal(otpPayload.create_user, false);
  assert.equal((await sb!.auth.getSession()).data.session?.access_token, before);
  failOtp = true;
  try { const result=await auth.AuthService.requestAdminAccessLink(); assert.equal(result.success, false); assert.match(result.error || '', /Limite de envios/); }
  finally { failOtp = false; }
});
