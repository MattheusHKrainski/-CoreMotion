import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome da loja deve ter pelo menos 3 caracteres')
    .max(80, 'Nome da loja muito longo'),
  slug: z
    .string()
    .min(2, 'Slug inválido')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z
    .string()
    .min(10, 'Apresente a loja com no mínimo 10 caracteres'),
  category: z
    .string()
    .min(2, 'Selecione o nicho esportivo'),
  contact_email: z
    .string()
    .email('E-mail de contato comercial inválido'),
  contact_phone: z
    .string()
    .min(8, 'Telefone ou WhatsApp comercial inválido')
    .optional(),
  location: z
    .string()
    .min(2, 'Cidade e Estado da sede'),
  cnpj: z
    .string()
    .min(14, 'CNPJ deve conter 14 dígitos')
    .optional(),
  logo_url: z
    .string()
    .url('URL da logomarca inválida')
    .optional(),
  banner_url: z
    .string()
    .url('URL da imagem de capa inválida')
    .optional(),
});

export type CreateStoreFormData = z.infer<typeof createStoreSchema>;

export const storeVerificationSchema = z.object({
  cnpj: z
    .string()
    .min(14, 'CNPJ obrigatório para homologação de loja oficial'),
  company_name: z
    .string()
    .min(3, 'Razão social obrigatória'),
  alvara_number: z
    .string()
    .optional(),
  document_url: z
    .string()
    .url('URL de upload do documento fiscal/alvará')
    .optional(),
});

export type StoreVerificationFormData = z.infer<typeof storeVerificationSchema>;
