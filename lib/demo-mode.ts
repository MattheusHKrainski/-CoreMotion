/**
 * Catálogo inicial local quando nenhum banco Supabase está configurado,
 * ou quando ativado explicitamente via NEXT_PUBLIC_DEMO_MODE=true.
 */
const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
  (!hasSupabaseEnv && process.env.NEXT_PUBLIC_DEMO_MODE !== 'false');
