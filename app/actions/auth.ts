'use server';

import { loginSchema, registerSchema, forgotPasswordSchema } from '@/lib/schemas/auth.schema';
import { AuthService } from '@/services/authService';

export async function serverLogin(formData: unknown) {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Dados inválidos.',
    };
  }

  const { email, password } = parsed.data;
  const result = await AuthService.loginWithEmail(email, password);
  return result;
}

export async function serverSignUp(formData: unknown) {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Dados inválidos.',
    };
  }

  const { email, password, name, role } = parsed.data;
  const result = await AuthService.signUpWithEmail(email, password, name, role);
  return result;
}

export async function serverForgotPassword(formData: unknown) {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'E-mail inválido.',
    };
  }

  return {
    success: true,
    message: 'Se a conta existir, um link de redefinição foi enviado.',
  };
}
