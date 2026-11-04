import { it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_COACHES, INITIAL_ATHLETES } from '@/fixtures/initial-data';
import { ADDITIONAL_COACHES, ADDITIONAL_ATHLETES } from '@/fixtures/sports-profiles';
import { CoreMotiomProvider } from '@/lib/store';
import CoachesView from '@/components/CoachesView';

it('amplia os perfis sem substituir os exemplos anteriores ou repetir identificadores', () => {
  assert.equal(INITIAL_COACHES.length, 9);
  assert.equal(INITIAL_ATHLETES.length, 10);
  for (const list of [INITIAL_COACHES, INITIAL_ATHLETES]) {
    assert.equal(new Set(list.map(profile => profile.id)).size, list.length);
    assert.equal(new Set(list.map(profile => profile.name)).size, list.length);
  }
  assert.ok(INITIAL_COACHES.some(profile => profile.id === 'coach-1'));
  assert.ok(INITIAL_ATHLETES.some(profile => profile.id === 'athlete-1'));
});
it('novos perfis têm avatares locais e dados completos sem contatos ou credenciais inventadas', () => {
  for (const profile of [...ADDITIONAL_COACHES, ...ADDITIONAL_ATHLETES]) {
    assert.ok(profile.bio.length > 70);
    assert.ok(profile.location);
    assert.ok(existsSync(`public${profile.avatar_url}`));
  }
  assert.equal(new Set([...ADDITIONAL_COACHES, ...ADDITIONAL_ATHLETES].map(profile => profile.avatar_url)).size, 14);
  for (const coach of ADDITIONAL_COACHES) {
    assert.ok(coach.sports.length > 0);
    assert.ok(coach.hourly_rate > 0);
    assert.equal(coach.is_certified, false);
    assert.equal(coach.cref_number, undefined);
    assert.equal(coach.reviews_count, 0);
  }
  assert.ok(ADDITIONAL_ATHLETES.every(athlete => athlete.achievements.length > 0 && !athlete.instagram));
});
it('mostra treinadores e atletas com filtros de modalidade mesmo sem ativar dados locais das demais áreas', () => {
  const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(CoachesView)));
  assert.match(html, /9 treinadores/);
  assert.match(html, /10 atletas/);
  assert.match(html, /Modalidade dos atletas/);
  for (const profile of [...ADDITIONAL_COACHES, ...ADDITIONAL_ATHLETES]) assert.ok(html.includes(profile.name));
  for (const sport of ['Pilates', 'Natação', 'Musculação', 'Futebol', 'Vôlei', 'Tênis']) assert.ok(html.includes(sport));
  const source = readFileSync('components/CoachesView.tsx', 'utf8');
  assert.match(source, /new Set\(coaches.flatMap/);
  assert.match(source, /athlete.sport === athleteSport/);
});
