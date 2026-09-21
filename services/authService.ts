import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, UserRole } from '@/lib/types';

export const MASTER_ADMIN_EMAIL = 'mattheusxmljz@gmail.com';
export const MASTER_ADMIN_EMAILS = [
  'mattheusxmljz@gmail.com',
  'professorchines2026@gmail.com',
  'operacaoamd@gmail.com',
  'admin@coremotiom.com',
];

/**
 * Validates if the email belongs to the Master Administrator / Developer.
 */
export function isMasterAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    MASTER_ADMIN_EMAILS.includes(clean) ||
    clean.startsWith('mattheusxmljz') ||
    clean.startsWith('professorchines')
  );
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AuthService {
  /**
   * Signs in with email and password via standard Supabase Auth.
   */
  static async loginWithEmail(email: string, pass: string): Promise<AuthResponse<UserProfile>> {
    const sb = getSupabaseClient();
    if (!sb) {
      return {
        success: false,
        error: 'Supabase não inicializado. Verifique as credenciais de configuração.',
      };
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await sb.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Usuário não retornado pelo Supabase.' };
      }

      const profile = await this.getProfileOrCreate(data.user.id, data.user.email || cleanEmail, {
        name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
        avatar_url: data.user.user_metadata?.avatar_url,
        role: isMasterAdmin(cleanEmail) ? 'admin' : (data.user.user_metadata?.role as UserRole) || 'user',
      });

      return { success: true, data: profile };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Registers a new account with email, password, and metadata.
   */
  static async signUpWithEmail(
    email: string,
    pass: string,
    name: string,
    requestedRole: UserRole = 'user'
  ): Promise<AuthResponse<UserProfile>> {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Supabase não inicializado.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole: UserRole = isMasterAdmin(cleanEmail) ? 'admin' : requestedRole;

    try {
      const { data, error } = await sb.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            name: name.trim(),
            role: assignedRole,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Falha ao registrar usuário no Supabase.' };
      }

      const profile = await this.getProfileOrCreate(data.user.id, data.user.email || cleanEmail, {
        name: name.trim(),
        role: assignedRole,
      });

      const requiresConfirmation = !data.session;

      return {
        success: true,
        data: profile,
        error: requiresConfirmation
          ? 'Enviamos um link de confirmação para o seu e-mail. Por favor, confirme seu e-mail para concluir o acesso.'
          : undefined,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Initiates Google OAuth flow using Supabase Auth in popup window.
   */
  static async signInWithGoogle(): Promise<{ success: boolean; url?: string; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Supabase não inicializado. Verifique o arquivo .env.local.' };
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackUrl = `${origin}/auth/callback`;

      const { data, error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.url) {
        if (typeof window !== 'undefined') {
          const popup = window.open(
            data.url,
            'google_oauth_popup',
            'width=560,height=680,location=no,toolbar=no,menubar=no'
          );

          if (!popup) {
            window.location.href = data.url;
          }
        }
        return { success: true, url: data.url };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Sends password reset email.
   */
  static async resetPassword(email: string): Promise<AuthResponse<null>> {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Supabase não inicializado.' };
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Signs out the current user session.
   */
  static async signOut(): Promise<void> {
    const sb = getSupabaseClient();
    if (sb) {
      await sb.auth.signOut();
    }
  }

  /**
   * Retrieves or creates a user profile in public.profiles.
   */
  static async getProfileOrCreate(
    userId: string,
    email: string,
    fallbackData?: Partial<UserProfile>
  ): Promise<UserProfile> {
    const sb = getSupabaseClient();
    const isAdmin = isMasterAdmin(email);
    const defaultRole: UserRole = isAdmin ? 'admin' : fallbackData?.role || 'user';

    const defaultProfile: UserProfile = {
      id: userId,
      email,
      name: fallbackData?.name || email.split('@')[0],
      avatar_url:
        fallbackData?.avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      role: defaultRole,
      city: fallbackData?.city || 'São Paulo',
      state: fallbackData?.state || 'SP',
      sport_interests: fallbackData?.sport_interests || ['Corrida', 'Alta Performance'],
      created_at: new Date().toISOString(),
    };

    if (!sb) return defaultProfile;

    try {
      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[AuthService] Profile query error, using default:', error.message);
        return defaultProfile;
      }

      if (data) {
        // Enforce admin for master email
        const role = isMasterAdmin(data.email) ? 'admin' : (data.role as UserRole);
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          phone: data.phone,
          role,
          city: data.city,
          state: data.state,
          sport_interests: data.sport_interests,
          store_id: data.store_id,
          created_at: data.created_at,
        };
      }

      // Upsert profile if missing
      await sb.from('profiles').upsert([
        {
          id: userId,
          email,
          name: defaultProfile.name,
          avatar_url: defaultProfile.avatar_url,
          role: defaultRole,
          city: defaultProfile.city,
          state: defaultProfile.state,
          sport_interests: defaultProfile.sport_interests,
        },
      ]);

      return defaultProfile;
    } catch (err) {
      console.warn('[AuthService] Unexpected error getting profile:', err);
      return defaultProfile;
    }
  }

  /**
   * Updates user profile fields.
   */
  static async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<AuthResponse<UserProfile>> {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Supabase indisponível.' };
    }

    try {
      const { data, error } = await sb
        .from('profiles')
        .update({
          name: updates.name,
          avatar_url: updates.avatar_url,
          phone: updates.phone,
          city: updates.city,
          state: updates.state,
          sport_interests: updates.sport_interests,
          store_id: updates.store_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          phone: data.phone,
          role: isMasterAdmin(data.email) ? 'admin' : (data.role as UserRole),
          city: data.city,
          state: data.state,
          sport_interests: data.sport_interests,
          store_id: data.store_id,
          created_at: data.created_at,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}
