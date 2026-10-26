'use client';

import React from 'react';
import type { Product } from '@/lib/types';
import { useCoreMotiom } from '@/lib/store';
import { ArrowRight, Clock, Heart, MapPin, ShieldCheck, ShoppingBag, Sparkles, User } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function getConditionMeta(condition: Product['condition']): {
  badge: string;
  detail: string;
  pillClass: string;
  isBrandNew: boolean;
} {
  switch (condition) {
    case 'novo':
      return {
        badge: 'Novo · Sem uso',
        detail: 'Nunca usado',
        pillClass: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200',
        isBrandNew: true,
      };
    case 'como_novo':
      return {
        badge: 'Pouquíssimo uso',
        detail: 'Usado poucas vezes',
        pillClass: 'border-teal-500/40 bg-teal-950/90 text-teal-200',
        isBrandNew: false,
      };
    case 'seminovo':
      return {
        badge: 'Seminovo',
        detail: 'Já usado · Bem conservado',
        pillClass: 'border-sky-500/40 bg-sky-950/90 text-sky-200',
        isBrandNew: false,
      };
    case 'usado_excelente':
      return {
        badge: 'Usado · Ótimo estado',
        detail: 'Usado · Ótima conservação',
        pillClass: 'border-amber-500/40 bg-amber-950/90 text-amber-200',
        isBrandNew: false,
      };
    case 'usado_bom':
      return {
        badge: 'Usado · Bom estado',
        detail: 'Usado · Marcas normais de uso',
        pillClass: 'border-orange-500/40 bg-orange-950/90 text-orange-200',
        isBrandNew: false,
      };
    default:
      return {
        badge: condition,
        detail: 'Anúncio de atleta',
        pillClass: 'border-zinc-700/80 bg-black/85 text-zinc-200',
        isBrandNew: false,
      };
  }
}

export function getDefaultUsageTime(condition: Product['condition']): string {
  switch (condition) {
    case 'novo':
      return 'Zero uso (na caixa / etiqueta)';
    case 'como_novo':
      return 'Usado 2 a 4 vezes';
    case 'seminovo':
      return 'Cerca de 5 a 8 meses de uso';
    case 'usado_excelente':
      return 'Cerca de 6 meses de uso';
    case 'usado_bom':
      return 'Cerca de 9 meses de uso';
    default:
      return 'Uso pessoal';
  }
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const { addToCart, setCheckoutOpen, favorites, toggleFavorite, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const isFavorite = favorites.includes(product.id);

  if (product.product_type !== 'c2c') return null;

  const selectProduct = () => onSelect?.(product);
  const conditionMeta = getConditionMeta(product.condition);
  const usageLabel = product.usage_time || getDefaultUsageTime(product.condition);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl shadow-black/30 transition-all duration-300 hover:border-red-500/40 hover:bg-zinc-900/90">
      <button
        type="button"
        onClick={selectProduct}
        className="relative aspect-[5/4] w-full overflow-hidden bg-zinc-950/80 text-left"
        aria-label={`Ver anúncio de atleta: ${product.title}`}
      >
        <img
          src={product.images[0] || '/products/image-unavailable.svg'}
          alt={product.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/products/image-unavailable.svg';
          }}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Origem clara: vendido por atleta pessoa física */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-zinc-700/90 bg-zinc-950/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-100 backdrop-blur">
          <User className="h-3 w-3 text-sky-400" />
          De Atleta
        </span>

        {/* Estado claro: Novo sem uso vs Já usado */}
        <span
          className={`absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold backdrop-blur ${conditionMeta.pillClass}`}
        >
          {conditionMeta.isBrandNew ? (
            <Sparkles className="h-3 w-3 shrink-0" />
          ) : (
            <Clock className="h-3 w-3 shrink-0" />
          )}
          {conditionMeta.badge}
        </span>
      </button>

      <button
        type="button"
        onClick={() => (isVisitor ? setAuthModalOpen(true) : toggleFavorite(product.id))}
        aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur transition ${
          isFavorite ? 'bg-red-600 text-white' : 'border border-zinc-700 bg-zinc-950/80 text-zinc-300 hover:text-white'
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            <span className="truncate text-zinc-300">{product.sport}</span>
            <span className="truncate">{product.category}</span>
          </div>

          <button
            type="button"
            onClick={selectProduct}
            className="line-clamp-2 min-h-10 text-left text-sm font-bold leading-snug text-zinc-100 transition hover:text-red-300"
          >
            {product.title}
          </button>

          {/* Tempo de uso explícito logo no card */}
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
            <Clock className="h-3 w-3 shrink-0 text-red-400" />
            <span className="truncate">{usageLabel}</span>
          </div>

          {/* Trecho realista do relato do dono */}
          <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
            {product.description}
          </p>

          {/* Atleta anunciante + cidade */}
          <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-200">
                {product.seller_name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{product.seller_name}</span>
            </div>
            {product.location && (
              <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-zinc-500">
                <MapPin className="h-2.5 w-2.5" />
                {product.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 border-t border-zinc-800/80 pt-3">
          <div>
            {product.original_price && product.original_price > product.price ? (
              <span className="mb-0.5 block text-[10px] text-zinc-500">
                Novo custou {formatPrice(product.original_price)}
              </span>
            ) : (
              <span className="mb-0.5 flex items-center gap-1 text-[10px] text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                Compra Garantida
              </span>
            )}
            <span className="text-lg font-extrabold tracking-tight text-white">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              title="Adicionar ao carrinho"
              className="rounded-full border border-zinc-700/60 bg-zinc-800/80 p-2 text-zinc-300 transition hover:scale-105 hover:bg-zinc-800 hover:text-white"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelect) onSelect(product);
                else {
                  addToCart(product, 1);
                  setCheckoutOpen(true);
                }
              }}
              className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-red-950/40 transition hover:scale-105 hover:bg-red-500"
            >
              Ver detalhes
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
