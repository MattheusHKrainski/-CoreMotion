'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ExternalOffer, Product } from '@/lib/types';
import { welcomeCatalogItems, type WelcomeCatalogFilter } from '@/lib/welcome-catalog';
import ProductCard from './marketplace/ProductCard';
import ExternalOfferCard from './marketplace/ExternalOfferCard';
import ProductDetailModal from './marketplace/ProductDetailModal';
import ExternalOfferModal from './marketplace/ExternalOfferModal';

export default function WelcomeCatalog({ products, offers, onExplore }: {
  products: Product[];
  offers: ExternalOffer[];
  onExplore: () => void;
}) {
  const [filter, setFilter] = useState<WelcomeCatalogFilter>('all');
  const [product, setProduct] = useState<Product | null>(null);
  const [offer, setOffer] = useState<ExternalOffer | null>(null);
  const items = welcomeCatalogItems(products, offers, filter);
  return <>
    <section id="produtos" aria-labelledby="welcome-catalog-title" className="scroll-mt-24 pt-5 text-left space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">Explore antes de entrar</p>
          <h2 id="welcome-catalog-title" className="mt-2 text-2xl sm:text-3xl font-black text-white">Encontre seu próximo equipamento</h2>
        </div>
        <button type="button" onClick={onExplore} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800">Ver catálogo completo<ArrowRight className="h-4 w-4" /></button>
      </div>
      <div role="group" aria-label="Filtrar produtos da página de boas-vindas" className="flex flex-wrap gap-2">
        {([['all', 'Tudo'], ['athletes', 'De Atletas'], ['offers', 'Ofertas']] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${filter === id ? 'border-red-600 bg-red-600 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'}`}>{label}</button>)}
      </div>
      {items.length > 0 ? <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => item.kind === 'product'
          ? <ProductCard key={`product-${item.value.id}`} product={item.value} onSelect={setProduct} />
          : <ExternalOfferCard key={`offer-${item.value.id}`} offer={item.value} onSelect={setOffer} />)}
      </div> : <p role="status" className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">Nenhum item disponível nesta seleção no momento. Explore o catálogo completo ou consulte outra categoria.</p>}
    </section>
    <ProductDetailModal key={product?.id || 'no-product'} product={product} onClose={() => setProduct(null)} />
    <ExternalOfferModal offer={offer} onClose={() => setOffer(null)} />
  </>;
}
