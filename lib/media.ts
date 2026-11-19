export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export function validateImageFile(file: Pick<File, 'type' | 'size'>): void {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error('A imagem deve ter até 8 MB.');
}
export function validImageUrl(value: string): boolean {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
