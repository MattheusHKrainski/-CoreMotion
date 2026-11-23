import { getSupabaseClient } from './supabaseClient';
import { validateImageFile, MAX_COMMUNITY_IMAGE_BYTES, MAX_IMAGE_BYTES } from '@/lib/media';

export async function uploadImage(file: File, purpose: 'products' | 'avatars' | 'community'): Promise<string> {
  validateImageFile(file, purpose === 'community' ? MAX_COMMUNITY_IMAGE_BYTES : MAX_IMAGE_BYTES);
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

export async function uploadCommunityVideo(file:File):Promise<string> {
 const {validateVideoFile}=await import('@/lib/media');validateVideoFile(file);
 const client=getSupabaseClient();if(!client)throw new Error('Entre na sua conta para enviar vídeos.');
 const auth=await client.auth.getUser();if(auth.error||!auth.data.user)throw new Error('Sua sessão expirou. Entre novamente.');
 const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const mp4=String.fromCharCode(...header.slice(4,8))==='ftyp';
 const webm=header[0]===0x1a&&header[1]===0x45&&header[2]===0xdf&&header[3]===0xa3;
 if((file.type==='video/mp4'&&!mp4)||(file.type==='video/webm'&&!webm))throw new Error('Arquivo de vídeo inválido ou danificado.');
 const path=`${auth.data.user.id}/community-videos/${crypto.randomUUID()}.${file.type==='video/mp4'?'mp4':'webm'}`;
 const result=await client.storage.from('user-media').upload(path,file,{contentType:file.type,upsert:false});
 if(result.error)throw new Error('Não foi possível enviar o vídeo. Verifique sua conexão e tente novamente.');
 return client.storage.from('user-media').getPublicUrl(path).data.publicUrl;
}
