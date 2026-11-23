/** Non-payable, browser-only demonstration card data. Never persist or transmit PAN/CVV. */
export const DEMO_TEST_CARDS = [
  { brand: 'Visa', number: '4242424242424242', last4: '4242' },
  { brand: 'Mastercard', number: '5555555555554444', last4: '4444' },
] as const;

export interface DemoCardFields {
  holder: string;
  number: string;
  expiry: string;
  cvc: string;
}

export function formatDemoCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(' ') ?? '';
}

export function formatDemoExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function demoCardBrand(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  return DEMO_TEST_CARDS.find(card => card.number === digits)?.brand ?? null;
}

/** Months, not days, are relevant to card expiry. */
export function isFutureDemoExpiry(value: string, today = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]), year = 2000 + Number(match[2]);
  return month >= 1 && month <= 12 && (year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth() + 1)) && year <= today.getFullYear() + 15;
}

/** Only the allowlisted card fixtures can pass; a real credit card must never be accepted. */
export function validateDemoCard(fields: DemoCardFields, today = new Date()): string | null {
  if (fields.holder.trim().length < 4 || fields.holder.trim().length > 80)
    return 'Informe o nome fictício impresso no cartão.';
  if (!demoCardBrand(fields.number))
    return 'Utilize apenas um dos cartões de teste disponibilizados nesta tela. Cartões reais não são aceitos.';
  if (!isFutureDemoExpiry(fields.expiry, today))
    return 'Informe a validade fictícia em MM/AA, com mês e ano válidos.';
  if (!/^\d{3}$/.test(fields.cvc))
    return 'Preencha um CVV fictício de três números.';
  return null;
}

/** Split integer cents without losing or gaining centavos. */
export function demoInstallmentValues(totalCents: number, count: number): { regular: number; last: number } {
  if (!Number.isSafeInteger(totalCents) || totalCents < 0 || !Number.isInteger(count) || count < 1 || count > 12)
    throw new Error('Parcelamento de demonstração inválido.');
  const regular = Math.floor(totalCents / count);
  return { regular, last: totalCents - regular * (count - 1) };
}

export function demoSampleExpiry(today = new Date()): string {
  return `12/${String((today.getFullYear() + 2) % 100).padStart(2, '0')}`;
}
