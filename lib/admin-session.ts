import { ADMIN_LOGIN_EMAIL } from './admin-account';
import type { UserProfile } from './types';

/** Session identity must be validated by Auth; privileges must come from the trusted DB profile. */
export async function readSavedAdminProfile(
  readUser: () => Promise<{ id: string; email?: string } | null>,
  readProfile: (id: string, email: string) => Promise<UserProfile | null>,
): Promise<UserProfile | null> {
  try {
    const identity = await readUser();
    if (identity?.email?.toLowerCase() !== ADMIN_LOGIN_EMAIL) return null;
    const profile = await readProfile(identity.id, identity.email);
    if (!profile || profile.role !== 'admin' || profile.is_banned ||
      profile.email.toLowerCase() !== ADMIN_LOGIN_EMAIL ||
      (profile.supabase_id || profile.id) !== identity.id) return null;
    return profile;
  } catch { return null; }
}
