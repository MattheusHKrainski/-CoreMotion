'use server';

import { createStoreSchema, storeVerificationSchema } from '@/lib/schemas/store.schema';
import { StoreService } from '@/services/storeService';

export async function serverCreateStore(formData: unknown, userId?: string) {
  const parsed = createStoreSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Dados da loja inválidos.',
    };
  }

  const result = await StoreService.createStore(
    {
      owner_id: userId || 'anon',
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      category: parsed.data.category,
      contact_email: parsed.data.contact_email,
      contact_phone: parsed.data.contact_phone,
      location: parsed.data.location,
      verification_docs: parsed.data.cnpj ? { cnpj: parsed.data.cnpj } : undefined,
      logo_url: parsed.data.logo_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
      banner_url: parsed.data.banner_url || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80',
    },
    userId
  );

  return result;
}

export async function serverRequestVerification(storeId: string, docsData: unknown) {
  const parsed = storeVerificationSchema.safeParse(docsData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Documentação inválida.',
    };
  }

  const result = await StoreService.requestVerification(storeId, {
    cnpj: parsed.data.cnpj,
    company_name: parsed.data.company_name,
    document_url: parsed.data.document_url,
  });

  return result;
}
