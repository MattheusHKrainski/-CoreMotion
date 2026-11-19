import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HELP_TOPICS, SUPPORT_EMAIL, supportMailto } from '../../lib/support';

test('all ten help categories provide guidance and a valid contact link', () => {
  assert.equal(Object.keys(HELP_TOPICS).length, 10);
  for (const category of Object.keys(HELP_TOPICS) as (keyof typeof HELP_TOPICS)[]) {
    assert.ok(HELP_TOPICS[category].text.length > 80);
    const link = new URL(supportMailto(category));
    assert.equal(link.protocol, 'mailto:');
    assert.equal(link.pathname, SUPPORT_EMAIL);
    assert.equal(link.searchParams.get('subject'), `CoreMotion — ${HELP_TOPICS[category].label}`);
  }
});
test('support tickets do not grant ownership or response authority to submitters', () => {
  const migration = readFileSync('supabase/migrations/20261022101000_restrict_support_ticket_columns.sql', 'utf8');
  assert.match(migration, /REVOKE ALL ON public.support_tickets FROM anon, authenticated/);
  assert.match(migration, /INSERT\(category,subject,message,reference\)/);
  assert.match(migration, /UPDATE\(status,response\)/);
  const policies = readFileSync('supabase/migrations/20261022100000_support_and_restore_likes.sql', 'utf8');
  assert.match(policies, /owner=auth.uid\(\)/);
  assert.match(policies, /FOR UPDATE TO authenticated USING\(public.is_staff\(\) AND NOT public.is_banned_user\(\)\)/);
});
test('restored like RPC is explicit-state, authenticated and serialized per post', () => {
  const sql = readFileSync('supabase/migrations/20261022100000_support_and_restore_likes.sql', 'utf8');
  assert.match(sql, /set_community_like\(p_post_id uuid, p_liked boolean\)/);
  assert.match(sql, /FOR UPDATE/);
  assert.match(sql, /ON CONFLICT DO NOTHING/);
  assert.match(sql, /user_id=auth.uid\(\)/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public.set_community_like\(uuid,boolean\) FROM PUBLIC/);
});
