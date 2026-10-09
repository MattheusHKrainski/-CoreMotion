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
  Layers,
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
        return 'Seminovo';
      case 'usado_excelente':
        return 'Excelente';
      case 'usado_bom':
        return 'Bom Estado';
      default:
        return cond;
    }
  };

  const isB2C = product.product_type === 'b2c';

  return (
    <div className="group relative bg-zinc-900/60 hover:bg-zinc-900/90 rounded-2xl border border-zinc-800/80 hover:border-red-500/40 shadow-xl shadow-black/50 hover:shadow-red-950/20 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Image Container with Floating Pill Badges */}
      <div
        onClick={() => onSelect && onSelect(product)}
        className="relative aspect-square w-full bg-zinc-950/80 overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'}
          alt={product.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges (Pills) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {isB2C ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-950/90 text-red-400 text-[10px] font-semibold tracking-wide uppercase border border-red-500/30 backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-red-500" />
              <span>Loja Oficial</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-950/90 text-zinc-300 text-[10px] font-medium tracking-wide uppercase border border-zinc-800 backdrop-blur-md">
              <Layers className="w-3 h-3 text-zinc-400" />
              <span>Atleta C2C</span>
            </span>
          )}

          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/80 text-zinc-400 text-[10px] font-medium uppercase backdrop-blur-md border border-zinc-800/80">
            {getConditionLabel(product.condition)}
          </span>
        </div>

        {/* Favorite Button (Pill circular) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isVisitor) {
              setAuthModalOpen(true);
            } else {
              toggleFavorite(product.id);
            }
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFav
              ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
              : 'bg-zinc-950/70 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
          }`}
          title="Salvar nos Favoritos"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Badge */}
        {product.original_price && product.original_price > product.price && (
          <div className="absolute bottom-3 left-3 bg-red-950/90 text-red-400 border border-red-700/80 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight backdrop-blur-md">
            -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Sport Tag */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5 font-medium tracking-wide uppercase">
            <span className="text-zinc-400">{product.sport}</span>
            <span className="text-zinc-600">•</span>
            <span className="truncate">{product.category}</span>
          </div>

          {/* Title */}
          <h4
            onClick={() => onSelect && onSelect(product)}
            className="text-xs sm:text-[13px] font-semibold text-zinc-100 group-hover:text-red-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.title}
          </h4>

          {/* Seller / Store info */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-2.5">
            {product.store_name ? (
              <span className="font-medium text-zinc-300 flex items-center gap-1 truncate">
                {product.store_name}
                {product.is_verified_store && (
                  <ShieldCheck className="w-3 h-3 text-red-500 shrink-0" />
                )}
              </span>
            ) : (
              <span className="text-zinc-400 truncate flex items-center gap-1">
                Atleta: {product.seller_name}
              </span>
            )}
            {product.location && (
              <>
                <span className="text-zinc-700">•</span>
                <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 truncate">
                  <MapPin className="w-2.5 h-2.5 text-zinc-500" />
                  {product.location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pricing & CTA Capsule Buttons */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-end justify-between gap-2">
          <div>
            {product.original_price && product.original_price > product.price && (
              <span className="text-[10px] text-zinc-500 line-through block -mb-0.5">
                {formatPrice(product.original_price)}
              </span>
            )}
            <span className="text-sm sm:text-[15px] font-extrabold text-white tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all hover:scale-105 active:scale-95"
              title="Adicionar ao Carrinho"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) {
                  onSelect(product);
                } else {
                  addToCart(product, 1);
                  setCheckoutOpen(true);
                }
              }}
              className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-red-950/40 hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <span>Ver mais</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
