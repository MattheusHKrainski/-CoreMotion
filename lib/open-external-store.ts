import { externalOfferDestination } from './external-offer-link';

/** Returns true only when a real browsing context was obtained and navigated. */
export function openExternalStore(destination: string): boolean {
  const safe = externalOfferDestination(destination);
  if (!safe) return false;
  let tab: Window | null = null;
  try {
    tab = window.open('about:blank', '_blank');
    if (!tab) return false;
    // Sever the opener before any untrusted merchant page is loaded.
    tab.opener = null;
    tab.location.replace(safe);
    return true;
  } catch {
    try { tab?.close(); } catch { /* The native anchor remains available. */ }
    return false;
  }
}
