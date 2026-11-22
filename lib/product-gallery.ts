type ProductPhotos = { image_urls?: string[]; images?: string[]; image_url?: string };
/** Persisted photos take priority over static fallbacks, never mix other products. */
export function productGallery(item: ProductPhotos, fallback: string[] = []): string[] {
  const stored = item.image_urls?.length ? item.image_urls : item.images?.length ? item.images : [];
  const candidates = stored.length ? stored : fallback.length ? fallback : [item.image_url || ''];
  return [...new Set(candidates.filter(url => typeof url === 'string' && (/^https?:\/\//.test(url) || (url.startsWith('/') && !url.startsWith('//')))))];
}
