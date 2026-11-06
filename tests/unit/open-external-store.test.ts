import { it } from 'node:test';
import assert from 'node:assert/strict';
import { openExternalStore } from '@/lib/open-external-store';

it('abre sincronamente, remove opener antes de navegar e detecta bloqueios sem inventar sucesso', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const url = 'https://www.decathlon.com.br/kimono-adulto-de-jiu-jitsu-brasileiro-500-preto-8920531-outshock/p';
  let navigated = '', closed = false;
  const tab = { opener: {} as unknown, location: { replace(value: string) { assert.equal(tab.opener, null); navigated = value; } }, close() { closed = true; } };
  const install = (open: () => unknown) => Object.defineProperty(globalThis, 'window', { configurable: true, value: { open } });
  try {
    install(() => tab);
    assert.equal(openExternalStore(url), true);
    assert.equal(navigated, url);
    install(() => null);
    assert.equal(openExternalStore(url), false);
    install(() => { throw new Error('sandbox'); });
    assert.equal(openExternalStore(url), false);
    install(() => ({ ...tab, location: { replace() { throw new Error('navigation denied'); } } }));
    assert.equal(openExternalStore(url), false);
    assert.ok(closed);
    install(() => { throw new Error('unsafe link must not reach window.open'); });
    assert.equal(openExternalStore('javascript:alert(1)'), false);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous); else Reflect.deleteProperty(globalThis, 'window');
  }
});
