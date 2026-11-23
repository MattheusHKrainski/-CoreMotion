import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/services/supabaseClient';

/** Read with the caller's identity so the catalog uses its normal RLS policies. */
export function catalogClient(authorization: string | null) {
  if (!isSupabaseConfigured) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: authorization ? { Authorization: authorization } : {} },
  });
}

export async function readCatalogPages<T>(page: (start: number, end: number) => PromiseLike<{
  data: T[] | null; error: { message: string } | null;
}>): Promise<T[]> {
  const rows: T[] = [];
  const size = 250;
  for (;;) {
    const { data, error } = await page(rows.length, rows.length + size - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < size) return rows;
  }
}
