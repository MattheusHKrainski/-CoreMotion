import { it } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { removeAccountMedia } from '@/services/accountMedia';
const target = '11111111-1111-4111-8111-111111111111';
function fixture(role = 'admin', failRemove = false) {
  const removed: string[][] = [];
  const offsets: number[] = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: '22222222-2222-4222-8222-222222222222' } } }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role, is_banned: false } }) }) }) }),
    storage: { from: () => ({
      list: async (prefix: string, { offset }: { offset: number }) => {
        if (prefix === target) return { data: [{ name: 'avatars', id: null }] };
        offsets.push(offset);
        return { data: Array.from({ length: offset === 0 ? 100 : 5 }, (_, i) => ({ name: `file-${offset + i}.jpg`, id: String(offset + i) })) };
      },
      remove: async (paths: string[]) => { removed.push(paths); return failRemove ? { error: new Error('Network') } : { data: paths.map(name => ({ name })) }; },
    }) },
  } as unknown as SupabaseClient;
  return { client, removed, offsets };
}
it('limpeza Storage visita todas as páginas e remove só arquivos da conta em lotes', async () => {
  const f = fixture();
  await removeAccountMedia(f.client, target);
  assert.deepEqual(f.offsets, [0,100]);
  assert.deepEqual(f.removed.map(batch => batch.length), [100,5]);
  assert.ok(f.removed.flat().every(path => path.startsWith(`${target}/avatars/`)));
});
it('supervisor não pode limpar arquivos de outra conta', async () => {
  const f = fixture('supervisor');
  await assert.rejects(removeAccountMedia(f.client, target), /administradores/);
  assert.equal(f.removed.length, 0);
});
it('falhas de Storage impedem continuar com a exclusão', async () => {
  const f = fixture('admin', true);
  await assert.rejects(removeAccountMedia(f.client, target), /conta não foi excluída/);
});
it('não aceita prefixos arbitrários nem apagar os próprios arquivos pelo fluxo de exclusão', async () => {
  const f = fixture();
  await assert.rejects(removeAccountMedia(f.client, '../other'), /inválida/);
  await assert.rejects(removeAccountMedia(f.client, '22222222-2222-4222-8222-222222222222'), /não permitida/);
});
