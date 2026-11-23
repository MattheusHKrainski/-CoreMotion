'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Tag } from 'lucide-react';
import type { ExternalOffer } from '@/lib/types';
import ProductImage from './shared/ProductImage';

type Campaign = {
  id: string; sport: string; headline: string; kicker: string; subtitle: string;
  theme: string; accent: string; frame: string; backdrop: string;
  primaryIds: string[];
};

const CAMPAIGNS: Campaign[] = [
  { id: 'running', sport: 'Corrida', headline: 'CORRA O\nSEU JOGO.', kicker: '01 / CORRIDA', subtitle: 'Tênis e acessórios para conquistar cada quilômetro.', theme: 'from-[#2b124b] via-[#141024] to-[#07070a]', accent: 'text-purple-300', frame: 'bg-purple-500', backdrop: 'text-purple-400/10', primaryIds: ['offer-bf26-adidas-ultraboost5-id8812'] },
  { id: 'basketball', sport: 'Basquete', headline: 'DOMINE A\nQUADRA.', kicker: '02 / BASQUETE', subtitle: 'Performance, atitude e cultura de quadra.', theme: 'from-[#591a25] via-[#210d15] to-[#08070a]', accent: 'text-red-300', frame: 'bg-red-600', backdrop: 'text-red-500/10', primaryIds: ['offer-bf26-kipsta-fast500-8977594', 'offer-bf26-spalding-streetball-8633779', 'offer-bf26-nba-lakers-9002131'] },
  { id: 'volleyball', sport: 'Vôlei', headline: 'JOGUE\nMAIS ALTO.', kicker: '03 / VÔLEI', subtitle: 'Do primeiro saque ao ponto decisivo.', theme: 'from-[#2e1546] via-[#140e24] to-[#08070a]', accent: 'text-purple-300', frame: 'bg-purple-600', backdrop: 'text-purple-500/10', primaryIds: ['offer-bf26-allsix-v900-8408660', 'offer-bf26-kipsta-bv100-8752032'] },
  { id: 'football', sport: 'Futebol', headline: 'CADA JOGO\nCONTA.', kicker: '04 / FUTEBOL', subtitle: 'Seu próximo lance começa com o equipamento certo.', theme: 'from-[#5a1724] via-[#26101a] to-[#08070a]', accent: 'text-red-300', frame: 'bg-red-600', backdrop: 'text-red-500/10', primaryIds: ['offer-bf26-adidas-copapure3-jh8728'] },
  { id: 'tennis', sport: 'Tênis', headline: 'CONTROLE O\nPRÓXIMO SET.', kicker: '05 / TÊNIS', subtitle: 'Equipamentos para treinar, competir e evoluir.', theme: 'from-[#251748] via-[#130e21] to-[#08070a]', accent: 'text-purple-300', frame: 'bg-purple-600', backdrop: 'text-purple-500/10', primaryIds: ['offer-bf26-kuikma-9rpro-8934939'] },
];

const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const discountPercent = (offer: ExternalOffer) => offer.original_price && offer.original_price > offer.price
  ? Math.round((1 - offer.price / offer.original_price) * 100) : null;

interface Props { offers: ExternalOffer[]; onSelectOffer?: (offer: ExternalOffer) => void; }

export default function HomeVerifiedCampaigns({ offers, onSelectOffer }: Props) {
  const campaigns = useMemo(() => CAMPAIGNS.map(config => {
    const matching = offers.filter(offer => offer.is_active !== false && offer.sport === config.sport);
    const related = [...matching].sort((a, b) => {
      const ai = config.primaryIds.indexOf(a.id), bi = config.primaryIds.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    return { ...config, products: related };
  }).filter(campaign => campaign.products.length > 0), [offers]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (campaigns.length <= 1 || paused || interacting || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setIndex(i => (i + 1) % campaigns.length); }, 7500);
    return () => window.clearInterval(timer);
  }, [campaigns.length, paused, interacting, reducedMotion]);
  if (!campaigns.length) return null;
  const active = campaigns[index % campaigns.length];
  const primary = active.products[0];
  const more = active.products.slice(1, 4);
  const pct = discountPercent(primary);
  const change = (step: number) => setIndex(i => (i + step + campaigns.length) % campaigns.length);

  return <section aria-labelledby="campaigns-title" className="space-y-4"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false); }}>
    <div className="flex flex-wrap items-end justify-between gap-3 px-1">
      <div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-red-400">CoreMotion / campanhas 2026</p>
        <h2 id="campaigns-title" className="text-3xl font-black uppercase leading-none tracking-[-0.05em] text-white sm:text-5xl">SEU ESPORTE. <span className="text-purple-400">SEU MOMENTO.</span></h2>
        <p className="mt-2 text-xs text-zinc-400">Seleções por modalidade com produtos reais e preços informados por lojas.</p></div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Campanha anterior" onClick={() => change(-1)} className="rounded-full border border-white/20 p-2.5 text-white transition hover:border-purple-400 hover:bg-purple-500/10"><ChevronLeft className="h-4 w-4" /></button>
        <span className="min-w-12 text-center text-xs font-bold tabular-nums text-zinc-400">{index + 1} / {campaigns.length}</span>
        <button type="button" aria-label="Próxima campanha" onClick={() => change(1)} className="rounded-full border border-white/20 p-2.5 text-white transition hover:border-purple-400 hover:bg-purple-500/10"><ChevronRight className="h-4 w-4" /></button>
        <button type="button" disabled={reducedMotion} onClick={() => setPaused(p => !p)} aria-label={paused ? 'Retomar troca automática' : 'Pausar troca automática'} aria-pressed={paused} className="rounded-full border border-white/20 p-2.5 text-white hover:bg-white/10 disabled:opacity-40">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
      </div>
    </div>
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#08080b] shadow-2xl">
      <div key={active.id} className={['relative isolate grid min-h-[440px] overflow-hidden bg-gradient-to-br lg:grid-cols-[1fr_0.95fr]', active.theme].join(' ')}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden"><svg viewBox="0 0 920 520" preserveAspectRatio="xMidYMid slice" className="h-full w-full opacity-50"><path d="M-90 460Q180 80 520 240T1010 20M-90 490Q180 110 520 270T1010 50M-90 520Q180 140 520 300T1010 80" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="13 17" opacity=".35"/><path d="M40 85L130 45 156 135 238 112M655 410l92-80 86 57 52-130" stroke="#fa3a51" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round"/><circle cx="760" cy="110" r="160" stroke="#fff" strokeWidth="2" fill="none" opacity=".16"/><circle cx="760" cy="110" r="125" stroke="#fff" strokeWidth="1" fill="none" opacity=".25"/><path d="M450 0L640 520" stroke="#fff" strokeWidth="30" opacity=".04"/></svg><div className="absolute -bottom-10 left-0 -rotate-12 text-[clamp(8rem,21vw,22rem)] font-black italic tracking-[-.15em] text-white/[.055]">MOVE</div><div className="absolute right-4 top-5 -rotate-6 border-2 border-white/20 px-4 py-1 text-xs font-black uppercase tracking-[.4em] text-white/40">CoreMotion / 26</div></div>
        <div className="relative z-10 flex flex-col justify-between gap-6 px-6 py-8 sm:px-10 sm:py-12">
          <div><span className={['text-[10px] font-black uppercase tracking-[0.23em]',active.accent].join(' ')}>{active.kicker} / BLACK FRIDAY</span>
            <h3 className="mt-6 whitespace-pre-line text-[clamp(3.2rem,7.2vw,7rem)] font-black uppercase leading-[0.87] tracking-[-0.07em] text-white">{active.headline}</h3>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-300">{active.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => onSelectOffer?.(primary)} className={['inline-flex items-center gap-3 rounded-full px-5 py-3 text-xs font-black text-white transition hover:brightness-110',active.frame].join(' ')}>Conhecer destaque <ArrowRight className="h-4 w-4" /></button>
            <span className="text-[11px] text-zinc-400">{active.products.length} produto(s) nesta modalidade</span>
          </div>
        </div>
        <div className="relative grid min-h-[360px] grid-rows-[minmax(210px,1fr)_auto] bg-[#17171b] text-white lg:min-h-[440px]"><div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_50%_55%,rgba(225,29,72,.15),transparent_66%)]" />
          <button type="button" onClick={() => onSelectOffer?.(primary)} aria-label={'Detalhes de ' + primary.title} className="group relative min-h-[240px] w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500">
            <ProductImage src={primary.image_url} alt={primary.title} sizes="(max-width:1024px) 90vw, 46vw" />
            {pct !== null && <span className="absolute left-4 top-4 rounded-lg bg-red-600 px-3 py-2 text-sm font-black text-white">-{pct}%</span>}
            <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-zinc-950/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">{primary.store_name}</span>
          </button>
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 bg-[#17171b] px-5 py-4 text-white sm:px-6">
            <div><h4 className="max-w-md text-sm font-black leading-tight">{primary.title}</h4><p className="mt-2 flex flex-wrap items-baseline gap-3">{primary.original_price && primary.original_price > primary.price && <span className="text-xs text-zinc-400 line-through">{currency(primary.original_price)}</span>}<span className="text-2xl font-black">{currency(primary.price)}</span></p></div>
            <button type="button" onClick={() => onSelectOffer?.(primary)} className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-2 text-[10px] font-black text-white hover:bg-white/10">Ver no CoreMotion <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>
      {more.length > 0 && <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{more.map(offer => <button key={offer.id} type="button" onClick={() => onSelectOffer?.(offer)} className="group flex items-center gap-3 bg-[#0e0e12] p-4 text-left transition hover:bg-purple-950/40"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100"><ProductImage src={offer.image_url} alt={offer.title} sizes="80px" /></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-bold text-zinc-200">{offer.title}</p><p className="mt-2 text-sm font-black text-white">{currency(offer.price)}</p>{discountPercent(offer) !== null && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-red-400"><Tag className="h-3 w-3"/>{discountPercent(offer)}% abaixo do preço de referência</span>}</div></button>)}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#0b0b0e] px-5 py-4 sm:px-8">
        <div className="flex flex-wrap gap-1.5">{campaigns.map((campaign,i) => <button type="button" key={campaign.id} onClick={() => setIndex(i)} aria-label={'Ver campanha de ' + campaign.sport} aria-current={index === i ? 'true' : undefined} className={['rounded-full border px-3 py-1.5 text-[10px] font-black transition',index===i?'border-purple-400 bg-purple-600 text-white':'border-white/10 text-zinc-500 hover:text-white'].join(' ')}>{campaign.sport}</button>)}</div>
        <p className="text-[10px] leading-relaxed text-zinc-500">Preços consultados em 22/11/2026; variam por tamanho, estoque e loja. Não são preços de venda garantidos pelo CoreMotion.</p>
      </div>
    </div>
  </section>;
}
