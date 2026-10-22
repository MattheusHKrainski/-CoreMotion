'use client';

import React from 'react';
import type { Product } from '@/lib/types';
import { useCoreMotiom } from '@/lib/store';
import { ArrowRight, Heart, MapPin, ShieldCheck, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getConditionLabel(condition: Product['condition']): string {
  switch (condition) {
    case 'novo': return 'Novo';
    case 'como_novo': return 'Como novo';
    case 'seminovo': return 'Seminovo';
    case 'usado_excelente': return 'Excelente';
    case 'usado_bom': return 'Bom estado';
    default: return condition;
  }
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const { addToCart, setCheckoutOpen, favorites, toggleFavorite, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const isFavorite = favorites.includes(product.id);

  if (product.product_type !== 'c2c') return null;

  const selectProduct = () => onSelect?.(product);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl shadow-black/30 transition-all duration-300 hover:border-red-500/40 hover:bg-zinc-900/90">
      <button type="button" onClick={selectProduct} className="relative aspect-[5/4] w-full overflow-hidden bg-zinc-950/80 text-left" aria-label={`Ver anúncio: ${product.title}`}>
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'}
          alt={product.title}
          onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'; }}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-950/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-200 backdrop-blur">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          Compra Garantida
        </span>
        <span className="absolute bottom-3 left-3 rounded-full border border-zinc-700/70 bg-black/80 px-2.5 py-1 text-[10px] font-medium text-zinc-200 backdrop-blur">{getConditionLabel(product.condition)}</span>
        {product.original_price && product.original_price > product.price && (
          <span className="absolute bottom-3 right-3 rounded-full border border-red-700/70 bg-red-950/90 px-2.5 py-1 text-[10px] font-bold text-red-200 backdrop-blur">
            -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => isVisitor ? setAuthModalOpen(true) : toggleFavorite(product.id)}
        aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur transition ${isFavorite ? 'bg-red-600 text-white' : 'border border-zinc-700 bg-zinc-950/80 text-zinc-300 hover:text-white'}`}
      >
        <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            <span className="truncate text-zinc-300">{product.sport}</span>
            <span className="truncate">{product.category}</span>
          </div>
          <button type="button" onClick={selectProduct} className="line-clamp-2 min-h-10 text-left text-sm font-bold leading-snug text-zinc-100 transition hover:text-red-300">
            {product.title}
          </button>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="truncate">Vendido por {product.seller_name}</span>
            {product.location && <><span className="text-zinc-700">·</span><span className="flex shrink-0 items-center gap-0.5 text-[10px] text-zinc-500"><MapPin className="h-2.5 w-2.5" />{product.location}</span></>}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 border-t border-zinc-800/80 pt-3">
          <div>
            {product.original_price && product.original_price > product.price && <span className="mb-0.5 block text-[10px] text-zinc-500 line-through">{formatPrice(product.original_price)}</span>}
            <span className="text-base font-extrabold tracking-tight text-white">{formatPrice(product.price)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => addToCart(product, 1)} title="Adicionar ao carrinho" className="rounded-full border border-zinc-700/60 bg-zinc-800/80 p-2 text-zinc-300 transition hover:scale-105 hover:bg-zinc-800 hover:text-white">
              <ShoppingBag className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelect) onSelect(product);
                else { addToCart(product, 1); setCheckoutOpen(true); }
              }}
              className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-red-950/40 transition hover:scale-105 hover:bg-red-500"
            >
              Ver anúncio
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
