'use client';

import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowRight, BadgePercent, MoveUpRight } from 'lucide-react';
import type { ExternalOffer } from '@/lib/types';
import { getOfferDiscountPercent } from '@/lib/offer-utils';
import ProductImage from './shared/ProductImage';

export function discountedOffers(offers: ExternalOffer[]): ExternalOffer[] {
  return offers.filter(offer => offer.is_active && Number.isFinite(offer.price) && offer.price > 0 && Number.isFinite(offer.original_price) && (getOfferDiscountPercent(offer) ?? 0) > 0)
    .sort((a, b) => (getOfferDiscountPercent(b) ?? 0) - (getOfferDiscountPercent(a) ?? 0));
}

export default function HomeBlackFriday({ offers, onSelectOffer, onExplore }: { offers: ExternalOffer[]; onSelectOffer?: (offer: ExternalOffer) => void; onExplore: () => void }) {
  const discounts = useMemo(() => discountedOffers(offers), [offers]);
  const featured = discounts[0];
  const maxDiscount = featured ? getOfferDiscountPercent(featured) : null;
  const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const showDeals = () => document.getElementById('descontos')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  return <div className="space-y-6 sm:space-y-8">
    <section id="black-friday" aria-labelledby="black-friday-title" className="relative isolate overflow-hidden rounded-2xl bg-[#ef1328] text-white sm:rounded-3xl">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-40 h-[620px] w-[480px] rotate-[28deg] border-[70px] border-black/10" />
      <div className="relative grid min-h-[400px] items-center gap-6 px-6 py-9 sm:px-12 sm:py-12 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"><span className="h-1.5 w-1.5 rounded-full bg-white" />Seleção CoreShop · 2026</div>
          <h1 id="black-friday-title" className="text-[clamp(3.8rem,9.3vw,8rem)] font-black uppercase italic leading-[0.83] tracking-[-0.07em]">BLACK<br /><span className="text-zinc-950">FRIDAY.</span></h1>
          <p className="mt-6 max-w-sm text-sm font-medium leading-relaxed text-white/90">Seu próximo nível começa aqui.<br />Grandes marcas. Mais esporte. Menos no preço.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4"><button type="button" onClick={featured ? showDeals : onExplore} className="inline-flex items-center gap-5 rounded-full bg-white px-6 py-3.5 text-xs font-black text-zinc-950 transition hover:bg-zinc-950 hover:text-white">{featured ? 'Explorar descontos' : 'Explorar CoreShop'}<ArrowRight className="h-4 w-4" /></button><span className="text-xs font-semibold text-white/80">O seu esporte não espera.</span></div>
        </div>
        {featured ? <button type="button" onClick={() => onSelectOffer?.(featured)} aria-label={`Ver oferta em destaque: ${featured.title}`} className="group relative mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-[#f5f5f3] p-5 text-left text-zinc-950 shadow-2xl shadow-black/20 transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-black">
          <div className="flex items-start justify-between gap-4"><span className="text-[10px] font-bold uppercase tracking-[0.18em]">Destaque da seleção</span><span className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white">−{maxDiscount}%</span></div>
          <div className="relative my-1 h-48 sm:h-60"><ProductImage src={featured.image_url} alt={featured.title} sizes="(max-width: 1024px) 85vw, 400px" /></div>
          <div className="flex items-end justify-between gap-3 border-t border-zinc-300 pt-4"><div className="min-w-0"><p className="line-clamp-2 text-sm font-bold">{featured.title}</p><p className="mt-2 text-xs text-zinc-500"><span className="line-through">{money(featured.original_price!)}</span><strong className="ml-2 text-lg font-black text-zinc-950">{money(featured.price)}</strong></p></div><span className="shrink-0 rounded-full bg-red-600 p-3 text-white"><MoveUpRight className="h-5 w-5" /></span></div>
        </button> : <div className="hidden text-right lg:block"><ArrowDownRight strokeWidth={1} className="ml-auto h-64 w-64 text-black/80" /><p className="text-2xl font-black italic uppercase">Movimento é o que nos une.</p></div>}
      </div>
      <div className="relative flex flex-wrap justify-center gap-x-7 gap-y-2 border-t border-white/20 bg-zinc-950 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs"><span>Mais esporte por menos</span><span className="text-red-400">✦</span><span>Encontre seu próximo equipamento</span><span className="hidden text-red-400 sm:inline">✦</span><span className="hidden sm:inline">CoreShop</span></div>
    </section>
    <section id="descontos" aria-labelledby="discounts-title" className="scroll-mt-24 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"><div className="flex items-center gap-3"><BadgePercent className="h-6 w-6 text-red-400" /><div><h2 id="discounts-title" className="text-sm font-black uppercase tracking-wide sm:text-base">Descontos em destaque</h2><p className="mt-1 text-[10px] text-zinc-400">Seleção CoreMotion · fornecedores de origem identificados · vendas em preparação.</p></div></div>{maxDiscount !== null && <span className="text-sm font-black text-red-400">ATÉ {maxDiscount}% OFF</span>}</header>
      {discounts.length ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{discounts.slice(0,4).map(offer => <button type="button" key={offer.id} onClick={() => onSelectOffer?.(offer)} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-left transition hover:border-red-500 focus-visible:outline focus-visible:outline-red-500">
        <div className="relative h-40 bg-[#f5f5f3] sm:h-52"><ProductImage src={offer.image_url} alt={offer.title} sizes="(max-width: 768px) 45vw, 310px" /><span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-1 text-[10px] font-black text-white">{getOfferDiscountPercent(offer)}% OFF</span></div>
        <div className="space-y-2 p-3 sm:p-4"><p className="line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-zinc-200">{offer.title}</p><p className="text-[11px] text-zinc-500 line-through">{money(offer.original_price!)}</p><p className="text-lg font-black text-white sm:text-xl">{money(offer.price)}</p><p className="flex items-center gap-1 pt-1 text-[10px] font-bold text-red-400">Conhecer oferta<ArrowRight className="h-3 w-3" /></p></div>
      </button>)}</div> : <p className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">Nenhum desconto informado no momento. Explore os produtos disponíveis no CoreShop.</p>}
      <p className="text-[10px] leading-relaxed text-zinc-500">Percentuais calculados sobre os preços de referência do catálogo. Vendas CoreMotion em preparação: pagamento desativado, disponibilidade e logística ainda não confirmadas. Black Friday é a seleção temática da vitrine.</p>
    </section>
  </div>;
}
