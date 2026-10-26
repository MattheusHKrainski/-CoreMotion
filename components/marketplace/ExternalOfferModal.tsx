'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Copy, ExternalLink, Pencil, Store, Ticket, Trash2, X } from 'lucide-react';
import { ExternalOffer } from '@/lib/types';

interface ExternalOfferModalProps {
  offer: ExternalOffer | null;
  onClose: () => void;
  canManage?: boolean;
  onEditOffer?: (offer: ExternalOffer) => void;
  onDeleteOffer?: (offer: ExternalOffer) => void;
}

export default function ExternalOfferModal({
  offer,
  onClose,
  canManage = false,
  onEditOffer,
  onDeleteOffer,
}: ExternalOfferModalProps) {
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!offer) return null;

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const destinationHost = (() => {
    try {
      return new URL(offer.source_url).hostname.replace(/^www\./, '');
    } catch {
      return offer.store_name;
    }
  })();

  const handleCopyCoupon = async () => {
    if (!offer.coupon_code) return;
    try {
      await navigator.clipboard.writeText(offer.coupon_code);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2500);
    } catch {
      // ignore clipboard restriction
    }
  };

  const handleAction = () => {
    if (offer.is_demo) return;
    window.open(offer.source_url, '_blank', 'noopener,noreferrer');
  };

  const resolvedSrc = imgError ? '/offers/gps-ciclocomputador-bike.jpg' : offer.image_url;
  const isUnoptimized = !resolvedSrc.startsWith('/');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes da oferta"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-700/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-950">
          <Image
            src={resolvedSrc}
            alt={offer.title}
            fill
            unoptimized={isUnoptimized}
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-200 bg-zinc-800 px-2.5 py-1 rounded-full">
              <Store className="w-3.5 h-3.5 text-red-400" />
              {offer.store_name}
            </span>
            <span>
              {offer.sport} • {offer.category}
            </span>
          </div>

          <h2 className="text-xl font-black text-white leading-tight">{offer.title}</h2>
          <p className="text-sm text-zinc-300 leading-relaxed">{offer.description}</p>
        </div>

        <div className="flex items-baseline justify-between gap-2 pt-3 border-t border-zinc-800">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-white">{formatPrice(offer.price)}</span>
            {offer.original_price && offer.original_price > offer.price && (
              <span className="text-sm text-zinc-500 line-through">
                {formatPrice(offer.original_price)}
              </span>
            )}
          </div>
          {!offer.is_demo && (
            <span className="text-[11px] text-zinc-400 truncate max-w-[190px]" title={offer.source_url}>
              Destino: {destinationHost}
            </span>
          )}
        </div>

        {offer.coupon_code && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-dashed border-emerald-500/40">
            <div className="flex items-center gap-2 text-xs">
              <Ticket className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-zinc-300">
                Cupom disponível:{' '}
                <strong className="font-mono text-emerald-300 tracking-wider">{offer.coupon_code}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCoupon}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 text-xs font-bold transition-colors"
            >
              {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCoupon ? 'Copiado!' : 'Copiar cupom'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleAction}
          className="w-full py-3.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-950/50"
        >
          <span>Ir para oferta em {offer.store_name}</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
          Você será redirecionado em nova aba para a página da promoção na loja externa. Preço, frete e estoque são confirmados no site de destino.
        </p>

        {canManage && (onEditOffer || onDeleteOffer) && (
          <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Gestão rápida Admin
            </span>
            <div className="flex items-center gap-2">
              {onEditOffer && (
                <button
                  type="button"
                  onClick={() => {
                    const target = offer;
                    onClose();
                    onEditOffer(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-400" />
                  Editar oferta
                </button>
              )}
              {onDeleteOffer && (
                <button
                  type="button"
                  onClick={() => {
                    const target = offer;
                    onClose();
                    onDeleteOffer(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
