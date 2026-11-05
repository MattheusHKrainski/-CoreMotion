/** Accept common providers and custom domains, but require a complete email address. */
export function isValidEmailAddress(value: string): boolean {
  const email = value.trim();
  if (email.length > 254 || /\s/.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
  const labels = domain.split('.');
  return labels.length >= 2 && labels.every(label => label.length <= 63 && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label)) && /^[a-zA-Z]{2,63}$/.test(labels[labels.length - 1]);
}

/** New registrations only; existing accounts retain their login/recovery support. */
export const SIGNUP_EMAIL_HELP = 'Use um e-mail @gmail.com, @hotmail.com ou @outlook.com.';
export function isAllowedSignupEmail(value: string): boolean {
  return isValidEmailAddress(value) && ['gmail.com', 'hotmail.com', 'outlook.com'].includes(value.trim().toLowerCase().split('@')[1]);
}
