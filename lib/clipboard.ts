/** Clipboard API can be denied by an embedded preview's permissions policy. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* Try the user-initiated compatibility path below. */ }
  const previousFocus = document.activeElement;
  const input = document.createElement('textarea');
  input.value = text;
  input.readOnly = true;
  input.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;pointer-events:none';
  document.body.appendChild(input);
  try {
    input.focus({ preventScroll: true });
    input.select();
    input.setSelectionRange(0, text.length);
    return typeof document.execCommand === 'function' && document.execCommand('copy');
  } catch {
    return false;
  } finally {
    input.remove();
    if (typeof HTMLElement !== 'undefined' && previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  }
}
