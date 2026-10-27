export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}
export function validPhone(value: string): boolean { return /^[+\d\s().-]+$/.test(value) && /^\d{10,15}$/.test(normalizePhone(value)); }
export function sellerContactUrl(phone: string | null | undefined, title: string): string | null {
  return phone && validPhone(phone) ? `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(`Olá! Vi seu anúncio de ${title} na CoreMotion. Podemos conversar sobre o estado do produto, preço, pagamento e entrega?`)}` : null;
}
