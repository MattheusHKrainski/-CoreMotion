/**
 * Modo demonstração: catálogo fictício local e sessões sem banco de dados.
 * Desligado por padrão. Ative com NEXT_PUBLIC_DEMO_MODE=true (ver .env.example).
 * Com o modo ligado, os dados de fixtures/ aparecem quando o banco não responde.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
