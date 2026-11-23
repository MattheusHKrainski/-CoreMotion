'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCoreMotiom } from '@/lib/store';
import { useCommerce } from '@/lib/commerce-store';
import { EMPTY_ADDRESS, money, retailPriceCents, validateAddress, type ShippingAddress } from '@/lib/commerce';
import { confirmDemoSale } from '@/services/commerce';
import { demoPaymentLabel, demoPaymentReference, type DemoPaymentMethod } from '@/lib/demo-payments';
import DemoPaymentPanel from '@/components/commerce/DemoPaymentPanel';
import AuthModal from '@/components/auth/AuthModal';
import { sellerContactUrl } from '@/lib/seller-contact';
import ProductImage from '@/components/shared/ProductImage';

const FIELDS: [keyof ShippingAddress,string][] = [['recipient','Destinatário'],['phone','Telefone'],['postalCode','CEP'],['street','Rua'],['number','Número'],['complement','Complemento (opcional)'],['district','Bairro'],['city','Cidade'],['state','UF']];
export default function CheckoutPage() {
  const { user, isVisitor, activeOffers, cart: athleteCart, removeFromCart, updateCartQty, setAuthModalMode, setAuthModalOpen } = useCoreMotiom();
  const cart = useCommerce();
  const [address, setAddress] = useState<ShippingAddress>({...EMPTY_ADDRESS});
  const [step,setStep] = useState<'cart'|'address'|'review'>('cart');
  const [busy,setBusy] = useState(false), [error,setError] = useState(''), [saved,setSaved] = useState('');
  const [method,setMethod] = useState<DemoPaymentMethod>('pix');
  const [cpf,setCpf] = useState('');
  const cpfDigits = cpf.replace(/\D/g, '');
  const validCpf = (() => { if (!/^\d{11}$/.test(cpfDigits) || /^(\d)\1{10}$/.test(cpfDigits)) return false; for (const length of [9,10]) { const sum = [...cpfDigits.slice(0,length)].reduce((acc,digit,index) => acc + Number(digit)*(length+1-index),0); const remainder = (sum*10)%11; if (Number(cpfDigits[length]) !== (remainder===10?0:remainder)) return false; } return true; })();
  const request = useRef<{ signature: string; key: string } | null>(null);
  useEffect(() => {
    let postalCode = '';
    try { const savedCep = sessionStorage.getItem('coremotion-cep') || ''; postalCode = /^\d{8}$/.test(savedCep) ? savedCep : ''; } catch { /* Session storage can be unavailable. */ }
    setAddress({ ...EMPTY_ADDRESS, postalCode });
    setStep('cart'); setSaved(''); setCpf(''); setMethod('pix'); setError(''); request.current = null;
  }, [user?.id]);
  const lines = cart.lines.map(line => ({...line, offer: activeOffers.find(item => item.id===line.offerId)}));
  const invalidVariant = (line: typeof lines[number]) => Boolean(line.offer?.variant_options?.length && !line.offer.variant_options.includes(line.variant));
  const available = lines.length > 0 && lines.every(line => line.offer && line.offer.stock_status !== 'sold_out' && !invalidVariant(line));
  const subtotal = lines.reduce((total,line) => total + (line.offer ? retailPriceCents(line.offer.price)*line.quantity : 0),0);
  const finalizeDemo = async () => {
    if (busy || !available || !user || isVisitor) return;
    if (!validCpf) { setError('Informe um CPF válido para continuar.'); return; }
    setBusy(true); setError('');
    try {
      validateAddress(address);
      // The method is not part of this key: a lost response followed by a retry
      // cannot silently create a second payment by switching methods.
      const signature = JSON.stringify([user.id,cart.lines,address]);
      if (request.current?.signature !== signature) request.current = { signature, key: crypto.randomUUID() };
      const id = await confirmDemoSale(cart.lines,address,request.current.key,method);
      setSaved(id);
      cart.clear();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível confirmar o pedido simulado.');
    } finally { setBusy(false); }
  };
  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-7 text-white sm:px-8"><header className="flex flex-wrap justify-between gap-4 border-b border-zinc-800 pb-5"><Link href="/" className="font-black">← CoreShop</Link><Link href="/pedidos" className="text-sm text-red-400">Meus pedidos</Link></header><h1 className="mt-8 text-3xl font-black">Seu carrinho</h1><p className="mt-3 text-sm leading-relaxed text-zinc-400">Escolha seus produtos, confirme o endereço e finalize sua experiência de compra no CoreShop.</p>
    <div className="my-6 flex flex-wrap gap-3 text-xs">{(['cart','address','review'] as const).map((id,i) => <span key={id} aria-current={step===id?'step':undefined} className={`rounded-full border px-4 py-2 ${step===id?'border-red-500 text-white':'border-zinc-800 text-zinc-500'}`}>{i+1}. {({cart:'Carrinho',address:'Endereço',review:'Revisão'})[id]}</span>)}</div>
    {saved ? <section role="status" className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 text-center sm:p-9">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-2xl" aria-hidden="true">✓</div>
      <h2 className="text-2xl font-black">Pedido confirmado!</h2>
      <p className="text-sm leading-relaxed text-zinc-300">Seu pagamento de demonstração por {demoPaymentLabel(method)} foi aprovado e o pedido já está salvo em Meus pedidos.</p>
      <p className="text-xs text-amber-200">Simulação para apresentação. Nenhuma cobrança real foi realizada e nenhuma entrega foi contratada.</p>
      <p className="break-all rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">Pedido: {saved}</p>
      <p className="break-all text-xs text-zinc-500">Referência fictícia: {demoPaymentReference(method,saved)}</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/pedidos" className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold hover:bg-red-500">Ver meus pedidos</Link>
        <Link href="/" className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-bold">Voltar à loja</Link>
      </div>
    </section> : <div className="grid gap-7 lg:grid-cols-[1fr_340px]"><section className="min-w-0 space-y-4">
      {step==='cart' && <><h2 className="text-lg font-bold">Vendido pela CoreMotion</h2>{!lines.length && <p className="rounded-xl border border-zinc-800 p-8 text-zinc-400">Seu carrinho CoreMotion está vazio. <Link href="/" className="text-red-400">Explorar produtos</Link></p>}{lines.map((line,index) => <article key={JSON.stringify([line.offerId,line.variant])} className="flex gap-4 rounded-2xl border border-zinc-800 p-4"><div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100"><ProductImage src={line.offer?.image_url || ''} alt={line.offer?.title || 'Item indisponível'} sizes="96px" /></div><div className="min-w-0 flex-1"><h2 className="text-sm font-bold">{line.offer?.title || 'Produto indisponível — remova antes de continuar'}</h2><p className="mt-1 text-xs text-zinc-500">Fornecedor: {line.offer?.store_name || 'Indisponível'} · {line.variant || 'Sem variante informada'}</p>{line.offer?.stock_status === 'sold_out' && <p className="mt-2 text-sm font-semibold text-amber-300">Esgotado — remova este item para continuar.</p>}{invalidVariant(line) && <p className="mt-2 text-sm text-amber-300">Remova este item e <Link className="underline" href={'/produto/core/' + encodeURIComponent(line.offerId)}>escolha um tamanho disponível</Link>.</p>}<div className="mt-3 flex flex-wrap items-center gap-4"><label className="text-xs">Quantidade <input type="number" min={1} max={10} value={line.quantity} onChange={event => cart.update(index,Number(event.target.value))} className="ml-2 w-14 rounded border border-zinc-700 bg-zinc-900 p-1" /></label><button type="button" onClick={() => cart.remove(index)} className="text-xs text-red-400">Remover</button>{line.offer && <strong className="text-sm">{money(retailPriceCents(line.offer.price)*line.quantity)}</strong>}</div></div></article>)}<button type="button" disabled={!available} onClick={() => { if (!user || isVisitor) { setAuthModalMode('login'); setAuthModalOpen(true); } else setStep('address'); }} className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold disabled:opacity-40">Continuar para endereço</button></>}
      {step==='address' && <form onSubmit={event => { event.preventDefault(); setError(''); try { validateAddress(address); const signature = JSON.stringify([user?.id, cart.lines, address]); if (request.current?.signature !== signature) request.current = { signature, key: crypto.randomUUID() }; setStep('review'); } catch(reason) { setError(reason instanceof Error?reason.message:'Confira os dados.'); } }} className="grid gap-4 sm:grid-cols-2">{FIELDS.map(([key,label]) => <label key={key} className="text-xs text-zinc-400">{label}<input required={key!=='complement'} maxLength={key==='state'?2:200} autoComplete={key==='postalCode'?'postal-code':key==='recipient'?'name':key==='phone'?'tel':'off'} value={address[key]} onChange={event => setAddress(previous => ({...previous,[key]:key==='state'?event.target.value.toUpperCase():event.target.value}))} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white" /></label>)}<button type="button" onClick={() => setStep('cart')} className="rounded-xl border border-zinc-700 p-3 text-sm">Voltar</button><button type="submit" className="rounded-xl bg-red-600 p-3 text-sm font-bold">Revisar pedido</button></form>}
      {step==='review' && <section className="space-y-5 rounded-2xl border border-zinc-800 p-5">
        <div><h2 className="text-lg font-black">Revise e confirme</h2><p className="mt-2 text-sm text-zinc-400">{address.recipient} · {address.street}, {address.number} · {address.district} · {address.city}/{address.state} · CEP {address.postalCode}</p></div>
        <div className="rounded-xl bg-zinc-900 p-4"><p className="text-xs text-zinc-500">Valor dos produtos</p><strong className="text-2xl">{money(subtotal)}</strong><p className="mt-1 text-xs text-zinc-500">O frete não é calculado ou cobrado nesta simulação.</p></div>
        <div className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-900 p-4"><label htmlFor="checkout-cpf" className="block text-sm font-semibold">CPF do comprador *</label><input id="checkout-cpf" type="text" inputMode="numeric" autoComplete="off" value={cpf} maxLength={14} placeholder="000.000.000-00" onChange={event => { const digits=event.target.value.replace(/\D/g,'').slice(0,11); setCpf(digits.replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/(\d{3})(\d{1,2})$/,'$1-$2')); setError(''); }} aria-invalid={cpfDigits.length===11&&!validCpf} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" /><p className="text-xs text-zinc-400">Validação matemática do CPF para a simulação. Não consultamos a Receita Federal e não armazenamos o CPF no pedido.</p>{cpfDigits.length===11&&!validCpf && <p className="text-xs text-red-300" role="alert">CPF inválido. Confira os números.</p>}</div>
        <DemoPaymentPanel key={request.current?.key ?? 'pending'} operationKey={request.current?.key ?? ''} method={method} onMethodChange={setMethod} subtotal={subtotal} busy={busy} available={available && validCpf} onConfirm={finalizeDemo} />

        <button type="button" disabled={busy} onClick={() => setStep('address')} className="text-xs text-zinc-400">Editar endereço</button>
      </section>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </section><aside className="h-fit space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="font-black">Resumo CoreMotion</h2><p className="flex justify-between text-sm text-zinc-400"><span>Subtotal de referência</span><strong className="text-white">{money(subtotal)}</strong></p><p className="flex justify-between text-sm text-zinc-400"><span>Frete</span><span>Definido na confirmação logística</span></p><p className="border-t border-zinc-700 pt-4 text-sm">Valor dos itens: <strong>{money(subtotal)}</strong></p><p className="text-xs leading-relaxed text-zinc-500">O valor dos itens é conferido pelo banco na finalização. Frete não está incluído; nenhuma entrega é contratada.</p></aside></div>}
    <section className="mt-10 space-y-4 rounded-2xl border border-zinc-800 p-5" aria-label="Produtos de atletas no carrinho"><h2 className="font-bold">Vendido por atletas</h2><p className="text-sm text-zinc-400">Negocie com cada anunciante. Estes itens não entram no pedido nem no subtotal CoreMotion.</p>
      {!athleteCart.length && <p className="text-sm text-zinc-500">Nenhum produto de atleta no carrinho.</p>}
      {athleteCart.map(item => { const contact = sellerContactUrl(item.product.contact_phone,item.product.title); return <article key={item.product.id} className="flex gap-4 rounded-xl border border-zinc-800 p-4"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100"><ProductImage src={item.product.images?.[0] || ''} alt={item.product.title} sizes="80px" /></div><div className="min-w-0 flex-1"><Link href={`/produto/athlete/${encodeURIComponent(item.product.id)}`} className="text-sm font-bold hover:text-red-400">{item.product.title}</Link><p className="mt-1 text-xs text-zinc-400">Vendedor: {item.product.seller_name || 'Atleta'} · {money(retailPriceCents(item.product.price))} por unidade</p><div className="mt-3 flex flex-wrap items-center gap-4"><label className="text-xs">Quantidade <input aria-label={`Quantidade de ${item.product.title}`} type="number" min={1} max={10} value={item.quantity} onChange={event => {const quantity=Number(event.target.value);if(Number.isInteger(quantity)&&quantity>=1&&quantity<=10)updateCartQty(item.product.id,quantity);}} className="ml-2 w-14 rounded border border-zinc-700 bg-zinc-900 p-1" /></label><button type="button" onClick={()=>removeFromCart(item.product.id)} className="text-xs text-red-400">Remover</button>{contact ? <a href={contact} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-400">Conversar com o vendedor</a> : <span className="text-xs text-zinc-500">Contato indisponível</span>}</div></div></article>;})}
    </section><AuthModal />
  </main>;
}
