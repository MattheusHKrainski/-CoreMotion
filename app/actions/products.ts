'use server';

import { productSchema } from '@/lib/schemas/product.schema';
import { ProductService } from '@/services/productService';

export async function serverCreateProduct(inputData: unknown, userId?: string) {
  const parsed = productSchema.safeParse(inputData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Dados do produto inválidos.',
    };
  }

  const result = await ProductService.createProduct(
    {
      ...parsed.data,
      original_price: parsed.data.original_price || undefined,
      seller_id: userId || 'anon',
      seller_name: 'Atleta CoreMotiom',
      status: 'active',
      is_verified_store: parsed.data.product_type === 'b2c',
    },
    userId
  );

  return result;
}

export async function serverDeleteProduct(productId: string) {
  if (!productId) {
    return { success: false, error: 'ID do produto não informado.' };
  }
  const result = await ProductService.deleteProduct(productId);
  return result;
}
