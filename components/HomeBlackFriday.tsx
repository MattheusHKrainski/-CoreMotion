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
  const supporting = discounts.slice(1, 3);
  const maxDiscount = featured ? getOfferDiscountPercent(featured) : null;
  const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const showDeals = () => document.getElementById('descontos')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  return <div className="space-y-6 sm:space-y-8">
    <section id="black-friday" aria-labelledby="black-friday-title" className="relative isolate overflow-hidden rounded-2xl bg-[#090a0c] text-white sm:rounded-3xl">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-44 h-[620px] w-[620px] rounded-full border border-white/10" />
        <div className="absolute -right-20 -top-28 h-[500px] w-[500px] rounded-full border-[55px] border-red-600/[0.10]" />
        <div className="absolute bottom-[-15%] left-[35%] h-[420px] w-[420px] rotate-[-18deg] bg-red-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,rgba(220,38,38,0.1)_38.2%,transparent_39%)]" /><svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-55"><path d="M-100 500Q350 70 820 260T1350 60M-100 520Q350 105 820 294T1350 94M-100 540Q350 140 820 328T1350 128" fill="none" stroke="#fca5a5" strokeWidth="2.5" strokeDasharray="17 14" opacity=".42"/><path d="M680 80L725 20 755 100 832 38M1020 450l60-90 45 25 70-115" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/><circle cx="970" cy="180" r="170" fill="none" stroke="#fff" strokeWidth="3" opacity=".14"/><circle cx="970" cy="180" r="132" fill="none" stroke="#fff" strokeWidth="2" opacity=".12"/></svg><span className="absolute bottom-3 left-[38%] rotate-[-15deg] select-none text-[clamp(7rem,18vw,18rem)] font-black italic uppercase tracking-[-.17em] text-white/[.035]">MOVE</span>
      </div>
      <div className="relative grid min-h-[430px] items-center gap-7 px-5 py-8 sm:px-9 sm:py-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-9 lg:px-12">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-red-300"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />CoreMotion · Black Friday</div>
          <h1 id="black-friday-title" className="text-[clamp(3.7rem,9.5vw,8.6rem)] font-black uppercase leading-[0.78] tracking-[-0.085em]">BLACK<br /><span className="text-[#f85155] italic">FRIDAY</span><span className="text-red-500">.</span></h1>
          <p className="mt-6 max-w-md text-sm font-medium leading-relaxed text-zinc-300 sm:text-base">A energia do jogo. O equipamento certo. Descubra as ofertas do nosso catálogo para entrar em quadra, na pista ou no campo.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" onClick={featured ? showDeals : onExplore} className="inline-flex items-center gap-3 rounded-full bg-red-600 px-5 py-3.5 text-xs font-black text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white">{featured ? 'Ver descontos' : 'Explorar CoreShop'}<ArrowRight className="h-4 w-4" /></button>
            <button type="button" onClick={onExplore} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3.5 text-xs font-bold text-white transition hover:border-white hover:bg-white/10">Explorar produtos</button>
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Encontre. Movimente-se. Evolua.</p>
        </div>
        {featured ? <div className="relative grid min-h-[360px] grid-cols-[1.5fr_.78fr] grid-rows-2 gap-2 sm:min-h-[430px] sm:gap-3">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-7 -rotate-6 rounded-[48px] border-[10px] border-red-600/35 blur-[1px]"/>
          <button type="button" onClick={() => onSelectOffer?.(featured)} aria-label={'Ver destaque: ' + featured.title} className="group relative row-span-2 overflow-hidden rounded-xl border border-white/20 bg-[#f4f1ec] text-left shadow-2xl shadow-black/50 sm:rounded-2xl">
            <span className="absolute left-3 top-3 z-10 -rotate-6 bg-red-600 px-3 py-2 text-xs font-black uppercase text-white sm:text-sm">-{maxDiscount}% OFF</span>
            <ProductImage src={featured.image_url} alt={featured.title} sizes="(max-width: 1024px) 65vw, 34vw" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent px-4 pb-5 pt-20 text-white">
              <span className="line-clamp-2 block text-xs font-bold sm:text-sm">{featured.title}</span>
              <span className="mt-2 block text-xs text-white/65 line-through">{money(featured.original_price!)}</span>
              <span className="mt-1 flex items-center justify-between text-xl font-black sm:text-2xl">{money(featured.price)}<MoveUpRight className="h-5 w-5 text-red-400"/></span>
            </span>
          </button>
          {supporting.map(offer => <button type="button" key={offer.id} onClick={() => onSelectOffer?.(offer)} aria-label={'Ver ' + offer.title} className="group relative overflow-hidden rounded-xl border border-white/15 bg-[#edeae5] shadow-lg sm:rounded-2xl">
            <ProductImage src={offer.image_url} alt={offer.title} sizes="(max-width:1024px) 30vw, 18vw"/>
            <span className="absolute inset-x-0 bottom-0 bg-black/85 px-2 py-2 text-left text-white">
              <span className="line-clamp-1 block text-[10px] font-bold">{offer.title}</span>
              <span className="block text-xs font-black">{money(offer.price)}</span>
            </span>
          </button>)}
          {supporting.length < 2 && <div className="relative overflow-hidden rounded-xl border border-white/20 bg-red-600/20"><span className="absolute inset-0 flex items-center justify-center -rotate-12 text-3xl font-black italic text-white/30">CORE</span></div>}
          {supporting.length === 0 && <div className="relative overflow-hidden rounded-xl border border-white/20 bg-red-600/20"><span className="absolute inset-0 flex items-center justify-center -rotate-12 text-3xl font-black italic text-white/30">MOTION</span></div>}
        </div> : <div className="relative hidden min-h-72 items-center justify-center lg:flex"><div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" /><ArrowDownRight strokeWidth={1} className="relative h-64 w-64 text-red-500" /><p className="absolute bottom-3 right-3 max-w-48 text-right text-2xl font-black italic uppercase tracking-tight text-white">Movimento é o que nos une.</p></div>}
      </div>
      <div className="relative flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-white/10 bg-red-600 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-white sm:text-xs"><span>Mais esporte por menos</span><span className="hidden sm:inline">/</span><span>Descubra seu próximo equipamento</span><span className="hidden sm:inline">/</span><span>CoreMotion</span></div>
    </section>
    <section id="descontos" aria-labelledby="discounts-title" className="scroll-mt-24 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"><div className="flex items-center gap-3"><BadgePercent className="h-6 w-6 text-red-400" /><div><h2 id="discounts-title" className="text-sm font-black uppercase tracking-wide sm:text-base">Descontos em destaque</h2></div></div>{maxDiscount !== null && <span className="text-sm font-black text-red-400">ATÉ {maxDiscount}% OFF</span>}</header>
      {discounts.length ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{discounts.slice(0,4).map(offer => <button type="button" key={offer.id} onClick={() => onSelectOffer?.(offer)} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-left transition hover:border-red-500 focus-visible:outline focus-visible:outline-red-500">
        <div className="relative h-40 bg-[#19191c] sm:h-52"><ProductImage src={offer.image_url} alt={offer.title} sizes="(max-width: 768px) 45vw, 310px" /><span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-1 text-[10px] font-black text-white">{getOfferDiscountPercent(offer)}% OFF</span></div>
        <div className="space-y-2 p-3 sm:p-4"><p className="line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-zinc-200">{offer.title}{offer.voltage_variants?.length ? ' · '+offer.voltage_variants.map(item=>item.label).join(' / ') : ''}</p><p className="text-[11px] text-zinc-500 line-through">{money(offer.original_price!)}</p><p className="text-lg font-black text-white sm:text-xl">{money(offer.price)}</p><p className="flex items-center gap-1 pt-1 text-[10px] font-bold text-red-400">Conhecer oferta<ArrowRight className="h-3 w-3" /></p></div>
      </button>)}</div> : <p className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">Nenhum desconto informado no momento. Explore os produtos disponíveis no CoreShop.</p>}
      <p className="text-[10px] leading-relaxed text-zinc-500">Descontos calculados sobre preços de referência dos fornecedores. Confira as opções de cada produto.</p>
    </section>
  </div>;
}
