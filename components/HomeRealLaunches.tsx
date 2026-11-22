'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from 'lucide-react';
import type { ExternalOffer } from '@/lib/types';
import ProductImage from './shared/ProductImage';

type Launch = { id: string; brand: string; title: string; subtitle: string; detail: string; date: string; availability: string; sport: string; category: string; official: string; image: string; tint: string };
const LAUNCHES: Launch[] = [
  { id: 'book3', brand: 'NIKE BASKETBALL', title: 'BOOK 3.', subtitle: 'O próximo capítulo de Devin Booker.', detail: 'A Nike apresentou o Book 3 em 16 de novembro de 2026. O modelo está previsto para a primavera de 2027 no hemisfério norte; ainda não é um item à venda no CoreMotion.', date: '16 NOV 2026', availability: 'APRESENTADO / PREVISTO 2027', sport: 'Basquete', category: 'BASKETBALL / PERFORMANCE', official: 'https://about.nike.com/en/newsroom/releases/nike-basketball-and-devin-booker-introduce-the-nike-book-3-built-for-court-feel-and-timeless-style', image: 'https://nmp.about.nike.com/about/prod/fed6508b-d4bc-4997-9ee8-af1102055e71/nike-inc-world-of-athletes-nike-book-3.jpg', tint: 'from-[#51171f] via-[#160c12] to-[#0b090e]' },
  { id: 'sp5der', brand: 'ADIDAS ORIGINALS × SP5DER', title: 'F50 FORMOTION.', subtitle: 'Quando o futebol encontra o streetwear.', detail: 'A coleção Originals × SP5DER foi anunciada em 10 de novembro. O F50 Formotion é uma silhueta de moda inspirada no futebol; não deve ser anunciado como chuteira de jogo.', date: '10 NOV 2026', availability: 'COLEÇÃO ANUNCIADA', sport: 'Futebol', category: 'SPORTSTYLE / CULTURA', official: 'https://news.adidas.com/originals/adidas-originals-and-sp5der-reunite-for-a-head-to-toe-collection-featuring-new-f50-formotion-sp5der-/s/b6e081cf-db95-4018-b8f3-bb849b96bc96', image: 'https://preview.thenewsmarket.com/Previews/ADID/StillAssets/1920x1080/738029_v2.jpg', tint: 'from-[#2e184b] via-[#140d24] to-[#08080b]' },
  { id: 'nimbus29', brand: 'ASICS PERFORMANCE RUNNING', title: 'GEL-NIMBUS 29.', subtitle: 'Uma nova geração de conforto.', detail: 'A ASICS anunciou o GEL-NIMBUS 29 em 29 de outubro. O lançamento global está previsto para 1º de dezembro de 2026; disponibilidade e preço no Brasil não foram confirmados aqui.', date: '29 OUT 2026', availability: 'PREVISTO / 01 DEZ 2026', sport: 'Corrida', category: 'RUNNING / AMORTECIMENTO', official: 'https://news-emea.asics.com/latest-news/comfort-that-moves-body-and-mind--asics-launches-the-new-gel-nimbus--29-shoe/s/35db6121-474e-4287-8640-705096dcff37', image: 'https://preview.thenewsmarket.com/Previews/ASIC/StillAssets/1920x1080/736421_v3.jpg', tint: 'from-[#362344] via-[#171123] to-[#090a0e]' },
];

export default function HomeRealLaunches({ offers, onSelectOffer }: { offers: ExternalOffer[]; onSelectOffer?: (offer: ExternalOffer) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (paused || hover || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setIndex(i => (i+1) % LAUNCHES.length); }, 9500);
    return () => window.clearInterval(timer);
  }, [paused, hover, reducedMotion]);
  const current = LAUNCHES[index];
  const related = offers.filter(offer => offer.is_active !== false && offer.sport === current.sport).slice(0, 3);
  const move = (delta:number) => setIndex(i => (i+delta+LAUNCHES.length) % LAUNCHES.length);
  return <section aria-labelledby="launches-title" className="overflow-hidden rounded-[28px] border border-white/10 bg-[#09090d]"
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    onFocusCapture={()=>setHover(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node | null))setHover(false);}}>
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-5 py-6 sm:px-9">
      <div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-red-400">CoreMotion / Notícias de marcas / Novembro 2026</p>
        <h2 id="launches-title" className="text-3xl font-black uppercase leading-none tracking-[-0.06em] text-white sm:text-5xl">LANÇAMENTOS <span className="text-purple-400">REAIS.</span></h2>
        <p className="mt-2 text-xs text-zinc-400">Anúncios oficiais, não ofertas inventadas nem disponibilidade garantida no Brasil.</p></div>
      <div className="flex items-center gap-2"><button type="button" onClick={()=>move(-1)} aria-label="Lançamento anterior" className="rounded-full border border-white/20 p-2.5 text-white hover:border-purple-400 hover:bg-purple-500/10"><ChevronLeft className="h-4 w-4"/></button>
        <span className="min-w-12 text-center text-xs tabular-nums text-zinc-400">{index+1} / {LAUNCHES.length}</span>
        <button type="button" onClick={()=>move(1)} aria-label="Próximo lançamento" className="rounded-full border border-white/20 p-2.5 text-white hover:border-purple-400 hover:bg-purple-500/10"><ChevronRight className="h-4 w-4"/></button>
        <button type="button" disabled={reducedMotion} onClick={()=>setPaused(v=>!v)} aria-label={paused?'Retomar rotação':'Pausar rotação'} aria-pressed={paused} className="rounded-full border border-white/20 p-2.5 text-white hover:bg-white/10 disabled:opacity-40">{paused?<Play className="h-4 w-4"/>:<Pause className="h-4 w-4"/>}</button>
      </div>
    </header>
    <div key={current.id} className={['relative grid min-h-[440px] overflow-hidden bg-gradient-to-br lg:grid-cols-[1fr_1.05fr]',current.tint].join(' ')}>
      <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-10">
        <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-300">{current.brand} · {current.date}</p>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{current.category}</p>
          <h3 className="mt-3 text-[clamp(3rem,6vw,6.5rem)] font-black uppercase leading-[0.87] tracking-[-0.07em] text-white">{current.title}</h3>
          <p className="mt-5 text-lg font-bold text-white">{current.subtitle}</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-300">{current.detail}</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <a href={current.official} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-xs font-black text-black transition hover:bg-purple-200">Ver anúncio oficial <ExternalLink className="h-4 w-4"/></a>
          <span className="rounded-full border border-white/20 px-3 py-2 text-[10px] font-black text-zinc-300">{current.availability}</span>
        </div>
      </div>
      <div className="relative min-h-[290px] overflow-hidden bg-zinc-900 lg:min-h-[440px]">
        {failedImage !== current.id ? <Image src={current.image} alt={'Imagem divulgada pela ' + current.brand + ' para ' + current.title} fill sizes="(max-width:1024px) 100vw, 55vw" unoptimized onError={()=>setFailedImage(current.id)} className="object-cover" /> : <div role="img" aria-label={'Arte de ' + current.title} className="flex h-full min-h-[290px] items-center justify-center bg-gradient-to-br from-purple-900/50 to-black px-5 text-center text-5xl font-black text-white">{current.title}</div>}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-16 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">Imagem: assessoria / newsroom da marca</div>
      </div>
    </div>
    {related.length > 0 && <div className="border-t border-white/10 px-5 py-5 sm:px-8">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-sm font-black uppercase tracking-wide text-white">Explore {current.sport} no CoreMotion</h4><p className="text-[10px] text-zinc-500">Produtos da mesma modalidade; não são o lançamento anunciado acima.</p></div>
      <div className="grid gap-2 sm:grid-cols-3">{related.map(offer=><button type="button" key={offer.id} onClick={()=>onSelectOffer?.(offer)} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-left transition hover:border-purple-500/40"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100"><ProductImage src={offer.image_url} alt={offer.title} sizes="80px"/></div><span className="min-w-0 flex-1"><span className="line-clamp-2 text-xs font-bold text-white">{offer.title}</span><span className="mt-2 block text-sm font-black text-purple-300">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(offer.price)}</span><span className="mt-1 inline-flex items-center gap-1 text-[10px] text-zinc-400">Ver produto <ArrowRight className="h-3 w-3"/></span></span></button>)}</div>
    </div>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/30 px-5 py-4 sm:px-8">
      <div role="group" aria-label="Selecionar lançamento" className="flex gap-2">{LAUNCHES.map((item,i)=><button type="button" key={item.id} onClick={()=>setIndex(i)} aria-current={index===i?'true':undefined} className={['rounded-full border px-3 py-1.5 text-[10px] font-black transition',index===i?'border-purple-400 bg-purple-600 text-white':'border-white/10 text-zinc-400 hover:text-white'].join(' ')}>{item.brand.split(' ')[0]}</button>)}</div>
      <p className="text-[10px] text-zinc-500">Fontes: comunicados oficiais das marcas. Sem preços inventados para lançamentos.</p>
    </div>
  </section>;
}
