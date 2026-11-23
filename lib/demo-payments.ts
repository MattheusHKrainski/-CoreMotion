/**
 * Presentation-only payments. Never send card credentials or a valid Pix/boleto
 * payload to a provider. The database records only the selected method.
 */
export const DEMO_PAYMENT_METHODS = [
  { id: 'pix', label: 'Pix', description: 'Confirmação imediata simulada' },
  { id: 'credit', label: 'Cartão de crédito', description: 'Cartão fictício e parcelamento ilustrativo' },
  { id: 'debit', label: 'Cartão de débito', description: 'Aprovação de débito simulada' },
  { id: 'boleto', label: 'Boleto bancário', description: 'Boleto fictício com confirmação simulada' },
] as const;

export type DemoPaymentMethod = (typeof DEMO_PAYMENT_METHODS)[number]['id'];

export function demoPaymentLabel(method: string | null | undefined): string {
  return DEMO_PAYMENT_METHODS.find(option => option.id === method)?.label ?? 'Não informado';
}

/** These are deliberately NOT valid Pix / banking / card credentials. */
export function demoPaymentReference(method: DemoPaymentMethod, orderId: string): string {
  return `COREMOTION-DEMONSTRACAO-${method.toUpperCase()}-${orderId.slice(0, 8).toUpperCase()}`;
}
