import { isProductDestination } from './offer-catalog';

/** Only product/affiliate HTTPS destinations. Never turn a missing URL into a local link. */
export function externalOfferDestination(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const destination = value.trim();
  if (!destination || /[\u0000-\u001f\u007f]/.test(destination) || !isProductDestination(destination)) return null;
  try {
    const url = new URL(destination);
    if (url.hostname.endsWith('.test') || url.hostname === 'localhost' || /^(127\.|0\.)/.test(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}
