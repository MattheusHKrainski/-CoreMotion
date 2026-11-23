import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
it('cada montagem do hook recebe canal único, inclusive durante limpeza assíncrona do anterior', () => {
  const hook = readFileSync('hooks/useRealtimeRefresh.ts','utf8');
  assert.match(hook, /client.channel\('coremotion-' \+ channelId \+ '-' \+ crypto.randomUUID\(\)\)/);
  assert.match(hook, /client.removeChannel\(channel\)/);
  assert.ok(hook.indexOf("channel.on('postgres_changes'") < hook.indexOf('channel.subscribe('));
});
