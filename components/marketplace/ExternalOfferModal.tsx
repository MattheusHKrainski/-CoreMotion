'use client';

import React, { useEffect, useState } from 'react';
import type { ExternalOffer } from '@/lib/types';
import { getOfferDiscountPercent } from '@/fixtures/demo-offers';
import { CheckCircle2, ExternalLink, ShieldCheck, Store, Tag, X } from 'lucide-react';

interface ExternalOfferModalProps {
  offer: ExternalOffer | null;
  onClose: () => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function ExternalOfferModal({ offer, onClose }: ExternalOfferModalProps) {
  const [partnerRedirectNotice, setPartnerRedirectNotice] = useState(false);

  useEffect(() => {
    if (!offer) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [offer, onClose]);

  useEffect(() => setPartnerRedirectNotice(false), [offer?.id]);

  if (!offer) return null;

  const discount = getOfferDiscountPercent(offer);
  const handleOpenSource = () => {
    if (offer.is_demo) {
      setPartnerRedirectNotice(true);
      return;
    }

    try {
      const url = new URL(offer.source_url);
      if (url.protocol === 'https:') window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      // Ignora endereços inválidos.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-offer-title"
        className="relative my-auto grid w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-700/80 bg-[#111318] text-white shadow-2xl md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes da oferta"
          className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/70 p-2 text-zinc-200 transition hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative min-h-64 bg-zinc-950 md:min-h-full">
          <img
            src={offer.image_url}
            alt={offer.title}
            onError={(event) => {
              event.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80';
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-black/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-100">
            <Tag className="h-3.5 w-3.5 text-red-400" />
            Oferta Parceira
          </span>
          {discount !== null && (
            <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white shadow-lg">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="space-y-2 pr-8">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <Store className="h-4 w-4 text-red-400" />
              Vendido por: <span className="text-zinc-200">{offer.store_name}</span>
            </p>
            <h2 id="external-offer-title" className="text-xl font-black leading-tight sm:text-2xl">{offer.title}</h2>
            <p className="text-xs text-zinc-500">{offer.category} · {offer.sport}</p>
          </div>

          <p className="text-sm leading-relaxed text-zinc-300">{offer.description}</p>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            {discount !== null && offer.original_price && (
              <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                <span className="line-through">{formatPrice(offer.original_price)}</span>
                <span className="font-bold text-emerald-300">-{discount}%</span>
              </div>
            )}
            <p className="text-2xl font-black text-white">{formatPrice(offer.price)}</p>
            <p className="mt-1 text-[11px] text-zinc-400">ou em até 10x sem juros na loja parceira</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-relaxed text-zinc-300">
            <div className="mb-1.5 flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              Parceiro Verificado CoreMotion
            </div>
            <p>Oferta selecionada na vitrine oficial <strong className="text-white">{offer.store_name}</strong>, com nota fiscal, garantia de fábrica e envio segurado para todo o Brasil.</p>
          </div>

          {partnerRedirectNotice && (
            <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              Oferta selecionada em {offer.store_name} com condição promocional ativa.
            </p>
          )}

          <button
            type="button"
            onClick={handleOpenSource}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
          >
            Ir para oferta na loja
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-center text-[10px] text-zinc-500">Venda e entrega realizadas diretamente pela loja parceira {offer.store_name}.</p>
        </div>
      </section>
    </div>
  );
}
