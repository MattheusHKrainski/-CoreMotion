import { getSupabaseClient } from './supabaseClient';
import { validateImageFile } from '@/lib/media';

export async function uploadImage(file: File, purpose: 'products' | 'avatars' | 'community'): Promise<string> {
  validateImageFile(file);
  const client = getSupabaseClient();
  if (!client) throw new Error('Entre em uma conta conectada ao Supabase para enviar imagens.');
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error('Sua sessão expirou. Entre novamente.');
  // Decode and re-encode before storage: preserve no EXIF/GPS data and bound image dimensions.
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error('Arquivo de imagem inválido ou danificado. Escolha outra foto.'); }
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, (purpose === 'avatars' ? 512 : 1600) / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) { bitmap.close(); throw new Error('Não foi possível processar a imagem.'); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Imagem inválida.')), 'image/jpeg', 0.86));
  const path = `${data.user.id}/${purpose}/${crypto.randomUUID()}.jpg`;
  const result = await client.storage.from('user-media').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (result.error) throw new Error('Não foi possível enviar a imagem. Tente novamente.');
  return client.storage.from('user-media').getPublicUrl(path).data.publicUrl;
}
