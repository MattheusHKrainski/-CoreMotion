import type { Session } from '@supabase/supabase-js';
import type { UserProfile } from './types';
import type { AccountType } from './sports';

export const SAVED_ACCOUNTS_EVENT = 'coremotion:saved-accounts';
export interface SavedAccount {
  id: string;
  name: string;
  email: string;
  account_type: AccountType;
  role: UserProfile['role'];
  needsLogin: boolean;
}
export type SavedTokens = Pick<Session, 'access_token' | 'refresh_token'>;
interface SavedEntry extends SavedAccount { tokens: SavedTokens | null }
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/** Device-local bearer credentials. Never store passwords or send this list to public tables. */
export class SavedAccountVault {
  constructor(private storage: StorageLike, readonly key: string) {}
  private read(): SavedEntry[] {
    try {
      const value: unknown = JSON.parse(this.storage.getItem(this.key) || '[]');
      if (!Array.isArray(value)) return [];
      const seen = new Set<string>();
      return value.filter((entry): entry is SavedEntry => {
        if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' ||
            !/^[0-9a-f-]{36}$/i.test(entry.id) || seen.has(entry.id) ||
            typeof entry.name !== 'string' || typeof entry.email !== 'string' ||
            !['athlete', 'coach', 'casual'].includes(entry.account_type) ||
            !['user', 'seller', 'supervisor', 'admin'].includes(entry.role) ||
            !(entry.tokens === null || (typeof entry.tokens?.access_token === 'string' && typeof entry.tokens?.refresh_token === 'string'))) return false;
        seen.add(entry.id);
        return true;
      });
    } catch { return []; }
  }
  list(): SavedAccount[] {
    return this.read().map(({ id, name, email, account_type, role, tokens }) => ({ id, name, email, account_type, role, needsLogin: !tokens }));
  }
  tokens(id: string): SavedTokens | null { return this.read().find(entry => entry.id === id)?.tokens || null; }
  has(id: string): boolean { return this.read().some(entry => entry.id === id); }
  save(profile: UserProfile, session: Pick<Session, 'user' | 'access_token' | 'refresh_token'>): void {
    if (session.user.id !== profile.id || profile.is_banned || profile.role === 'visitor') throw new Error('Sessão incompatível com a conta.');
    const entry: SavedEntry = {
      id: profile.id, name: profile.name, email: profile.email,
      account_type: profile.account_type || 'casual', role: profile.role, needsLogin: false,
      tokens: { access_token: session.access_token, refresh_token: session.refresh_token },
    };
    this.storage.setItem(this.key, JSON.stringify([entry, ...this.read().filter(item => item.id !== profile.id)]));
  }
  rotate(session: Pick<Session, 'user' | 'access_token' | 'refresh_token'>): void {
    const entries = this.read();
    if (!entries.some(entry => entry.id === session.user.id && entry.tokens)) return;
    this.storage.setItem(this.key, JSON.stringify(entries.map(entry => entry.id === session.user.id ? {
      ...entry, needsLogin: false, tokens: { access_token: session.access_token, refresh_token: session.refresh_token },
    } : entry)));
  }
  invalidate(id: string): void {
    this.storage.setItem(this.key, JSON.stringify(this.read().map(entry => entry.id === id ? { ...entry, tokens: null, needsLogin: true } : entry)));
  }
  remove(id: string): void {
    this.storage.setItem(this.key, JSON.stringify(this.read().filter(entry => entry.id !== id)));
  }
}
