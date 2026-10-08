// ============================================================================
// CORE MOTIOM — MARKETPLACE (Catálogo)
// Filtros combinados (busca, tipo B2C/C2C, categoria, esporte, condição),
// ordenação e grid de produtos com estado vazio.
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Product, ProductCondition } from '@/lib/types';
import ProductCard from '@/components/marketplace/ProductCard';
import {
  ShoppingBag,
  Filter,
  ShieldCheck,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  X,
  PlusCircle,
} from 'lucide-react';

interface MarketplaceViewProps {
  onSelectProduct?: (product: Product) => void;
}

/* ===========================================================
   VISTA DO MARKETPLACE
=========================================================== */

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

  const categories = [
    'Calçados',
    'Roupas',
    'Equipamentos',
    'Tecnologia & Wearables',
    'Nutrição & Suplementos',
  ];

  const sports = [
    'Corrida',
    'Triatlo',
    'Ciclismo',
    'Trail Running',
    'Crossfit & Funcional',
  ];

  const conditions: { id: ProductCondition | 'all'; label: string }[] = [
    { id: 'all', label: 'Todas as Condições' },
    { id: 'novo', label: 'Novo (Lacrado)' },
    { id: 'como_novo', label: 'Como Novo' },
    { id: 'usado_excelente', label: 'Usado (Excelente)' },
    { id: 'usado_bom', label: 'Usado (Bom)' },
  ];

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
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Sport
      if (selectedSport !== 'all' && p.sport !== selectedSport) {
        return false;
      }

      // Condition
      if (selectedCondition !== 'all' && p.condition !== selectedCondition) {
        return false;
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
      return (b.views + b.likes_count * 2) - (a.views + a.likes_count * 2);
    });
  }, [products, searchQuery, selectedType, selectedCategory, selectedSport, selectedCondition, onlyVerified, sortBy]);

  const activeFiltersCount = [
    selectedType !== 'all',
    selectedCategory !== 'all',
    selectedSport !== 'all',
    selectedCondition !== 'all',
    onlyVerified,
  ].filter(Boolean).length;

  /* ===========================================================
     RESETAR FILTROS DO MARKETPLACE
  =========================================================== */

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedSport('all');
    setSelectedCondition('all');
    setOnlyVerified(false);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E232F]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catálogo Geral Esportivo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Equipamentos de Performance & Lojas Oficiais
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Itens novos direto de marcas parceiras com garantia e seminovos verificados entre atletas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (isVisitor) setAuthModalOpen(true);
              else setActiveView('sell');
            }}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Anunciar Produto (C2C)</span>
          </button>
        </div>
      </div>

      {/* Segment Tabs (Todos / Lojas Oficiais / Venda C2C) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#12151C] p-2 rounded-xl border border-[#232836]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedType === 'all'
                ? 'bg-red-600 text-white font-semibold shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#181D26]'
            }`}
          >
            Todos os Produtos ({products.length})
          </button>

          <button
            onClick={() => setSelectedType('b2c')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedType === 'b2c'
                ? 'bg-red-600 text-white font-semibold shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#181D26]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lojas & Marcas</span>
          </button>

          <button
            onClick={() => setSelectedType('c2c')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedType === 'c2c'
                ? 'bg-red-600 text-white font-semibold shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#181D26]'
            }`}
          >
            <span>Venda entre Atletas (C2C)</span>
          </button>
        </div>

        {/* Right Sort Dropdown & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#181D26] border border-[#232836] rounded-lg text-xs text-white"
          >
            <Filter className="w-3.5 h-3.5 text-red-400" />
            <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-[#181D26] text-white text-xs py-1.5 px-2.5 rounded-lg border border-[#232836] focus:outline-none focus:border-red-500/50"
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
        <div className="flex flex-wrap items-center gap-2 bg-[#12151C] p-2.5 rounded-lg border border-[#232836] text-xs">
          <span className="text-[#64748B] font-medium">Filtros Ativos:</span>
          {searchQuery && (
            <span className="px-2 py-0.5 rounded bg-[#181D26] text-[#CBD5E1] border border-[#232836] flex items-center gap-1">
              Busca: &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-[#94A3B8] hover:text-white" /></button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="px-2 py-0.5 rounded bg-[#181D26] text-[#CBD5E1] border border-[#232836] flex items-center gap-1">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3 text-[#94A3B8] hover:text-white" /></button>
            </span>
          )}
          {selectedSport !== 'all' && (
            <span className="px-2 py-0.5 rounded bg-[#181D26] text-[#CBD5E1] border border-[#232836] flex items-center gap-1">
              {selectedSport}
              <button onClick={() => setSelectedSport('all')}><X className="w-3 h-3 text-[#94A3B8] hover:text-white" /></button>
            </span>
          )}
          {selectedCondition !== 'all' && (
            <span className="px-2 py-0.5 rounded bg-[#181D26] text-[#CBD5E1] border border-[#232836] flex items-center gap-1">
              {conditions.find(c => c.id === selectedCondition)?.label}
              <button onClick={() => setSelectedCondition('all')}><X className="w-3 h-3 text-[#94A3B8] hover:text-white" /></button>
            </span>
          )}
          {onlyVerified && (
            <span className="px-2 py-0.5 rounded bg-red-600/10 text-red-400 border border-red-500/20 flex items-center gap-1">
              ✓ Lojas Oficiais
              <button onClick={() => setOnlyVerified(false)}><X className="w-3 h-3 text-red-400 hover:text-white" /></button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-red-400 hover:underline ml-auto text-[11px] font-medium"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Desktop Sidebar Filters */}
        <aside className={`md:block space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="bg-[#12151C] p-4 rounded-xl border border-[#232836] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
                <span>Filtros</span>
              </h3>
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} className="text-[10px] text-[#64748B] hover:text-white font-medium">
                  Limpar
                </button>
              )}
            </div>

            {/* Verified Store Only Checkbox */}
            <div className="p-2.5 rounded-lg bg-[#0E1017] border border-[#232836]">
              <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded border-[#232836] text-red-600 focus:ring-red-500 bg-[#0E1017]"
                />
                <span className="flex items-center gap-1 text-red-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Lojas Oficiais (CNPJ)
                </span>
              </label>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[#64748B] mb-2 font-medium">Categorias</h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === 'all' ? 'bg-red-600/15 text-red-400 font-semibold border border-red-500/20' : 'text-[#94A3B8] hover:bg-[#181D26]'
                  }`}
                >
                  <span>Todas as Categorias</span>
                  <span className="text-[10px] text-[#64748B]">{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === cat ? 'bg-red-600/15 text-red-400 font-semibold border border-red-500/20' : 'text-[#94A3B8] hover:bg-[#181D26]'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] text-[#64748B]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sport Filter */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[#64748B] mb-2 font-medium">Modalidade</h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedSport('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedSport === 'all' ? 'bg-red-600/15 text-red-400 font-semibold border border-red-500/20' : 'text-[#94A3B8] hover:bg-[#181D26]'
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
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                        selectedSport === sp ? 'bg-red-600/15 text-red-400 font-semibold border border-red-500/20' : 'text-[#94A3B8] hover:bg-[#181D26]'
                      }`}
                    >
                      <span>{sp}</span>
                      <span className="text-[10px] text-[#64748B]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[#64748B] mb-2 font-medium">Condição</h4>
              <div className="space-y-1 text-xs">
                {conditions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCondition(c.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                      selectedCondition === c.id ? 'bg-red-600/15 text-red-400 font-semibold border border-red-500/20' : 'text-[#94A3B8] hover:bg-[#181D26]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>{filteredProducts.length} produtos encontrados</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#12151C] border border-[#232836] rounded-xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#0E1017] border border-[#232836] flex items-center justify-center text-[#64748B] mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Nenhum produto correspondente</h3>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                Ajuste os filtros de busca ou limpe os parâmetros para explorar todo o catálogo esportivo.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors"
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

