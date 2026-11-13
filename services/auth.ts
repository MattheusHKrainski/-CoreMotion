import { ADMIN_LOGIN_EMAIL } from '@/lib/admin-account';
import { MIN_PASSWORD_LENGTH, signupErrorMessage } from '@/lib/signup-validation';
import { getSupabaseClient } from './supabaseClient';
import { UserProfile } from '@/lib/types';

import { isValidEmailAddress, isAllowedSignupEmail, SIGNUP_EMAIL_HELP } from '@/lib/email-validation';
import { authedFetch, type ApiResult } from '@/lib/auth-fetch';


interface AuthResponse<T = unknown> {
  success: boolean;
  confirmationRequired?: boolean;
  data?: T;
  error?: string;
}

type SyncMetadata = {
  name?: string;
  avatar?: string;
  city?: string;
  sport?: string;
};

/** Read the authenticated user's own trusted DB profile; never infer privileges from metadata. */
async function readOwnSupabaseProfile(userId: string): Promise<UserProfile> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase não configurado.');
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
  if (error || !data || data.id !== userId) throw new Error('Não foi possível carregar o perfil da conta.');
  if (data.is_banned) throw new Error('Esta conta está suspensa.');
  return { ...data, supabase_id: data.id } as UserProfile;
}

/**
 * Sincroniza a sessão com public.users. O servidor identifica o usuário pelo token e decide o papel.
 * Fora do modo demonstração, falha de sincronização é erro (nunca um perfil inventado).
 */
async function syncSessionWithDb(supabaseId: string, email: string, metadata?: SyncMetadata): Promise<UserProfile> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase não configurado. Nenhuma sessão foi criada.');
  // Existing accounts already have a profile. Read it with the user's JWT and RLS,
  // rather than making successful Auth depend on a separately configured SQL API.
  const { data: ownProfile } = await client.from('profiles').select('*').eq('id', supabaseId).maybeSingle();
  if (ownProfile) {
    if (ownProfile.id !== supabaseId) throw new Error('Perfil incompatível com a sessão.');
    if (ownProfile.is_banned) throw new Error('Esta conta está suspensa.');
    return { ...ownProfile, supabase_id: supabaseId } as UserProfile;
  }
  let res: Response;
  try {
    res = await authedFetch('/api/auth/sync', {
      method: 'POST',
      body: JSON.stringify({
        name: metadata?.name,
        avatar: metadata?.avatar,
        city: metadata?.city,
        sport: metadata?.sport,
      }),
    });
  } catch {
    if (getSupabaseClient()) return readOwnSupabaseProfile(supabaseId);
    throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
  }

  const data = await res.json().catch(() => null);
  if (res.ok && data?.success && data.user) {
    return data.user as UserProfile;
  }
  if (res.status >= 500 && getSupabaseClient()) return readOwnSupabaseProfile(supabaseId);
  throw new Error(data?.error || 'Não foi possível concluir o acesso. Tente novamente.');
}

export class AuthService {
  /** Passwordless first access still requires proving ownership of the administrator's inbox. */
  static async requestAdminAccessLink(): Promise<AuthResponse> {
    const sb = getSupabaseClient();
    if (!sb || typeof window === 'undefined') return { success: false, error: 'Conexão de autenticação indisponível.' };
    try {
      const { error } = await sb.auth.signInWithOtp({ email: ADMIN_LOGIN_EMAIL, options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?admin=1`,
      } });
      if (error) return { success: false, error: /rate|too many|429/i.test(error.message) ? 'Limite de envios atingido. Aguarde antes de pedir outro link ou entre com e-mail e senha.' : 'Não foi possível enviar o link de acesso. Tente novamente ou entre com e-mail e senha.' };
      return { success: true };
    } catch { return { success: false, error: 'Não foi possível conectar ao serviço de autenticação. Nenhum acesso foi liberado.' }; }
  }

  /**
   * Entra com e-mail e senha pelo Supabase Auth e sincroniza o perfil.
   * Credencial recusada é falha: nenhuma sessão é criada.
   */
  static async loginWithEmail(email: string, pass: string): Promise<AuthResponse<UserProfile>> {
    const cleanEmail = email.trim();
    if (!isValidEmailAddress(cleanEmail)) return { success: false, error: 'Informe um e-mail completo e válido, como nome@gmail.com.' };
    const sb = getSupabaseClient();

    if (!sb) return { success: false, error: 'Login indisponível: configure a conexão com o Supabase. Nenhuma sessão foi criada.' };

    let result: { data: { user: { id: string; user_metadata?: Record<string, unknown> } | null }; error: { message: string } | null };
    try {
      result = await sb.auth.signInWithPassword({ email: cleanEmail, password: pass });
    } catch {
      return { success: false, error: 'Não foi possível conectar ao servidor de autenticação.' };
    }
    const { data, error } = result;
    if (error || !data.user) {
      const notConfirmed = error?.message?.toLowerCase().includes('email not confirmed');
      return {
        success: false,
        error: notConfirmed ? 'Confirme seu e-mail antes de entrar.' : 'E-mail ou senha inválidos.',
      };
    }
    const meta = data.user.user_metadata || {};
    return this.finishSession(data.user.id, cleanEmail, {
      name: (typeof meta.name === 'string' && meta.name) || cleanEmail.split('@')[0],
      sport: typeof meta.sport === 'string' ? meta.sport : undefined,
      avatar: typeof meta.avatar_url === 'string' ? meta.avatar_url : undefined,
    });
  }

  /**
   * Cria a conta no Supabase Auth. O papel não é escolhido pelo cliente: contas nascem como atleta
   * e o servidor aplica o papel de conta-mestre no sincronismo.
   */
  static async signUpWithEmail(email: string, pass: string, name: string, accountType: import("@/lib/sports").AccountType = "casual", sport?: string): Promise<AuthResponse<UserProfile>> {
    if (pass.length < MIN_PASSWORD_LENGTH) return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' };
    const cleanEmail = email.trim();
    if (!isValidEmailAddress(cleanEmail)) return { success: false, error: 'Informe um e-mail completo e válido, como nome@gmail.com.' };
    if (!isAllowedSignupEmail(cleanEmail)) return { success: false, error: SIGNUP_EMAIL_HELP };
    const sb = getSupabaseClient();

    if (!sb) return { success: false, error: 'Cadastro indisponível: configure a conexão com o Supabase. Nenhuma conta foi criada.' };

    try {
      const { data, error } = await sb.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: { data: { name, account_type: accountType, sport: sport?.trim() }, ...(typeof window !== 'undefined' ? { emailRedirectTo: `${window.location.origin}/auth/callback` } : {}) },
      });
      if (error) {
        return { success: false, error: signupErrorMessage(error) };
      }
      if (!data.user) {
        return { success: false, error: 'Não foi possível criar a conta.' };
      }
      if (!data.session) {
        // Confirmação de e-mail pendente: sem sessão não há como sincronizar o perfil ainda.
        return { success: true, confirmationRequired: true };
      }
      return this.finishSession(data.user.id, cleanEmail, { name, sport });
    } catch {
      return { success: false, error: 'Não foi possível conectar ao servidor de autenticação.' };
    }
  }

  private static async finishSession(
    supabaseId: string,
    email: string,
    metadata: SyncMetadata
  ): Promise<AuthResponse<UserProfile>> {
    try {
      const profile = await syncSessionWithDb(supabaseId, email, metadata);
      return { success: true, data: profile };
    } catch (err: unknown) {
      // Sem perfil sincronizado não há sessão no app: encerra também a sessão do Supabase.
      await this.signOut();
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Retrieves profile from public.users or creates/syncs it.
   * Em falha (ex.: conta suspensa), encerra a sessão e devolve a mensagem do servidor.
   */
  static async getProfileOrCreate(
    userId: string,
    email: string,
    fallbackData?: Partial<UserProfile>
  ): Promise<AuthResponse<UserProfile>> {
    return this.finishSession(userId, email, {
      name: fallbackData?.name,
      avatar: fallbackData?.avatar_url,
      city: fallbackData?.city,
      sport: fallbackData?.sport_interests?.[0],
    });
  }

  /**
   * Updates user profile in public.users. Devolve o perfil salvo pelo servidor.
   */
  static async updateProfile(
    userId: string,
    data: Partial<UserProfile>
  ): Promise<ApiResult & { user?: UserProfile }> {
    try {
      const sb = getSupabaseClient();
      if (!sb) return { success: false, error: 'Entre em uma conta real para salvar seu perfil.' };
      const { data: session, error: sessionError } = await sb.auth.getUser();
      if (sessionError || session.user?.id !== userId) return { success: false, error: 'Sua sessão expirou. Entre novamente.' };
      // Only personal fields; privilege columns are also protected by a DB trigger.
      const allowed = ['name', 'avatar_url', 'city', 'state', 'phone', 'sport_interests'] as const;
      const updates = Object.fromEntries(allowed.filter(key => data[key] !== undefined).map(key => [key, data[key]]));
      const { data: profile, error } = await sb.from('profiles').update(updates).eq('id', userId).select('*').single();
      if (error || !profile) return { success: false, error: error?.message || 'Perfil não encontrado ou sem permissão.' };
      return { success: true, user: { ...profile, supabase_id: profile.id } as UserProfile };
    } catch {
      return { success: false, error: 'Não foi possível conectar ao servidor. As alterações não foram salvas.' };
    }
  }

  /** Real accounts, including newly registered users. RLS restricts this to staff. */
  static async listUsers(): Promise<UserProfile[]> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error('Conexão com o banco indisponível.');
    const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Initiates Google OAuth flow.
   */
  static async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Supabase não inicializado.' };
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Signs out current user session.
   */
  static async signOut(): Promise<void> {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb.auth.signOut({ scope: 'local' });
      } catch {
        // ignore
      }
    }
  }

}
