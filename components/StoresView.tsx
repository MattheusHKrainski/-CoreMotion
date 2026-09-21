'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Store, Product } from '@/lib/types';
import ProductCard from './ProductCard';
import {
  Store as StoreIcon,
  ShieldCheck,
  PlusCircle,
  MapPin,
  Search,
  ExternalLink,
  ArrowLeft,
  FileCheck,
  CheckCircle2,
  X,
  ChevronRight,
  Package,
} from 'lucide-react';

interface StoresViewProps {
  onSelectProduct?: (product: Product) => void;
}

export default function StoresView({ onSelectProduct }: StoresViewProps) {
  const {
    stores,
    products,
    selectedStore,
    setSelectedStore,
    setCreateStoreModalOpen,
    user,
    isVisitor,
    setAuthModalOpen,
    requestStoreVerification,
  } = useCoreMotiom();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [cnpj, setCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');

  // Extract unique high-level categories
  const categories = [
    { id: 'all', label: 'Todas as Lojas' },
    { id: 'corrida', label: 'Corrida & Atletismo' },
    { id: 'ciclismo', label: 'Ciclismo & Triatlo' },
    { id: 'nutricao', label: 'Nutrição & Suplementos' },
    { id: 'tecnologia', label: 'Tecnologia & GPS' },
    { id: 'natacao', label: 'Natação & Aquáticos' },
    { id: 'multiesportes', label: 'Multiesportes & Outdoor' },
  ];

  // Filter stores
  const filteredStores = stores.filter((s) => {
    if (selectedCategory !== 'all') {
      const cat = (s.category || '').toLowerCase();
      const desc = (s.description || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      const text = `${cat} ${desc} ${name}`;

      if (selectedCategory === 'corrida' && !text.includes('corrida') && !text.includes('maratona') && !text.includes('running') && !text.includes('atletismo')) return false;
      if (selectedCategory === 'ciclismo' && !text.includes('cicl') && !text.includes('bike') && !text.includes('triatlo') && !text.includes('gravel') && !text.includes('shimano') && !text.includes('sram')) return false;
      if (selectedCategory === 'nutricao' && !text.includes('nutri') && !text.includes('suplement') && !text.includes('gel') && !text.includes('fuel') && !text.includes('hidrogel')) return false;
      if (selectedCategory === 'tecnologia' && !text.includes('gps') && !text.includes('garmin') && !text.includes('polar') && !text.includes('suunto') && !text.includes('tech') && !text.includes('wearable') && !text.includes('cardio')) return false;
      if (selectedCategory === 'natacao' && !text.includes('nata') && !text.includes('aqua') && !text.includes('speedo') && !text.includes('arena')) return false;
      if (selectedCategory === 'multiesportes' && !text.includes('multi') && !text.includes('outdoor') && !text.includes('decathlon') && !text.includes('centauro') && !text.includes('bayard') && !text.includes('trilha') && !text.includes('lifestyle')) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchCat = s.category.toLowerCase().includes(q);
      const matchLoc = (s.location || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchLoc) return false;
    }
    if (filterVerifiedOnly && !s.is_verified) return false;
    return true;
  });

  const handleRequestVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    requestStoreVerification(selectedStore.id, {
      cnpj,
      company_name: companyName,
      website,
    });
    setIsVerificationModalOpen(false);
    setCnpj('');
    setCompanyName('');
    setWebsite('');
  };

  // If a specific store is selected, show its full dedicated official page
  if (selectedStore) {
    const storeProducts = products.filter((p) => p.store_id === selectedStore.id);
    const isOwner = user?.store_id === selectedStore.id || user?.id === selectedStore.owner_id;

    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Back Button in Pill Style */}
        <button
          onClick={() => setSelectedStore(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para todas as lojas</span>
        </button>

        {/* Store Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-900/60 shadow-2xl">
          <div className="h-48 sm:h-64 w-full bg-zinc-950 relative overflow-hidden">
            <img
              src={selectedStore.banner_url || 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80'}
              alt={selectedStore.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          </div>

          <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-950 border-2 border-red-500 overflow-hidden shadow-2xl shrink-0">
                <img
                  src={selectedStore.logo_url}
                  alt={selectedStore.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {selectedStore.name}
                  </h1>
                  {selectedStore.is_verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-bold border border-red-500/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                      <span>Loja Oficial Verificada</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                  <span>{selectedStore.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-zinc-500">
                    <MapPin className="w-3 h-3" />
                    {selectedStore.location || 'Brasil'}
                  </span>
                </p>
              </div>
            </div>

            {/* Owner Actions / Verification CTA */}
            {isOwner && (
              <div className="flex items-center gap-2">
                {!selectedStore.is_verified && selectedStore.verification_status !== 'pending' && (
                  <button
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-red-950/50 hover:scale-105"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Solicitar Verificação</span>
                  </button>
                )}
                {selectedStore.verification_status === 'pending' && (
                  <span className="px-4 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-400" />
                    <span>Verificação em análise pela equipe</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="px-6 pb-6 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 leading-relaxed max-w-3xl">
            <p>{selectedStore.description}</p>
          </div>
        </div>

        {/* Catalog of Products */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-red-400" />
              <span>Catálogo Oficial da Loja</span>
              <span className="text-xs text-zinc-500">({storeProducts.length} itens cadastrados)</span>
            </h3>
          </div>

          {storeProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {storeProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center text-xs text-zinc-400 space-y-2">
              <StoreIcon className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="font-semibold text-zinc-300">Esta loja ainda não possui produtos ativos no momento.</p>
              <p className="text-zinc-500">Novos lotes de equipamentos serão disponibilizados em breve.</p>
            </div>
          )}
        </div>

        {/* Verification Request Modal */}
        {isVerificationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Solicitar Selo Oficial</span>
                </h4>
                <button onClick={() => setIsVerificationModalOpen(false)} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Para proteção dos atletas, todas as marcas parceiras passam por validação cadastral e de conformidade fiscal.
              </p>

              <form onSubmit={handleRequestVerificationSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    CNPJ DA EMPRESA
                  </label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    RAZÃO SOCIAL
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome Empresarial Ltda"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    SITE OFICIAL / INSTAGRAM
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://suamarca.com.br"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVerificationModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md shadow-red-950/50"
                  >
                    Enviar Solicitação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">
            <StoreIcon className="w-3.5 h-3.5" />
            <span>Diretório de Lojas & Marcas Oficiais</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Lojas Parceiras
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Fabricantes e revendedores oficiais credenciados com garantia de procedência, nota fiscal e estoque validado.
          </p>
        </div>

        <button
          onClick={() => {
            if (isVisitor) setAuthModalOpen(true);
            else setCreateStoreModalOpen(true);
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Minha Loja</span>
        </button>
      </div>

      {/* Filter and Search Bar in Capsule Dock Style */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/70 p-2.5 rounded-2xl border border-zinc-800/80 backdrop-blur-md text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por marca (ex: New Balance, Puma, Adidas, Trek)..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 text-xs text-white rounded-full border border-zinc-800 focus:border-red-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-950/80 px-3 py-1.5 rounded-full border border-zinc-800">
              {filteredStores.length} {filteredStores.length === 1 ? 'loja encontrada' : 'lojas credenciadas'}
            </span>

            <label className="flex items-center gap-2 text-xs font-medium text-red-400 cursor-pointer select-none px-3 py-1.5 rounded-full bg-zinc-950/60 border border-zinc-800 hover:border-red-500/30 transition-colors">
              <input
                type="checkbox"
                checked={filterVerifiedOnly}
                onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                className="rounded border-zinc-800 text-red-600 focus:ring-red-500 bg-zinc-900"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Selo Verificado</span>
            </label>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition-all text-xs ${
                  isActive
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/50 scale-105'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stores Directory Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map((store) => {
          const storeProds = products.filter((p) => p.store_id === store.id);
          return (
            <div
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className="group bg-zinc-900/60 hover:bg-zinc-900 rounded-3xl border border-zinc-800/80 hover:border-red-500/40 shadow-xl shadow-black/50 hover:shadow-red-950/20 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Banner & Logo */}
                <div className="h-32 bg-zinc-950 relative overflow-hidden">
                  <img
                    src={store.banner_url}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                  
                  {/* Verified Badge */}
                  {store.is_verified && (
                    <div className="absolute top-3 right-3 bg-zinc-950/90 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-md">
                      <ShieldCheck className="w-3 h-3 text-red-500" />
                      <span>Verificado</span>
                    </div>
                  )}
                </div>

                <div className="p-5 pt-0 relative z-10 space-y-3">
                  <div className="flex items-end gap-3.5 -mt-8">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border-2 border-red-500 overflow-hidden shadow-xl shrink-0">
                      <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white group-hover:text-red-400 transition-colors flex items-center gap-1">
                        {store.name}
                      </h3>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{store.category}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {store.location || 'Brasil'}
                    </span>
                    <span>•</span>
                    <span>{storeProds.length} equipamentos cadastrados</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-xs">
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <span>Ver catálogo oficial</span>
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
