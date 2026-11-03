'use client';

import { sellerContactUrl } from '@/lib/seller-contact';
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useCoreMotiom } from '@/lib/store';
import {
  X,
  ShoppingBag,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Clock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { getConditionMeta, getDefaultUsageTime } from './ProductCard';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const {
    addToCart,
    favorites,
    toggleFavorite,
    isVisitor,
    setAuthModalOpen,
    addToast,
  } = useCoreMotiom();

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  if (!product || product.product_type !== 'c2c') return null;

  const isFav = favorites.includes(product.id);
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : ['/products/image-unavailable.svg'];

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

  const contactUrl = sellerContactUrl(product.contact_phone, product.title);

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
          
          {/* Left Column: Product Gallery */}
          <div className="space-y-4">
            {product.image_is_reference && <p className="rounded-xl border border-zinc-700 p-3 text-xs text-zinc-400">Imagem de referência do produto.</p>}
            <div className="group relative aspect-square w-full bg-[#0E1017] rounded-xl overflow-hidden border border-[#232836] shadow-inner">
              <img
                key={selectedImgIndex}
                src={galleryImages[selectedImgIndex] || galleryImages[0]}
                alt={`${product.title} - ${getAngleLabel(selectedImgIndex, product.category)}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/products/image-unavailable.svg';
                }}
                className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in"
              />

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

              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 text-white text-[11px] font-semibold backdrop-blur-md border border-white/15 shadow-md">
                <Camera className="w-3 h-3 text-red-400" />
                <span>Ângulo {selectedImgIndex + 1}/{galleryImages.length}</span>
              </div>

              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <div className="rounded-md border border-[#232836] bg-[#12151C]/90 px-2.5 py-1 text-xs font-semibold text-[#E5E7EB] shadow-md backdrop-blur-sm">
                  Anúncio de atleta
                </div>
              </div>

              <div className="absolute bottom-3 inset-x-3 text-center pointer-events-none">
                <span className="inline-block px-3 py-1 rounded-full bg-black/75 text-zinc-300 text-[11px] font-medium backdrop-blur-md border border-zinc-800/80 shadow-md">
                  {getAngleLabel(selectedImgIndex, product.category)}
                </span>
              </div>
            </div>

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
                            e.currentTarget.onerror = null;
                  e.currentTarget.src = '/products/image-unavailable.svg';
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
            <div className="space-y-2 rounded-xl border border-[#232836] bg-[#0E1017] p-4 text-xs">
              <span className="text-[#9CA3AF]">Vendido por:</span>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#232836] bg-[#181B22] font-bold text-white">
                  {product.seller_avatar ? (
                    <img src={product.seller_avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{product.seller_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-white">{product.seller_name}</h5>
                  <p className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                    <MapPin className="h-3 w-3 text-[#6B7280]" />
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
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-950/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-200">
                    <User className="h-3 w-3 text-sky-400" />
                    Equipamento de Atleta
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                      getConditionMeta(product.condition).pillClass
                    }`}
                  >
                    {getConditionMeta(product.condition).badge}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {product.title}
                </h2>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-xl bg-[#0E1017] border border-[#232836]">
                {product.original_price && product.original_price > product.price && (
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-1">
                    <span>Valor pago quando novo:</span>
                    <span className="line-through font-medium">{formatPrice(product.original_price)}</span>
                  </div>
                )}
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Ficha de Estado & Tempo de Uso */}
              {!product.image_is_reference && <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0E1017] border border-[#232836]">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    Tempo de Uso
                  </span>
                  <span className="mt-1 block text-xs font-bold text-white">
                    {product.usage_time || getDefaultUsageTime(product.condition)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0E1017] border border-[#232836]">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Estado Real
                  </span>
                  <span className="mt-1 block text-xs font-bold text-white">
                    {getConditionMeta(product.condition).detail}
                  </span>
                </div>
              </div>}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Relato do Atleta sobre Conservação e Uso
                </h4>
                <p className="text-xs text-[#D1D5DB] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#232836] space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(product, 1);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#0E1017] hover:bg-[#181B22] border border-[#232836] hover:border-[#3B4252] text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar ao Carrinho</span>
                </button>

                {contactUrl ? (
                  <a
                    href={contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Falar com o atleta pelo WhatsApp</span>
                  </a>
                ) : (
                  <span className="py-3 px-4 rounded-xl border border-zinc-700 text-zinc-400 text-xs text-center">
                    WhatsApp não informado pelo atleta
                  </span>
                )}
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
