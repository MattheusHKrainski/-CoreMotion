/** Utilitários de entrada para as rotas de API (validação mínima e segura). */
import type { NextRequest } from 'next/server';

export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T | null> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? (body as T) : null;
  } catch {
    return null;
  }
}

/** Converte para texto aparado, limitado em tamanho. Valores não textuais viram string vazia. */
export function str(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function num(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function strArray(value: unknown, maxItems = 10, maxLength = 2048): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .slice(0, maxItems)
    .map((v) => v.trim().slice(0, maxLength));
}

export const PRODUCT_CONDITIONS = ['novo', 'como_novo', 'seminovo', 'usado_excelente', 'usado_bom'] as const;
export const PRODUCT_STATUSES = ['active', 'draft', 'sold', 'suspended'] as const;
