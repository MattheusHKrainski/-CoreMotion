export type ProductVariantConfig = {
  label: string;
  options: string[];
  note: string;
  fixedValue?: string;
};

const SHOE_SIZES = Array.from({ length: 12 }, (_, index) => String(index + 34)); // 34–45 BR
const APPAREL_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
const GI_SIZES = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Options express the customer's requested variant; supplier stock is not implied. */
export function getProductVariantConfig(title: string, category: string, sport: string, description = '', listedSizes?: string[]): ProductVariantConfig | null {
  if (listedSizes?.length) {
    return {
      label: 'Tamanho',
      options: listedSizes,
      fixedValue: listedSizes.length === 1 ? listedSizes[0] : undefined,
      note: '',
    };
  }
  const text = normalize(`${title} ${category} ${sport} ${description}`);
  const normalizedCategory = normalize(category);
  if (/\b(kimono|gi)\b/.test(text)) {
    return { label: 'Tamanho do kimono', options: GI_SIZES, note: '' };
  }
  if (normalizedCategory.includes('calcado') || /^(tenis(?! de mesa)|chuteira|sapatilha|boots|shoe)\b/.test(normalize(title))) {
    return { label: 'Numeração (BR)', options: SHOE_SIZES, note: '' };
  }
  if (/\b(camiseta|camisa|regata|short|bermuda|calca|legging|jaqueta|blusa|top|uniforme)\b/.test(text) || /vestuario|roupas/.test(normalizedCategory)) {
    return { label: 'Tamanho', options: APPAREL_SIZES, note: '' };
  }
  if (/\b(luva|luvas)\b/.test(text)) {
    return { label: 'Tamanho da luva', options: ['P', 'M', 'G', 'GG'], note: '' };
  }
  if (/\bbola\b/.test(text)) {
    const explicitSize = text.match(/(?:tamanho(?:\s+oficial)?|size)\s*(\d)/)?.[1];
    if (/\b(volei|volleyball)\b/.test(text)) {
      const size = explicitSize || '5';
      return { label: 'Tamanho da bola', options: [size], fixedValue: size, note: '' };
    }
    if (/\bbasquete\b/.test(text)) {
      if (explicitSize) return { label: 'Tamanho da bola', options: [explicitSize], fixedValue: explicitSize, note: '' };
      return { label: 'Tamanho da bola', options: ['5', '6', '7'], note: '' };
    }
    if (/\b(futebol|futsal)\b/.test(text)) {
      if (explicitSize) return { label: 'Tamanho da bola', options: [explicitSize], fixedValue: explicitSize, note: '' };
      return { label: 'Tamanho da bola', options: ['3', '4', '5'], note: '' };
    }
    if (/\b(handebol)\b/.test(text)) return { label: 'Tamanho da bola', options: ['1', '2', '3'], note: '' };
  }
  return null;
}
