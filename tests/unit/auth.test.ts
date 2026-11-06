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
let profileMode: 'missing' | 'present' | 'banned' | 'admin' = 'missing';
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
    if (password !== GOOD_PASSWORD || email === 'naocadastrado@gmail.com') {
      return json(400, { error: 'invalid_grant', error_description: 'Invalid login credentials' });
    }
    return json(200, session(email));
  }
  if (url.startsWith('/auth/v1/signup')) {
    const { email } = JSON.parse(body || '{}');
    if (email === 'existente@gmail.com') {
      return json(422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' });
    }
    if (email === 'pendente@gmail.com') return json(200, { user: session(email).user, session: null });
    return json(200, session(email));
  }
  if (url.startsWith('/rest/v1/profiles') && profileMode !== 'missing') {
    return json(200, { id: USER_ID, email: profileMode === 'admin' ? 'mattheus.h.krainski@gmail.com' : 'carlos@atleta.com', name: 'Carlos', role: profileMode === 'admin' ? 'admin' : 'user', is_banned: profileMode === 'banned' });
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

after(async () => {
  try {
    client?.getSupabaseClient()?.auth.stopAutoRefresh();
  } finally {
    // O servidor precisa fechar mesmo se o cliente falhar: um servidor aberto
    // mantém o processo de testes vivo e trava o CI até o timeout do job.
    if (server.listening) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
        // O fetch nativo pode manter um socket keep-alive ocioso; feche-o para sair na hora.
        server.closeAllConnections();
      });
    }
  }
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

  it('Admin com senha errada e conta inexistente não entram nem sincronizam perfil', async () => {
    for (const [email, password] of [['mattheus.h.krainski@gmail.com', 'qualquer-senha'], ['naocadastrado@gmail.com', GOOD_PASSWORD]]) {
      syncCalls = 0;
      const result = await auth.AuthService.loginWithEmail(email, password);
      assert.equal(result.success, false);
      assert.equal(result.data, undefined);
      assert.equal(syncCalls, 0);
    }
  });

  it('credencial válida entra e usa o perfil devolvido pelo servidor', async () => {
    syncCalls = 0;
    const res = await auth.AuthService.loginWithEmail('carlos@atleta.com', GOOD_PASSWORD);
    assert.equal(res.success, true);
    assert.equal(res.data?.id, USER_ID);
    assert.equal(syncCalls, 1);
  });

  it('perfil existente com RLS entra sem depender da API SQL indisponível', async () => {
    profileMode = 'present';
    syncMode = 'down';
    syncCalls = 0;
    try {
      const result = await auth.AuthService.loginWithEmail('carlos@atleta.com', GOOD_PASSWORD);
      assert.equal(result.success, true);
      assert.equal(result.data?.id, USER_ID);
      assert.equal(result.data?.supabase_id, USER_ID);
      assert.equal(syncCalls, 0);
      const rejected = await auth.AuthService.loginWithEmail('carlos@atleta.com', 'senha-errada');
      assert.equal(rejected.success, false);
    } finally { profileMode = 'missing'; syncMode = 'ok'; }
  });

  it('Admin usa o papel do perfil confiável após validar a senha', async () => {
    profileMode = 'admin';
    syncCalls = 0;
    try {
      const result = await auth.AuthService.loginWithEmail('mattheus.h.krainski@gmail.com', GOOD_PASSWORD);
      assert.equal(result.success, true);
      assert.equal(result.data?.role, 'admin');
      assert.equal(syncCalls, 0);
    } finally { profileMode = 'missing'; }
  });

  it('perfil suspenso não usa sincronização SQL para contornar a suspensão', async () => {
    profileMode = 'banned';
    syncCalls = 0;
    try {
      const result = await auth.AuthService.loginWithEmail('carlos@atleta.com', GOOD_PASSWORD);
      assert.equal(result.success, false);
      assert.match(result.error || '', /suspensa/);
      assert.equal(syncCalls, 0);
    } finally { profileMode = 'missing'; }
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

  it('cadastro com senha curta informa o mínimo sem criar sessão', async () => {
    const result = await auth.AuthService.signUpWithEmail('pessoa@gmail.com', '12345', 'Pessoa');
    assert.equal(result.success, false);
    assert.equal(result.error, 'A senha deve ter no mínimo 6 caracteres.');
    assert.equal(result.data, undefined);
  });

  it('cadastro rejeita outros provedores sem criar sessão', async () => {
    syncCalls = 0;
    for (const email of ['nome@yahoo.com', 'nome@gmail.com.evil.com', 'nome@empresa.com']) {
      const result = await auth.AuthService.signUpWithEmail(email, '123456', 'Pessoa');
      assert.equal(result.success, false);
      assert.match(result.error || '', /@gmail.com/);
      assert.equal(result.data, undefined);
    }
    assert.equal(syncCalls, 0);
  });

  it('cadastro com seis caracteres recebe sessão e perfil, sem e-mail de confirmação', async () => {
    const result = await auth.AuthService.signUpWithEmail('cadastro@hotmail.com', '123456', 'Pessoa');
    assert.equal(result.success, true);
    assert.equal(result.data?.id, USER_ID);
    assert.equal(result.confirmationRequired, undefined);
  });

  it('cadastro com e-mail já existente é recusado', async () => {
    const res = await auth.AuthService.signUpWithEmail('existente@gmail.com', 'senha-nova', 'Existente');
    assert.equal(res.success, false);
    assert.match(res.error ?? '', /Já existe uma conta/);
  });

  it('confirmação pendente não autentica nem é tratada como erro de cadastro', async () => {
    syncCalls = 0;
    const result = await auth.AuthService.signUpWithEmail('pendente@gmail.com', 'senha-segura', 'Pessoa');
    assert.equal(result.success, true);
    assert.equal(result.confirmationRequired, true);
    assert.equal(result.data, undefined);
    assert.equal(syncCalls, 0);
  });

  it('getProfileOrCreate falha (sem perfil) quando o perfil não pode ser sincronizado', async () => {
    syncMode = 'down';
    try {
      const res = await auth.AuthService.getProfileOrCreate(USER_ID, 'carlos@atleta.com');
      assert.equal(res.success, false);
      assert.equal(res.data, undefined);
    } finally {
      syncMode = 'ok';
    }
  });
});
