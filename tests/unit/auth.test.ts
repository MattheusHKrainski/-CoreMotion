/**
 * Testes do AuthService (C1): credencial recusada não vira sessão e falha de sincronização não vira sucesso.
 * O Supabase Auth e a rota /api/auth/sync são simulados por um servidor HTTP local (sem mocks de módulo).
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

const USER_ID = 'u-123';
const GOOD_PASSWORD = 'senha-correta';
let syncMode: 'ok' | 'down' = 'ok';
let syncCalls = 0;

const session = (email: string) => ({
  access_token: 'token-de-teste',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'refresh-de-teste',
  user: {
    id: USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email,
    user_metadata: { name: 'Carlos' },
    app_metadata: {},
    created_at: new Date().toISOString(),
  },
});

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  const body = await readBody(req);
  const url = req.url || '';
  res.setHeader('content-type', 'application/json');
  const json = (status: number, payload: unknown) => {
    res.statusCode = status;
    res.end(JSON.stringify(payload));
  };

  if (url.startsWith('/auth/v1/token?grant_type=password')) {
    const { email, password } = JSON.parse(body || '{}');
    if (password !== GOOD_PASSWORD) {
      return json(400, { error: 'invalid_grant', error_description: 'Invalid login credentials' });
    }
    return json(200, session(email));
  }
  if (url.startsWith('/auth/v1/signup')) {
    const { email } = JSON.parse(body || '{}');
    if (email === 'existente@x.com') {
      return json(422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' });
    }
    return json(200, session(email));
  }
  if (url === '/api/auth/sync') {
    syncCalls += 1;
    if (syncMode === 'down') return json(500, { success: false, error: 'Banco indisponível.' });
    return json(200, {
      success: true,
      user: { id: USER_ID, email: 'carlos@atleta.com', name: 'Carlos', role: 'user' },
    });
  }
  return json(404, { error: 'not found' });
});

type AuthModule = typeof import('../../services/auth');
type ClientModule = typeof import('../../services/supabaseClient');
let auth: AuthModule;
let client: ClientModule;

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;
  process.env.NEXT_PUBLIC_SUPABASE_URL = base;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'chave-anonima-de-teste';
  delete process.env.NEXT_PUBLIC_DEMO_MODE;

  // Chamadas relativas (/api/...) do navegador apontam para o servidor de teste.
  const realFetch = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    realFetch(typeof input === 'string' && input.startsWith('/') ? base + input : input, init)) as typeof fetch;

  auth = await import('../../services/auth');
  client = await import('../../services/supabaseClient');
});

after(() => {
  client?.getSupabaseClient()?.auth.stopAutoRefresh();
  server.close();
});

describe('AuthService: credenciais e sincronização (C1)', () => {
  it('credencial inválida é falha e não sincroniza sessão alguma', async () => {
    syncCalls = 0;
    const res = await auth.AuthService.loginWithEmail('carlos@atleta.com', 'senha-errada');
    assert.equal(res.success, false);
    assert.equal(res.error, 'E-mail ou senha inválidos.');
    assert.equal(res.data, undefined);
    assert.equal(syncCalls, 0);
  });

  it('credencial válida entra e usa o perfil devolvido pelo servidor', async () => {
    syncCalls = 0;
    const res = await auth.AuthService.loginWithEmail('carlos@atleta.com', GOOD_PASSWORD);
    assert.equal(res.success, true);
    assert.equal(res.data?.id, USER_ID);
    assert.equal(syncCalls, 1);
  });

  it('falha de sincronização com o servidor não vira sucesso', async () => {
    syncMode = 'down';
    try {
      const res = await auth.AuthService.loginWithEmail('carlos@atleta.com', GOOD_PASSWORD);
      assert.equal(res.success, false);
      assert.ok(res.error && res.error.length > 0);
      assert.equal(res.data, undefined);
    } finally {
      syncMode = 'ok';
    }
  });

  it('cadastro com e-mail já existente é recusado', async () => {
    const res = await auth.AuthService.signUpWithEmail('existente@x.com', 'senha-nova', 'Existente');
    assert.equal(res.success, false);
    assert.match(res.error ?? '', /Já existe uma conta/);
  });

  it('getProfileOrCreate devolve null quando o perfil não pode ser sincronizado', async () => {
    syncMode = 'down';
    try {
      assert.equal(await auth.AuthService.getProfileOrCreate(USER_ID, 'carlos@atleta.com'), null);
    } finally {
      syncMode = 'ok';
    }
  });
});
