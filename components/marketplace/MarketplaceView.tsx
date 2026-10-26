'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { isStaffRole } from '@/lib/permissions';
import type { ExternalOffer, Product } from '@/lib/types';
import { getOfferDiscountPercent } from '@/fixtures/demo-offers';
import ProductCard from './ProductCard';
import ExternalOfferCard from './ExternalOfferCard';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  Layers,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
  X,
  PlusCircle,
} from 'lucide-react';

interface MarketplaceViewProps {
  onSelectProduct?: (product: Product) => void;
  onSelectOffer?: (offer: ExternalOffer) => void;
}

type CatalogTab = 'all' | 'offers' | 'c2c';
type SortBy = 'relevance' | 'price_asc' | 'price_desc' | 'discount_desc' | 'newest';

const PAGE_SIZE = 12;
const CATEGORIES = ['Calçados', 'Vestuário', 'Artes Marciais', 'Equipamentos', 'Acessórios', 'Tecnologia & Wearables'];
const SPORTS = ['Jiu-Jitsu', 'Basquete', 'Vôlei', 'Tênis', 'Karatê', 'Futebol', 'Corrida', 'Musculação', 'Natação', 'Ciclismo'];
const CONDITIONS = [
  { id: 'novo', label: 'Novo (lacrado)' },
  { id: 'como_novo', label: 'Como novo' },
  { id: 'seminovo', label: 'Seminovo' },
  { id: 'usado_excelente', label: 'Usado: excelente' },
  { id: 'usado_bom', label: 'Usado: bom estado' },
] as const;

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function matchesCategory(itemCategory: string, selectedCategory: string): boolean {
  if (selectedCategory === 'all') return true;
  if (itemCategory === selectedCategory) return true;
  if (selectedCategory === 'Vestuário' && itemCategory === 'Roupas') return true;
  if (selectedCategory === 'Artes Marciais' && itemCategory === 'Lutas') return true;
  if (selectedCategory === 'Tecnologia & Wearables' && ['Tecnologia', 'Wearables'].includes(itemCategory)) return true;
  return false;
}

function sortProducts(items: Product[], sortBy: SortBy): Product[] {
  return [...items].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'discount_desc') {
      const aDiscount = a.original_price && a.original_price > a.price ? (a.original_price - a.price) / a.original_price : 0;
      const bDiscount = b.original_price && b.original_price > b.price ? (b.original_price - b.price) / b.original_price : 0;
      return bDiscount - aDiscount;
    }
    return ((b.views ?? 0) + (b.likes_count ?? 0) * 2) - ((a.views ?? 0) + (a.likes_count ?? 0) * 2);
  });
}

function sortOffers(items: ExternalOffer[], sortBy: SortBy): ExternalOffer[] {
  return [...items].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'discount_desc') return (getOfferDiscountPercent(b) ?? 0) - (getOfferDiscountPercent(a) ?? 0);
    return 0;
  });
}

export default function MarketplaceView({ onSelectProduct, onSelectOffer }: MarketplaceViewProps) {
  const { user, products, activeOffers, searchQuery, setSearchQuery, setActiveView, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const [selectedTab, setSelectedTab] = useState<CatalogTab>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const normalizedQuery = normalize(searchQuery.trim());
  const filteredOffers = useMemo(() => {
    const filtered = activeOffers.filter((offer) => {
      const searchText = normalize(`${offer.title} ${offer.description} ${offer.store_name} ${offer.category} ${offer.sport} ${offer.coupon_code || ''}`);
      if (normalizedQuery && !searchText.includes(normalizedQuery)) return false;
      if (!matchesCategory(offer.category, selectedCategory)) return false;
      if (selectedSport !== 'all' && offer.sport !== selectedSport) return false;
      return true;
    });
    return sortOffers(filtered, sortBy);
  }, [activeOffers, normalizedQuery, selectedCategory, selectedSport, sortBy]);

  const filteredC2CProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (product.product_type !== 'c2c' || product.status !== 'active') return false;
      const searchText = normalize(`${product.title} ${product.description} ${product.brand || ''} ${product.seller_name} ${product.category} ${product.sport}`);
      if (normalizedQuery && !searchText.includes(normalizedQuery)) return false;
      if (!matchesCategory(product.category, selectedCategory)) return false;
      if (selectedSport !== 'all' && product.sport !== selectedSport) return false;
      if (selectedCondition !== 'all' && product.condition !== selectedCondition) return false;
      return true;
    });
    return sortProducts(filtered, sortBy);
  }, [products, normalizedQuery, selectedCategory, selectedSport, selectedCondition, sortBy]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [normalizedQuery, selectedTab, selectedCategory, selectedSport, selectedCondition, sortBy]);

  const visibleC2CProducts = filteredC2CProducts.slice(0, visibleCount);
  const hasOffers = selectedTab !== 'c2c';
  const hasC2C = selectedTab !== 'offers';
  const displayedCount = (hasOffers ? filteredOffers.length : 0) + (hasC2C ? filteredC2CProducts.length : 0);
  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedSport !== 'all',
    selectedCondition !== 'all' && selectedTab !== 'offers',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedTab('all');
    setSelectedCategory('all');
    setSelectedSport('all');
    setSelectedCondition('all');
    setSearchQuery('');
  };

  const handleSellClick = () => {
    if (isVisitor) setAuthModalOpen(true);
    else setActiveView('sell');
  };

  const categoryCount = (category: string) =>
    activeOffers.filter((offer) => matchesCategory(offer.category, category)).length +
    products.filter((product) => product.product_type === 'c2c' && matchesCategory(product.category, category)).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Catálogo esportivo</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Equipamentos e Ofertas Esportivas</h1>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Encontre descontos nas melhores lojas esportivas ou compre equipamentos novos e seminovos direto de outros atletas por meio de anúncios publicados na plataforma.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSellClick}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500"
        >
          <PlusCircle className="h-4 w-4" />
          Vender meu equipamento
        </button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-2 backdrop-blur-md">
        <div className="flex w-full items-center gap-1.5 overflow-x-auto text-xs scrollbar-none sm:w-auto">
          {([
            { id: 'all', label: `Tudo (${filteredC2CProducts.length + filteredOffers.length})`, icon: ShoppingBag },
            { id: 'c2c', label: `De Atletas (${filteredC2CProducts.length})`, icon: Layers },
            { id: 'offers', label: `Ofertas (${filteredOffers.length})`, icon: Tag },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-semibold transition ${selectedTab === tab.id ? 'bg-red-600 text-white shadow-md shadow-red-950/40' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs text-white md:hidden"
          >
            <Filter className="h-3.5 w-3.5 text-red-400" />
            Filtros{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </button>
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
            <span className="sr-only">Ordenar resultados</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)} className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none">
              <option value="relevance">Relevância</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="discount_desc">Maior desconto</option>
              <option value="newest">Mais recentes</option>
            </select>
          </label>
        </div>
      </div>

      {(activeFiltersCount > 0 || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3 text-xs">
          <span className="font-medium text-zinc-500">Filtros ativos:</span>
          {searchQuery && <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-200">Busca: “{searchQuery}”<button type="button" aria-label="Limpar busca" onClick={() => setSearchQuery('')}><X className="h-3 w-3" /></button></span>}
          {selectedCategory !== 'all' && <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-200">{selectedCategory}<button type="button" aria-label="Limpar categoria" onClick={() => setSelectedCategory('all')}><X className="h-3 w-3" /></button></span>}
          {selectedSport !== 'all' && <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-200">{selectedSport}<button type="button" aria-label="Limpar modalidade" onClick={() => setSelectedSport('all')}><X className="h-3 w-3" /></button></span>}
          {selectedCondition !== 'all' && selectedTab !== 'offers' && <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-200">{CONDITIONS.find((condition) => condition.id === selectedCondition)?.label}<button type="button" aria-label="Limpar condição" onClick={() => setSelectedCondition('all')}><X className="h-3 w-3" /></button></span>}
          <button type="button" onClick={resetFilters} className="ml-auto font-semibold text-red-400 hover:underline">Limpar todos</button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-4">
        <aside className={`space-y-5 ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="space-y-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white"><SlidersHorizontal className="h-3.5 w-3.5 text-red-400" />Refinar resultados</h2>
              {activeFiltersCount > 0 && <button type="button" onClick={resetFilters} className="text-[10px] font-medium text-zinc-500 hover:text-white">Limpar</button>}
            </div>

            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Categorias</h3>
              <div className="space-y-1 text-xs">
                <button type="button" onClick={() => setSelectedCategory('all')} className={`flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left ${selectedCategory === 'all' ? 'border border-red-500/20 bg-red-600/15 font-bold text-red-400' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}><span>Todas</span><span className="text-[10px] text-zinc-500">{activeOffers.length + products.filter((product) => product.product_type === 'c2c').length}</span></button>
                {CATEGORIES.map((category) => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left ${selectedCategory === category ? 'border border-red-500/20 bg-red-600/15 font-bold text-red-400' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}><span>{category}</span><span className="text-[10px] text-zinc-500">{categoryCount(category)}</span></button>)}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Modalidade</h3>
              <div className="space-y-1 text-xs">
                <button type="button" onClick={() => setSelectedSport('all')} className={`w-full rounded-full px-3 py-1.5 text-left ${selectedSport === 'all' ? 'border border-red-500/20 bg-red-600/15 font-bold text-red-400' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}>Todas as modalidades</button>
                {SPORTS.map((sport) => <button key={sport} type="button" onClick={() => setSelectedSport(sport)} className={`w-full rounded-full px-3 py-1.5 text-left ${selectedSport === sport ? 'border border-red-500/20 bg-red-600/15 font-bold text-red-400' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}>{sport}</button>)}
              </div>
            </div>

            {selectedTab !== 'offers' && (
              <div>
                <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Estado de conservação</h3>
                <p className="mb-2 text-[10px] text-zinc-600">Filtra equipamentos anunciados por outros atletas.</p>
                <div className="space-y-1 text-xs">
                  <button type="button" onClick={() => setSelectedCondition('all')} className={`w-full rounded-full px-3 py-1.5 text-left ${selectedCondition === 'all' ? 'border border-red-500/20 bg-red-600/15 font-bold text-red-400' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}>Todas as condições</button>
                  {CONDITIONS.map((condition) => <button key={condition.id} type="button" onClick={() => setSelectedCondition(condition.id)} className={`w-full rounded-full px-3 py-1.5 text-left ${selectedCondition === condition.id ? 'border border-red-500/20 bg-red-600/15 font-bold text-red-400' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}>{condition.label}</button>)}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="space-y-7 md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-2.5 text-xs text-zinc-400">
            <span>{displayedCount} resultado(s) · {hasC2C ? `${filteredC2CProducts.length} de atletas` : ''}{hasC2C && hasOffers ? ' + ' : ''}{hasOffers ? `${filteredOffers.length} em ofertas` : ''}</span>
            {selectedCategory !== 'all' && <span className="font-medium text-red-400">Categoria: {selectedCategory}</span>}
          </div>

          {displayedCount === 0 ? (
            <div className="space-y-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-12 text-center shadow-xl">
              <Search className="mx-auto h-8 w-8 text-zinc-600" />
              <h2 className="text-sm font-bold text-white">Nenhum resultado encontrado</h2>
              <p className="mx-auto max-w-md text-xs text-zinc-400">Tente ajustar a busca, categoria ou modalidade selecionada para explorar mais equipamentos.</p>
              <button type="button" onClick={resetFilters} className="rounded-full bg-red-600 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-red-500">Limpar filtros</button>
            </div>
          ) : (
            <>
              {hasC2C && filteredC2CProducts.length > 0 && (
                <section aria-labelledby="c2c-listings-title" className="space-y-4">
                  <div className="flex items-end justify-between gap-3 border-b border-zinc-800/80 pb-3">
                    <div>
                      <h2 id="c2c-listings-title" className="flex items-center gap-2 text-base font-black text-white"><Layers className="h-4 w-4 text-red-400" />Equipamentos de Atletas <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">{filteredC2CProducts.length}</span></h2>
                      <p className="mt-1 text-[11px] text-zinc-500">Vendidos diretamente por atletas — novos sem uso ou já usados, com tempo de uso e estado real descritos pelo dono.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
                    {visibleC2CProducts.map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}
                  </div>
                  {visibleCount < filteredC2CProducts.length && (
                    <div className="flex justify-center border-t border-zinc-800/80 pt-5">
                      <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500">
                        Carregar mais equipamentos ({Math.min(PAGE_SIZE, filteredC2CProducts.length - visibleCount)})
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {visibleCount >= filteredC2CProducts.length && filteredC2CProducts.length > PAGE_SIZE && (
                    <p className="flex items-center justify-center gap-2 border-t border-zinc-800/80 pt-5 text-xs text-zinc-400"><Check className="h-4 w-4 text-emerald-400" />Todos os equipamentos foram exibidos.</p>
                  )}
                </section>
              )}

              {hasOffers && filteredOffers.length > 0 && (
                <section aria-labelledby="partner-offers-title" className="space-y-4">
                  <div className="flex items-end justify-between gap-3 border-b border-zinc-800/80 pb-3">
                    <div>
                      <h2 id="partner-offers-title" className="flex items-center gap-2 text-base font-black text-white"><Tag className="h-4 w-4 text-red-400" />Ofertas <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-200">{filteredOffers.length}</span></h2>
                      <p className="mt-1 text-[11px] text-zinc-500">Promoções reais selecionadas em grandes lojas esportivas, com redirecionamento direto e descontos ativos.</p>
                    </div>
                    {isStaffRole(user?.role) && (
                      <button
                        type="button"
                        onClick={() => setActiveView('profile')}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/35 bg-red-600/15 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-600 hover:text-white"
                      >
                        <Tag className="h-3.5 w-3.5" />
                        Gerenciar ofertas
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
                    {filteredOffers.map((offer) => <ExternalOfferCard key={offer.id} offer={offer} onSelect={(item) => onSelectOffer?.(item)} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
