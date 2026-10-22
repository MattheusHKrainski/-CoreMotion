/**
 * Catálogo inicial local ativado automaticamente quando não há banco externo configurado
 * ou quando NEXT_PUBLIC_DEMO_MODE=true. Com Supabase configurado, permanece desativado por padrão.
 */
const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
  (!hasSupabaseEnv && process.env.NEXT_PUBLIC_DEMO_MODE !== 'false');
