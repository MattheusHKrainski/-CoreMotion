import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Insira um e-mail válido'),
  password: z
    .string()
    .min(6, 'A senha deve conter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Insira um e-mail válido'),
  password: z
    .string()
    .min(6, 'A senha deve conter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa'),
  role: z.enum(['user', 'seller']).default('user'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Insira um e-mail válido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
