import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import config from '../../next.config';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants';

it('isola os arquivos do preview dos arquivos gerados pelo build', () => {
  const development = config(PHASE_DEVELOPMENT_SERVER);
  const production = config(PHASE_PRODUCTION_BUILD);
  assert.equal(development.distDir, '.cache/next-dev');
  assert.equal(production.distDir, '.next');
  assert.notEqual(development.distDir, production.distDir);
  assert.ok(development.allowedDevOrigins?.includes('*.e2b.app'));
});
it('limita as três imagens de boas-vindas a contêineres proporcionais', () => {
  const source = readFileSync('components/WelcomeLandingPage.tsx', 'utf8');
  assert.equal((source.match(/aspectRatio: '16 \/ 10'/g) || []).length, 3);
  const css = readFileSync('app/globals.css', 'utf8');
  assert.match(css, /img, video\s*\{\s*max-width: 100%/);
});
