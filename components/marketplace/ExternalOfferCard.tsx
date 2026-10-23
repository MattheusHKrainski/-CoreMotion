'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Store, Ticket } from 'lucide-react';
import { ExternalOffer } from '@/lib/types';

interface ExternalOfferCardProps {
  offer: ExternalOffer;
  onSelect: (offer: ExternalOffer) => void;
}

export default function ExternalOfferCard({ offer, onSelect }: ExternalOfferCardProps) {
  const [imgError, setImgError] = useState(false);

  const discount =
    offer.original_price && offer.original_price > offer.price
      ? Math.round(((offer.original_price - offer.price) / offer.original_price) * 100)
      : null;

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const resolvedSrc = imgError ? '/offers/gps-ciclocomputador-bike.jpg' : offer.image_url;
  const isUnoptimized = !resolvedSrc.startsWith('/');

  return (
    <div
      onClick={() => onSelect(offer)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(offer);
        }
      }}
      className="group relative flex flex-col justify-between bg-zinc-900/70 rounded-2xl border border-zinc-800/80 overflow-hidden transition-all duration-300 hover:border-red-500/40 hover:bg-zinc-900 hover:shadow-xl hover:shadow-red-950/20 cursor-pointer"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
        <Image
          src={resolvedSrc}
          alt={offer.title}
          fill
          unoptimized={isUnoptimized}
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[76%]">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-950/90 text-zinc-100 border border-zinc-700/80 backdrop-blur-md flex items-center gap-1">
            <Store className="w-3 h-3 text-red-400 shrink-0" />
            <span className="truncate">{offer.store_name}</span>
          </span>
          {offer.coupon_code && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
              <Ticket className="w-2.5 h-2.5" />
              {offer.coupon_code}
            </span>
          )}
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

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shadow-md shadow-red-950/40">
            <span>Ver oferta</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
