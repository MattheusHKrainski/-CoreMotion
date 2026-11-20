'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, ShoppingBag, Truck } from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import { useCommerce } from '@/lib/commerce-store';
import { money, retailPriceCents } from '@/lib/commerce';
import ProductImage from '@/components/shared/ProductImage';
import { sellerContactUrl } from '@/lib/seller-contact';
import AuthModal from '@/components/auth/AuthModal';
import ReportButton from '@/components/shared/ReportButton';
import { getConditionMeta } from '@/components/marketplace/ProductCard';
import { getSupabaseClient } from '@/services/supabaseClient';

export default function ProductPage({ kind, id }: { kind: string; id: string }) {
  const { products, activeOffers, favorites, toggleFavorite, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const cart = useCommerce();
  const [index, setIndex] = useState(0), [variant, setVariant] = useState(''), [notice, setNotice] = useState('');
  const [remote, setRemote] = useState<{ title: string; description: string; price: number; original_price?: number; images?: string[]; image_url?: string; store_name?: string; category: string; sport: string; product_type?: string; status?: string; is_active?: boolean; seller_name?: string; contact_phone?: string; condition?: string; location?: string; image_is_reference?: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);
  React.useEffect(() => { let alive = true; const sb = getSupabaseClient(); if (!sb) { setLoaded(true); return; } if (kind !== 'core' && kind !== 'athlete') { setLoaded(true); return; } void sb.from(kind === 'core' ? 'external_offers' : 'products').select('*').eq('id',id).maybeSingle().then(({data}) => { if (alive) { setRemote(data); setLoaded(true); } }); return () => { alive = false; }; }, [kind,id]);
  const local = kind === 'core' ? activeOffers.find(item => item.id === id) : kind === 'athlete' ? products.find(item => item.id === id && item.product_type === 'c2c') : null;
  const item = local || remote;
  const core = kind === 'core';
  const available = item && (core ? ('is_active' in item && item.is_active !== false) : ('product_type' in item && item.product_type === 'c2c' && 'status' in item && item.status === 'active'));
  if (!item || !available) return <main className="mx-auto max-w-5xl p-8"><Link href="/" className="text-red-400">← Voltar ao CoreShop</Link><h1 className="mt-10 text-2xl font-black">{loaded ? 'Produto indisponível' : 'Carregando produto…'}</h1><p className="mt-3 text-zinc-400">{loaded ? 'Não foi possível encontrar um anúncio ativo. Confira o catálogo ou tente novamente.' : 'Consultando o catálogo.'}</p></main>;
  const gallery: string[] = ('images' in item && item.images?.length ? item.images : ['image_url' in item ? item.image_url || '' : '']).filter(Boolean);
  const needsVariant = ['Calçados','Vestuário','Roupas','Lutas','Artes Marciais'].includes(item.category);
  const contact = !core && 'contact_phone' in item ? sellerContactUrl(item.contact_phone, item.title) : null;
  return <div className="min-h-screen bg-zinc-950 text-white">
    <header className="border-b border-zinc-800 px-5 py-5"><nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><Link href="/" className="inline-flex items-center gap-2 font-black"><ArrowLeft className="h-4 w-4" />CoreShop</Link><div className="flex gap-5 text-xs"><Link href="/compras">Carrinho CoreMotion ({cart.count})</Link><Link href="/pedidos">Meus pedidos</Link></div></nav></header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8"><p className="mb-6 text-xs text-zinc-500">CoreShop / {core ? 'CoreMotion' : 'De atletas'} / {item.sport} / {item.category}</p>
      <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section aria-label="Fotos do produto" className="space-y-3"><div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100"><ProductImage key={gallery[index]} src={gallery[index] || ''} alt={`${item.title} — foto ${index + 1}`} sizes="(max-width: 1024px) 95vw, 720px" /></div><div className="flex gap-3 overflow-x-auto">{gallery.map((src,i) => <button key={`${src}-${i}`} type="button" aria-label={`Ver foto ${i+1}`} aria-pressed={index===i} onClick={() => setIndex(i)} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-100 ${index===i ? 'border-red-500' : 'border-zinc-700'}`}><ProductImage src={src} alt={`Miniatura ${i+1}`} sizes="80px" /></button>)}</div>{'image_is_reference' in item && item.image_is_reference && <p className="text-xs text-zinc-500">Imagem de referência. Solicite fotos atuais ao anunciante.</p>}
          <details open className="rounded-2xl border border-zinc-800 p-5"><summary className="cursor-pointer font-bold">Informações do produto</summary><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{item.description}</p></details>
        </section>
        <section className="space-y-6 lg:sticky lg:top-6"><div className="flex items-start justify-between gap-4"><h1 className="text-2xl font-black sm:text-3xl">{item.title}</h1>{!core && <button type="button" aria-label="Salvar produto" onClick={() => isVisitor ? setAuthModalOpen(true) : toggleFavorite(id)} className="rounded-full border border-zinc-700 p-3"><Heart className={`h-5 w-5 ${favorites.includes(id) ? 'fill-red-500 text-red-500' : ''}`} /></button>}</div>
          <div>{item.original_price && item.original_price>item.price ? <p className="text-sm text-zinc-500 line-through">{money(retailPriceCents(item.original_price))}</p> : null}<p className="mt-1 text-3xl font-black">{money(retailPriceCents(item.price))}</p><p className="mt-2 text-xs text-zinc-500">{core ? 'Preço do catálogo. Frete ainda não cotado; pagamento desativado.' : 'Negocie preço e entrega diretamente com o anunciante.'}</p></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm"><p>Vendido por <strong>{core ? 'CoreMotion' : 'seller_name' in item ? item.seller_name : 'Atleta'}</strong></p>{core ? <><p className="mt-2 text-zinc-400">Fornecedor de origem: <strong>{'store_name' in item ? item.store_name : ''}</strong></p><p className="mt-2 text-xs text-amber-300">Operação em preparação. Acordo comercial, estoque e envio ainda não confirmados com o fornecedor.</p></> : <><p className="mt-2 text-zinc-400">{'condition' in item && item.condition ? getConditionMeta(item.condition as Parameters<typeof getConditionMeta>[0]).badge : ''}</p><p className="mt-1 text-zinc-400">{'location' in item ? item.location : ''}</p></>}</div>
          {core ? <><label className="block text-sm">{needsVariant ? 'Tamanho / variante desejada (obrigatório)' : 'Variante desejada (opcional)'}<input maxLength={120} value={variant} onChange={event => setVariant(event.target.value)} placeholder={needsVariant ? 'Ex.: tamanho 40 — sujeito à confirmação' : 'Ex.: cor ou modelo'} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3" /></label><button type="button" disabled={needsVariant && !variant.trim()} onClick={() => { cart.add(id,variant.trim()); setNotice('Adicionado ao carrinho CoreMotion. A compra ainda não foi concluída.'); }} className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-5 py-4 text-sm font-bold disabled:opacity-40"><ShoppingBag className="h-5 w-5" />Adicionar ao carrinho</button><button type="button" disabled={needsVariant && !variant.trim()} onClick={() => { cart.add(id,variant.trim()); window.location.assign('/compras'); }} className="block w-full rounded-xl border border-zinc-700 p-4 text-center text-sm font-bold disabled:opacity-40">Comprar — preparar checkout</button><div className="rounded-xl border border-zinc-800 p-4 text-xs text-zinc-400"><Truck className="mb-2 h-5 w-5" />Frete e prazo indisponíveis até a configuração da logística. Não há cobrança nem reserva de estoque nesta etapa.</div></> : contact ? <a href={contact} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-red-600 p-4 text-center text-sm font-bold">Conversar com o atleta pelo WhatsApp</a> : <p className="text-sm text-amber-300">Contato do anunciante indisponível.</p>}
          {notice && <p role="status" className="text-sm text-emerald-400">{notice}</p>}<ReportButton category={core ? 'external_offer' : 'athlete_listing'} targetId={id} title={item.title} />
        </section>
      </div>
    </main>
    <AuthModal />
  </div>;
}
