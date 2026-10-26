import { z } from 'zod';
import { isProductDestination } from '../offer-catalog';

const httpsUrlSchema = z
  .string()
  .trim()
  .min(8, 'Informe um link válido começando com https://')
  .max(2048, 'Link muito longo.')
  .refine((val) => {
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'O link da oferta precisa ser um endereço seguro (https://...).');

const imagePathOrHttpsSchema = z
  .string()
  .trim()
  .min(2, 'Informe a imagem da oferta.')
  .max(400_000, 'Imagem muito grande. Use um arquivo menor ou link direto.')
  .refine((val) => {
    if (val.startsWith('/') && !val.startsWith('//')) return true;
    if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(val)) return true;
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }, 'Use uma URL de imagem (https://...), envie uma foto do dispositivo ou use caminho local (/offers/...).');

export const offerCreateSchema = z.object({
  title: z.string().trim().min(3, 'O título precisa ter ao menos 3 caracteres.').max(180),
  description: z.string().trim().min(5, 'A descrição precisa ter ao menos 5 caracteres.').max(2000),
  store_name: z.string().trim().min(2, 'Informe o nome da loja (ex: AliExpress, Amazon, Netshoes).').max(80),
  category: z.string().trim().min(2).max(60).default('Equipamentos'),
  sport: z.string().trim().min(2).max(60).default('Corrida'),
  price: z.number().positive('O preço em oferta deve ser maior que zero.').max(1_000_000),
  original_price: z.number().positive().max(1_000_000).nullable().optional(),
  image_url: imagePathOrHttpsSchema,
  source_url: httpsUrlSchema.refine(isProductDestination, 'Informe o link direto do produto, não uma busca, categoria ou página inicial.'),
  coupon_code: z.string().trim().max(40).nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const offerUpdateSchema = offerCreateSchema.partial();

export type OfferCreateInput = z.infer<typeof offerCreateSchema>;
export type OfferUpdateInput = z.infer<typeof offerUpdateSchema>;

export function detectStoreNameFromHost(hostname: string): string {
  const host = hostname.toLowerCase();
  if (host.includes('aliexpress') || host.includes('s.click.aliexpress')) return 'AliExpress';
  if (host.includes('mercadolivre') || host.includes('mercadolibre')) return 'Mercado Livre';
  if (host.includes('amazon') || host.includes('amzn.to')) return 'Amazon Brasil';
  if (host.includes('shopee')) return 'Shopee';
  if (host.includes('netshoes')) return 'Netshoes';
  if (host.includes('centauro')) return 'Centauro';
  if (host.includes('decathlon')) return 'Decathlon';
  if (host.includes('nike')) return 'Nike Oficial';
  if (host.includes('adidas')) return 'Adidas Oficial';
  if (host.includes('olympikus')) return 'Olympikus Oficial';
  if (host.includes('asics')) return 'Asics Oficial';
  if (host.includes('puma')) return 'Puma Oficial';
  return host.replace(/^www\./, '').split('.')[0].replace(/^\w/, (c) => c.toUpperCase());
}
