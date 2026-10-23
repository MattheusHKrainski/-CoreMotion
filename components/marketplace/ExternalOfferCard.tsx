'use client';

import React from 'react';
import type { ExternalOffer } from '@/lib/types';
import { getOfferDiscountPercent } from '@/fixtures/demo-offers';
import { ArrowUpRight, Sparkles, Tag } from 'lucide-react';

interface ExternalOfferCardProps {
  offer: ExternalOffer;
  onSelect?: (offer: ExternalOffer) => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function ExternalOfferCard({ offer, onSelect }: ExternalOfferCardProps) {
  const discount = getOfferDiscountPercent(offer);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl shadow-black/30 transition-all duration-300 hover:border-red-500/40 hover:bg-zinc-900/90">
      <button
        type="button"
        onClick={() => onSelect?.(offer)}
        className="relative aspect-[5/4] w-full overflow-hidden bg-zinc-950 text-left"
        aria-label={`Ver oferta: ${offer.title}`}
      >
        <img
          src={offer.image_url}
          alt={offer.title}
          onError={(event) => {
            event.currentTarget.src = '/products/olympikus-corre-3.jpg';
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-zinc-950/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-200 backdrop-blur">
          <Tag className="h-3 w-3 text-red-400" />
          Oferta · Loja Oficial
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-950/90 px-2.5 py-1 text-[10px] font-bold text-emerald-200 backdrop-blur">
          <Sparkles className="h-2.5 w-2.5" />
          Novo · Lacrado
        </span>
        {discount !== null && (
          <span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-black text-white shadow-md">
            -{discount}% OFF
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            <span className="truncate text-zinc-300">{offer.store_name}</span>
            <span className="shrink-0">{offer.sport}</span>
          </div>
          <div>
            <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-white group-hover:text-red-300">
              {offer.title}
            </h3>
            <p className="mt-1 text-[11px] text-zinc-500">Produto novo de loja · Nota fiscal e garantia</p>
          </div>
          <div className="flex min-h-12 items-end justify-between gap-2 border-t border-zinc-800/80 pt-3">
            <div>
              {discount !== null && offer.original_price && (
                <span className="block text-[11px] text-zinc-500 line-through">{formatPrice(offer.original_price)}</span>
              )}
              <span className="text-lg font-black tracking-tight text-white">{formatPrice(offer.price)}</span>
            </div>
            {discount !== null && (
              <span className="mb-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect?.(offer)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-950/30 transition hover:bg-red-500"
        >
          Ver oferta
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
