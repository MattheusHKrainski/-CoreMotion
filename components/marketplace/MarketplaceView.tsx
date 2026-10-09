'use client';

import React, { useState, useMemo } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Product, ProductCondition } from '@/lib/types';
import ProductCard from './ProductCard';
import {
  ShoppingBag,
  Filter,
  ShieldCheck,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  X,
  PlusCircle,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react';

interface MarketplaceViewProps {
  onSelectProduct?: (product: Product) => void;
}

export default function MarketplaceView({ onSelectProduct }: MarketplaceViewProps) {
  const {
    products,
    searchQuery,
    setSearchQuery,
    setActiveView,
    isVisitor,
    setAuthModalOpen,
  } = useCoreMotiom();

  // Filters State
  const [selectedType, setSelectedType] = useState<'all' | 'b2c' | 'c2c'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'newest'>('relevance');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination State
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const categories = [
    'Calçados',
    'Vestuário',
    'Equipamentos',
    'Tecnologia & Wearables',
    'Acessórios',
  ];

  const sports = [
    'Casual',
    'Corrida',
    'Treino',
    'Futebol',
    'Ciclismo',
    'Triatlo',
    'Aventura',
    'Natação',
  ];

  const conditions: { id: ProductCondition | 'all'; label: string }[] = [
    { id: 'all', label: 'Todas as Condições' },
    { id: 'novo', label: 'Novo (Lacrado)' },
    { id: 'como_novo', label: 'Seminovo (Como Novo)' },
    { id: 'seminovo', label: 'Seminovo' },
    { id: 'usado_excelente', label: 'Excelente' },
    { id: 'usado_bom', label: 'Bom Estado' },
  ];

  // Reset pagination state when filters change
  const filterKey = `${searchQuery}_${selectedType}_${selectedCategory}_${selectedSport}_${selectedCondition}_${onlyVerified}_${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchSport = p.sport.toLowerCase().includes(q);
        const matchSeller = p.seller_name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchBrand && !matchCategory && !matchSport && !matchSeller) {
          return false;
        }
      }

      // Type
      if (selectedType !== 'all' && p.product_type !== selectedType) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const isMatch = p.category === selectedCategory ||
          (selectedCategory === 'Vestuário' && p.category === 'Roupas') ||
          (selectedCategory === 'Roupas' && p.category === 'Vestuário') ||
          (selectedCategory === 'Tecnologia & Wearables' && (p.category === 'Tecnologia' || p.category === 'Wearables')) ||
          (selectedCategory === 'Tecnologia' && p.category === 'Tecnologia & Wearables');
        if (!isMatch) return false;
      }

      // Sport
      if (selectedSport !== 'all' && p.sport !== selectedSport) {
        return false;
      }

      // Condition
      if (selectedCondition !== 'all') {
        const isCondMatch = p.condition === selectedCondition ||
          (selectedCondition === 'como_novo' && p.condition === 'seminovo') ||
          (selectedCondition === 'seminovo' && p.condition === 'como_novo');
        if (!isCondMatch) return false;
      }

      // Only Verified
      if (onlyVerified && !p.is_verified_store) {
        return false;
      }

      // Status
      if (p.status !== 'active') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      const bScore = (b.views ?? 0) + (b.likes_count ?? 0) * 2;
      const aScore = (a.views ?? 0) + (a.likes_count ?? 0) * 2;
      return bScore - aScore;
    });
  }, [products, searchQuery, selectedType, selectedCategory, selectedSport, selectedCondition, onlyVerified, sortBy]);

  // Paginated slice
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const activeFiltersCount = [
    selectedType !== 'all',
    selectedCategory !== 'all',
    selectedSport !== 'all',
    selectedCondition !== 'all',
    onlyVerified,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedSport('all');
    setSelectedCondition('all');
    setOnlyVerified(false);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Title in Dark High-Performance Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catálogo Geral Esportivo</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Equipamentos de Performance & Lojas Oficiais
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Super tênis com placa de carbono, relógios GPS e vestuário de compressão (anúncios de demonstração) ou intermediados com custódia segura entre atletas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (isVisitor) setAuthModalOpen(true);
              else setActiveView('sell');
            }}
            className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Anunciar Equipamento</span>
          </button>
        </div>
      </div>

      {/* Segment Tabs Pills (Todos / Lojas Oficiais / Venda C2C) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/70 p-2 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs scrollbar-none">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedType === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            Todos os Produtos ({products.length})
          </button>

          <button
            onClick={() => setSelectedType('b2c')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedType === 'b2c'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lojas Oficiais</span>
          </button>

          <button
            onClick={() => setSelectedType('c2c')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedType === 'c2c'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Venda entre Atletas (C2C)</span>
          </button>
        </div>

        {/* Right Sort Dropdown & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-white"
          >
            <Filter className="w-3.5 h-3.5 text-red-400" />
            <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-zinc-950 text-white text-xs py-1.5 px-3 rounded-full border border-zinc-800 focus:outline-none focus:border-red-500"
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="newest">Lançamentos Recentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filters pill bar */}
      {(activeFiltersCount > 0 || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/80 text-xs">
          <span className="text-zinc-500 font-medium">Filtros Ativos:</span>
          {searchQuery && (
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5">
              Busca: &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            </span>
          )}
          {selectedSport !== 'all' && (
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5">
              {selectedSport}
              <button onClick={() => setSelectedSport('all')}><X className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            </span>
          )}
          {selectedCondition !== 'all' && (
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5">
              {conditions.find(c => c.id === selectedCondition)?.label}
              <button onClick={() => setSelectedCondition('all')}><X className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            </span>
          )}
          {onlyVerified && (
            <span className="px-3 py-1 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Lojas Oficiais
              <button onClick={() => setOnlyVerified(false)}><X className="w-3 h-3 text-red-400 hover:text-white" /></button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-red-400 hover:underline ml-auto text-xs font-semibold"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className={`md:block space-y-5 ${isMobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
                <span>Refinar Filtros</span>
              </h3>
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} className="text-[10px] text-zinc-500 hover:text-white font-medium">
                  Limpar
                </button>
              )}
            </div>

            {/* Verified Store Only Pill Toggle */}
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
              <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded border-zinc-800 text-red-600 focus:ring-red-500 bg-zinc-900"
                />
                <span className="flex items-center gap-1.5 text-red-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Somente Lojas Oficiais (CNPJ)
                </span>
              </label>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Categorias</h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-full transition-colors flex items-center justify-between ${
                    selectedCategory === 'all' ? 'bg-red-600/15 text-red-400 font-bold border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <span>Todas as Categorias</span>
                  <span className="text-[10px] text-zinc-500">{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => {
                    return p.category === cat ||
                      (cat === 'Vestuário' && p.category === 'Roupas') ||
                      (cat === 'Roupas' && p.category === 'Vestuário') ||
                      (cat === 'Tecnologia & Wearables' && (p.category === 'Tecnologia' || p.category === 'Wearables')) ||
                      (cat === 'Tecnologia' && p.category === 'Tecnologia & Wearables');
                  }).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-1.5 rounded-full transition-colors flex items-center justify-between ${
                        selectedCategory === cat ? 'bg-red-600/15 text-red-400 font-bold border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] text-zinc-500 font-medium">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sport Filter */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Modalidade</h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedSport('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-full transition-colors flex items-center justify-between ${
                    selectedSport === 'all' ? 'bg-red-600/15 text-red-400 font-bold border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <span>Todos os Esportes</span>
                </button>
                {sports.map((sp) => {
                  const count = products.filter((p) => p.sport === sp).length;
                  return (
                    <button
                      key={sp}
                      onClick={() => setSelectedSport(sp)}
                      className={`w-full text-left px-3 py-1.5 rounded-full transition-colors flex items-center justify-between ${
                        selectedSport === sp ? 'bg-red-600/15 text-red-400 font-bold border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                      }`}
                    >
                      <span>{sp}</span>
                      <span className="text-[10px] text-zinc-500 font-medium">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Condição</h4>
              <div className="space-y-1 text-xs">
                {conditions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCondition(c.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-full transition-colors ${
                      selectedCondition === c.id ? 'bg-red-600/15 text-red-400 font-bold border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid & Pagination */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/40 px-4 py-2.5 rounded-xl border border-zinc-800/60">
            <span>
              Mostrando <strong className="text-white font-semibold">{displayedProducts.length}</strong> de <strong className="text-white font-semibold">{filteredProducts.length}</strong> produtos
            </span>
            {selectedCategory !== 'all' && (
              <span className="text-red-400 font-medium">Filtrado por: {selectedCategory}</span>
            )}
          </div>

          {displayedProducts.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>

              {/* Pagination & Load More Controls */}
              <div className="pt-6 border-t border-zinc-800/80 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center justify-between w-full max-w-xs text-xs text-zinc-400">
                  <span>Progresso do Catálogo</span>
                  <span className="text-[11px] font-semibold text-red-400">
                    {Math.round((displayedProducts.length / filteredProducts.length) * 100)}%
                  </span>
                </div>
                <div className="w-full max-w-xs h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-300 shadow-sm shadow-red-500"
                    style={{ width: `${Math.min(100, Math.round((displayedProducts.length / filteredProducts.length) * 100))}%` }}
                  />
                </div>

                {visibleCount < filteredProducts.length ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-full transition-all flex items-center gap-2 shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>Carregar Mais Produtos (+{Math.min(PAGE_SIZE, filteredProducts.length - visibleCount)})</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setVisibleCount(filteredProducts.length)}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded-full transition-colors border border-zinc-800 cursor-pointer"
                    >
                      Mostrar Todos ({filteredProducts.length})
                    </button>
                  </div>
                ) : (
                  filteredProducts.length > PAGE_SIZE && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2 bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Você visualizou todos os {filteredProducts.length} produtos disponíveis</span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Nenhum produto correspondente aos filtros</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Ajuste os parâmetros de busca ou limpe os filtros para explorar todo o catálogo esportivo.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full transition-colors shadow-md shadow-red-950/40"
              >
                Ver Todos os Produtos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
