import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canDeleteTarget, canChangeRoleOf } from '@/lib/permissions';
it('allows administrators to delete or change roles of other administrators, regardless of historical emails', () => {
  for (const email of ['ordinary@test.com','professorchines2026@gmail.com','mattheus.h.krainski@gmail.com']) {
    assert.equal(canDeleteTarget('admin', email), true);
    assert.equal(canChangeRoleOf('admin', email), true);
    assert.equal(canDeleteTarget('supervisor', email), false);
    assert.equal(canChangeRoleOf('supervisor', email), false);
  }
});
it('protects only the active account in the dashboard and exposes administrator promotion', () => {
  const ui=readFileSync('components/admin/AdminDashboard.tsx','utf8');
  assert.match(ui, /const protectedAccount = a.id === user!\.id;/);
  assert.match(ui, /<option value="admin">Administrador<\/option>/);
  assert.doesNotMatch(ui,/isMasterAdminEmail/);
  const sql=readFileSync('supabase/migrations/20261104220000_administrator_account_management.sql','utf8');
  assert.match(sql,/CHECK\(role IN \('user','seller','merchant','supervisor','admin'\)\)/);
  assert.match(sql,/IF target.id=auth.uid\(\) THEN/);
  assert.match(sql,/p_role NOT IN \('user','supervisor','admin'\)/);
});

it('server routes and profile synchronization never restore admin solely by historical email', () => {
  for (const file of ['lib/server-auth.ts','lib/db-queries.ts']) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /isMasterAdminEmail|public\.is_master_email/);
  }
});
