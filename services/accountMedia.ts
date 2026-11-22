import type { SupabaseClient } from '@supabase/supabase-js';

/** Delete through Storage's API (not SQL), restricted by server-side RLS.
 * Runs before account deletion; failures leave the account available for retry.
 */
export async function removeAccountMedia(client: SupabaseClient, targetId: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) throw new Error('Conta inválida.');
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user || auth.user.id === targetId) throw new Error('Exclusão não permitida.');
  const { data: actor, error: roleError } = await client.from('profiles').select('role,is_banned').eq('id', auth.user.id).single();
  if (roleError || actor?.role !== 'admin' || actor.is_banned) throw new Error('Somente administradores ativos podem excluir contas.');
  const bucket = client.storage.from('user-media');
  const files: string[] = [];
  let requests = 0;
  async function collect(prefix: string, depth: number): Promise<void> {
    if (depth > 8) throw new Error('Estrutura de arquivos excede o limite seguro.');
    for (let offset = 0; ; offset += 100) {
      if (++requests > 1000) throw new Error('Arquivos demais para esta operação. Contate o suporte.');
      const { data, error } = await bucket.list(prefix, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
      if (error || !data) throw new Error('Não foi possível consultar as imagens da conta. Tente novamente.');
      for (const item of data) {
        if (item.name.includes('/') || item.name === '.' || item.name === '..') throw new Error('Caminho de arquivo inválido.');
        const path = `${prefix}/${item.name}`;
        if (item.id) files.push(path);
        else await collect(path, depth + 1);
      }
      if (data.length < 100) break;
    }
  }
  await collect(targetId, 0);
  for (let offset = 0; offset < files.length; offset += 100) {
    const batch = files.slice(offset, offset + 100);
    const { data, error } = await bucket.remove(batch);
    if (error || !data || data.length !== batch.length) throw new Error('Não foi possível remover todas as imagens. A conta não foi excluída; tente novamente.');
  }
}
