import { ADMIN_LOGIN_EMAIL } from './admin-account';
import type { UserProfile } from './types';

/** Resume only a server-validated session and its trusted administrative profile. */
export async function readSavedAdminProfile(
  readUser: () => Promise<{ id: string; email?: string } | null>,
  readProfile: (id: string, email: string) => Promise<UserProfile | null>,
): Promise<UserProfile | null> {
  try {
    const user = await readUser();
    if (user?.email?.toLowerCase() !== ADMIN_LOGIN_EMAIL) return null;
    const profile = await readProfile(user.id, user.email);
    if (!profile || profile.role !== 'admin' || profile.is_banned ||
        profile.email.toLowerCase() !== ADMIN_LOGIN_EMAIL ||
        (profile.supabase_id || profile.id) !== user.id) return null;
    return profile;
  } catch {
    // Offline, expired, revoked and failed profile requests must require login.
    return null;
  }
}
