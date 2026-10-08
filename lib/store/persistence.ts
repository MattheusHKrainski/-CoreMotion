// ============================================================================
// CORE MOTIOM — PERSISTÊNCIA LOCAL (localStorage)
// Mesma chave/formato da versão anterior — dados existentes continuam válidos.
// ============================================================================

const STORAGE_KEY = 'coremotiom_state_v1';

export function readPersistedState(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function writePersistedState(payload: Record<string, unknown>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage indisponível — ignora
  }
}
