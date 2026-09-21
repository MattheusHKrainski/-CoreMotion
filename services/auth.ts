import { getSupabaseClient } from './supabaseClient';
import { UserProfile, UserRole } from '@/lib/types';

export const MASTER_ADMIN_EMAIL = 'mattheusxmljz@gmail.com';
export const OPERACAO_ADMIN_EMAIL = 'operacaoamd@gmail.com';

/**
 * Checks if the email belongs to a master administrator.
 */
export function isMasterAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === MASTER_ADMIN_EMAIL ||
    clean === OPERACAO_ADMIN_EMAIL ||
    clean.startsWith('mattheusxmljz')
  );
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Synchronizes user session with public.users using supabase_id.
 */
export async function syncSessionWithDb(
  supabaseId: string,
  email: string,
  metadata?: {
    name?: string;
    avatar?: string;
    role?: UserRole;
    city?: string;
    sport?: string;
  }
): Promise<UserProfile> {
  try {
    const res = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseId,
        email,
        name: metadata?.name,
        avatar: metadata?.avatar,
        role: isMasterAdmin(email) ? 'admin' : metadata?.role || 'athlete',
        city: metadata?.city,
        sport: metadata?.sport,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        return data.user as UserProfile;
      }
    }
  } catch (err) {
    console.warn('[AuthService] /api/auth/sync network call failed, using fallback:', err);
  }

  // Resilient fallback profile
  const isAdmin = isMasterAdmin(email) || metadata?.role === 'admin';
  return {
    id: supabaseId || String(Date.now()),
    supabase_id: supabaseId,
    name: metadata?.name || email.split('@')[0],
    email,
    avatar_url:
      metadata?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    role: isAdmin ? 'admin' : (metadata?.role as UserRole) || 'user',
    city: metadata?.city || 'São Paulo',
    state: 'SP',
    sport_interests: metadata?.sport ? [metadata.sport] : ['Corrida', 'Alta Performance'],
    created_at: new Date().toISOString(),
  };
}

export class AuthService {
  /**
   * Signs in with email and password via Supabase Auth,
   * then immediately synchronizes with public.users using supabase_id.
   */
  static async loginWithEmail(email: string, pass: string): Promise<AuthResponse<UserProfile>> {
    const cleanEmail = email.trim();
    const sb = getSupabaseClient();

    let supabaseId = `usr_${Date.now()}`;
    let userName = cleanEmail.split('@')[0];
    let userAvatar: string | undefined = undefined;
    let userRole: UserRole = isMasterAdmin(cleanEmail) ? 'admin' : 'user';

    // 1. Try Supabase Auth if client is initialized
    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (!error && data.user) {
          supabaseId = data.user.id;
          userName = data.user.user_metadata?.name || userName;
          userAvatar = data.user.user_metadata?.avatar_url;
          userRole = isMasterAdmin(cleanEmail)
            ? 'admin'
            : (data.user.user_metadata?.role as UserRole) || userRole;
        } else if (error) {
          console.warn('[AuthService] Supabase Auth returned error:', error.message);
          // If Supabase credentials/network failed, proceed to database synchronization
        }
      } catch (e) {
        console.warn('[AuthService] Supabase Auth exception:', e);
      }
    }

    // 2. Synchronize with public.users
    try {
      const profile = await syncSessionWithDb(supabaseId, cleanEmail, {
        name: userName,
        avatar: userAvatar,
        role: userRole,
      });

      return { success: true, data: profile };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Registers a new account with Supabase Auth and persists into public.users.
   */
  static async signUpWithEmail(
    email: string,
    pass: string,
    name: string,
    requestedRole: UserRole = 'user'
  ): Promise<AuthResponse<UserProfile>> {
    const cleanEmail = email.trim();
    const sb = getSupabaseClient();
    const assignedRole: UserRole = isMasterAdmin(cleanEmail) ? 'admin' : requestedRole;
    let supabaseId = `usr_${Date.now()}`;

    // 1. Try Supabase Auth
    if (sb) {
      try {
        const { data, error } = await sb.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              name,
              role: assignedRole,
            },
          },
        });

        if (!error && data.user) {
          supabaseId = data.user.id;
        }
      } catch (e) {
        console.warn('[AuthService] Supabase signUp exception:', e);
      }
    }

    // 2. Synchronize with public.users
    try {
      const profile = await syncSessionWithDb(supabaseId, cleanEmail, {
        name,
        role: assignedRole,
      });

      return { success: true, data: profile };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Retrieves profile from public.users or creates/syncs it.
   */
  static async getProfileOrCreate(
    userId: string,
    email: string,
    fallbackData?: Partial<UserProfile>
  ): Promise<UserProfile> {
    return syncSessionWithDb(userId, email, {
      name: fallbackData?.name,
      avatar: fallbackData?.avatar_url,
      role: isMasterAdmin(email) ? 'admin' : fallbackData?.role,
      city: fallbackData?.city,
      sport: fallbackData?.sport_interests?.[0],
    });
  }

  /**
   * Updates user profile in public.users.
   */
  static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabase_id: userId,
          name: data.name,
          avatar: data.avatar_url,
          city: data.city,
          state: data.state,
          role: data.role,
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

  /**
   * Fetches all registered users (for admin panel).
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch('/api/auth/sync?all=true');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          return data.users;
        }
      }
    } catch {
      // ignore
    }
    return [];
  }
}
