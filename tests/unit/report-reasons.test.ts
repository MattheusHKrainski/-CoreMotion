import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REPORT_REASONS, buildReportReason } from '@/lib/report-reasons';
it('persists each selected reason with optional details and supports inappropriate language/abuse', () => {
  assert.equal(REPORT_REASONS.abuse, 'Abuso ou assédio');
  assert.equal(REPORT_REASONS.inappropriate_language, 'Palavras inapropriadas');
  for (const code of Object.keys(REPORT_REASONS).filter(c => c !== 'other')) {
    assert.equal(buildReportReason(code, ''), REPORT_REASONS[code as keyof typeof REPORT_REASONS]);
  }
  assert.equal(buildReportReason('abuse','  Assédio na publicação  '),'Abuso ou assédio — Assédio na publicação');
  assert.equal(buildReportReason('other','  Problema diferente  '),'Outro motivo — Problema diferente');
});
it('rejects unselected/unknown reasons and requires explanation for Other', () => {
  for (const code of ['', 'toString', 'unknown']) assert.throws(() => buildReportReason(code,'Detalhes'),/Escolha um motivo/);
  assert.throws(() => buildReportReason('other','  '), /pelo menos 5/);
  assert.ok(buildReportReason('spam','x'.repeat(3000)).length<=2000);
});
it('deletion is separate from review submission and requires explicit confirmation', () => {
  const ui=readFileSync('components/admin/AdminDashboard.tsx','utf8');
  assert.match(ui,/type="button" disabled=\{busy\}[^\n]+onClick=\{onDelete\}>Excluir denúncia/);
  assert.match(ui,/window.confirm\('Excluir definitivamente esta denúncia/);
  assert.match(readFileSync('components/shared/ReportButton.tsx','utf8'),/select required value=\{reasonCode\}/);
});
