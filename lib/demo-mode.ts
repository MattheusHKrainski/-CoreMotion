/**
 * O modo demonstração só pode ser ativado explicitamente em desenvolvimento.
 * Em produção, ausência de configuração nunca cria sessões ou dados de demonstração.
 */
const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const DEMO_MODE =
  process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
