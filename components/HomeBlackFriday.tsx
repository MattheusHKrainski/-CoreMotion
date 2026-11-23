'use client';

import { uniqueOfferModels } from '@/lib/offer-models';
import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowRight, BadgePercent, MoveUpRight } from 'lucide-react';
import type { ExternalOffer } from '@/lib/types';
import { getOfferDiscountPercent } from '@/lib/offer-utils';
import ProductImage from './shared/ProductImage';

export function discountedOffers(offers: ExternalOffer[]): ExternalOffer[] {
  return uniqueOfferModels(offers).filter(offer => offer.is_active && Number.isFinite(offer.price) && offer.price > 0 && Number.isFinite(offer.original_price) && (getOfferDiscountPercent(offer) ?? 0) > 0)
    .sort((a, b) => (getOfferDiscountPercent(b) ?? 0) - (getOfferDiscountPercent(a) ?? 0));
}

export default function HomeBlackFriday({ offers, onSelectOffer, onExplore }: { offers: ExternalOffer[]; onSelectOffer?: (offer: ExternalOffer) => void; onExplore: () => void }) {
  const discounts = useMemo(() => discountedOffers(offers), [offers]);
  const featured = discounts[0];
  const maxDiscount = featured ? getOfferDiscountPercent(featured) : null;
  const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const showDeals = () => document.getElementById('descontos')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  return <div className="space-y-6 sm:space-y-8">
    <section id="black-friday" aria-labelledby="black-friday-title" className="relative isolate overflow-hidden rounded-2xl bg-[#090a0c] text-white sm:rounded-3xl">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-44 h-[620px] w-[620px] rounded-full border border-white/10" />
        <div className="absolute -right-20 -top-28 h-[500px] w-[500px] rounded-full border-[55px] border-[#8b5cf6]/[0.08]" />
        <div className="absolute bottom-[-15%] left-[35%] h-[420px] w-[420px] rotate-[-18deg] bg-red-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,rgba(139,92,246,0.08)_38.2%,transparent_39%)]" />
      </div>
      <div className="relative grid min-h-[430px] items-center gap-7 px-5 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-12">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5cf6]"><span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />CoreMotion · Black Friday</div>
          <h1 id="black-friday-title" className="text-[clamp(3.7rem,9.5vw,8.6rem)] font-black uppercase leading-[0.78] tracking-[-0.085em]">BLACK<br /><span className="text-[#8b5cf6]">FRIDAY</span><span className="text-red-500">.</span></h1>
          <p className="mt-6 max-w-md text-sm font-medium leading-relaxed text-zinc-300 sm:text-base">Seu esporte, seu próximo equipamento, novas possibilidades. Entre no movimento e descubra o que vale a pena.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" onClick={featured ? showDeals : onExplore} className="inline-flex items-center gap-3 rounded-full bg-[#8b5cf6] px-5 py-3.5 text-xs font-black text-black transition hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-red-500">{featured ? 'Ver descontos' : 'Explorar CoreShop'}<ArrowRight className="h-4 w-4" /></button>
            <button type="button" onClick={onExplore} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3.5 text-xs font-bold text-white transition hover:border-white hover:bg-white/10">Explorar produtos</button>
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Encontre. Movimente-se. Evolua.</p>
        </div>
        {featured ? <button type="button" onClick={() => onSelectOffer?.(featured)} aria-label={`Ver destaque: ${featured.title}`} className="group relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-[#f3f3f1] p-4 text-left text-zinc-950 shadow-2xl shadow-black/50 transition hover:-translate-y-1 sm:rounded-3xl sm:p-5">
          <div className="absolute left-0 top-0 h-1.5 w-full bg-[#8b5cf6]" />
          <div className="flex items-start justify-between gap-3"><span className="text-[10px] font-black uppercase tracking-[0.18em]">Seleção em destaque</span><span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white">-{maxDiscount}%</span></div>
          <div className="relative my-2 h-44 sm:h-56"><ProductImage src={featured.image_url} alt={featured.title} sizes="(max-width: 1024px) 85vw, 400px" /></div>
          <div className="flex items-end justify-between gap-3 border-t border-zinc-300 pt-3"><div className="min-w-0"><p className="line-clamp-2 text-sm font-bold">{featured.title}</p><p className="mt-2 text-xs text-zinc-500"><span className="line-through">{money(featured.original_price!)}</span><strong className="ml-2 text-lg font-black text-zinc-950">{money(featured.price)}</strong></p></div><span className="shrink-0 rounded-full bg-zinc-950 p-3 text-[#8b5cf6]"><MoveUpRight className="h-5 w-5" /></span></div>
        </button> : <div className="relative hidden min-h-72 items-center justify-center lg:flex"><div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#8b5cf6]/10 blur-3xl" /><ArrowDownRight strokeWidth={1} className="relative h-64 w-64 text-[#8b5cf6]" /><p className="absolute bottom-3 right-3 max-w-48 text-right text-2xl font-black italic uppercase tracking-tight text-white">Movimento é o que nos une.</p></div>}
      </div>
      <div className="relative flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-white/10 bg-[#8b5cf6] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-black sm:text-xs"><span>Mais esporte por menos</span><span className="hidden sm:inline">/</span><span>Descubra seu próximo equipamento</span><span className="hidden sm:inline">/</span><span>CoreMotion</span></div>
    </section>
    <section id="descontos" aria-labelledby="discounts-title" className="scroll-mt-24 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"><div className="flex items-center gap-3"><BadgePercent className="h-6 w-6 text-red-400" /><div><h2 id="discounts-title" className="text-sm font-black uppercase tracking-wide sm:text-base">Descontos em destaque</h2><p className="mt-1 text-[10px] text-zinc-400">Seleção CoreMotion · fotos e preços de referência verificados.</p></div></div>{maxDiscount !== null && <span className="text-sm font-black text-red-400">ATÉ {maxDiscount}% OFF</span>}</header>
      {discounts.length ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{discounts.slice(0,4).map(offer => <button type="button" key={offer.id} onClick={() => onSelectOffer?.(offer)} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-left transition hover:border-red-500 focus-visible:outline focus-visible:outline-red-500">
        <div className="relative h-40 bg-[#f5f5f3] sm:h-52"><ProductImage src={offer.image_url} alt={offer.title} sizes="(max-width: 768px) 45vw, 310px" /><span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-1 text-[10px] font-black text-white">{getOfferDiscountPercent(offer)}% OFF</span></div>
        <div className="space-y-2 p-3 sm:p-4"><p className="line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-zinc-200">{offer.title}{offer.voltage_variants?.length ? ' · '+offer.voltage_variants.map(item=>item.label).join(' / ') : ''}</p><p className="text-[11px] text-zinc-500 line-through">{money(offer.original_price!)}</p><p className="text-lg font-black text-white sm:text-xl">{money(offer.price)}</p><p className="flex items-center gap-1 pt-1 text-[10px] font-bold text-red-400">Conhecer oferta<ArrowRight className="h-3 w-3" /></p></div>
      </button>)}</div> : <p className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">Nenhum desconto informado no momento. Explore os produtos disponíveis no CoreShop.</p>}
      <p className="text-[10px] leading-relaxed text-zinc-500">Descontos calculados sobre preços de referência dos fornecedores. Confira as opções de cada produto.</p>
    </section>
  </div>;
}
