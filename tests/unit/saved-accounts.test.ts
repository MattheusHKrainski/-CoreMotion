import { it } from 'node:test';
import assert from 'node:assert/strict';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { SavedAccountVault } from '@/lib/saved-accounts';
import { restoreSavedAccount } from '@/services/savedAccounts';
import type { UserProfile } from '@/lib/types';

const a = '11111111-1111-4111-8111-111111111111';
const b = '22222222-2222-4222-8222-222222222222';
const profile: UserProfile = { id: a, name: 'Conta Atleta', email: 'atleta@gmail.com', role: 'user', account_type: 'athlete', created_at: '2026-10-22' };
const session = (id = a, token = 'token') => ({ user: { id }, access_token: `access-${token}`, refresh_token: `refresh-${token}` }) as Session;
function setup() {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); } };
  return { values, storage, vault: new SavedAccountVault(storage, 'saved') };
}

it('cofre começa vazio, persiste várias contas, deduplica por id e não salva senha', () => {
  const { values, vault, storage } = setup();
  assert.deepEqual(vault.list(), []);
  vault.save({ ...profile, password: 'must-not-save' } as UserProfile, session());
  vault.save({ ...profile, id: b, name: 'Treinadora', account_type: 'coach' }, session(b));
  vault.save({ ...profile, name: 'Nome atualizado' }, session(a, 'rotated'));
  const reopened = new SavedAccountVault(storage, 'saved');
  assert.equal(reopened.list().length, 2);
  assert.equal(reopened.list()[0].name, 'Nome atualizado');
  assert.equal(reopened.tokens(a)?.refresh_token, 'refresh-rotated');
  assert.doesNotMatch(values.get('saved')!, /password|must-not-save/);
  assert.doesNotMatch(JSON.stringify(reopened.list()), /access_token|refresh_token|access-rotated/);
});
it('não salva sessão de outra identidade ou conta suspensa', () => {
  const { vault } = setup();
  assert.throws(() => vault.save(profile, session(b)));
  assert.throws(() => vault.save({ ...profile, is_banned: true }, session()));
  assert.deepEqual(vault.list(), []);
});
it('rotação atualiza apenas contas já salvas; remoção é persistente e não ressuscita pelo refresh', () => {
  const { vault } = setup();
  vault.rotate(session()); assert.deepEqual(vault.list(), []);
  vault.save(profile, session());
  vault.save({ ...profile, id: b, account_type: 'casual' }, session(b));
  vault.rotate(session(a, 'new')); assert.equal(vault.tokens(a)?.refresh_token, 'refresh-new');
  vault.remove(a); vault.rotate(session(a, 'later'));
  assert.equal(vault.has(a), false); assert.equal(vault.list().length, 1);
  vault.invalidate(b); assert.equal(vault.tokens(b), null); assert.equal(vault.list()[0].needsLogin, true);
  vault.rotate(session(b, 'later')); assert.equal(vault.tokens(b), null);
});
it('dados inválidos ou legados não geram cartões ou sessões', () => {
  const { values, vault } = setup();
  for (const invalid of ['{', 'null', '{}', '[{"id":"quick-admin"}]']) { values.set('saved', invalid); assert.deepEqual(vault.list(), []); }
});
it('erro de armazenamento não finge que a conta foi salva ou removida', () => {
  const vault = new SavedAccountVault({ getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } }, 'saved');
  assert.throws(() => vault.save(profile, session()), /QuotaExceeded/);
  assert.throws(() => vault.remove(a), /QuotaExceeded/);
});

function loginSetup(options: { expired?: boolean; offline?: boolean; banned?: boolean; mismatch?: boolean; missing?: boolean; removed?: boolean; role?: UserProfile['role'] } = {}) {
  const { vault } = setup();
  vault.save({ ...profile, role: 'admin' }, session()); // Card role is intentionally forged.
  let activations = 0, stopped = 0, refreshed = 0;
  const verifier = {
    auth: {
      setSession: async () => {
        if (options.offline) return { data: { session: null }, error: { name: 'AuthRetryableFetchError', status: 0 } };
        if (options.expired) return { data: { session: null }, error: { name: 'AuthApiError', status: 400 } };
        return { data: { session: session(options.mismatch ? b : a, 'verified') }, error: null };
      },
      getUser: async () => ({ data: { user: { id: a } }, error: null }),
      refreshSession: async () => { refreshed++; if (options.removed) vault.remove(a); return { data: { session: session(a, 'fresh') }, error: null }; },
      stopAutoRefresh: async () => { stopped++; },
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: options.missing ? null : { ...profile, role: options.role || 'user', is_banned: Boolean(options.banned) }, error: null }) }) }) }),
  } as unknown as SupabaseClient;
  const active = { auth: { setSession: async (tokens: { refresh_token: string }) => { activations++; assert.equal(tokens.refresh_token, 'refresh-fresh'); return { data: { session: session(a, 'active'), user: { id: a } }, error: null }; } } } as unknown as SupabaseClient;
  return { vault, dependencies: { vault, createVerifier: () => verifier, getActive: () => active, notify: () => {} }, stats: () => ({ activations, stopped, refreshed }) };
}
it('entrada direta valida identidade e perfil no servidor e renova tokens sem confiar no papel do cartão', async () => {
  for (const role of ['user', 'supervisor', 'admin'] as const) {
    const { vault, dependencies, stats } = loginSetup({ role });
    const result = await restoreSavedAccount(a, dependencies);
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.profile.role, role);
    assert.equal(vault.tokens(a)?.refresh_token, 'refresh-active');
    assert.deepEqual(stats(), { activations: 1, stopped: 1, refreshed: 1 });
  }
});
it('sessões revogadas, contas suspensas/excluídas ou identidade divergente não substituem conta atual', async () => {
  for (const options of [{ expired: true }, { banned: true }, { missing: true }, { mismatch: true }]) {
    const { vault, dependencies, stats } = loginSetup(options);
    const result = await restoreSavedAccount(a, dependencies);
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.requiresLogin, true);
    assert.equal(vault.tokens(a), null); assert.equal(vault.list()[0].needsLogin, true);
    assert.equal(stats().activations, 0); assert.equal(stats().stopped, 1);
  }
});
it('falha de rede mantém cartão/sessão salva e conta conectada intactos', async () => {
  const { vault, dependencies, stats } = loginSetup({ offline: true });
  const result = await restoreSavedAccount(a, dependencies);
  assert.equal(result.success, false);
  assert.ok(vault.tokens(a)); assert.equal(stats().activations, 0);
});
it('remoção em outra aba durante entrada não recria o cartão', async () => {
  const { vault, dependencies, stats } = loginSetup({ removed: true });
  assert.equal((await restoreSavedAccount(a, dependencies)).success, false);
  assert.equal(vault.has(a), false); assert.equal(stats().activations, 0);
});
it('cartão removido ou com sessão invalidada não tenta ativar nenhuma conta', async () => {
  const { vault, dependencies, stats } = loginSetup();
  vault.invalidate(a);
  assert.equal((await restoreSavedAccount(a, dependencies)).success, false);
  vault.remove(a);
  assert.equal((await restoreSavedAccount(a, dependencies)).success, false);
  assert.deepEqual(stats(), { activations: 0, stopped: 0, refreshed: 0 });
});

it('carrinho e favoritos são isolados por identidade e não confundidos com a lista de contas salvas', async () => {
  const { accountListsKey, readAccountLists } = await import('@/lib/account-lists');
  const { storage } = setup();
  storage.setItem(accountListsKey(a), JSON.stringify({ cart: [], favorites: ['favorite-a'] }));
  storage.setItem(accountListsKey(b), JSON.stringify({ cart: [], favorites: ['favorite-b'] }));
  assert.deepEqual(readAccountLists(storage, a).favorites, ['favorite-a']);
  assert.deepEqual(readAccountLists(storage, b).favorites, ['favorite-b']);
  assert.deepEqual(readAccountLists(storage, null).favorites, []);
  assert.notEqual(accountListsKey(a), accountListsKey(b));
  assert.deepEqual(readAccountLists({ getItem: () => '{' }, a), { cart: [], favorites: [] });
});
