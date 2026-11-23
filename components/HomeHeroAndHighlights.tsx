'use client';

import React, { useMemo, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import type { ExternalOffer, Product } from '@/lib/types';
import HomeBlackFriday from './HomeBlackFriday';
import HomeVerifiedCampaigns from './HomeVerifiedCampaigns';
import HomeRealLaunches from './HomeRealLaunches';
import HomeProductCarousel from './HomeProductCarousel';
import ProductCard from '@/components/marketplace/ProductCard';
import ExternalOfferCard from '@/components/marketplace/ExternalOfferCard';
import {
  Bike,
  ChevronRight,
  Layers,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react';

interface HomeHeroAndHighlightsProps {
  onSelectProduct?: (product: Product) => void;
  onSelectOffer?: (offer: ExternalOffer) => void;
}


const QUICK_FILTERS = ['all', 'Jiu-Jitsu', 'Basquete', 'Vôlei', 'Tênis', 'Karatê', 'Futebol', 'Corrida', 'Ciclismo', 'Musculação'];

function matchesQuickFilter(category: string, sport: string, filter: string): boolean {
  if (filter === 'all') return true;
  if (category === filter || sport === filter) return true;
  if (filter === 'Vestuário' && category === 'Roupas') return true;
  return false;
}

export default function HomeHeroAndHighlights({ onSelectProduct, onSelectOffer }: HomeHeroAndHighlightsProps) {
  const { products, activeOffers, setActiveView, setSearchQuery, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredOffers = useMemo(() => activeOffers.filter((offer) =>
    matchesQuickFilter(offer.category, offer.sport, activeFilter)
  ), [activeOffers, activeFilter]);

  const filteredC2CProducts = useMemo(() => products.filter((product) =>
    product.product_type === 'c2c' &&
    product.status === 'active' &&
    matchesQuickFilter(product.category, product.sport, activeFilter)
  ), [products, activeFilter]);

  const showOffers = true;
  const showC2C = true;
  const resultCount = (showOffers ? filteredOffers.length : 0) + (showC2C ? filteredC2CProducts.length : 0);

  const openMarketplace = () => {
    setSearchQuery('');
    setActiveView('marketplace');
  };

  const handleSellClick = () => {
    if (isVisitor) setAuthModalOpen(true);
    else setActiveView('sell');
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 pb-16 sm:space-y-12">
      <HomeBlackFriday offers={activeOffers} onSelectOffer={onSelectOffer} onExplore={openMarketplace} />
      <HomeVerifiedCampaigns offers={activeOffers} onSelectOffer={onSelectOffer} />
      <HomeRealLaunches offers={activeOffers} onSelectOffer={onSelectOffer} />
      <HomeProductCarousel products={products} offers={activeOffers} onSelectProduct={onSelectProduct} onSelectOffer={onSelectOffer} onExplore={openMarketplace} />

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-white sm:text-xl"><ShoppingBag className="h-5 w-5 text-red-400" />Explore o catálogo</h2>
            <p className="mt-1 text-xs text-zinc-500">{resultCount} itens disponíveis em anúncios de atletas e ofertas.</p>
          </div>

        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_FILTERS.map((filter) => (
            <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${activeFilter === filter ? 'border-red-500 bg-red-600 text-white shadow-md shadow-red-950/40' : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-white'}`}>
              {filter === 'all' ? 'Todas as categorias' : filter}
            </button>
          ))}
        </div>
      </section>

      {showC2C && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-black text-white sm:text-lg"><Layers className="h-4 w-4 text-red-400" />Equipamentos de Atletas <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">{filteredC2CProducts.length}</span></h2>
              <p className="mt-1 text-[11px] text-zinc-500">Vendidos diretamente por atletas — novos sem uso ou já usados, com descrição e conservação informadas pelo anunciante.</p>
            </div>
            <button type="button" onClick={() => openMarketplace()} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300">Ver todos <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          {filteredC2CProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
              {filteredC2CProducts.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}
            </div>
          ) : <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">Nenhum equipamento encontrado para este filtro.</p>}
        </section>
      )}

      {showOffers && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-black text-white sm:text-lg"><Tag className="h-4 w-4 text-red-400" />Ofertas <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-200">{filteredOffers.length}</span></h2>
              <p className="mt-1 text-[11px] text-zinc-500">Produtos selecionados da vitrine CoreMotion, com origem informada e fluxo de compra demonstrativo sem cobrança real.</p>
            </div>
            <button type="button" onClick={() => openMarketplace()} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300">Ver ofertas <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          {filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
              {filteredOffers.slice(0, 3).map((offer) => <ExternalOfferCard key={offer.id} offer={offer} onSelect={(item) => onSelectOffer?.(item)} />)}
            </div>
          ) : <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">Nenhuma oferta encontrada para este filtro.</p>}
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <button type="button" onClick={() => openMarketplace()} className="group flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-red-500/35 hover:bg-zinc-900">
          <Tag className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <span><strong className="block text-sm text-white">Economize nas Melhores Marcas</strong><span className="mt-1 block text-xs leading-relaxed text-zinc-500">Descontos em kimonos, bolas oficiais, raquetes, tênis de quadra, chuteiras e muito mais.</span></span>
        </button>
        <button type="button" onClick={handleSellClick} className="group flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-red-500/35 hover:bg-zinc-900">
          <Bike className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <span><strong className="block text-sm text-white">Venda seu Equipamento Parado</strong><span className="mt-1 block text-xs leading-relaxed text-zinc-500">Anuncie em poucos cliques e negocie diretamente com atletas de todo o país.</span></span>
        </button>
        <button type="button" onClick={() => setActiveView('community')} className="group flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-red-500/35 hover:bg-zinc-900">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <span><strong className="block text-sm text-white">Comunidade de Atletas</strong><span className="mt-1 block text-xs leading-relaxed text-zinc-500">Veja opiniões sinceras sobre equipamentos, relatos de prova e dicas de treino.</span></span>
        </button>
      </section>
    </div>
  );
}
