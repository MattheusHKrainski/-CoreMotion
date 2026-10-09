'use client';

import React, { useState, useEffect } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Product } from '@/lib/types';
import ProductCard from '@/components/marketplace/ProductCard';
import {
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  ShoppingBag,
  Lock,
  CheckCircle2,
  Users,
  Layers,
  Flame,
} from 'lucide-react';

interface HomeHeroAndHighlightsProps {
  onSelectProduct?: (product: Product) => void;
}

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

  // Active filter state for the Bento Grid showcase
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'b2c' | 'c2c'>('all');

  // Hero carousel slides
  const heroSlides = [
    {
      id: 1,
      badge: 'Streetwear & Casual Esportivo',
      title: 'Estilo Urbano e Conforto para o Dia a Dia',
      subtitle: 'Compre e venda os tênis casuais mais icônicos do mundo — Nike Air Force 1, Adidas Samba, Vans e Puma com autenticidade garantida e envio seguro.',
      productName: "Tênis Nike Air Force 1 '07 Branco",
      productSpecs: 'Couro Legítimo • Amortecimento Air Encapsulado • Sola Antiderrapante',
      price: 'R$ 799,90',
      condition: 'Novo (Lacrado)',
      seller: 'Nike Flagship Store Brasil',
      image: '/products/nike-air-force-1.jpg',
      tag: 'Casual',
    },
    {
      id: 2,
      badge: 'Corrida Popular & Treino Diário',
      title: 'O Tênis Mais Querido do Brasil para Corridas e Academia',
      subtitle: 'Desenvolvido por corredores nacionais: leveza de apenas 210g, cabedal Oxitec respirável e entressola com amortecimento Eleva Pro.',
      productName: 'Tênis Olympikus Corre 3 Grafite & Laranja',
      productSpecs: 'Tecnologia Oxitec • Espuma Eleva Pro • Sola Gripper • 210g',
      price: 'R$ 449,90',
      condition: 'Novo (Lacrado)',
      seller: 'Olympikus Flagship Brasil',
      image: '/products/olympikus-corre-3.jpg',
      tag: 'Corrida',
    },
    {
      id: 3,
      badge: 'Streetwear Clássico & Retrô',
      title: 'O Maior Ícone Urbano das Ruas e das Quadras',
      subtitle: 'Silhueta histórica em couro legítimo preto, biqueira em camurça T-toe, as clássicas 3 listras brancas e solado em borracha natural gum.',
      productName: 'Tênis Adidas Samba OG Preto & Branco',
      productSpecs: 'Couro Premium • Biqueira em Camurça • Sola de Borracha Gum',
      price: 'R$ 699,90',
      condition: 'Novo (Lacrado)',
      seller: 'Adidas Originals & Adizero Lab',
      image: '/products/adidas-samba-og.jpg',
      tag: 'Casual',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto advance carousel every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Pill filter tags
  const filterTags = [
    { id: 'all', label: 'Todos os Produtos' },
    { id: 'Casual', label: 'Casual & Streetwear' },
    { id: 'Corrida', label: 'Corrida de Rua' },
    { id: 'Treino', label: 'Treino & Academia' },
    { id: 'Calçados', label: 'Tênis & Calçados' },
    { id: 'Vestuário', label: 'Vestuário & Jaquetas' },
    { id: 'Acessórios', label: 'Mochilas & Acessórios' },
    { id: 'Futebol', label: 'Camisas de Futebol' },
  ];

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (activeTab !== 'all' && p.product_type !== activeTab) return false;
    if (activeFilter === 'all') return true;
    return p.sport === activeFilter ||
      p.category === activeFilter ||
      (activeFilter === 'Vestuário' && p.category === 'Roupas') ||
      (activeFilter === 'Roupas' && p.category === 'Vestuário');
  });

  const verifiedStores = stores.filter((s) => s.is_verified).slice(0, 4);

  const slide = heroSlides[currentSlide];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 pt-4 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* 1. HERO SECTION IMERSIVO (CARD AMPLO ARREDONDADO COM GRADIENTE ESCURO & LUZ DIFUSA VERMELHA) */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-950 via-[#0E1017] to-black border border-zinc-800/80 shadow-2xl shadow-black/80 transition-all duration-500">
        
        {/* Subtle diffuse red ambient light */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Category Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>{slide.badge}</span>
              </div>

              {/* Title with Architectural Typography */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] drop-shadow-sm">
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
                {slide.subtitle}
              </p>

              {/* Action Buttons in Pill Format */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveView('marketplace')}
                  className="px-6 sm:px-8 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-xl shadow-red-950/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (isVisitor) {
                      setAuthModalOpen(true);
                    } else {
                      setActiveView('sell');
                    }
                  }}
                  className="px-6 sm:px-8 py-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold border border-zinc-700/80 transition-all hover:border-red-500/40 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-red-400" />
                  <span>Vender Equipamento</span>
                </button>
              </div>

              {/* Technical Trust Indicators */}
              <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Garantia</span>
                  <span className="font-bold text-white text-xs block mt-0.5">Lojas Oficiais</span>
                  <span className="text-[10px] text-red-400">Produtos com NF</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Custódia C2C</span>
                  <span className="font-bold text-white text-xs block mt-0.5">Retenção Segura</span>
                  <span className="text-[10px] text-red-400">Liberação 48h</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Comunidade</span>
                  <span className="font-bold text-white text-xs block mt-0.5">Atletas Reais</span>
                  <span className="text-[10px] text-red-400">Reviews & Dicas</span>
                </div>
              </div>

            </div>

            {/* Right: High-Performance Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden bg-zinc-900/90 border border-zinc-800 shadow-2xl p-4 sm:p-5 space-y-4">
                
                {/* Visual Image Showcase */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 group">
                  <img
                    src={slide.image}
                    alt={slide.productName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {/* Floating Specs on Image */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      Destaque PRO
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/80 text-zinc-300 text-[10px] font-medium backdrop-blur-md border border-zinc-700">
                      {slide.condition}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                    <span className="text-[10px] text-zinc-400 font-medium block">
                      {slide.seller}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base leading-tight truncate">
                      {slide.productName}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {slide.productSpecs}
                    </p>
                  </div>
                </div>

                {/* Technical Specs Footer & Quick Action */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Valor de Referência</span>
                    <span className="text-lg font-black text-white tracking-tight">{slide.price}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSearchQuery(slide.productName.split(' ')[0]);
                      setActiveView('marketplace');
                    }}
                    className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-red-950/40 flex items-center gap-1.5"
                  >
                    <span>Ver no Catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Carousel Navigation Indicators & Controls */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between">
            {/* Pill Dots */}
            <div className="flex items-center gap-2">
              {heroSlides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-8 bg-red-600' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
                className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95"
                title="Slide Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95"
                title="Próximo Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ÁREA DE FILTROS RÁPIDOS EM CÁPSULA (PILL TAGS) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <span>Categorias & Modalidades Esportivas</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Filtre por esporte de alto rendimento ou componente de performance.
            </p>
          </div>

          {/* Type Switcher Pills */}
          <div className="flex items-center p-1 rounded-full bg-zinc-900/80 border border-zinc-800 self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'all' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab('b2c')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'b2c' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lojas Oficiais
            </button>
            <button
              onClick={() => setActiveTab('c2c')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'c2c' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Venda C2C
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Pill List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterTags.map((tag) => {
            const isSelected = activeFilter === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setActiveFilter(tag.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/50 scale-105'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. BENTO GRID / PAINEL MODULAR DE DESTAQUES (COLUNA 1: VITRINE | COLUNA 2: WIDGETS TÉCNICOS) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Coluna 1 (Vitrine Vertical / Modular Grid de Produtos) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Vitrine de Alta Performance ({filteredProducts.length})
              </h3>
            </div>

            <button
              onClick={() => setActiveView('marketplace')}
              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <span>Ver Catálogo Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-300">Nenhum equipamento encontrado</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Não há produtos disponíveis com o filtro atual. Tente selecionar outra categoria.
              </p>
              <button
                onClick={() => { setActiveFilter('all'); setActiveTab('all'); }}
                className="px-4 py-2 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold hover:text-white"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}

          {/* Bottom Catalog Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-white">Procura algo específico?</h4>
              <p className="text-xs text-zinc-400">
                Navegue por dezenas de sapatilhas de carbono, ciclocomputadores e peças de precisão.
              </p>
            </div>
            <button
              onClick={() => setActiveView('marketplace')}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide shrink-0 transition-all shadow-md shadow-red-950/40 hover:scale-105"
            >
              Explorar Todos os Produtos
            </button>
          </div>
        </div>

        {/* Coluna 2 (Widgets Técnicos Laterais no Bento Grid) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Widget 1: Lojas Oficiais Verificadas */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-red-500/15 text-red-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Lojas Oficiais Verificadas</h4>
                  <p className="text-[10px] text-zinc-400">Marcas com Nota Fiscal e Garantia</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('stores')}
                className="text-[11px] font-semibold text-red-400 hover:underline"
              >
                Ver Todas
              </button>
            </div>

            <div className="space-y-2.5">
              {verifiedStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/70 hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700/60 overflow-hidden shrink-0">
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white group-hover:text-red-400 transition-colors flex items-center gap-1">
                        {store.name}
                        <CheckCircle2 className="w-3 h-3 text-red-500 shrink-0" />
                      </h5>
                      <span className="text-[10px] text-zinc-500 block truncate">{store.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-400 transition-colors" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveView('stores')}
              className="w-full py-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold tracking-wide border border-zinc-700/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explorar Lojas Parceiras</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Widget 2: Protocolo de Custódia Segura C2C */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-950 via-[#10131B] to-black border border-zinc-800/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-red-500/15 text-red-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Custódia Segura C2C</h4>
                <p className="text-[10px] text-zinc-400">Proteção total para compradores e atletas</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-semibold text-zinc-200 text-[11px]">Pagamento Retido em Escrow</p>
                  <p className="text-[10px] text-zinc-500">O valor não vai direto para o vendedor.</p>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-semibold text-zinc-200 text-[11px]">Envio Rastreável com Seguro</p>
                  <p className="text-[10px] text-zinc-500">Código de rastreio integrado à plataforma.</p>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-semibold text-zinc-200 text-[11px]">48h para Inspeção do Atleta</p>
                  <p className="text-[10px] text-zinc-500">Confira se o equipamento confere com as fotos.</p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => {
                  if (isVisitor) setAuthModalOpen(true);
                  else setActiveView('sell');
                }}
                className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-red-950/50 flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Anunciar meu Equipamento</span>
              </button>
            </div>
          </div>

          {/* Widget 3: Comunidade Esportiva & Reviews */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-red-500/15 text-red-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Comunidade de Atletas</h4>
                <p className="text-[10px] text-zinc-400">Fórum & Reviews Técnicos</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Troque experiências sobre calçados, provas e equipamentos com atletas experientes e treinadores.
            </p>

            <button
              onClick={() => setActiveView('community')}
              className="w-full py-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold tracking-wide border border-zinc-700/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 text-red-400" />
              <span>Acessar Comunidade</span>
            </button>
          </div>

          {/* Widget 4: Treinadores Credenciados */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-red-500/15 text-red-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Treinadores & Assessorias</h4>
                <p className="text-[10px] text-zinc-400">Consultoria e Periodização</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Encontre treinadores credenciados para ajustar sua mecânica de corrida e planilhas de maratona e triatlo.
            </p>

            <button
              onClick={() => setActiveView('coaches')}
              className="w-full py-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold tracking-wide border border-zinc-700/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Ver Treinadores</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </section>

    </div>
  );
}
