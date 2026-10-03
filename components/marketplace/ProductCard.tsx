// ============================================================================
// CORE MOTIOM — CARD DE PRODUTO
// Miniatura com badges (Oficial/C2C/condição), favorito, preço e CTAs
// de compra rápida. Usado na Home, Marketplace e página de Loja.
// ============================================================================

'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { useCoreMotiom } from '@/lib/store';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const { addToCart, setCheckoutOpen, favorites, toggleFavorite, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const isFav = favorites.includes(product.id);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const getConditionLabel = (cond: Product['condition']) => {
    switch (cond) {
      case 'novo':
        return 'Novo';
      case 'como_novo':
        return 'Como Novo';
      case 'usado_excelente':
        return 'Excelente';
      case 'usado_bom':
        return 'Bom Estado';
      default:
        return cond;
    }
  };

  return (
    <div className="group relative bg-[#12151C] rounded-xl border border-[#232836] hover:border-red-500/40 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      
      {/* Image container */}
      <div
        onClick={() => onSelect && onSelect(product)}
        className="relative aspect-square w-full bg-[#0E1017] overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.product_type === 'b2c' && product.is_verified_store && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#12151C]/90 text-red-400 text-[10px] font-semibold tracking-wide uppercase border border-red-500/30 backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-red-400" />
              <span>Oficial</span>
            </span>
          )}

          {product.product_type === 'c2c' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181C25]/90 text-[#CBD5E1] text-[10px] font-medium tracking-wide uppercase border border-[#2B3545] backdrop-blur-md">
              <span>C2C</span>
            </span>
          )}

          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#0B0D11]/80 text-[#94A3B8] text-[9px] font-medium uppercase backdrop-blur-md border border-[#232836]">
            {getConditionLabel(product.condition)}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isVisitor) {
              setAuthModalOpen(true);
            } else {
              toggleFavorite(product.id);
            }
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md transition-all z-10 ${
            isFav
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-[#0E1017]/80 text-[#94A3B8] hover:text-white hover:bg-[#181C25] border border-[#232836]'
          }`}
          title="Salvar nos Favoritos"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Discount badge */}
        {product.original_price && product.original_price > product.price && (
          <div className="absolute bottom-2.5 left-2.5 bg-red-950/90 text-red-400 border border-red-800/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
            -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Sport */}
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
            <span className="font-medium text-[#94A3B8]">{product.sport}</span>
            <span className="truncate">{product.category}</span>
          </div>

          {/* Title */}
          <h4
            onClick={() => onSelect && onSelect(product)}
            className="text-xs sm:text-[13px] font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.title}
          </h4>

          {/* Seller / Store info */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] mt-2">
            {product.store_name ? (
              <span className="font-medium text-[#CBD5E1] flex items-center gap-1 truncate">
                {product.store_name}
                {product.is_verified_store && (
                  <ShieldCheck className="w-3 h-3 text-red-400 shrink-0" />
                )}
              </span>
            ) : (
              <span className="text-[#94A3B8] truncate flex items-center gap-1">
                Atleta: {product.seller_name}
              </span>
            )}
            {product.location && (
              <>
                <span className="text-[#334155]">•</span>
                <span className="text-[10px] text-[#64748B] flex items-center gap-0.5 truncate">
                  <MapPin className="w-2.5 h-2.5 text-[#64748B]" />
                  {product.location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2.5 border-t border-[#1E232F] flex items-end justify-between gap-2">
          <div>
            {product.original_price && product.original_price > product.price && (
              <span className="text-[10px] text-[#64748B] line-through block -mb-0.5">
                {formatPrice(product.original_price)}
              </span>
            )}
            <span className="text-sm sm:text-[15px] font-bold text-white tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="p-1.5 rounded-lg bg-[#181C25] hover:bg-[#202634] text-[#94A3B8] hover:text-white border border-[#232836] transition-colors"
              title="Adicionar ao Carrinho"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
                setCheckoutOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-1"
            >
              <span>Comprar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

