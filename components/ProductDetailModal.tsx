'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useCoreMotiom } from '@/lib/store';
import {
  X,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Truck,
  MapPin,
  Zap,
  Share2,
  Store,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenStore?: (storeId: string) => void;
}

export default function ProductDetailModal({ product, onClose, onOpenStore }: ProductDetailModalProps) {
  const {
    addToCart,
    setCheckoutOpen,
    favorites,
    toggleFavorite,
    isVisitor,
    setAuthModalOpen,
    addToast,
  } = useCoreMotiom();

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('41 BR');
  const [cep, setCep] = useState('');
  const [shippingCalculated, setShippingCalculated] = useState(false);

  if (!product) return null;

  const isFav = favorites.includes(product.id);
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'];

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link Copiado', 'Link do produto copiado para a área de transferência.', 'success');
    }
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (cep.length >= 8) {
      setShippingCalculated(true);
      addToast('Frete Calculado', 'Opções de envio disponíveis para seu endereço.', 'info');
    }
  };

  const handlePrevImage = () => {
    setSelectedImgIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImgIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const getAngleLabel = (idx: number, cat: string) => {
    if (cat === 'Calçados') {
      const shoeLabels = [
        'Perfil Lateral Externo',
        'Frontal / Superior (Cabedal & Cadarços)',
        'Traseira / Calcanhar',
        'Solado / Tração & Grip',
        'Detalhes & Textura'
      ];
      return shoeLabels[idx] || `Ângulo ${idx + 1}`;
    }
    const genericLabels = [
      'Visão Principal',
      'Ângulo Lateral / Detalhe',
      'Vista Traseira / Funcional',
      'Em Uso / Contexto',
      'Acabamento & Material'
    ];
    return genericLabels[idx] || `Foto ${idx + 1}`;
  };

  const shoeSizes = ['38 BR', '39 BR', '40 BR', '41 BR', '42 BR', '43 BR', '44 BR'];
  const apparelSizes = ['P', 'M', 'G', 'GG'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#12151C] text-white rounded-2xl border border-[#232836] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 border-b border-[#232836] flex items-center justify-between bg-[#0E1017]">
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
            <span className="font-medium">{product.sport}</span>
            <span>/</span>
            <span>{product.category}</span>
            {product.brand && (
              <>
                <span>/</span>
                <span className="text-[#D1D5DB] font-semibold">{product.brand}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#232836] rounded-lg transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#232836] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Multi-Angle Image Gallery */}
          <div className="space-y-4">
            <div className="group relative aspect-square w-full bg-[#0E1017] rounded-xl overflow-hidden border border-[#232836] shadow-inner">
              <img
                key={selectedImgIndex}
                src={galleryImages[selectedImgIndex] || galleryImages[0]}
                alt={`${product.title} - ${getAngleLabel(selectedImgIndex, product.category)}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
                }}
                className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in"
              />

              {/* Navigation Arrows for Angles */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-all opacity-80 hover:opacity-100 shadow-lg"
                    title="Ângulo Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-all opacity-80 hover:opacity-100 shadow-lg"
                    title="Próximo Ângulo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Top Angle Indicator Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 text-white text-[11px] font-semibold backdrop-blur-md border border-white/15 shadow-md">
                <Camera className="w-3 h-3 text-red-400" />
                <span>Ângulo {selectedImgIndex + 1}/{galleryImages.length}</span>
              </div>

              {/* Verified badge or C2C tag */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.is_verified_store ? (
                  <div className="bg-red-600/90 text-white border border-red-500/50 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-sm">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Loja Oficial Verificada</span>
                  </div>
                ) : (
                  <div className="bg-[#12151C]/90 text-[#E5E7EB] border border-[#232836] px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-sm shadow-md">
                    <span>Venda entre Atletas (C2C)</span>
                  </div>
                )}
              </div>

              {/* Current Angle Subtitle Pill on bottom */}
              <div className="absolute bottom-3 inset-x-3 text-center pointer-events-none">
                <span className="inline-block px-3 py-1 rounded-full bg-black/75 text-zinc-300 text-[11px] font-medium backdrop-blur-md border border-zinc-800/80 shadow-md">
                  {getAngleLabel(selectedImgIndex, product.category)}
                </span>
              </div>
            </div>

            {/* Multi-Angle Thumbnails with Active Red Indicator */}
            {galleryImages.length > 1 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium px-0.5">
                  <span>Ângulos e Detalhes ({galleryImages.length} fotos)</span>
                  <span className="text-red-400 text-[10px]">Clique para alternar</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
                  {galleryImages.map((img, idx) => {
                    const isSelected = selectedImgIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedImgIndex(idx)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 ${
                          isSelected
                            ? 'border-red-600 ring-2 ring-red-500/60 scale-105 shadow-lg shadow-red-950/40 opacity-100'
                            : 'border-[#232836] opacity-60 hover:opacity-100 hover:border-zinc-600'
                        }`}
                        title={getAngleLabel(idx, product.category)}
                      >
                        <img
                          src={img}
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-1 ring-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seller info card */}
            <div className="p-4 rounded-xl bg-[#0E1017] border border-[#232836] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Vendido e Entregue por:</span>
                {product.store_id && (
                  <button
                    onClick={() => {
                      if (product.store_id && onOpenStore) onOpenStore(product.store_id);
                    }}
                    className="text-red-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Ver Loja</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-[#181B22] border border-[#232836] overflow-hidden flex items-center justify-center font-bold text-white">
                  {product.seller_avatar ? (
                    <img src={product.seller_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{product.seller_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-white flex items-center gap-1.5">
                    {product.store_name || product.seller_name}
                    {product.is_verified_store && (
                      <span className="text-red-400 text-[11px] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verificado
                      </span>
                    )}
                  </h5>
                  <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#6B7280]" />
                    {product.location || 'Brasil'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Product Header */}
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-[#0E1017] text-[#9CA3AF] text-[11px] uppercase font-semibold tracking-wider border border-[#232836] mb-2">
                  Condição: {product.condition === 'novo' ? 'Novo (Lacrado)' : product.condition === 'como_novo' ? 'Como Novo' : 'Usado (Excelente Estado)'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {product.title}
                </h2>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-xl bg-[#0E1017] border border-[#232836]">
                {product.original_price && product.original_price > product.price && (
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF] line-through mb-0.5">
                    <span>{formatPrice(product.original_price)}</span>
                    <span className="text-red-400 no-underline text-[10px] font-bold">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}% de desconto
                    </span>
                  </div>
                )}
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {formatPrice(product.price)}
                </div>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  ou 12x de {formatPrice(product.price / 12)} sem juros no cartão
                </p>
                <div className="mt-2 text-xs text-red-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>5% de desconto à vista no PIX</span>
                </div>
              </div>

              {/* Size Selector if shoes / apparel */}
              {product.category === 'Calçados' && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-white">Selecione a Numeração (BR)</span>
                    <span className="text-[#9CA3AF] text-[11px]">Tabela de Medidas</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {shoeSizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                          selectedSize === s
                            ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950/40'
                            : 'bg-[#0E1017] border-[#232836] text-[#9CA3AF] hover:border-[#3B4252]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(product.category === 'Vestuário' || product.category === 'Roupas') && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-white">Selecione o Tamanho</span>
                    <span className="text-[#9CA3AF] text-[11px]">Guia de Caimento</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {apparelSizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                          selectedSize === s
                            ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950/40'
                            : 'bg-[#0E1017] border-[#232836] text-[#9CA3AF] hover:border-[#3B4252]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Descrição do Produto
                </h4>
                <p className="text-xs text-[#D1D5DB] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Shipping Estimator */}
              <div className="pt-3 border-t border-[#232836]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-red-400" />
                  Calcular Frete e Prazo
                </h4>
                <form onSubmit={handleCalculateShipping} className="flex gap-2">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Digite seu CEP (ex: 01310100)"
                    className="flex-1 px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E232F] hover:bg-[#2A3142] text-xs font-semibold text-white rounded-lg transition-colors border border-[#232836]"
                  >
                    Calcular
                  </button>
                </form>

                {shippingCalculated && (
                  <div className="mt-2.5 p-3 rounded-lg bg-[#0E1017] border border-[#232836] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#D1D5DB]">
                      <span>SEDEX Express (1-2 dias úteis)</span>
                      <span className="font-semibold text-white">R$ 42,50</span>
                    </div>
                    <div className="flex items-center justify-between text-[#D1D5DB]">
                      <span>PAC Padrão (4-6 dias úteis)</span>
                      <span className="font-semibold text-white">R$ 24,90</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#232836] space-y-2.5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(product, 1, selectedSize);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#0E1017] hover:bg-[#181B22] border border-[#232836] hover:border-[#3B4252] text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar ao Carrinho</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(product, 1, selectedSize);
                    onClose();
                    setCheckoutOpen(true);
                  }}
                  className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Comprar Agora</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isVisitor) setAuthModalOpen(true);
                  else toggleFavorite(product.id);
                }}
                className={`w-full py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-colors ${
                  isFav
                    ? 'bg-red-600/10 text-red-400 border-red-500/30'
                    : 'bg-[#12151C] text-[#9CA3AF] border-[#232836] hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                <span>{isFav ? 'Salvo nos Favoritos' : 'Adicionar à Lista de Desejos'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

