'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Heart, Image as ImageIcon, MapPin, ShoppingBag, Truck, X } from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import { useCommerce } from '@/lib/commerce-store';
import { money, retailPriceCents, productPath } from '@/lib/commerce';
import ProductImage from '@/components/shared/ProductImage';
import { sellerContactUrl } from '@/lib/seller-contact';
import AuthModal from '@/components/auth/AuthModal';
import ReportButton from '@/components/shared/ReportButton';
import { getConditionMeta } from '@/components/marketplace/ProductCard';
import { getSupabaseClient } from '@/services/supabaseClient';
import ProductOptions from './ProductOptions';
import { productGallery } from '@/lib/product-gallery';
import { productPresentation } from '@/lib/product-presentation';
import type { ExternalOffer, Product } from '@/lib/types';

type GalleryItem = ExternalOffer | Product;
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function ProductPage({ kind, id }: { kind: string; id: string }) {
  const { products, activeOffers, favorites, toggleFavorite, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const cart = useCommerce();
  const core = kind === 'core';
  const [index, setIndex] = useState(0);
  const [variant, setVariant] = useState('');
  const [notice, setNotice] = useState('');
  const [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!zoom || !dialog.current) return;
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, [zoom]);
  const [cep, setCep] = useState('');
  const [cepStatus, setCepStatus] = useState('');
  const [checkingCep, setCheckingCep] = useState(false);
  const [remote, setRemote] = useState<GalleryItem | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setVariant(''); setNotice(''); setIndex(0); setZoom(false); setRemote(null); setLoaded(false); }, [kind, id]);
  useEffect(() => {
    let alive = true;
    const sb = getSupabaseClient();
    if (!sb || (kind !== 'core' && kind !== 'athlete')) { setLoaded(true); return; }
    void (async () => {
      try {
        const { data, error } = await sb.from(kind === 'core' ? 'external_offers' : 'products').select('*').eq('id', id).maybeSingle();
        if (alive && !error) setRemote(data as GalleryItem | null);
      } catch { /* Product retrieval errors are handled by the unavailable state. */ }
      finally { if (alive) setLoaded(true); }
    })();
    return () => { alive = false; };
  }, [kind, id]);

  const local = core
    ? activeOffers.find(item => item.id === id)
    : kind === 'athlete' ? products.find(item => item.id === id && item.product_type === 'c2c') : null;
  const item = (remote || local) as GalleryItem | null;
  const available = !!item && (core
    ? ('is_active' in item && item.is_active !== false)
    : ('product_type' in item && item.product_type === 'c2c' && item.status === 'active'));
  const coreOffer = core && item && 'source_url' in item ? item as ExternalOffer : null;
  const athlete = !core && item && 'product_type' in item ? item as Product : null;
  const presentation = coreOffer ? productPresentation(id, coreOffer.source_url) : undefined;
  const gallery = item ? productGallery(item, presentation?.images).slice(0, 12) : [];
  const selectedImage = gallery[Math.min(index, gallery.length - 1)] || '';
  const needsVariant = Boolean(coreOffer && /^(Calçados|Vestuário|Roupas|Lutas|Artes Marciais)$/.test(coreOffer.category));
  const missingVerifiedSizes = Boolean(needsVariant && !(coreOffer?.variant_options?.length)
    && !presentation?.options.some(option => option.label === 'Tamanho' && option.values.length > 0));
  const selectedVariant = variant;
  const variantRequired = Boolean(coreOffer?.variant_options?.length ? !coreOffer.variant_options.includes(variant) : needsVariant && !variant.trim());
  const otherColors = coreOffer ? activeOffers.filter(other =>
    other.id !== coreOffer.id && other.store_name === coreOffer.store_name &&
    normalize(other.title) === normalize(coreOffer.title) && other.is_active !== false &&
    other.image_url !== coreOffer.image_url
  ).slice(0,9) : [];
  const percentage = item && item.original_price && item.original_price > item.price
    ? Math.round((1-item.price/item.original_price)*100) : 0;
  const previous = () => setIndex(current => (current-1+gallery.length)%gallery.length);
  const next = () => setIndex(current => (current+1)%gallery.length);

  const checkCep = async () => {
    const digits = cep.replace(/\D/g,'');
    if (!/^\d{8}$/.test(digits)) { setCepStatus('Digite um CEP com 8 números.'); return; }
    setCheckingCep(true); setCepStatus('');
    try {
      const res = await fetch('https://viacep.com.br/ws/'+digits+'/json/', { signal: AbortSignal.timeout(9000) });
      if (!res.ok) throw new Error('Não foi possível consultar o CEP.');
      const data: {erro?: boolean;localidade?: string;uf?: string} = await res.json();
      if (data.erro) { setCepStatus('CEP não encontrado.'); return; }
      setCepStatus((data.localidade && data.uf ? data.localidade+' / '+data.uf+' · ' : '')+'CEP confirmado para o endereço de entrega.');
      sessionStorage.setItem('coremotion-cep',digits);
    } catch { setCepStatus('CEP não consultado. Confira o endereço no carrinho.'); }
    finally { setCheckingCep(false); }
  };

  const addToCart = (buy = false) => {
    if (!item || !core || variantRequired) return;
    cart.add(id, selectedVariant.trim());
    if (buy) window.location.assign('/compras');
    else setNotice('Adicionado ao carrinho CoreMotion.');
  };

  if (!item || !available) return <main className="mx-auto max-w-5xl p-8 text-white">
    <Link href="/" className="text-red-400">← Voltar ao CoreShop</Link>
    <h1 className="mt-10 text-2xl font-black">{loaded ? 'Produto indisponível' : 'Carregando produto…'}</h1>
    <p className="mt-3 text-zinc-400">{loaded ? 'Consulte outros itens no catálogo.' : 'Consultando catálogo.'}</p>
  </main>;

  return <div className="min-h-screen bg-[#090b10] text-zinc-100">
    <header className="border-b border-zinc-800 bg-[#0a0a0c] text-white">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black tracking-tight"><ArrowLeft className="h-4 w-4"/>COREMOTION <span className="font-normal text-zinc-500">/</span> CoreShop</Link>
        <div className="flex gap-5 text-xs text-zinc-300"><Link href="/compras" className="hover:text-white">Carrinho ({cart.count})</Link><Link href="/pedidos" className="hover:text-white">Meus pedidos</Link></div>
      </nav>
    </header>
    <main className="mx-auto max-w-[1380px] px-4 pb-16 pt-5 sm:px-8">
      <p className="mb-6 text-xs font-medium text-zinc-500">CoreMotion <span className="mx-2">/</span> {core ? 'CoreShop' : 'De atletas'} <span className="mx-2">/</span> {item.sport} <span className="mx-2">/</span> {item.category}</p>
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(350px,0.85fr)]">
        <div className="min-w-0 space-y-5">
          <section aria-label="Galeria de fotos do produto" className="space-y-3">
            {gallery.length > 1 ? <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl">
              {gallery.slice(0,4).map((src,i)=><button key={src+i} type="button" onClick={()=>{setIndex(i);setZoom(true);}} className="group relative aspect-square overflow-hidden bg-[#11141b] text-zinc-100 hover:opacity-95" aria-label={'Ampliar foto '+(i+1)}>
                <ProductImage src={src} fallbackSrcs={gallery.filter(candidate => candidate !== src)} alt={item.title+' — foto '+(i+1)} sizes="(max-width: 1023px) 45vw, 340px"/>
                {i===3 && gallery.length>4 && <span className="absolute inset-0 flex items-end justify-center bg-black/20 pb-4 text-xs font-black text-white">Ver as {gallery.length} fotos</span>}
              </button>)}
            </div> : <button type="button" onClick={()=>setZoom(true)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#11141b]" aria-label="Ampliar imagem principal">
              <ProductImage src={selectedImage} fallbackSrcs={gallery.filter(candidate => candidate !== selectedImage)} alt={item.title} sizes="(max-width: 1023px) 100vw, 740px"/>
            </button>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500"><ImageIcon className="h-4 w-4"/>{gallery.length} {gallery.length===1?'imagem':'imagens'} do produto</span>
              {gallery.length>1 && <button type="button" onClick={()=>setZoom(true)} className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-100 hover:border-red-500">Ver galeria completa</button>}
            </div>
            {gallery.length>1 && <div className="flex gap-2 overflow-x-auto pb-1">{gallery.map((src,i)=><button type="button" key={src+i} onClick={()=>setIndex(i)} aria-label={'Selecionar foto '+(i+1)} aria-pressed={index===i} className={'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-[#11141b] '+(index===i?'border-red-600':'border-zinc-200')}><ProductImage src={src} fallbackSrcs={gallery.filter(candidate => candidate !== src)} alt={item.title+' — miniatura '+(i+1)} sizes="64px"/></button>)}</div>}
          </section>
          <details open className="rounded-2xl border border-zinc-800 bg-[#14161d] p-5 sm:p-6">
            <summary className="cursor-pointer text-sm font-black">Informações do produto</summary>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-300">{item.description}</p>
            {'image_is_reference' in item && item.image_is_reference && <p className="mt-3 text-xs text-zinc-500">Imagem de referência fornecida pelo anunciante.</p>}
          </details>
        </div>

        <section className="space-y-5 rounded-2xl border border-zinc-800 bg-[#14161d] p-5 shadow-2xl shadow-black/30 lg:sticky lg:top-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{coreOffer?.store_name || (athlete ? 'Venda entre atletas' : 'CoreMotion')}</p>
              <h1 className="text-xl font-black leading-tight sm:text-2xl">{item.title}</h1>
            </div>
            <button type="button" aria-label={favorites.includes(id)?'Remover dos favoritos':'Salvar nos favoritos'} onClick={()=>isVisitor?setAuthModalOpen(true):toggleFavorite(id)} className="rounded-full border border-zinc-700 p-2.5 hover:border-red-400">
              <Heart className={'h-5 w-5 '+(favorites.includes(id)?'fill-red-600 text-red-600':'text-zinc-500')}/>
            </button>
          </div>
          {item.original_price && item.original_price > item.price && <p className="text-xs text-zinc-400 line-through">De {money(retailPriceCents(item.original_price))}</p>}
          <div className="flex flex-wrap items-center gap-3"><p className="text-3xl font-black tracking-tight">{money(retailPriceCents(item.price))}</p>{percentage>0&&<span className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">-{percentage}%</span>}</div>
          <div className="border-t border-zinc-800 pt-4 text-sm text-zinc-500">
            {coreOffer ? <p>Referência de <strong className="text-white">{coreOffer.store_name}</strong>. <a href={coreOffer.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-red-400 hover:underline">Ver produto na loja <ExternalLink className="h-3.5 w-3.5"/></a></p>
              : <p>Vendido por <strong className="text-white">{athlete?.seller_name || 'Atleta'}</strong> {athlete?.condition && '· '+getConditionMeta(athlete.condition).badge}</p>}
          </div>
          {otherColors.length>0 && <div className="space-y-3 border-t border-zinc-800 pt-4">
            <p className="text-sm font-semibold">Outras versões e cores</p>
            <div className="flex flex-wrap gap-2">{otherColors.map((other,i)=><Link href={productPath('core',other.id)} title={other.title} key={other.id} aria-label={'Ver versão '+(i+2)} className="relative block h-14 w-14 overflow-hidden rounded-lg border-2 border-zinc-700 bg-zinc-950 hover:border-red-500"><ProductImage src={other.image_url} alt={other.title} sizes="56px"/></Link>)}</div>
          </div>}
          {coreOffer && <div className="border-t border-zinc-800 pt-4">
            <ProductOptions key={id} id={id} source={coreOffer.source_url}
              category={coreOffer.category} title={coreOffer.title} sport={coreOffer.sport}
              description={coreOffer.description} listedSizes={coreOffer.variant_options} onChange={setVariant} />
          </div>}
          {missingVerifiedSizes && coreOffer && <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-zinc-300">
            A numeração deste modelo não foi confirmada no catálogo. <a href={coreOffer.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-red-400 underline">Consultar tamanhos na loja</a>
          </div>}
          {!core && athlete && <div className="text-sm text-zinc-500">{athlete.location && <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4"/>{athlete.location}</p>}</div>}
          {coreOffer ? <>
            <div className="space-y-2">
              <button type="button" disabled={variantRequired} onClick={()=>addToCart(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">Comprar agora</button>
              <button type="button" disabled={variantRequired} onClick={()=>addToCart(false)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-600 px-5 py-4 text-sm font-bold text-red-400 hover:bg-red-950/30 disabled:opacity-40"><ShoppingBag className="h-4 w-4"/>Adicionar ao carrinho</button>
              {notice&&<p role="status" className="text-sm font-semibold text-emerald-400">{notice}</p>}
            </div>
            <div className="space-y-3 border-t border-zinc-800 pt-5">
              <p className="flex items-center gap-2 text-sm font-black"><Truck className="h-4 w-4 text-red-600"/>Consultar destino de entrega</p>
              <div className="flex gap-2"><input inputMode="numeric" aria-label="CEP para entrega" autoComplete="postal-code" maxLength={9} placeholder="Digite seu CEP" value={cep} onChange={e=>setCep(e.target.value.replace(/[^\d-]/g,''))} className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-red-600"/><button type="button" disabled={checkingCep} onClick={()=>void checkCep()} className="rounded-lg bg-zinc-900 px-4 text-xs font-bold text-white hover:bg-zinc-700 disabled:opacity-40">{checkingCep?'Consultando':'Consultar'}</button></div>
              {cepStatus && <p role="status" className="text-xs text-zinc-400">{cepStatus}</p>}
            </div>
            <ReportButton category="external_offer" targetId={id} title={item.title}/>
          </> : <>
            {athlete?.contact_phone ? <a href={sellerContactUrl(athlete.contact_phone,athlete.title)||'#'} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-red-600 px-5 py-4 text-center text-sm font-bold text-white">Falar com o anunciante</a> : <p className="text-sm text-zinc-500">Contato do anunciante indisponível.</p>}
            <ReportButton category="athlete_listing" targetId={id} title={item.title}/>
          </>}
        </section>
      </div>
    </main>

    {zoom && gallery.length>0 && <dialog ref={dialog} onCancel={() => setZoom(false)} aria-label="Galeria ampliada" className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none flex flex-col bg-black/95 px-4 py-4 text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between"><span className="text-sm font-semibold">{index+1} / {gallery.length}</span><button type="button" aria-label="Fechar galeria" onClick={()=>setZoom(false)} className="rounded-full border border-zinc-600 p-3 hover:bg-zinc-800"><X className="h-5 w-5"/></button></div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center gap-2 py-6">
        <button type="button" aria-label="Foto anterior" onClick={previous} disabled={gallery.length<2} className="rounded-full p-2 hover:bg-zinc-800 disabled:opacity-20"><ChevronLeft/></button>
        <div className="relative h-full min-h-0 flex-1 overflow-hidden rounded-xl bg-[#11141b]"><ProductImage src={selectedImage} fallbackSrcs={gallery.filter(candidate => candidate !== selectedImage)} alt={item.title+' — foto ampliada '+(index+1)} sizes="90vw"/></div>
        <button type="button" aria-label="Próxima foto" onClick={next} disabled={gallery.length<2} className="rounded-full p-2 hover:bg-zinc-800 disabled:opacity-20"><ChevronRight/></button>
      </div>
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-2">{gallery.map((src,i)=><button type="button" onClick={()=>setIndex(i)} key={src+i} aria-label={'Foto '+(i+1)} className={'relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 bg-[#11141b] '+(index===i?'border-red-600':'border-transparent')}><ProductImage src={src} fallbackSrcs={gallery.filter(candidate => candidate !== src)} alt="" sizes="56px"/></button>)}</div>
    </dialog>}
    <AuthModal />
  </div>;
}
