'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCoreMotiom } from '@/lib/store';
import { useCommerce } from '@/lib/commerce-store';
import { EMPTY_ADDRESS, money, retailPriceCents, validateAddress, type ShippingAddress } from '@/lib/commerce';
import { prepareSale, simulateSalePayment } from '@/services/commerce';
import AuthModal from '@/components/auth/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import ProductImage from '@/components/shared/ProductImage';

const FIELDS: [keyof ShippingAddress,string][] = [['recipient','Destinatário'],['phone','Telefone'],['postalCode','CEP'],['street','Rua'],['number','Número'],['complement','Complemento (opcional)'],['district','Bairro'],['city','Cidade'],['state','UF']];
export default function CheckoutPage() {
  const { user, isVisitor, activeOffers, cart: athleteCart, setCheckoutOpen, setAuthModalMode, setAuthModalOpen } = useCoreMotiom();
  const cart = useCommerce();
  const [address, setAddress] = useState<ShippingAddress>({...EMPTY_ADDRESS});
  const [step,setStep] = useState<'cart'|'address'|'review'>('cart');
  const [busy,setBusy] = useState(false), [error,setError] = useState(''), [saved,setSaved] = useState(''), [paid,setPaid] = useState(false);
  const request = useRef<{ signature: string; key: string } | null>(null);
  useEffect(() => {
    let postalCode = '';
    try { const savedCep = sessionStorage.getItem('coremotion-cep') || ''; postalCode = /^\d{8}$/.test(savedCep) ? savedCep : ''; } catch { /* Session storage can be unavailable. */ }
    setAddress({ ...EMPTY_ADDRESS, postalCode });
    setStep('cart'); setSaved(''); setPaid(false); setError(''); request.current = null;
  }, [user?.id]);
  const lines = cart.lines.map(line => ({...line, offer: activeOffers.find(item => item.id===line.offerId)}));
  const available = lines.length > 0 && lines.every(line => line.offer);
  const subtotal = lines.reduce((total,line) => total + (line.offer ? retailPriceCents(line.offer.price)*line.quantity : 0),0);
  const finalizeDemo = async () => {
    if (busy || (!saved && !available)) return;
    setBusy(true); setError('');
    try {
      let id = saved;
      if (!id) {
        validateAddress(address);
        const signature = JSON.stringify([user?.id, cart.lines, address]);
        if (request.current?.signature !== signature) request.current = { signature, key: crypto.randomUUID() };
        id = await prepareSale(cart.lines, address, request.current.key);
        setSaved(id);
      }
      await simulateSalePayment(id);
      setPaid(true);
      cart.clear();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível finalizar sua experiência de compra.');
    } finally { setBusy(false); }
  };
  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-7 text-white sm:px-8"><header className="flex flex-wrap justify-between gap-4 border-b border-zinc-800 pb-5"><Link href="/" className="font-black">← CoreShop</Link><Link href="/pedidos" className="text-sm text-red-400">Meus pedidos CoreMotion</Link></header><h1 className="mt-8 text-3xl font-black">Seu carrinho</h1><p className="mt-3 text-sm leading-relaxed text-zinc-400">Escolha seus produtos, confirme o endereço e finalize sua experiência de compra no CoreShop.</p>
    <div className="my-6 flex flex-wrap gap-3 text-xs">{(['cart','address','review'] as const).map((id,i) => <span key={id} aria-current={step===id?'step':undefined} className={`rounded-full border px-4 py-2 ${step===id?'border-red-500 text-white':'border-zinc-800 text-zinc-500'}`}>{i+1}. {({cart:'Carrinho',address:'Endereço',review:'Revisão'})[id]}</span>)}</div>
    {saved ? <section role="status" className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 text-center sm:p-9">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-2xl">{paid ? '✓' : '●'}</div>
      <h2 className="text-2xl font-black">{paid ? 'Pagamento de teste aprovado' : 'Pedido registrado'}</h2>
      <p className="text-sm leading-relaxed text-zinc-400">{paid ? 'Seu pedido foi confirmado no ambiente de demonstração CoreMotion.' : 'Seu pedido foi salvo. Confirme o pagamento de teste para concluir esta experiência.'}</p>
      <p className="break-all rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-500">Protocolo: {saved}</p>
      {!paid && <button type="button" disabled={busy} onClick={() => void finalizeDemo()} className="w-full rounded-xl bg-red-600 px-5 py-4 text-sm font-bold hover:bg-red-500 disabled:opacity-40">{busy ? 'Confirmando…' : 'Confirmar pagamento de teste'}</button>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <Link href="/pedidos" className="inline-block text-sm font-bold text-red-400">Acompanhar meu pedido</Link>
    </section> : <div className="grid gap-7 lg:grid-cols-[1fr_340px]"><section className="min-w-0 space-y-4">
      {step==='cart' && <>{!lines.length && <p className="rounded-xl border border-zinc-800 p-8 text-zinc-400">Seu carrinho CoreMotion está vazio. <Link href="/" className="text-red-400">Explorar produtos</Link></p>}{lines.map((line,index) => <article key={JSON.stringify([line.offerId,line.variant])} className="flex gap-4 rounded-2xl border border-zinc-800 p-4"><div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100"><ProductImage src={line.offer?.image_url || ''} alt={line.offer?.title || 'Item indisponível'} sizes="96px" /></div><div className="min-w-0 flex-1"><h2 className="text-sm font-bold">{line.offer?.title || 'Produto indisponível — remova antes de continuar'}</h2><p className="mt-1 text-xs text-zinc-500">Fornecedor: {line.offer?.store_name || 'Indisponível'} · {line.variant || 'Sem variante informada'}</p><div className="mt-3 flex flex-wrap items-center gap-4"><label className="text-xs">Quantidade <input type="number" min={1} max={10} value={line.quantity} onChange={event => cart.update(index,Number(event.target.value))} className="ml-2 w-14 rounded border border-zinc-700 bg-zinc-900 p-1" /></label><button type="button" onClick={() => cart.remove(index)} className="text-xs text-red-400">Remover</button>{line.offer && <strong className="text-sm">{money(retailPriceCents(line.offer.price)*line.quantity)}</strong>}</div></div></article>)}<button type="button" disabled={!available} onClick={() => { if (!user || isVisitor) { setAuthModalMode('login'); setAuthModalOpen(true); } else setStep('address'); }} className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold disabled:opacity-40">Continuar para endereço</button></>}
      {step==='address' && <form onSubmit={event => { event.preventDefault(); setError(''); try { validateAddress(address); setStep('review'); } catch(reason) { setError(reason instanceof Error?reason.message:'Confira os dados.'); } }} className="grid gap-4 sm:grid-cols-2">{FIELDS.map(([key,label]) => <label key={key} className="text-xs text-zinc-400">{label}<input required={key!=='complement'} maxLength={key==='state'?2:200} autoComplete={key==='postalCode'?'postal-code':key==='recipient'?'name':key==='phone'?'tel':'off'} value={address[key]} onChange={event => setAddress(previous => ({...previous,[key]:key==='state'?event.target.value.toUpperCase():event.target.value}))} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white" /></label>)}<button type="button" onClick={() => setStep('cart')} className="rounded-xl border border-zinc-700 p-3 text-sm">Voltar</button><button type="submit" className="rounded-xl bg-red-600 p-3 text-sm font-bold">Revisar preparação</button></form>}
      {step==='review' && <section className="space-y-5 rounded-2xl border border-zinc-800 p-5">
        <div><h2 className="text-lg font-black">Revise e confirme</h2><p className="mt-2 text-sm text-zinc-400">{address.recipient} · {address.street}, {address.number} · {address.district} · {address.city}/{address.state} · CEP {address.postalCode}</p></div>
        <div className="rounded-xl bg-zinc-900 p-4"><p className="text-xs text-zinc-500">Valor dos produtos</p><strong className="text-2xl">{money(subtotal)}</strong><p className="mt-1 text-xs text-zinc-500">Frete calculado separadamente quando houver fornecedor de entrega.</p></div>
        <div className="rounded-xl border border-zinc-800 p-4"><p className="text-sm font-semibold">Forma de pagamento</p><label className="mt-3 flex items-center gap-3 text-sm text-zinc-300"><input type="radio" checked readOnly name="demo-payment"/>Pagamento de teste CoreMotion</label></div>
        <button type="button" disabled={busy || !available} onClick={() => void finalizeDemo()} className="w-full rounded-xl bg-red-600 p-4 text-sm font-bold hover:bg-red-500 disabled:opacity-40">{busy ? 'Confirmando…' : 'Confirmar pedido'}</button>
        <p className="text-center text-xs text-zinc-500">Ambiente de demonstração: nenhuma cobrança financeira é realizada.</p>
        <button type="button" disabled={busy} onClick={() => setStep('address')} className="text-xs text-zinc-400">Editar endereço</button>
      </section>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </section><aside className="h-fit space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="font-black">Resumo CoreMotion</h2><p className="flex justify-between text-sm text-zinc-400"><span>Subtotal de referência</span><strong className="text-white">{money(subtotal)}</strong></p><p className="flex justify-between text-sm text-zinc-400"><span>Frete</span><span>Definido na confirmação logística</span></p><p className="border-t border-zinc-700 pt-4 text-sm">Valor dos itens: <strong>{money(subtotal)}</strong></p><p className="text-xs leading-relaxed text-zinc-500">O valor dos itens é conferido pelo banco na finalização. Frete será tratado separadamente.</p></aside></div>}
    <section className="mt-10 rounded-2xl border border-zinc-800 p-5"><h2 className="font-bold">Desapego entre atletas — fluxo separado</h2><p className="mt-2 text-sm text-zinc-400">{athleteCart.length} itens no carrinho de atletas. A negociação é diretamente com os anunciantes e não será incluída no pedido CoreMotion.</p><button type="button" onClick={() => setCheckoutOpen(true)} className="mt-4 text-sm font-bold text-red-400">Abrir carrinho de atletas</button></section><AuthModal /><CheckoutModal />
  </main>;
}
