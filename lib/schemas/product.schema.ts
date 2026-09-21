import { z } from 'zod';

export const productSchema = z.object({
  title: z
    .string()
    .min(3, 'O título deve ter no mínimo 3 caracteres')
    .max(120, 'O título não pode exceder 120 caracteres'),
  description: z
    .string()
    .min(10, 'Descreva o equipamento com no mínimo 10 caracteres'),
  price: z
    .number()
    .positive('O preço deve ser maior que zero'),
  original_price: z
    .number()
    .positive('Preço original inválido')
    .optional(),
  category: z
    .string()
    .min(1, 'Selecione uma categoria'),
  sport: z
    .string()
    .min(1, 'Selecione a modalidade esportiva'),
  condition: z
    .enum(['novo', 'como_novo', 'usado_excelente', 'usado_bom']),
  product_type: z
    .enum(['b2c', 'c2c'])
    .default('c2c'),
  images: z
    .array(z.string().url('URL da imagem inválida'))
    .min(1, 'Adicione pelo menos 1 foto do equipamento'),
  stock: z
    .number()
    .int()
    .min(1, 'Estoque mínimo de 1')
    .default(1),
  location: z
    .string()
    .min(2, 'Informe a cidade/estado'),
  shipping_available: z
    .boolean()
    .default(true),
  brand: z
    .string()
    .optional(),
  tags: z
    .array(z.string())
    .default([]),
});

export type ProductInputData = z.infer<typeof productSchema>;
