'use client';
import { productPath } from '@/lib/commerce';

import React from 'react';
import ProductImage from '@/components/shared/ProductImage';
import { ShoppingBag, Store } from 'lucide-react';
import { ExternalOffer } from '@/lib/types';

interface ExternalOfferCardProps {
  offer: ExternalOffer;
  onSelect: (offer: ExternalOffer) => void;
}

export default function ExternalOfferCard({ offer }: ExternalOfferCardProps) {

  const select = () => window.location.assign(productPath('core', offer.id));
  const discount =
    offer.original_price && offer.original_price > offer.price
      ? Math.round(((offer.original_price - offer.price) / offer.original_price) * 100)
      : null;

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);


  return (
    <div
      onClick={() => select()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }
      }}
      className="group relative flex flex-col justify-between bg-zinc-900/70 rounded-2xl border border-zinc-800/80 overflow-hidden transition-all duration-300 hover:border-red-500/40 hover:bg-zinc-900 hover:shadow-xl hover:shadow-red-950/20 cursor-pointer"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
<ProductImage src={offer.image_url} alt={offer.title} sizes="(max-width: 640px) 100vw, 512px" />

        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[76%]">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-950/90 text-zinc-100 border border-zinc-700/80 backdrop-blur-md flex items-center gap-1">
            <Store className="w-3 h-3 text-red-400 shrink-0" />
            <span className="truncate">Fornecedor: {offer.store_name}</span>
          </span>

        </div>

        {discount && discount > 0 && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-sm">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-zinc-400 flex items-center justify-between gap-2">
            <span className="text-red-400 font-semibold">{offer.sport}</span>
            <span className="truncate">{offer.category}</span>
          </div>

          <h3 className="font-bold text-sm sm:text-base text-white line-clamp-2 leading-snug group-hover:text-red-300 transition-colors">
            {offer.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{offer.description}</p>
        </div>

        <div className="pt-2 border-t border-zinc-800/80 flex items-end justify-between gap-2">
          <div>
            {offer.original_price && offer.original_price > offer.price && (
              <span className="text-xs text-zinc-500 line-through block">
                {formatPrice(offer.original_price)}
              </span>
            )}
            <span className="text-lg font-extrabold text-white tracking-tight">
              {formatPrice(offer.price)}
            </span>
          </div>

          <button type="button" onClick={event => { event.stopPropagation(); select(); }} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"><ShoppingBag className="h-3.5 w-3.5" />Comprar</button>
        </div>
      </div>
    </div>
  );
}
