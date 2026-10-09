/**
 * TLS dos scripts de banco: verifica o certificado do servidor.
 * Se o pooler usar uma CA própria (ex.: a do Supabase), informe o certificado em DATABASE_SSL_CA.
 */
export function pgSsl() {
  const ca = (process.env.DATABASE_SSL_CA || '').trim();
  return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: true };
}
