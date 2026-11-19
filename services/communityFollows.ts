import { getSupabaseClient } from './supabaseClient';

export async function getFollowing(): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await client.from('community_follows').select('following_id').eq('follower_id', auth.user.id);
  if (error) throw new Error('Não foi possível carregar quem você segue.');
  return (data || []).map(row => row.following_id);
}
export async function setFollowing(target: string, follow: boolean): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Entre em uma conta para seguir pessoas.');
  const { data: auth } = await client.auth.getUser();
  if (!auth.user || auth.user.id === target) throw new Error('Não foi possível seguir este perfil.');
  const result = follow
    ? await client.from('community_follows').upsert({ follower_id: auth.user.id, following_id: target }, { onConflict: 'follower_id,following_id', ignoreDuplicates: true })
    : await client.from('community_follows').delete().eq('follower_id', auth.user.id).eq('following_id', target);
  if (result.error) throw new Error('Não foi possível atualizar. Tente novamente.');
}
