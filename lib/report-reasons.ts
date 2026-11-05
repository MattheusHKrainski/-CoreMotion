export const REPORT_REASONS = {
  abuse: 'Abuso ou assédio',
  inappropriate_language: 'Palavras inapropriadas',
  hate: 'Ódio ou discriminação',
  spam: 'Spam ou publicidade indevida',
  fraud: 'Golpe ou fraude',
  misinformation: 'Informações incorretas',
  inappropriate_content: 'Conteúdo impróprio',
  other: 'Outro motivo',
} as const;
export type ReportReason = keyof typeof REPORT_REASONS;

/** Persist the selected reason together with optional context, including on legacy reports. */
export function buildReportReason(code: string, details: string): string {
  if (!Object.prototype.hasOwnProperty.call(REPORT_REASONS, code)) throw new Error('Escolha um motivo para a denúncia.');
  const context = details.trim();
  if (code === 'other' && context.length < 5) throw new Error('Descreva o outro motivo com pelo menos 5 caracteres.');
  return `${REPORT_REASONS[code as ReportReason]}${context ? ` — ${context}` : ''}`.slice(0, 2000);
}
