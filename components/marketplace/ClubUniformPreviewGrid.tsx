'use client';

import { useEffect, useState } from 'react';
import ProductImage from '@/components/shared/ProductImage';
import { getSupabaseClient } from '@/services/supabaseClient';

interface UniformPreview {
  id: string;
  team_id: string;
  title: string;
  description: string;
  season: string | null;
  image_url: string;
  price_brl: number | null;
  availability_status: 'awaiting_verification' | 'sold_out';
  womens_collection: boolean;
}

/**
 * A user's photograph is not an in-stock product. This separate gallery is
 * intentionally non-purchasable until pricing, seller and stock are verified.
 */
export default function ClubUniformPreviewGrid({ teamId }: { teamId: string }) {
  const [state, setState] = useState<{ teamId: string; items: UniformPreview[] }>({ teamId: '', items: [] });
  useEffect(() => {
    let alive = true;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    void supabase
      .from('catalog_team_uniform_previews')
      .select('id,team_id,title,description,season,image_url,price_brl,availability_status,womens_collection')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (alive && !error) setState({ teamId, items: (data || []) as UniformPreview[] });
      });
    return () => { alive = false; };
  }, [teamId]);

  if (state.teamId !== teamId || !state.items.length) return null;

  return <section aria-label="Uniformes identificados do clube" className="space-y-3">
    <div>
      <h2 className="text-sm font-bold text-white">Uniformes identificados do clube</h2>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
        Fotografias dos modelos reais. A venda fica desativada até que preço, tamanhos e estoque sejam confirmados.
      </p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {state.items.map(item => <article key={item.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
        <div className="relative aspect-[4/3] bg-[#11141b]">
          <ProductImage src={item.image_url} alt={item.title} sizes="(max-width: 640px) 100vw, 400px" fit="contain" />
          <span className="absolute left-3 top-3 rounded-md border border-zinc-600 bg-zinc-950/95 px-2.5 py-1 text-[11px] font-bold text-zinc-100">
            {item.availability_status === 'sold_out' ? 'Esgotado' : 'Disponibilidade não confirmada'}
          </span>
        </div>
        <div className="space-y-2 p-4">
          <h3 className="text-sm font-bold text-zinc-100">{item.title}</h3>
          {item.womens_collection && <p className="text-xs font-semibold text-amber-300">Linha feminina — não é uniforme da Superliga Masculina</p>}
          <p className="text-xs leading-relaxed text-zinc-400">{item.description}</p>
          <p className="text-sm font-bold text-zinc-200">{item.price_brl == null ? 'Preço a confirmar' : new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(item.price_brl)}</p>
          <button type="button" disabled className="w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-bold text-zinc-400">
            Compra indisponível
          </button>
        </div>
      </article>)}
    </div>
  </section>;
}
