export const MIN_PASSWORD_LENGTH = 6;

/** User-facing errors only; do not expose raw provider/database responses. */
export function signupErrorMessage(error: { code?: string; message?: string; status?: number }): string {
  const code = error.code || '';
  const message = (error.message || '').toLowerCase();
  if (code === 'user_already_exists' || code === 'email_exists' || message.includes('already')) return 'Já existe uma conta com este e-mail. Faça login ou use “Esqueci minha senha”.';
  if (code === 'weak_password' || message.includes('password')) return 'A senha deve ter no mínimo 6 caracteres e atender aos requisitos de segurança. Escolha uma senha mais forte.';
  if (code === 'email_address_invalid' || code === 'validation_failed' && message.includes('email') || message.includes('invalid email')) return 'O e-mail informado não é válido. Confira o endereço completo, como nome@gmail.com.';
  if (code === 'email_address_not_authorized') return 'O envio de confirmação para este endereço está restrito pela configuração de e-mail. Entre em contato com o suporte.';
  if (error.status === 429 || code.includes('rate_limit') || message.includes('rate limit')) return 'Muitas tentativas ou limite de envio de e-mails atingido. Aguarde alguns minutos antes de tentar novamente.';
  if (code === 'signup_disabled') return 'O cadastro de novas contas está temporariamente desativado. Tente novamente mais tarde.';
  if (code === 'email_provider_disabled') return 'O cadastro por e-mail está desativado. Entre em contato com o suporte.';
  if (code === 'unexpected_failure' || (error.status || 0) >= 500) return 'O serviço de cadastro não conseguiu concluir a solicitação. Tente novamente em alguns minutos.';
  return 'Não foi possível concluir o cadastro. Tente novamente; se o erro continuar, entre em contato com o suporte.';
}
