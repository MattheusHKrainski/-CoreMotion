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
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [cnpj, setCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');

  // Filter stores
  const filteredStores = stores.filter((s) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchCat = s.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedStore(null)}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para todas as lojas</span>
        </button>

        {/* Store Hero Banner */}
        <div className="relative rounded-xl overflow-hidden border border-[#232836] bg-[#12151C]">
          <div className="h-48 sm:h-64 w-full bg-[#0E1017] relative overflow-hidden">
            <img
              src={selectedStore.banner_url || 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80'}
              alt={selectedStore.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12151C] via-black/50 to-transparent"></div>
          </div>

          <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#0E1017] border-2 border-red-500 overflow-hidden shadow-xl shrink-0">
                <img
                  src={selectedStore.logo_url}
                  alt={selectedStore.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedStore.name}
                  </h1>
                  {selectedStore.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[11px] font-medium border border-red-500/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                      <span>Verificado</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#94A3B8] flex items-center gap-2">
                  <span>{selectedStore.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#64748B]">
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
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Solicitar Verificação</span>
                  </button>
                )}
                {selectedStore.verification_status === 'pending' && (
                  <span className="px-3 py-1.5 bg-[#181C25] text-[#CBD5E1] border border-[#232836] rounded-lg text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Verificação em análise</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="px-6 pb-6 pt-2 border-t border-[#1E232F] text-xs text-[#94A3B8] leading-relaxed max-w-3xl">
            <p>{selectedStore.description}</p>
          </div>
        </div>

        {/* Catalog of Products */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#1E232F] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Catálogo da Loja</span>
              <span className="text-xs text-[#64748B]">({storeProducts.length} itens cadastrados)</span>
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
            <div className="bg-[#12151C] border border-[#232836] rounded-xl p-8 text-center text-xs text-[#94A3B8]">
              Esta loja ainda não possui produtos ativos no momento.
            </div>
          )}
        </div>

        {/* Verification Request Modal */}
        {isVerificationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#12151C] rounded-xl border border-[#232836] p-6 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
                <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Solicitar Selo Oficial</span>
                </h4>
                <button onClick={() => setIsVerificationModalOpen(false)}>
                  <span className="text-[#94A3B8] hover:text-white">✕</span>
                </button>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Para proteção dos atletas, todas as lojas oficiais passam por validação cadastral e de conformidade fiscal.
              </p>

              <form onSubmit={handleRequestVerificationSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">
                    CNPJ DA EMPRESA
                  </label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">
                    RAZÃO SOCIAL
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome Empresarial Ltda"
                    className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">
                    SITE OFICIAL / INSTAGRAM
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://suamarca.com.br"
                    className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVerificationModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-[#181C25] text-[#94A3B8] font-medium hover:bg-[#202634]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold shadow-sm"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E232F]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
            <StoreIcon className="w-3.5 h-3.5" />
            <span>Diretório de Lojas & Marcas Oficiais</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Lojas Parceiras
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Marcas de alta performance com garantia de procedência, nota fiscal e estoque oficial.
          </p>
        </div>

        <button
          onClick={() => {
            if (isVisitor) setAuthModalOpen(true);
            else setCreateStoreModalOpen(true);
          }}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Criar Loja Oficial</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12151C] p-3 rounded-xl border border-[#232836] text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar loja por nome ou modalidade..."
            className="w-full pl-9 pr-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-red-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterVerifiedOnly}
            onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
            className="rounded border-[#2B3545] text-red-600 focus:ring-red-500 bg-[#0E1017]"
          />
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Apenas lojas verificadas</span>
        </label>
      </div>

      {/* Stores Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map((store) => {
          const storeProds = products.filter((p) => p.store_id === store.id);
          return (
            <div
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className="group bg-[#12151C] rounded-xl border border-[#232836] hover:border-red-500/40 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Banner & Logo */}
                <div className="h-32 bg-[#0E1017] relative overflow-hidden">
                  <img
                    src={store.banner_url}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12151C] via-transparent to-transparent"></div>
                  
                  {/* Verified Badge */}
                  {store.is_verified && (
                    <div className="absolute top-2.5 right-2.5 bg-[#12151C]/90 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 shadow-sm backdrop-blur-md">
                      <ShieldCheck className="w-3 h-3 text-red-400" />
                      <span>Verificado</span>
                    </div>
                  )}
                </div>

                <div className="p-4 pt-0 relative z-10 space-y-2.5">
                  <div className="flex items-end gap-3 -mt-7">
                    <div className="w-13 h-13 rounded-xl bg-[#0E1017] border-2 border-red-500 overflow-hidden shadow-lg shrink-0">
                      <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors flex items-center gap-1">
                        {store.name}
                      </h3>
                      <span className="text-[11px] text-[#94A3B8] uppercase">{store.category}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#64748B] pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {store.location || 'Brasil'}
                    </span>
                    <span>•</span>
                    <span>{storeProds.length} itens</span>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-[#1E232F] bg-[#0E1017]/60 flex items-center justify-between text-xs">
                <span className="text-red-400 font-medium flex items-center gap-1">
                  <span>Ver catálogo oficial</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#64748B] group-hover:text-red-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

