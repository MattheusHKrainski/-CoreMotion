import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Informe seu nome completo.'),
  email: z.string().email('E-mail inválido.'),
  message: z.string().min(10, 'Escreva uma mensagem com pelo menos 10 caracteres.'),
});

export const productSchema = z.object({
  title: z.string().min(3, 'Título muito curto.'),
  category: z.string().min(2, 'Selecione uma categoria.'),
  price: z.number().min(1, 'Preço deve ser maior que zero.'),
  stock: z.number().min(0, 'Estoque não pode ser negativo.'),
  description: z.string().min(20, 'Descreva melhor o produto.'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
