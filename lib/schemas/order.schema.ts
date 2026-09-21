import { z } from 'zod';

export const shippingAddressSchema = z.object({
  recipient_name: z
    .string()
    .min(3, 'Nome completo obrigatório'),
  phone: z
    .string()
    .min(8, 'Telefone de contato obrigatório'),
  cep: z
    .string()
    .min(8, 'CEP com 8 dígitos'),
  street: z
    .string()
    .min(3, 'Rua / Avenida'),
  number: z
    .string()
    .min(1, 'Número'),
  complement: z
    .string()
    .optional(),
  neighborhood: z
    .string()
    .min(2, 'Bairro'),
  city: z
    .string()
    .min(2, 'Cidade'),
  state: z
    .string()
    .length(2, 'Sigla do Estado (UF com 2 letras)'),
});

export const checkoutSchema = z.object({
  address: shippingAddressSchema,
  paymentMethod: z.enum(['pix', 'credit_card', 'boleto']),
  shippingMethod: z.enum(['pac', 'sedex', 'express']),
});

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
