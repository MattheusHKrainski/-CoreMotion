export const isProd = process.env.NODE_ENV === 'production';

export const appConfig = {
  appName: 'CoreMotiom',
  supportEmail: 'suporte@coremotiom.com',
  isSupabaseEnabled: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};
