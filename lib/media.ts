export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export function validateImageFile(file: Pick<File, 'type' | 'size'>): void {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error('A imagem deve ter até 8 MB.');
}
export function validImageUrl(value: string): boolean {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export function validateVideoFile(file: Pick<File,'type'|'size'>):void {
 if(!['video/mp4','video/webm'].includes(file.type))throw new Error('Use um vídeo MP4 ou WebM.');
 if(!file.size||file.size>MAX_VIDEO_BYTES)throw new Error('O vídeo deve ter até 50 MB.');
}
export function validCommunityVideoUrl(value:string):boolean {
 try {const url=new URL(value),base=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://unconfigured.invalid');return url.origin===base.origin&&!url.search&&!url.hash&&/^\/storage\/v1\/object\/public\/user-media\/[0-9a-f-]{36}\/community-videos\/[0-9a-f-]{36}\.(mp4|webm)$/i.test(url.pathname);}catch{return false;}
}
