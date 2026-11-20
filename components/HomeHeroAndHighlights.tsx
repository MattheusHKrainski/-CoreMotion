'use client';

import React, { useMemo, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import type { ExternalOffer, Product } from '@/lib/types';
import HomeBlackFriday from './HomeBlackFriday';
import HomeProductCarousel from './HomeProductCarousel';
import HomeLaunchRadar from './HomeLaunchRadar';
import ProductCard from '@/components/marketplace/ProductCard';
import ExternalOfferCard from '@/components/marketplace/ExternalOfferCard';
import { ArrowUpRight, Bike, ChevronRight, Dumbbell, Layers, ShoppingBag, Tag, Users, Volleyball, Zap } from 'lucide-react';

interface HomeHeroAndHighlightsProps {
  onSelectProduct?: (product: Product) => void;
  onSelectOffer?: (offer: ExternalOffer) => void;
}

type HomeTab = 'all' | 'offers' | 'c2c';
const QUICK_FILTERS = ['all', 'Jiu-Jitsu', 'Basquete', 'Vôlei', 'Tênis', 'Karatê', 'Futebol', 'Corrida', 'Ciclismo', 'Musculação'];

const SPORT_FEATURES = [
  { name: 'VÔLEI', label: 'Explosão · controle · altura', filter: 'Vôlei', number: '01', icon: Volleyball, tone: 'from-red-600/80 via-red-950 to-[#09090b]', accent: 'text-red-300', outline: 'border-red-500/40' },
  { name: 'BASQUETE', label: 'Quadra · velocidade · voo', filter: 'Basquete', number: '02', icon: Zap, tone: 'from-purple-600/70 via-purple-950 to-[#09090b]', accent: 'text-purple-300', outline: 'border-purple-500/40' },
  { name: 'FUTEBOL', label: 'Jogo · técnica · campo', filter: 'Futebol', number: '03', icon: ArrowUpRight, tone: 'from-zinc-700 via-zinc-950 to-[#09090b]', accent: 'text-white', outline: 'border-white/20' },
  { name: 'FITNESS', label: 'Força · foco · evolução', filter: 'Musculação', number: '04', icon: Dumbbell, tone: 'from-red-950 via-zinc-950 to-[#09090b]', accent: 'text-red-300', outline: 'border-red-500/30' },
  { name: 'RUNNING', label: 'Ritmo · distância · resistência', filter: 'Corrida', number: '05', icon: Bike, tone: 'from-purple-950 via-zinc-950 to-[#09090b]', accent: 'text-purple-300', outline: 'border-purple-500/30' },
];

function matchesQuickFilter(category: string, sport: string, filter: string): boolean {
  if (filter === 'all') return true;
  if (category === filter || sport === filter) return true;
  if (filter === 'Vestuário' && category === 'Roupas') return true;
  return false;
}

export default function HomeHeroAndHighlights({ onSelectProduct, onSelectOffer }: HomeHeroAndHighlightsProps) {
  const { products, activeOffers, setActiveView, setSearchQuery, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<HomeTab>('all');

  const filteredOffers = useMemo(() => activeOffers.filter((offer) => matchesQuickFilter(offer.category, offer.sport, activeFilter)), [activeOffers, activeFilter]);
  const filteredC2CProducts = useMemo(() => products.filter((product) => product.product_type === 'c2c' && product.status === 'active' && matchesQuickFilter(product.category, product.sport, activeFilter)), [products, activeFilter]);
  const showOffers = activeTab !== 'c2c';
  const showC2C = activeTab !== 'offers';
  const resultCount = (showOffers ? filteredOffers.length : 0) + (showC2C ? filteredC2CProducts.length : 0);

  const openMarketplace = (filter?: string) => {
    setSearchQuery(filter && filter !== 'all' ? filter : '');
    setActiveView('marketplace');
  };
  const handleSellClick = () => { if (isVisitor) setAuthModalOpen(true); else setActiveView('sell'); };
  const chooseSport = (sport: string) => { setActiveFilter(sport); document.getElementById('home-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <div className="mx-auto max-w-[1440px] space-y-10 pb-16 sm:space-y-14">
      <HomeBlackFriday offers={activeOffers} onSelectOffer={onSelectOffer} onExplore={() => openMarketplace()} />
      <HomeLaunchRadar />
      <HomeProductCarousel products={products} offers={activeOffers} onSelectProduct={onSelectProduct} onSelectOffer={onSelectOffer} onExplore={() => openMarketplace()} />

      <section aria-labelledby="sports-discovery" className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0d] p-5 sm:p-8 lg:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full border border-purple-500/15" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-[340px] w-[340px] rounded-full border-[35px] border-red-500/[0.06]" />
        <div className="relative mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-purple-300"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Explore pelo seu esporte</p>
            <h2 id="sports-discovery" className="max-w-3xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">O esporte<br/><span className="text-purple-400">é seu território.</span></h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-400 sm:text-right">Encontre equipamentos, descubra novas possibilidades e vá direto ao universo que move você.</p>
        </div>
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {SPORT_FEATURES.map((sport, i) => {
            const Icon = sport.icon;
            return <button key={sport.number} type="button" onClick={() => chooseSport(sport.filter)} className={`group relative min-h-[200px] overflow-hidden rounded-2xl border ${sport.outline} bg-gradient-to-br ${sport.tone} p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 ${i===0?'sm:col-span-2 xl:col-span-1 xl:min-h-[250px]':''}`}>
              <div aria-hidden="true" className="absolute -bottom-14 -right-10 h-44 w-44 rounded-full border border-white/10 transition duration-500 group-hover:scale-110 group-hover:border-white/25" />
              <div aria-hidden="true" className="absolute -bottom-8 -right-5 h-32 w-32 rounded-full bg-white/[0.03] blur-2xl" />
              <div className="relative flex h-full min-h-[155px] flex-col justify-between">
                <div className="flex items-start justify-between"><span className="text-[10px] font-black tracking-[0.2em] text-white/45">{sport.number} / CM</span><Icon className={`h-6 w-6 ${sport.accent} transition-transform group-hover:-translate-y-1 group-hover:translate-x-1`} strokeWidth={1.5}/></div>
                <div><h3 className="text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">{sport.name}</h3><p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">{sport.label}</p><span className={`mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] ${sport.accent}`}>Explorar <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"/></span></div>
              </div>
            </button>;
          })}
        </div>
        <div className="relative mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['Jiu-Jitsu','Tênis','Karatê','Ciclismo'].map((sport, i) => <button key={sport} type="button" onClick={() => chooseSport(sport)} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"><span>{sport}</span><span className="text-purple-400">0{i+6}</span></button>)}
        </div>
      </section>

      <section id="home-catalog" className="scroll-mt-24 space-y-5">
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-purple-950/30 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-500/[0.08] to-transparent" />
          <div className="relative">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-red-400">CoreMotion Select</p>
            <h2 className="text-3xl font-black uppercase leading-none tracking-[-0.05em] text-white sm:text-4xl">Equipamentos que<br/><span className="text-purple-400">movem você.</span></h2>
            <p className="mt-2 text-xs text-zinc-400">{resultCount} itens disponíveis · ofertas e equipamentos de atletas</p>
          </div>
          <div role="group" aria-label="Filtrar catálogo" className="relative flex w-fit flex-wrap gap-1 rounded-full border border-white/10 bg-black/40 p-1 text-xs">
            {([{id:'all',label:'Tudo'},{id:'c2c',label:'Atletas'},{id:'offers',label:'Ofertas'}] as const).map(tab => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-full px-3 py-2 font-bold transition ${activeTab===tab.id?'bg-purple-600 text-white':'text-zinc-400 hover:text-white'}`}>{tab.label}</button>)}
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_FILTERS.map(filter => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-bold transition ${activeFilter===filter?'border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-950/30':'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white'}`}>{filter==='all'?'Todas as modalidades':filter}</button>)}
        </div>
      </section>

      {(activeTab==='all'||activeTab==='c2c') && <section className="space-y-5">
        <header className="flex items-end justify-between gap-3 border-b border-white/10 pb-3">
          <div><p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">Marketplace entre atletas</p><h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-white sm:text-2xl"><Layers className="h-5 w-5 text-red-400"/>Equipamentos de atletas <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">{filteredC2CProducts.length}</span></h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">Equipamentos com uma nova história. Encontre itens anunciados por outros atletas.</p></div>
          <button type="button" onClick={() => openMarketplace()} className="inline-flex shrink-0 items-center gap-1 text-xs font-black uppercase tracking-wide text-purple-300 hover:text-white">Ver todos <ChevronRight className="h-3.5 w-3.5"/></button>
        </header>
        {filteredC2CProducts.length>0?<div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">{filteredC2CProducts.slice(0,3).map(product=><ProductCard key={product.id} product={product} onSelect={onSelectProduct}/>)}</div>:<p className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">Nenhum equipamento encontrado para este filtro.</p>}
      </section>}

      {(activeTab==='all'||activeTab==='offers') && <section className="space-y-5">
        <header className="flex items-end justify-between gap-3 border-b border-white/10 pb-3">
          <div><p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">Seleção CoreMotion</p><h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-white sm:text-2xl"><Tag className="h-5 w-5 text-purple-400"/>Oportunidades em destaque <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-200">{filteredOffers.length}</span></h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">Produtos selecionados para quem vive o esporte — explore os detalhes e encontre o próximo equipamento.</p></div>
          <button type="button" onClick={() => openMarketplace()} className="inline-flex shrink-0 items-center gap-1 text-xs font-black uppercase tracking-wide text-purple-300 hover:text-white">Ver ofertas <ChevronRight className="h-3.5 w-3.5"/></button>
        </header>
        {filteredOffers.length>0?<div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">{filteredOffers.slice(0,3).map(offer=><ExternalOfferCard key={offer.id} offer={offer} onSelect={item=>onSelectOffer?.(item)}/>)}</div>:<p className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">Nenhuma oferta encontrada para este filtro.</p>}
      </section>}

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <button type="button" onClick={() => openMarketplace()} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6 text-left transition hover:border-purple-500/40"><span className="absolute right-4 top-4 text-4xl font-black text-purple-500/15">01</span><Tag className="h-5 w-5 text-purple-400"/><h3 className="mt-5 text-lg font-black uppercase text-white">Garimpe o próximo equipamento</h3><p className="mt-2 text-xs leading-relaxed text-zinc-500">Descubra oportunidades e encontre equipamentos para sua rotina.</p><span className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-purple-300">Explorar catálogo <ArrowUpRight className="h-3.5 w-3.5"/></span></button>
        <button type="button" onClick={handleSellClick} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6 text-left transition hover:border-red-500/40"><span className="absolute right-4 top-4 text-4xl font-black text-red-500/15">02</span><ShoppingBag className="h-5 w-5 text-red-400"/><h3 className="mt-5 text-lg font-black uppercase text-white">Seu equipamento merece outro jogo</h3><p className="mt-2 text-xs leading-relaxed text-zinc-500">Coloque seu equipamento em movimento e conecte-se com quem pratica.</p><span className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-red-300">Anunciar equipamento <ArrowUpRight className="h-3.5 w-3.5"/></span></button>
        <button type="button" onClick={() => setActiveView('community')} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6 text-left transition hover:border-purple-500/40"><span className="absolute right-4 top-4 text-4xl font-black text-purple-500/15">03</span><Users className="h-5 w-5 text-purple-400"/><h3 className="mt-5 text-lg font-black uppercase text-white">O esporte conecta</h3><p className="mt-2 text-xs leading-relaxed text-zinc-500">Entre na comunidade, compartilhe experiências e encontre outros atletas.</p><span className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-purple-300">Conhecer comunidade <ArrowUpRight className="h-3.5 w-3.5"/></span></button>
      </section>
    </div>
  );
}
