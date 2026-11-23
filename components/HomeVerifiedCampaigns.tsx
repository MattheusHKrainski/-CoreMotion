'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Tag } from 'lucide-react';
import type { ExternalOffer } from '@/lib/types';
import ProductImage from './shared/ProductImage';

type Campaign = {
  id: string; sport: string; headline: string; subtitle: string; kicker: string;
  theme: string; accent: string; marker: string; outline: string; primaryIds: string[];
};
const CAMPAIGNS: Campaign[] = [
  { id: 'running', sport: 'Corrida', headline: 'A RUA É\nSUA PISTA.', subtitle: 'Cada quilômetro conta uma história. Encontre o equipamento para a próxima.', kicker: 'RUN CLUB / 01', theme: 'from-[#006a65] via-[#013a3c] to-[#071716]', accent: 'bg-[#b4ee61]', marker: 'text-[#d2ff97]', outline: 'stroke-[#b4ee61]', primaryIds: ['offer-bf26-adidas-ultraboost5-id8812'] },
  { id: 'basketball', sport: 'Basquete', headline: 'A QUADRA\nÉ NOSSA.', subtitle: 'O ritmo muda. A intensidade fica. Entre para o próximo jogo.', kicker: 'COURT CULTURE / 02', theme: 'from-[#b02b23] via-[#47130f] to-[#110e0d]', accent: 'bg-[#ff7553]', marker: 'text-[#ffb39b]', outline: 'stroke-[#ff9e75]', primaryIds: ['offer-bf26-kipsta-fast500-8977594', 'offer-bf26-spalding-streetball-8633779', 'offer-bf26-nba-lakers-9002131'] },
  { id: 'volleyball', sport: 'Vôlei', headline: 'O PRÓXIMO\nPONTO É SEU.', subtitle: 'Receba. Levante. Ataque. Equipamentos para quem vive cada rally.', kicker: 'ABOVE THE NET / 03', theme: 'from-[#3c278b] via-[#211545] to-[#0c0b1a]', accent: 'bg-[#f9d94d]', marker: 'text-[#fff099]', outline: 'stroke-[#e7d55b]', primaryIds: ['offer-bf26-allsix-v900-8408660', 'offer-bf26-kipsta-bv100-8752032'] },
  { id: 'football', sport: 'Futebol', headline: 'VESTE O\nSEU JOGO.', subtitle: 'A paixão começa antes do apito. Viva a cultura da arquibancada.', kicker: 'MATCH DAY / 04', theme: 'from-[#163d31] via-[#0d231b] to-[#080f0b]', accent: 'bg-[#cbff4f]', marker: 'text-[#e1ff93]', outline: 'stroke-[#cbff4f]', primaryIds: [] },
  { id: 'tennis', sport: 'Tênis', headline: 'JOGUE\nSEM LIMITES.', subtitle: 'Movimento, precisão e atitude em cada ponto.', kicker: 'BASELINE / 05', theme: 'from-[#8d993d] via-[#3d461c] to-[#161a0d]', accent: 'bg-[#e7fe73]', marker: 'text-[#edffa7]', outline: 'stroke-[#e7fe73]', primaryIds: ['offer-bf26-kuikma-9rpro-8934939'] },
];
const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const discount = (o: ExternalOffer) => o.original_price && o.original_price > o.price
  ? Math.round((1 - o.price / o.original_price) * 100) : null;

function CampaignArtwork({ sport, outline }: { sport: string; outline: string }) {
  return <svg aria-hidden="true" viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" className={'absolute inset-0 h-full w-full opacity-50 ' + outline}>
    {sport === 'Basquete' ? <>
      <circle cx="360" cy="240" r="205" strokeWidth="3" fill="none"/><path d="M150 240H570M360 35V445M210 100Q400 240 210 380M510 100Q320 240 510 380" fill="none" strokeWidth="3"/>
      <path d="M70 450L450 40M135 480L510 60" strokeWidth="10" opacity=".25"/>
    </> : sport === 'Vôlei' ? <>
      <path d="M0 135H640M0 195H640M0 255H640M0 315H640M50 100V420M145 100V420M240 100V420M335 100V420M430 100V420M525 100V420M620 100V420" fill="none" strokeWidth="2" opacity=".65"/>
      <path d="M55 410L540 20M100 450L585 60" strokeWidth="8" opacity=".25"/>
    </> : sport === 'Futebol' ? <>
      <path d="M20 30H620V450H20ZM320 30V450M320 115a125 125 0 1 0 0 250a125 125 0 1 0 0-250M20 160H125V320H20M620 160H515V320H620" fill="none" strokeWidth="3" opacity=".55"/>
      <path d="M0 480L640 0" strokeWidth="22" opacity=".15"/>
    </> : sport === 'Tênis' ? <>
      <path d="M60 50H580V430H60ZM320 50V430M60 240H580M60 140H580M60 340H580" fill="none" strokeWidth="3"/>
      <path d="M30 460Q160 90 590 40M60 480Q195 120 620 55" fill="none" strokeDasharray="12 13" strokeWidth="5"/>
    </> : <>
      <path d="M-20 460Q130 80 330 200T650 20M-20 495Q130 115 330 235T650 55M-20 530Q130 150 330 270T650 90" fill="none" strokeWidth="7"/>
      <path d="M90 330L210 210 250 290 390 130" strokeWidth="12" fill="none" strokeLinecap="round"/>
    </>}
  </svg>;
}

interface Props { offers: ExternalOffer[]; onSelectOffer?: (offer: ExternalOffer) => void }
export default function HomeVerifiedCampaigns({ offers, onSelectOffer }: Props) {
  const campaigns = useMemo(() => CAMPAIGNS.map(config => {
    const matching = offers.filter(o => o.is_active !== false && o.price > 0 && o.sport === config.sport && !!o.image_url);
    const products = [...matching].sort((a,b) => {
      const x = config.primaryIds.indexOf(a.id), y = config.primaryIds.indexOf(b.id);
      const featuredJersey = (o: ExternalOffer) => config.sport === 'Futebol' && /camisa|jersey|manto|uniforme/i.test(o.title) ? -100 : 0;
      return featuredJersey(a) - featuredJersey(b) || (x === -1 ? 999 : x) - (y === -1 ? 999 : y);
    });
    return { ...config, products };
  }).filter(c => c.products.length > 0), [offers]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduceMotion(media.matches);
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (campaigns.length <= 1 || paused || interacting || reduceMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setIndex(i => (i + 1) % campaigns.length); }, 9000);
    return () => window.clearInterval(timer);
  }, [campaigns.length, paused, interacting, reduceMotion]);
  if (!campaigns.length) return null;
  const active = campaigns[index % campaigns.length];
  const primary = active.products[0];
  const next = active.products.slice(1, 4);
  const off = discount(primary);
  const move = (step: number) => setIndex(i => (i + step + campaigns.length) % campaigns.length);
  return <section aria-labelledby="campaigns-title" className="space-y-4" onMouseEnter={() => setInteracting(true)}
    onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)}
    onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false); }}>
    <div className="flex flex-wrap items-end justify-between gap-4 px-1">
      <div><p className="text-[10px] font-black uppercase tracking-[.22em] text-red-400">Editorial CoreMotion / Esporte em movimento</p>
        <h2 id="campaigns-title" className="mt-2 text-2xl font-black uppercase tracking-[-.04em] text-white sm:text-4xl">ESCOLHA SEU <span className="text-red-400">PRÓXIMO MOVIMENTO.</span></h2>
        <p className="mt-2 text-xs text-zinc-400">Campanhas por modalidade com produtos e preços do catálogo.</p></div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Campanha anterior" onClick={() => move(-1)} className="rounded-full border border-white/20 p-2 text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4"/></button>
        
        <button type="button" aria-label="Próxima campanha" onClick={() => move(1)} className="rounded-full border border-white/20 p-2 text-white hover:bg-white/10"><ChevronRight className="h-4 w-4"/></button>
        <button type="button" disabled={reduceMotion} aria-label={paused ? 'Retomar campanhas' : 'Pausar campanhas'} aria-pressed={paused} onClick={() => setPaused(p => !p)} className="rounded-full border border-white/20 p-2 text-white hover:bg-white/10 disabled:opacity-40">{paused ? <Play className="h-4 w-4"/> : <Pause className="h-4 w-4"/>}</button>
      </div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090b0c] shadow-2xl sm:rounded-[28px]">
      <div key={active.id} className={'relative isolate grid min-h-[480px] overflow-hidden bg-gradient-to-br lg:grid-cols-[.94fr_1.06fr] ' + active.theme}>
        <CampaignArtwork sport={active.sport} outline={active.outline}/>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-14 -left-5 -rotate-6 select-none text-[clamp(7rem,18vw,14rem)] font-black italic uppercase tracking-[-.13em] text-white/[.07]">{active.sport}</div>
        <div className="relative z-10 flex flex-col justify-between gap-8 px-6 py-9 sm:px-10 sm:py-12 lg:py-16">
          <div><span className={'inline-flex -rotate-2 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.18em] text-black ' + active.accent}>{active.kicker}</span>
            <h3 className="mt-9 whitespace-pre-line text-[clamp(3.1rem,6.5vw,6.7rem)] font-black italic uppercase leading-[.84] tracking-[-.085em] text-white">{active.headline}</h3>
            <p className="mt-6 max-w-md text-sm font-medium leading-6 text-white/85 sm:text-base">{active.subtitle}</p></div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => onSelectOffer?.(primary)} className={'inline-flex items-center gap-3 rounded-md px-6 py-3.5 text-xs font-black uppercase tracking-wide text-black transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ' + active.accent}>Conhecer produto <ArrowRight className="h-4 w-4"/></button>
          </div>
        </div>
        <div className="relative z-10 grid min-h-[360px] grid-cols-[1.4fr_.8fr] grid-rows-2 gap-1.5 p-2 sm:gap-2 sm:p-3 lg:min-h-[500px]">
          <button type="button" onClick={() => onSelectOffer?.(primary)} aria-label={'Ver ' + primary.title} className="group relative row-span-2 overflow-hidden rounded-md border border-white/10 bg-[#f6f4f0] text-left shadow-xl">
            <ProductImage src={primary.image_url} alt={primary.title} sizes="(max-width:1024px) 66vw, 34vw"/>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-16 text-white">
              <span className="line-clamp-2 block text-xs font-black leading-4 sm:text-sm">{primary.title}</span>
              <span className="mt-1.5 block text-xl font-black">{currency(primary.price)}</span>
              {off !== null && <span className="mt-1 block text-[10px] font-bold text-[#ffdb7b]"><Tag className="mr-1 inline h-3 w-3"/> {off}% abaixo do preço de referência</span>}
            </span>
          </button>
          {next.slice(0,2).map(offer => <button type="button" key={offer.id} onClick={() => onSelectOffer?.(offer)}
            aria-label={'Ver ' + offer.title} className="group relative overflow-hidden rounded-md border border-white/10 bg-[#eeeae6]">
            <ProductImage src={offer.image_url} alt={offer.title} sizes="(max-width:1024px) 33vw, 17vw"/>
            <span className="absolute inset-x-0 bottom-0 bg-black/85 p-2 text-left text-white">
              <span className="line-clamp-1 block text-[10px] font-bold">{offer.title}</span>
              <span className="block text-xs font-black">{currency(offer.price)}</span>
            </span>
          </button>)}
          {next.length === 0 && <div className="relative row-span-2 overflow-hidden rounded-md border border-white/10 bg-black/30">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center"><span className="text-5xl font-black italic text-white/20">CM</span><span className="text-[10px] font-black uppercase tracking-[.2em] text-white/70">Seu esporte. Sua história.</span></div>
          </div>}
          {next.length === 1 && <div className="relative overflow-hidden rounded-md border border-white/10 bg-black/20"><span className="absolute inset-0 flex items-center justify-center -rotate-12 text-5xl font-black italic text-white/20">MOVE</span></div>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#111113] px-4 py-4 sm:px-7">
        <div role="group" aria-label="Selecionar modalidade" className="flex flex-wrap gap-1.5">{campaigns.map((c,i) =>
          <button type="button" key={c.id} onClick={() => setIndex(i)} aria-current={index % campaigns.length === i ? 'true' : undefined}
            className={'rounded-full border px-3 py-1.5 text-[10px] font-black uppercase transition ' + (index % campaigns.length === i ? 'border-red-500 bg-red-600 text-white' : 'border-white/20 text-zinc-300 hover:bg-white/10')}>{c.sport}</button>)}</div>
        <p className="text-[10px] leading-4 text-zinc-400">Fotos dos produtos do catálogo. Preços e disponibilidade sujeitos à atualização.</p>
      </div>
    </div>
  </section>;
}
