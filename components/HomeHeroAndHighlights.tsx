'use client';

import React, { useMemo, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { isStaffRole } from '@/lib/permissions';
import type { ExternalOffer, Product } from '@/lib/types';
import { DEMO_OFFERS, getOfferDiscountPercent } from '@/fixtures/demo-offers';
import ProductCard from '@/components/marketplace/ProductCard';
import ExternalOfferCard from '@/components/marketplace/ExternalOfferCard';
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  PlusCircle,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react';

interface HomeHeroAndHighlightsProps {
  onSelectProduct?: (product: Product) => void;
  onSelectOffer?: (offer: ExternalOffer) => void;
}

type HomeTab = 'all' | 'offers' | 'c2c';

const QUICK_FILTERS = ['all', 'Corrida', 'Ciclismo', 'Triatlo', 'Calçados', 'Tecnologia & Wearables', 'Acessórios'];

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function matchesQuickFilter(category: string, sport: string, filter: string): boolean {
  if (filter === 'all') return true;
  if (category === filter || sport === filter) return true;
  if (filter === 'Vestuário' && category === 'Roupas') return true;
  return false;
}

export default function HomeHeroAndHighlights({ onSelectProduct, onSelectOffer }: HomeHeroAndHighlightsProps) {
  const { user, products, setActiveView, setSearchQuery, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<HomeTab>('all');
  const showTechnicalDetails = isStaffRole(user?.role);
  const featuredOffer = DEMO_OFFERS[0];

  const filteredOffers = useMemo(() => DEMO_OFFERS.filter((offer) =>
    matchesQuickFilter(offer.category, offer.sport, activeFilter)
  ), [activeFilter]);

  const filteredC2CProducts = useMemo(() => products.filter((product) =>
    product.product_type === 'c2c' &&
    product.status === 'active' &&
    matchesQuickFilter(product.category, product.sport, activeFilter)
  ), [products, activeFilter]);

  const showOffers = activeTab !== 'c2c';
  const showC2C = activeTab !== 'offers';
  const resultCount = (showOffers ? filteredOffers.length : 0) + (showC2C ? filteredC2CProducts.length : 0);
  const discount = getOfferDiscountPercent(featuredOffer);

  const openMarketplace = () => {
    setSearchQuery('');
    setActiveView('marketplace');
  };

  const handleSellClick = () => {
    if (isVisitor) setAuthModalOpen(true);
    else setActiveView('sell');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-16 pt-3 sm:space-y-14 sm:px-3">
      <section aria-labelledby="home-title" className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-[#11131a] to-black p-6 shadow-2xl sm:p-10 lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-red-600/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-red-950/20 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              Esporte em movimento
            </span>
            <h1 id="home-title" className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Encontre ofertas esportivas. Anuncie entre atletas.
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              Explore uma vitrine demonstrativa de ofertas B2C de lojas externas e anúncios C2C publicados por atletas. A comunidade e os profissionais completam sua jornada esportiva.
            </p>
            <p role="note" className="max-w-2xl rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-100/80">
              As ofertas B2C desta versão usam lojas, links, preços e descontos fictícios. Nenhuma fonte real foi consultada; integrações serão conectadas depois.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="button" onClick={() => openMarketplace()} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500 sm:text-sm">
                <Tag className="h-4 w-4" />
                Explorar ofertas
                <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={handleSellClick} className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-6 py-3 text-xs font-semibold text-zinc-200 transition hover:border-red-500/40 hover:bg-zinc-800 hover:text-white sm:text-sm">
                <PlusCircle className="h-4 w-4 text-red-400" />
                Anunciar equipamento C2C
              </button>
            </div>

            {showTechnicalDetails && (
              <div className="grid grid-cols-1 gap-2 border-t border-zinc-800/80 pt-5 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Ofertas B2C</span>
                  <span className="mt-1 block text-xs font-bold text-white">Dados de demonstração</span>
                  <span className="text-[10px] text-amber-200/70">Sem fonte ou link real</span>
                </div>
                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Checkout C2C</span>
                  <span className="mt-1 block text-xs font-bold text-white">Fluxo simulado</span>
                  <span className="text-[10px] text-amber-200/70">Sem cobrança ou envio real</span>
                </div>
                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Comunidade</span>
                  <span className="mt-1 block text-xs font-bold text-white">Atletas e profissionais</span>
                  <span className="text-[10px] text-zinc-500">Participe e compartilhe</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-2xl">
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                <img
                  src={featuredOffer.image_url}
                  alt={featuredOffer.title}
                  onError={(event) => {
                    event.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80';
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-amber-500/30 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-100">Destaque demonstrativo</span>
                {discount !== null && <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">-{discount}%*</span>}
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-300">{featuredOffer.store_name}</span>
                  <h2 className="line-clamp-2 text-lg font-black leading-tight text-white">{featuredOffer.title}</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                <div>
                  {discount !== null && featuredOffer.original_price && <span className="block text-xs text-zinc-500 line-through">{formatPrice(featuredOffer.original_price)}</span>}
                  <span className="text-xl font-black text-white">{formatPrice(featuredOffer.price)}</span>
                  <span className="ml-2 text-[10px] text-amber-200/70">*desconto ilustrativo</span>
                </div>
                <button type="button" onClick={() => onSelectOffer?.(featuredOffer)} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-500">
                  Ver oferta
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-white sm:text-xl"><ShoppingBag className="h-5 w-5 text-red-400" />Explore o catálogo</h2>
            <p className="mt-1 text-xs text-zinc-500">{resultCount} resultado(s) · as ofertas B2C são apenas exemplos.</p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-full border border-zinc-800 bg-zinc-900/80 p-1 text-xs">
            {([
              { id: 'all', label: 'Tudo' },
              { id: 'offers', label: 'Ofertas B2C' },
              { id: 'c2c', label: 'Anúncios C2C' },
            ] as const).map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-full px-3 py-1.5 font-semibold transition ${activeTab === tab.id ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
                {tab.label}
              </button>
            ))}
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

      {(activeTab === 'all' || activeTab === 'offers') && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-black text-white sm:text-lg"><Tag className="h-4 w-4 text-red-400" />Ofertas B2C — vitrine simulada <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-100">{filteredOffers.length}</span></h2>
              <p className="mt-1 text-[11px] text-zinc-500">Dados fictícios, sem links para lojas reais nesta etapa.</p>
            </div>
            <button type="button" onClick={() => openMarketplace()} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300">Ver ofertas <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          {filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
              {filteredOffers.slice(0, 3).map((offer) => <ExternalOfferCard key={offer.id} offer={offer} onSelect={onSelectOffer} />)}
            </div>
          ) : <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">Nenhuma oferta de demonstração corresponde a este filtro.</p>}
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'c2c') && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-black text-white sm:text-lg"><Layers className="h-4 w-4 text-red-400" />Anúncios entre atletas (C2C) <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">{filteredC2CProducts.length}</span></h2>
              <p className="mt-1 text-[11px] text-zinc-500">O carrinho, pagamento e envio permanecem demonstrativos para este fluxo.</p>
            </div>
            <button type="button" onClick={() => openMarketplace()} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300">Ver anúncios <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          {filteredC2CProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
              {filteredC2CProducts.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}
            </div>
          ) : <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">Nenhum anúncio C2C corresponde a este filtro.</p>}
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <button type="button" onClick={() => openMarketplace()} className="group flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-red-500/30 hover:bg-zinc-900">
          <Tag className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <span><strong className="block text-sm text-white">Ofertas externas (B2C)</strong><span className="mt-1 block text-xs leading-relaxed text-zinc-500">Vitrine de exemplo; as fontes reais serão conectadas depois.</span></span>
        </button>
        <button type="button" onClick={handleSellClick} className="group flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-red-500/30 hover:bg-zinc-900">
          <Bike className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <span><strong className="block text-sm text-white">Anúncios C2C</strong><span className="mt-1 block text-xs leading-relaxed text-zinc-500">Publique equipamentos entre atletas; checkout e envio são simulados.</span></span>
        </button>
        <button type="button" onClick={() => setActiveView('community')} className="group flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-red-500/30 hover:bg-zinc-900">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <span><strong className="block text-sm text-white">Comunidade esportiva</strong><span className="mt-1 block text-xs leading-relaxed text-zinc-500">Compartilhe experiências e acompanhe outros atletas.</span></span>
        </button>
      </section>

      {showTechnicalDetails && (
        <aside className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-xs leading-relaxed text-zinc-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>Ofertas e registros desta versão podem ser demonstrativos. Os dados de oferta não têm integração de origem nem atualizam disponibilidade; não há pagamento, frete ou envio real no checkout C2C.</p>
          <CheckCircle2 className="hidden h-4 w-4 shrink-0 text-emerald-500 sm:block" />
        </aside>
      )}
    </div>
  );
}
