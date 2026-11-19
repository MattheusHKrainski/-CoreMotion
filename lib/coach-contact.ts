import { normalizePhone, validPhone } from './seller-contact';

export function coachContactUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  if (validPhone(clean)) return `https://wa.me/${normalizePhone(clean)}`;
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(clean)) return `mailto:${clean}`;
  try {
    const url = new URL(clean);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* Free text remains visible without becoming a link. */ }
  return null;
}
