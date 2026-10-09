import { getSupabaseClient } from './supabaseClient';
import { UserProfile } from '@/lib/types';

import { isMasterAdminEmail as isMasterAdmin } from '@/lib/permissions';
import { authedFetch } from '@/lib/auth-fetch';
import { DEMO_MODE } from '@/lib/demo-mode';


interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

type SyncMetadata = {
  name?: string;
  avatar?: string;
  city?: string;
  sport?: string;
};

/** Perfil local, usado somente no modo demonstração quando o servidor não responde. */
function localDemoProfile(supabaseId: string, email: string, metadata?: SyncMetadata): UserProfile {
  return {
    id: supabaseId || String(Date.now()),
    supabase_id: supabaseId,
    name: metadata?.name || email.split('@')[0],
    email,
    avatar_url:
      metadata?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    role: isMasterAdmin(email) ? 'admin' : 'user',
    city: metadata?.city || 'São Paulo',
    state: 'SP',
    sport_interests: metadata?.sport ? [metadata.sport] : ['Corrida', 'Alta Performance'],
    created_at: new Date().toISOString(),
  };
}

/**
 * Sincroniza a sessão com public.users. O servidor identifica o usuário pelo token e decide o papel.
 * Fora do modo demonstração, falha de sincronização é erro (nunca um perfil inventado).
 */
async function syncSessionWithDb(supabaseId: string, email: string, metadata?: SyncMetadata): Promise<UserProfile> {
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
    if (DEMO_MODE) return localDemoProfile(supabaseId, email, metadata);
    throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
  }

  const data = await res.json().catch(() => null);
  if (res.ok && data?.success && data.user) {
    return data.user as UserProfile;
  }
  if (DEMO_MODE) return localDemoProfile(supabaseId, email, metadata);
  throw new Error(data?.error || 'Não foi possível concluir o acesso. Tente novamente.');
}

export class AuthService {
  /**
   * Entra com e-mail e senha pelo Supabase Auth e sincroniza o perfil.
   * Credencial recusada é falha: nenhuma sessão é criada.
   */
  static async loginWithEmail(email: string, pass: string): Promise<AuthResponse<UserProfile>> {
    const cleanEmail = email.trim();
    const sb = getSupabaseClient();

    if (!sb) {
      // Sem Supabase configurado, só o modo demonstração entra (sessão local).
      if (!DEMO_MODE || !pass) {
        return { success: false, error: 'Login indisponível: o Supabase não está configurado.' };
      }
      return this.finishSession(`usr_${Date.now()}`, cleanEmail, { name: cleanEmail.split('@')[0] });
    }

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
      avatar: typeof meta.avatar_url === 'string' ? meta.avatar_url : undefined,
    });
  }

  /**
   * Cria a conta no Supabase Auth. O papel não é escolhido pelo cliente: contas nascem como atleta
   * e o servidor aplica o papel de conta-mestre no sincronismo.
   */
  static async signUpWithEmail(email: string, pass: string, name: string): Promise<AuthResponse<UserProfile>> {
    const cleanEmail = email.trim();
    const sb = getSupabaseClient();

    if (!sb) {
      if (!DEMO_MODE) {
        return { success: false, error: 'Cadastro indisponível: o Supabase não está configurado.' };
      }
      return this.finishSession(`usr_${Date.now()}`, cleanEmail, { name });
    }

    try {
      const { data, error } = await sb.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: { data: { name } },
      });
      if (error) {
        const exists = error.message?.toLowerCase().includes('already');
        return {
          success: false,
          error: exists ? 'Já existe uma conta com este e-mail.' : 'Não foi possível criar a conta. Verifique os dados.',
        };
      }
      if (!data.user) {
        return { success: false, error: 'Não foi possível criar a conta.' };
      }
      if (!data.session) {
        // Confirmação de e-mail pendente: sem sessão não há como sincronizar o perfil ainda.
        return { success: false, error: 'Conta criada. Confirme seu e-mail e depois entre.' };
      }
      return this.finishSession(data.user.id, cleanEmail, { name });
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
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Retrieves profile from public.users or creates/syncs it.
   */
  static async getProfileOrCreate(
    userId: string,
    email: string,
    fallbackData?: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      return await syncSessionWithDb(userId, email, {
        name: fallbackData?.name,
        avatar: fallbackData?.avatar_url,
        city: fallbackData?.city,
        sport: fallbackData?.sport_interests?.[0],
      });
    } catch (err) {
      // Sessão válida no Supabase sem perfil sincronizado: o usuário não entra no app.
      console.warn('[AuthService] Perfil não sincronizado:', err);
      return null;
    }
  }

  /**
   * Updates user profile in public.users.
   */
  static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<boolean> {
    try {
      // Papéis não são alteráveis por esta via: apenas dados de perfil do próprio usuário.
      const res = await authedFetch('/api/users', {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'updateProfile',
          userId,
          updates: {
            name: data.name,
            avatar_url: data.avatar_url,
            city: data.city,
            state: data.state,
            phone: data.phone,
          },
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
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
        await sb.auth.signOut();
      } catch {
        // ignore
      }
    }
  }

}
