'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { ExternalOffer, Product } from '@/lib/types';
import { homeCarouselSlides } from '@/lib/home-carousel';
import { getOfferDiscountPercent } from '@/lib/offer-utils';
import ProductImage from './shared/ProductImage';

export default function HomeProductCarousel({ products, offers, onSelectProduct, onSelectOffer, onExplore }: {
  products: Product[]; offers: ExternalOffer[];
  onSelectProduct?: (product: Product) => void; onSelectOffer?: (offer: ExternalOffer) => void; onExplore: () => void;
}) {
  const slides = useMemo(() => homeCarouselSlides(products, offers), [products, offers]);
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const index = slides.length ? position % slides.length : 0;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    preference(); visibility();
    media.addEventListener('change', preference); document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (slides.length < 2 || paused || hovered || focused || reduced || hidden) return;
    const timer = window.setInterval(() => setPosition(current => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length, paused, hovered, focused, reduced, hidden]);
  const move = (direction: number) => { if (slides.length > 1) setPosition(current => (current % slides.length + direction + slides.length) % slides.length); };
  const slide = slides[index];
  const formatPrice = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const discount = slide?.kind === 'offer' ? getOfferDiscountPercent(slide.value) : null;
  const select = () => { if (slide?.kind === 'product') onSelectProduct?.(slide.value); else if (slide) onSelectOffer?.(slide.value); };
  return <section role="region" aria-roledescription="carrossel" aria-label="Produtos e ofertas em destaque" tabIndex={0}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
    onKeyDown={event => { if (event.altKey || event.ctrlKey || event.metaKey) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}
    className="overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-[#15151d] to-black shadow-2xl focus-visible:outline focus-visible:outline-red-500">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-5 py-4 sm:px-8">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Escolha seu próximo equipamento</p><h1 className="mt-1 text-lg font-black text-white sm:text-xl">Destaques para o seu esporte</h1></div>
      <button type="button" onClick={onExplore} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white">Ver catálogo<ArrowRight className="h-4 w-4" /></button>
    </div>
    {slide ? <div aria-live={paused || focused || hovered || reduced ? 'polite' : 'off'} aria-atomic="true">
      <article key={`${slide.kind}-${slide.value.id}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${slides.length}: ${slide.value.title}`} className="grid md:grid-cols-2">
        <div className="relative min-w-0 bg-white touch-pan-y" onTouchStart={event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }} onTouchEnd={event => {
          const point = event.changedTouches[0]; const start = touch.current; touch.current = null;
          if (start && Math.abs(point.clientX - start.x) > 45 && Math.abs(point.clientX - start.x) > Math.abs(point.clientY - start.y)) move(point.clientX < start.x ? 1 : -1);
        }}>
          <button type="button" onClick={select} aria-label={`Ver detalhes de ${slide.value.title}`} className="group relative block aspect-[4/3] max-h-[370px] w-full focus-visible:outline focus-visible:outline-red-500">
            <ProductImage src={slide.kind === 'product' ? slide.value.images?.[0] || '' : slide.value.image_url} alt={slide.value.title} sizes="(max-width: 767px) 90vw, 45vw" />
          </button>
          {discount !== null && discount > 0 && <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">-{discount}%</span>}
        </div>
        <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:p-10">
          <span className="mb-3 inline-flex w-fit rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[11px] font-semibold text-zinc-300">{slide.kind === 'product' ? 'De Atletas' : `Oferta · ${slide.value.store_name}`}</span>
          <p className="text-xs font-semibold text-red-400">{slide.value.sport} · {slide.value.category}</p>
          <h2 className="mt-2 line-clamp-3 break-words text-xl font-black leading-tight text-white sm:text-2xl lg:text-3xl">{slide.value.title}</h2>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">{slide.value.description}</p>
          <div className="mt-5">
            {slide.value.original_price && slide.value.original_price > slide.value.price && <p className="text-sm text-zinc-500 line-through">{formatPrice(slide.value.original_price)}</p>}
            <p className="text-3xl font-black tracking-tight text-white">{formatPrice(slide.value.price)}</p>
            <p className="mt-1 text-[11px] text-zinc-500">{slide.kind === 'product' ? 'Negocie diretamente com o anunciante.' : 'Venda CoreMotion em preparação. Fornecedor de origem informado.'}</p>
          </div>
          <button type="button" onClick={select} className="mt-5 inline-flex w-fit items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-500">{slide.kind === 'product' ? 'Conhecer produto' : 'Ver oferta'}<ArrowRight className="h-4 w-4" /></button>
        </div>
      </article>
    </div> : <div role="status" className="px-6 py-16 text-center text-sm text-zinc-400">Nenhum destaque disponível no momento. Explore o catálogo para conferir os produtos.</div>}
    {slides.length > 1 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 px-5 py-4 sm:px-8">
      <div className="flex items-center gap-2"><button type="button" onClick={() => move(-1)} aria-label="Produto anterior" className="rounded-full border border-zinc-700 p-2 text-white hover:bg-zinc-800"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-12 text-center text-xs text-zinc-400">{index + 1} / {slides.length}</span><button type="button" onClick={() => move(1)} aria-label="Próximo produto" className="rounded-full border border-zinc-700 p-2 text-white hover:bg-zinc-800"><ChevronRight className="h-4 w-4" /></button></div>
      <div role="group" aria-label="Escolher produto em destaque" className="flex flex-wrap gap-1">{slides.map((item, itemIndex) => <button type="button" key={`${item.kind}-${item.value.id}`} aria-label={`Mostrar produto ${itemIndex + 1}: ${item.value.title}`} aria-current={itemIndex === index ? 'true' : undefined} onClick={() => setPosition(itemIndex)} className="flex h-7 w-6 items-center justify-center"><span className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${itemIndex === index ? 'w-6 bg-red-500' : 'w-1.5 bg-zinc-600'}`} /></button>)}</div>
      <button type="button" disabled={reduced} aria-pressed={paused || reduced} aria-label={paused || reduced ? 'Retomar carrossel' : 'Pausar carrossel'} onClick={() => setPaused(value => !value)} className="rounded-full border border-zinc-700 p-2 text-zinc-400 hover:text-white disabled:opacity-40">{paused || reduced ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
    </div>}
  </section>;
}
