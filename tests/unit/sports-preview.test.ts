import { it } from 'node:test';
import assert from 'node:assert/strict';
import { createSportsPreview, loadSportsPreview } from '@/fixtures/sports-preview';
import type { SportsRecord } from '@/lib/sports';

function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
it('preenche atletas, treinadores, seletivas e interações com identificadores únicos', () => {
  const records = createSportsPreview(new Date('2026-10-24T12:00:00Z'));
  assert.equal(new Set(records.map(r => r.id)).size, records.length);
  assert.equal(records.filter(r => r.kind === 'athlete').length, 8);
  assert.equal(records.filter(r => r.kind === 'coach').length, 5);
  assert.equal(records.filter(r => r.kind === 'trial').length, 6);
  assert.ok(records.some(r => r.kind === 'coach' && r.data.sport.includes('Pilates')));
  for (const record of records.filter(r => ['application', 'invite'].includes(r.kind))) {
    const target = records.find(r => r.id === record.data.target);
    assert.ok(target);
    assert.equal(target.owner, record.data.recipient);
  }
});
it('mantém seletivas futuras com prazos e rotina de treinamento completos', () => {
  for (const record of createSportsPreview(new Date('2026-10-24T12:00:00Z')).filter(r => r.kind === 'trial')) {
    assert.ok(record.data.date > '2026-10-24');
    assert.ok(record.data.deadline < record.data.date);
    assert.ok(Number(record.data.minAge) <= Number(record.data.maxAge));
    for (const key of ['address', 'time', 'trainingDays', 'trainingTime', 'trainingLocation', 'requirements']) assert.ok(record.data[key]);
    assert.match(record.data.contact, /\.example\.test$/);
  }
});
it('inicializa uma vez e não ressuscita exclusões nem sobrescreve edições', () => {
  const store = storage();
  const initial = loadSportsPreview(store);
  const edited = initial.slice(1).map((r, i) => i === 0 ? { ...r, data: { ...r.data, name: 'Nome atualizado' } } : r);
  store.setItem('coremotion_sports_v1', JSON.stringify(edited));
  assert.deepEqual(loadSportsPreview(store), edited);
});
it('preserva perfil próprio já cadastrado antes da carga inicial', () => {
  const store = storage();
  const mine: SportsRecord = { id: 'existing', owner: 'user-c2c-1-athlete', kind: 'athlete', data: { name: 'Meu currículo' } };
  store.setItem('coremotion_sports_v1', JSON.stringify([mine]));
  const records = loadSportsPreview(store);
  assert.deepEqual(records.find(r => r.id === 'existing'), mine);
  assert.equal(records.filter(r => r.owner === mine.owner && r.kind === mine.kind).length, 1);
});
