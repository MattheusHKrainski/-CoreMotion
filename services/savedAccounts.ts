import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { SAVED_ACCOUNTS_EVENT, SavedAccountVault } from '@/lib/saved-accounts';
import type { UserProfile } from '@/lib/types';
import { createSessionVerifier, getSupabaseClient, SUPABASE_AUTH_STORAGE_KEY } from './supabaseClient';

export function savedAccountVault(): SavedAccountVault {
  return new SavedAccountVault(window.localStorage, `coremotion_saved_accounts_v1_${SUPABASE_AUTH_STORAGE_KEY}`);
}
export function isAccountRemembered(id: string): boolean {
  try { return savedAccountVault().has(id); } catch { return false; }
}
export function notifySavedAccounts(): void { window.dispatchEvent(new Event(SAVED_ACCOUNTS_EVENT)); }
export function rotateSavedSession(session: Session): void {
  try { savedAccountVault().rotate(session); notifySavedAccounts(); } catch { /* Authentication must still work if storage is unavailable. */ }
}
export async function rememberCurrentAccount(profile: UserProfile): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    if (!client) return false;
    const { data, error } = await client.auth.getSession();
    if (error || !data.session || data.session.user.id !== profile.id) return false;
    savedAccountVault().save(profile, data.session);
    notifySavedAccounts();
    return true;
  } catch { return false; }
}

export type SavedLoginResult = { success: true; profile: UserProfile } | { success: false; error: string; email?: string; requiresLogin?: boolean };

/** Verify identity, suspension and current role with Supabase, not with card metadata. */
interface SavedLoginDependencies {
  vault: SavedAccountVault;
  createVerifier: () => SupabaseClient | null;
  getActive: () => SupabaseClient | null;
  notify: () => void;
}
export async function restoreSavedAccount(id: string, dependencies?: SavedLoginDependencies): Promise<SavedLoginResult> {
  const vault = dependencies?.vault || savedAccountVault();
  const notify = dependencies?.notify || notifySavedAccounts;
  const card = vault.list().find(entry => entry.id === id);
  const tokens = vault.tokens(id);
  if (!card) return { success: false, error: 'Esta conta foi removida do acesso rápido.' };
  if (!tokens) return { success: false, requiresLogin: true, email: card.email, error: 'Entre novamente para renovar o acesso desta conta.' };
  const verifier = (dependencies?.createVerifier || createSessionVerifier)();
  const active = (dependencies?.getActive || getSupabaseClient)();
  if (!verifier || !active) return { success: false, error: 'Conexão com o Supabase indisponível.' };
  const invalidate = (): SavedLoginResult => {
    vault.invalidate(id); notify();
    return { success: false, requiresLogin: true, email: card.email, error: 'O acesso salvo expirou ou foi revogado. Entre novamente com e-mail e senha.' };
  };
  try {
    // setSession refreshes an expired access token with the saved refresh token.
    const { data, error } = await verifier.auth.setSession(tokens);
    if (error || !data.session) {
      if (error && (error.status === 0 || (error.status && error.status >= 500) || error.name === 'AuthRetryableFetchError')) return { success: false, error: 'Não foi possível conectar. Tente novamente; sua conta atual foi mantida.' };
      return invalidate();
    }
    if (data.session.user.id !== id) return invalidate();
    // Persist rotated credentials before any subsequent request can fail.
    vault.rotate(data.session);
    const identity = await verifier.auth.getUser();
    if (identity.error || identity.data.user?.id !== id) {
      if (identity.error?.status === 401 || identity.error?.status === 403) return invalidate();
      return { success: false, error: 'Não foi possível validar a conta. Sua conta atual foi mantida.' };
    }
    const { data: profile, error: profileError } = await verifier.from('profiles').select('*').eq('id', id).maybeSingle();
    if (profileError) return { success: false, error: 'Não foi possível carregar o perfil. Tente novamente.' };
    if (!profile || profile.id !== id || profile.is_banned || profile.role === 'visitor') return invalidate();
    // Fetch a fresh token even if its access JWT has not expired: this checks session revocation.
    const refreshed = await verifier.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      if (refreshed.error && (refreshed.error.name === 'AuthRetryableFetchError' || refreshed.error.status === 0 || (refreshed.error.status && refreshed.error.status >= 500))) return { success: false, error: 'Não foi possível renovar a sessão. Tente novamente.' };
      return invalidate();
    }
    if (!vault.has(id)) return { success: false, error: 'Esta conta foi removida do acesso rápido.' };
    vault.save(profile, refreshed.data.session);
    const activated = await active.auth.setSession({ access_token: refreshed.data.session.access_token, refresh_token: refreshed.data.session.refresh_token });
    if (activated.error || activated.data.user?.id !== id) return { success: false, error: 'Não foi possível ativar a conta. Tente novamente.' };
    vault.rotate(activated.data.session!);
    notify();
    return { success: true, profile: { ...profile, supabase_id: id } as UserProfile };
  } catch {
    return { success: false, error: 'Não foi possível acessar a conta. Verifique sua conexão e tente novamente.' };
  } finally {
    await verifier.auth.stopAutoRefresh();
  }
}
