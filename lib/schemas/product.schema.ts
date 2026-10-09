import { z } from 'zod';
import { PRODUCT_CONDITIONS, PRODUCT_STATUSES } from '@/lib/api-utils';

/**
 * Regras de anúncio: fonte única para a API (POST e PATCH em app/api/products).
 * Os limites são os mesmos do formulário e do banco; ver database/README.md.
 */
const title = z
  .string()
  .trim()
  .min(3, 'O título deve ter entre 3 e 120 caracteres.')
  .max(120, 'O título deve ter entre 3 e 120 caracteres.');

const description = z
  .string()
  .trim()
  .min(10, 'A descrição deve ter entre 10 e 5000 caracteres.')
  .max(5000, 'A descrição deve ter entre 10 e 5000 caracteres.');

const price = z
  .number({ error: 'Preço inválido.' })
  .positive('O preço deve ser maior que zero.')
  .max(1_000_000, 'O preço excede o limite permitido.');

const images = z
  .array(z.string().url('URL da imagem inválida.').max(2048))
  .min(1, 'Adicione pelo menos 1 foto do equipamento.')
  .max(8, 'Use no máximo 8 fotos.');

const condition = z.enum(PRODUCT_CONDITIONS, { error: 'Condição do produto inválida.' });
const location = z.string().trim().max(120);
const brand = z.string().trim().max(80);
const tags = z.array(z.string().trim().min(1).max(40)).max(10);

/** Criação: aplica padrões (tipo c2c, estoque 1, frete disponível). */
export const productCreateSchema = z.object({
  title,
  description,
  price,
  original_price: price.nullish(),
  category: z.string().trim().min(1, 'Selecione uma categoria.').max(60),
  sport: z.string().trim().min(1, 'Selecione a modalidade esportiva.').max(60),
  condition,
  product_type: z.enum(['b2c', 'c2c']).default('c2c'),
  images,
  stock: z.number().int().min(1, 'Estoque mínimo de 1.').max(9999).default(1),
  location: location.nullish(),
  shipping_available: z.boolean().default(true),
  brand: brand.nullish(),
  tags: tags.default([]),
  store_id: z.string().max(64).nullish(),
});

/** Atualização parcial: sem padrões, para não sobrescrever campos que não vieram na requisição. */
export const productUpdateSchema = z.object({
  title: title.optional(),
  description: description.optional(),
  price: price.optional(),
  original_price: price.nullish(),
  condition: condition.optional(),
  images: images.optional(),
  stock: z.number().int().min(0, 'Estoque não pode ser negativo.').max(9999).optional(),
  location: location.nullish(),
  shipping_available: z.boolean().optional(),
  brand: brand.nullish(),
  tags: tags.optional(),
  status: z.enum(PRODUCT_STATUSES, { error: 'Status inválido.' }).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
