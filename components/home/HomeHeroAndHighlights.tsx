// ============================================================================
// CORE MOTIOM — HOME (Hero + destaques)
// Hero institucional, destaques B2C, banner SmartScan e deals C2C recentes.
// ============================================================================

'use client';

import React from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Product } from '@/lib/types';
import ProductCard from '@/components/marketplace/ProductCard';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

interface HomeHeroAndHighlightsProps {
  onSelectProduct?: (product: Product) => void;
}

/* ===========================================================
   BANNER INICIAL E DESTAQUES
=========================================================== */

export default function HomeHeroAndHighlights({ onSelectProduct }: HomeHeroAndHighlightsProps) {
  const {
    products,
    stores,
    setActiveView,
    setSelectedStore,
    setSearchQuery,
    isVisitor,
    setAuthModalOpen,
  } = useCoreMotiom();

  // Featured verified products
  const featuredB2C = products.filter((p) => p.product_type === 'b2c').slice(0, 4);
  // Recent C2C athlete deals
  const recentC2C = products.filter((p) => p.product_type === 'c2c').slice(0, 4);
  // Verified stores
  const verifiedStores = stores.filter((s) => s.is_verified);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Clean Minimalist Hero Section */}
      <section className="relative overflow-hidden bg-[#0B0D11] border-b border-[#1E232F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Marketplace de Alta Performance</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Equipamentos de Elite para Atletas Exigentes
              </h1>

              <p className="text-sm text-[#94A3B8] max-w-xl leading-relaxed">
                Compre e venda super tênis, vestuário de compressão, relógios GPS e acessórios de alta tecnologia com garantia de autenticidade e custódia segura.
              </p>

              {/* Minimalist Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveView('marketplace')}
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (isVisitor) setAuthModalOpen(true);
                    else setActiveView('sell');
                  }}
                  className="px-6 py-3 rounded-lg bg-[#141822] hover:bg-[#1A202C] text-white text-xs sm:text-sm font-semibold border border-[#232A38] hover:border-red-500/40 transition-colors flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-red-400" />
                  <span>Vender Equipamento</span>
                </button>

                <button
                  onClick={() => setActiveView('smartscan')}
                  className="px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>SmartScan</span>
                </button>
              </div>

              {/* Minimalist Indicators */}
              <div className="pt-6 border-t border-[#1C222C] grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#12151C] border border-[#232836]">
                  <span className="text-[11px] text-[#64748B] block">Autenticidade</span>
                  <span className="font-semibold text-white text-xs block mt-0.5">Lojas Oficiais</span>
                  <span className="text-[10px] text-red-400 font-medium">Marcas Verificadas</span>
                </div>
                <div className="p-3 rounded-lg bg-[#12151C] border border-[#232836]">
                  <span className="text-[11px] text-[#64748B] block">Custódia C2C</span>
                  <span className="font-semibold text-white text-xs block mt-0.5">Proteção Total</span>
                  <span className="text-[10px] text-red-400 font-medium">Pagamento Seguro</span>
                </div>
                <div className="p-3 rounded-lg bg-[#12151C] border border-[#232836]">
                  <span className="text-[11px] text-[#64748B] block">Avaliação</span>
                  <span className="font-semibold text-white text-xs block mt-0.5">SmartScan</span>
                  <span className="text-[10px] text-red-400 font-medium">Preço e Desgaste</span>
                </div>
              </div>
            </div>

            {/* Right Card / Minimalist Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-xl overflow-hidden border border-[#232A38] bg-[#12151C] shadow-lg p-4 space-y-3">
                
                {/* Visual Header */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#1E232F]">
                  <img
                    src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80"
                    alt="Marathon Athlete"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11] via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-semibold border border-red-500/30">
                      Placa de Carbono & Velocidade
                    </span>
                    <h3 className="font-bold text-sm">Super Tênis & Equipamentos de Ponta</h3>
                    <p className="text-xs text-[#94A3B8]">Encontre os modelos mais velozes das maiores marcas.</p>
                  </div>
                </div>

                {/* Sub Tiles */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setActiveView('stores')}
                    className="p-3 rounded-lg bg-[#0E1017] hover:bg-[#181C26] border border-[#232836] hover:border-red-500/30 text-left transition-all"
                  >
                    <span className="text-[10px] text-red-400 block font-medium">Marcas Parceiras</span>
                    <span className="font-semibold text-white block mt-0.5">Lojas Oficiais</span>
                    <span className="text-[10px] text-[#64748B]">Produtos com Nota Fiscal</span>
                  </button>

                  <button
                    onClick={() => setActiveView('coaches')}
                    className="p-3 rounded-lg bg-[#0E1017] hover:bg-[#181C26] border border-[#232836] hover:border-red-500/30 text-left transition-all"
                  >
                    <span className="text-[10px] text-red-400 block font-medium">Assessorias</span>
                    <span className="font-semibold text-white block mt-0.5">Treinadores</span>
                    <span className="text-[10px] text-[#64748B]">Planilhas de Treino</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {[
            { label: 'Super Tênis', category: 'Calçados', sport: 'Corrida' },
            { label: 'Vestuário Técnico', category: 'Roupas', sport: 'Performance' },
            { label: 'GPS & Relógios', category: 'Tecnologia & Wearables', sport: 'Triatlo' },
            { label: 'Bikes & Peças', category: 'Equipamentos', sport: 'Ciclismo' },
            { label: 'Nutrição & Suplementos', category: 'Nutrição & Suplementos', sport: 'Nutrição' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(item.category);
                setActiveView('marketplace');
              }}
              className="p-3.5 rounded-lg bg-[#12151C] hover:bg-[#181D26] border border-[#232836] hover:border-red-500/40 text-left transition-all group"
            >
              <span className="text-[10px] text-[#64748B] block mb-1">{item.sport}</span>
              <span className="font-semibold text-white text-xs group-hover:text-red-400 transition-colors block">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Official Verified Stores Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E232F]">
          <div>
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Lojas & Marcas Verificadas
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              Compre Diretamente de Fabricantes e Lojas Oficiais
            </h2>
          </div>
          <button
            onClick={() => setActiveView('stores')}
            className="text-xs font-semibold text-red-400 hover:underline flex items-center gap-1"
          >
            <span>Ver Todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {verifiedStores.map((store) => (
            <div
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className="group p-4 rounded-xl bg-[#12151C] border border-[#232836] hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-[#0E1017] border border-[#232A38] overflow-hidden shrink-0">
                  <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-red-400 transition-colors flex items-center gap-1">
                    {store.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{store.category}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-red-400 transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured B2C Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E232F]">
          <div>
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
              Destaques das Lojas
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              Equipamentos Novos em Destaque
            </h2>
          </div>
          <button
            onClick={() => setActiveView('marketplace')}
            className="text-xs font-semibold text-red-400 hover:underline flex items-center gap-1"
          >
            <span>Ver Catálogo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredB2C.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* SmartScan Minimalist Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#12151C] p-6 sm:p-8 border border-red-500/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
              <Sparkles className="w-4 h-4" />
              <span>SmartScan</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Avaliação de Desgaste e Preço Justo de Equipamentos
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Descubra a integridade da espuma, o estado da placa de carbono e o valor de mercado estimado antes de comprar ou anunciar.
            </p>
          </div>

          <button
            onClick={() => setActiveView('smartscan')}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide shadow-sm transition-all flex items-center gap-2 shrink-0 z-10"
          >
            <span>Iniciar Avaliação</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Recent C2C Athlete Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E232F]">
          <div>
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
              Mercado Entre Atletas (C2C)
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              Oportunidades & Seminovos de Atletas
            </h2>
          </div>
          <button
            onClick={() => setActiveView('sell')}
            className="text-xs font-semibold text-red-400 hover:underline flex items-center gap-1"
          >
            <span>Anunciar Equipamento</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentC2C.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

