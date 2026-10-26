import { INITIAL_EXTERNAL_OFFERS, LEGACY_SEARCH_OFFERS } from '@/fixtures/real-offers';
import type { ExternalOffer } from './types';

/** Migra somente URLs legadas conhecidas. Links editados pelo administrador são preservados. */
export function refreshLegacyOffers(offers: ExternalOffer[]): ExternalOffer[] {
  const retained = offers.filter(offer => LEGACY_SEARCH_OFFERS[offer.id] !== offer.source_url);
  if (retained.length === offers.length) return offers;
  return [...retained, ...INITIAL_EXTERNAL_OFFERS.filter(seed => !retained.some(offer => offer.id === seed.id))];
}

/** Rejeita buscas/categorias conhecidas; links de afiliado continuam aceitos.
 * Uma URL com formato de produto ainda exige conferência do destino pelo administrador.
 */
export function isProductDestination(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    if (!url.pathname || url.pathname === '/') return false;
    if (/^(lista|ofertas)\.mercadolivre\./i.test(url.hostname)) return false;
    if (/\/(busca|search|pesquisa|s|categoria|categorias|esportes|colecao)(\/|$)/i.test(url.pathname)) return false;
    if (/\/w\/wholesale-/i.test(url.pathname)) return false;
    if (url.hostname.endsWith('olympikus.com.br') && /^\/corre\/?$/.test(url.pathname)) return false;
    return true;
  } catch { return false; }
}
