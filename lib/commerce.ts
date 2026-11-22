/** Independent from the athlete/C2C checkout. All monetary amounts are integer BRL cents. */
export type SaleCartLine = { offerId: string; quantity: number; variant: string };
export type ShippingAddress = { recipient: string; phone: string; postalCode: string; street: string; number: string; complement: string; district: string; city: string; state: string };
export type OrderPreparationStatus = 'preparation' | 'reviewing' | 'cancelled';
export interface SaleOrder { id: string; owner: string; request_key: string; status: OrderPreparationStatus; payment_status: 'disabled' | 'test_approved' | 'test_cancelled'; shipping_status: 'not_quoted'; subtotal_cents: number; shipping_cents: null; total_cents: null; address: ShippingAddress; items: { offerId: string; title: string; supplier: string; quantity: number; variant: string; unitPriceCents: number }[]; note: string; created_at: string; updated_at: string }
export const PREPARATION_STATUS = { preparation: 'Aguardando confirmação', reviewing: 'Em acompanhamento', cancelled: 'Pedido cancelado' } as const;
export const EMPTY_ADDRESS: ShippingAddress = { recipient: '', phone: '', postalCode: '', street: '', number: '', complement: '', district: '', city: '', state: '' };
export function validateCart(value: unknown): SaleCartLine[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) throw new Error('O carrinho deve conter de 1 a 30 itens.');
  const keys = new Set<string>();
  return value.map(line => {
    if (!line || typeof line.offerId !== 'string' || !line.offerId || line.offerId.length > 96 || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10 || typeof line.variant !== 'string' || line.variant.length > 120) throw new Error('Item ou quantidade inválida.');
    const key = JSON.stringify([line.offerId, line.variant.trim()]); if (keys.has(key)) throw new Error('Item duplicado.'); keys.add(key);
    return { offerId: line.offerId, quantity: line.quantity, variant: line.variant.trim() };
  });
}
export function validateAddress(address: ShippingAddress): void {
  for (const key of ['recipient','street','number','district','city','state','postalCode','phone'] as const) if (!address[key]?.trim()) throw new Error('Preencha todos os campos obrigatórios do endereço.');
  if (!/^\d{8}$/.test(address.postalCode.replace(/\D/g,'')) || !/^[A-Z]{2}$/.test(address.state) || !/^\d{10,13}$/.test(address.phone.replace(/\D/g,'')) || Object.values(address).some(value => typeof value !== 'string' || value.length > 200)) throw new Error('Confira CEP, telefone, UF e o tamanho dos campos.');
}
export function retailPriceCents(price: number): number {
  if (!Number.isFinite(price) || price <= 0 || price > 9999999) throw new Error('Preço indisponível.');
  return Math.round(price * 100);
}
export function priceWithMargin(costCents: number, markupBps: number, handlingCents = 0): number {
  if (![costCents, markupBps, handlingCents].every(Number.isSafeInteger) || costCents <= 0 || markupBps < 0 || markupBps > 100000 || handlingCents < 0) throw new Error('Regra de preço inválida.');
  const result = Math.round(costCents * (10000 + markupBps) / 10000) + handlingCents;
  if (!Number.isSafeInteger(result) || result > 999999900) throw new Error('Preço acima do limite permitido.');
  return result;
}
export const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function productPath(kind: 'core' | 'athlete', id: string): string { return `/produto/${kind}/${encodeURIComponent(id)}`; }
