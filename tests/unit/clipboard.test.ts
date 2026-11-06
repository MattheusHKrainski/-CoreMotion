import { it } from 'node:test';
import assert from 'node:assert/strict';
import { copyText } from '@/lib/clipboard';

it('cópia usa API moderna, compatibilidade quando bloqueada e informa falha real', async () => {
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  let modern = '', selected = false, removed = false, fallback = true;
  const textarea = { value: '', readOnly: false, style: { cssText: '' }, focus() {}, select() { selected = true; }, setSelectionRange() {}, remove() { removed = true; } };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async (text: string) => { modern = text; } } } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { activeElement: null, body: { appendChild() {} }, createElement: () => textarea, execCommand: (command: string) => { assert.equal(command, 'copy'); return fallback; } } });
  try {
    assert.equal(await copyText('https://loja.com/produto'), true);
    assert.equal(modern, 'https://loja.com/produto');
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async () => { throw new Error('Permissions policy'); } } } });
    assert.equal(await copyText('https://loja.com/produto'), true);
    assert.equal(textarea.value, 'https://loja.com/produto');
    assert.ok(selected && removed);
    fallback = false;
    assert.equal(await copyText('cupom'), false);
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
    assert.equal(await copyText('cupom'), false);
  } finally {
    if (oldNavigator) Object.defineProperty(globalThis, 'navigator', oldNavigator); else Reflect.deleteProperty(globalThis, 'navigator');
    if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument); else Reflect.deleteProperty(globalThis, 'document');
  }
});
