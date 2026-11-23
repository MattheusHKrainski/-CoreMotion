'use client';

import React, { useState, type FormEvent } from 'react';
import { Banknote, Check, Copy, CreditCard, LockKeyhole, QrCode, ReceiptText, ShieldCheck } from 'lucide-react';
import { money } from '@/lib/commerce';
import { DEMO_PAYMENT_METHODS, type DemoPaymentMethod } from '@/lib/demo-payments';
import {
  DEMO_TEST_CARDS, demoCardBrand, demoInstallmentValues, demoSampleExpiry,
  formatDemoCardNumber, formatDemoExpiry, validateDemoCard, type DemoCardFields,
} from '@/lib/demo-card';

interface Props {
  method: DemoPaymentMethod;
  onMethodChange: (method: DemoPaymentMethod) => void;
  subtotal: number;
  available: boolean;
  busy: boolean;
  onConfirm: () => Promise<void>;
}

const EMPTY_CARD: DemoCardFields = { holder: '', number: '', expiry: '', cvc: '' };
const inputClass = 'mt-2 w-full rounded-xl border border-zinc-700 bg-[#101116] px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40';

function DemoQrArt() {
  return <div role="img" aria-label="QR Code ilustrativo não escaneável" className="relative h-44 w-44 shrink-0 rounded-xl bg-white p-3 shadow-inner">
    <div className="grid h-full w-full" style={{ gridTemplateColumns: 'repeat(17,minmax(0,1fr))' }}>
      {Array.from({ length: 289 }, (_, index) => {
        const r = Math.floor(index / 17), c = index % 17;
        const finder = (x: number, y: number) => {
          const rr = r - x, cc = c - y;
          return rr >= 0 && rr < 5 && cc >= 0 && cc < 5
            ? (rr === 0 || rr === 4 || cc === 0 || cc === 4 || (rr === 2 && cc === 2))
            : null;
        };
        const corner = finder(0, 0) ?? finder(0, 12) ?? finder(12, 0);
        const active = corner === null ? ((r * 11 + c * 7 + r * c) % 9 < 4) : corner;
        return <span key={index} aria-hidden="true" className={active ? 'bg-zinc-950' : 'bg-white'} />;
      })}
    </div>
    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center"><span className="rounded bg-white px-2 py-1 text-[11px] font-black tracking-wide text-zinc-950 shadow">DEMO</span></span>
  </div>;
}

export default function DemoPaymentPanel({ method, onMethodChange, subtotal, available, busy, onConfirm }: Props) {
  const [card, setCard] = useState<DemoCardFields>(EMPTY_CARD);
  const [installments, setInstallments] = useState(1);
  const [generated, setGenerated] = useState<{ reference: string; dueDate: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const isCard = method === 'credit' || method === 'debit';
  const brand = demoCardBrand(card.number);
  const parts = demoInstallmentValues(subtotal, installments);

  const changeMethod = (value: DemoPaymentMethod) => {
    onMethodChange(value);
    setGenerated(null); setCopied(false); setError('');
    setCard(previous => ({ ...previous, cvc: '' }));
    setInstallments(1);
  };

  const changeCard = (field: keyof DemoCardFields, value: string) => {
    const next = field === 'number' ? formatDemoCardNumber(value)
      : field === 'expiry' ? formatDemoExpiry(value)
      : field === 'cvc' ? value.replace(/\D/g, '').slice(0, 3) : value.slice(0, 80).toUpperCase();
    setCard(previous => ({ ...previous, [field]: next }));
    setError('');
  };

  const chooseTestCard = (number: string) => {
    setCard({ holder: 'CLIENTE TESTE', number: formatDemoCardNumber(number), expiry: demoSampleExpiry(), cvc: '123' });
    setError('');
  };

  const copyReference = async () => {
    if (!generated) return;
    try { await navigator.clipboard.writeText(generated.reference); setCopied(true); }
    catch { setError('Não foi possível copiar. Selecione o código fictício para copiar manualmente.'); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !available) return;
    setError('');
    if (isCard) {
      const problem = validateDemoCard(card);
      if (problem) { setError(problem); return; }
    } else if (!generated) {
      const due = new Date();
      due.setDate(due.getDate() + 3);
      setGenerated({
        reference: 'COREMOTION-' + method.toUpperCase() + '-SIMULADO-' + crypto.randomUUID().slice(0, 8).toUpperCase() + '-NAO-PAGAVEL',
        dueDate: due.toLocaleDateString('pt-BR'),
      });
      return;
    }
    await onConfirm();
  };

  const cta = busy ? 'Registrando seu pedido…'
    : isCard ? 'Confirmar pedido simulado'
    : generated ? 'Simular pagamento e confirmar pedido'
    : method === 'pix' ? 'Gerar Pix de demonstração' : 'Emitir boleto de demonstração';

  return <form onSubmit={event => void submit(event)} className="space-y-5">
    <fieldset className="space-y-4 rounded-2xl border border-zinc-800 bg-[#121319]/70 p-4 sm:p-5">
      <legend className="px-2 text-sm font-bold text-white">Escolha como pagar</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_PAYMENT_METHODS.map(option => {
          const Icon = option.id === 'pix' ? QrCode : option.id === 'boleto' ? ReceiptText : CreditCard;
          return <label key={option.id} className={'flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ' + (method === option.id ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 bg-[#1b1c22] hover:border-zinc-500')}>
            <input type="radio" name="demo-payment" value={option.id} checked={method === option.id} onChange={() => changeMethod(option.id)} className="mt-1 accent-red-500" />
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-zinc-300" aria-hidden="true" />
            <span><span className="block text-sm font-bold">{option.label}</span><span className="mt-1 block text-xs leading-relaxed text-zinc-400">{option.description}</span></span>
          </label>;
        })}
      </div>

      {isCard && <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-bold">Dados do cartão</h3><p className="mt-1 text-xs text-zinc-400">Preencha os campos como em um checkout real, usando somente dados fictícios.</p></div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/60 px-3 py-1 text-[11px] font-semibold text-emerald-300"><ShieldCheck className="h-3.5 w-3.5"/> Simulação segura</span>
        </div>
        <div className="rounded-2xl border border-zinc-600/60 bg-gradient-to-br from-[#303743] via-[#1c222c] to-[#15191f] p-5 shadow-xl">
          <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.18em]">COREMOTION</span><CreditCard className="h-7 w-7 text-zinc-300"/></div>
          <div className="mt-8 font-mono text-lg tracking-[.18em] text-zinc-100">•••• •••• •••• {card.number.replace(/\D/g, '').slice(-4) || '••••'}</div>
          <div className="mt-6 flex justify-between gap-3 text-xs"><span><small className="block text-[10px] uppercase text-zinc-400">Titular</small>{card.holder || 'CLIENTE TESTE'}</span><span><small className="block text-[10px] uppercase text-zinc-400">Validade</small>{card.expiry || 'MM/AA'}</span><strong>{brand || 'CARTÃO TESTE'}</strong></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_TEST_CARDS.map(item => <button key={item.number} type="button" onClick={() => chooseTestCard(item.number)} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-400">Preencher {item.brand} de teste •••• {item.last4}</button>)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-zinc-300 sm:col-span-2">Número do cartão de teste
            <input name="demo-card-number" value={card.number} onChange={event => changeCard('number', event.target.value)} placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="off" maxLength={19} className={inputClass}/>
          </label>
          <label className="text-xs font-semibold text-zinc-300 sm:col-span-2">Nome impresso no cartão
            <input name="demo-card-holder" value={card.holder} onChange={event => changeCard('holder', event.target.value)} placeholder="CLIENTE TESTE" autoComplete="off" maxLength={80} className={inputClass}/>
          </label>
          <label className="text-xs font-semibold text-zinc-300">Validade (MM/AA)
            <input name="demo-card-expiry" value={card.expiry} onChange={event => changeCard('expiry', event.target.value)} placeholder="MM/AA" inputMode="numeric" autoComplete="off" maxLength={5} className={inputClass}/>
          </label>
          <label className="text-xs font-semibold text-zinc-300">CVV fictício
            <input type="password" name="demo-card-cvv" value={card.cvc} onChange={event => changeCard('cvc', event.target.value)} placeholder="•••" inputMode="numeric" autoComplete="off" maxLength={3} className={inputClass}/>
          </label>
        </div>
        {method === 'credit' ? <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">Parcelamento sem juros (simulado)
            <select value={installments} onChange={event => setInstallments(Number(event.target.value))} className={inputClass}>
              {Array.from({ length: 6 }, (_, index) => index + 1).map(count => {
                const portions = demoInstallmentValues(subtotal, count);
                return <option key={count} value={count}>{count === 1 ? 'À vista — ' + money(subtotal) : count + 'x de ' + money(portions.regular) + ' (última ' + money(portions.last) + ')'}</option>;
              })}
            </select>
          </label>
          <p className="text-xs text-zinc-400">{installments === 1 ? 'Valor total demonstrativo à vista.' : 'Parcelas ilustrativas: ' + (installments - 1) + ' de ' + money(parts.regular) + ' e última de ' + money(parts.last) + '.'}</p>
        </div> : <p className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-300">Pagamento no débito, em uma única vez: <strong className="text-white">{money(subtotal)}</strong>.</p>}
        <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-200"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0"/> Nunca digite dados reais. Apenas os dois números de teste acima são aceitos. Número, validade e CVV não são enviados ao servidor nem gravados no pedido.</p>
      </div>}

      {method === 'pix' && <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">Pagar com Pix</h3><p className="mt-1 text-xs leading-relaxed text-zinc-400">Gere uma cobrança fictícia, visualize o código ilustrativo e simule a aprovação.</p></div><QrCode className="h-7 w-7 text-emerald-300"/></div>
        <div className="flex flex-wrap justify-between gap-3 rounded-lg bg-zinc-950/80 p-3 text-sm"><span>Total do Pix</span><strong>{money(subtotal)}</strong></div>
        {generated ? <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <DemoQrArt />
          <div className="min-w-0 flex-1 space-y-3"><p className="text-sm font-semibold text-zinc-100">Pix Copia e Cola — somente demonstração</p><p className="break-all rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">{generated.reference}</p><button type="button" onClick={() => void copyReference()} className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 px-3 py-2 text-xs font-semibold hover:bg-zinc-800">{copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}{copied ? 'Código copiado' : 'Copiar código fictício'}</button><p className="text-xs text-amber-200">QR Code ilustrativo não escaneável. O código não é reconhecido por bancos ou aplicativos de pagamento.</p></div>
        </div> : <p className="text-xs text-zinc-400">Nenhum dinheiro será enviado. A geração do código é apenas uma etapa visual.</p>}
      </section>}

      {method === 'boleto' && <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">Boleto bancário de demonstração</h3><p className="mt-1 text-xs text-zinc-400">Gere um documento ilustrativo e simule a compensação, sem emissão bancária real.</p></div><Banknote className="h-7 w-7 text-zinc-300"/></div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-sm"><span className="text-zinc-400">Beneficiário fictício</span><strong className="text-right">CoreMotion Demo</strong><span className="text-zinc-400">Valor</span><strong className="text-right">{money(subtotal)}</strong><span className="text-zinc-400">Vencimento ilustrativo</span><strong className="text-right">{generated?.dueDate ?? 'Gerado ao emitir'}</strong></div>
        {generated && <div className="space-y-3">
          <div role="img" aria-label="Código de barras decorativo, não pagável" className="relative h-20 overflow-hidden rounded-lg bg-white p-3">
            <div className="h-full w-full opacity-65" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#101010 0px,#101010 2px,white 2px,white 5px,#101010 5px,#101010 6px,white 6px,white 10px)' }} />
            <span className="absolute inset-0 flex items-center justify-center"><strong className="rounded bg-white px-3 py-1 text-xs tracking-widest text-black">NÃO PAGÁVEL</strong></span>
          </div>
          <p className="break-all rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">{generated.reference}</p>
          <button type="button" onClick={() => void copyReference()} className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 px-3 py-2 text-xs font-semibold hover:bg-zinc-800">{copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}{copied ? 'Código copiado' : 'Copiar referência fictícia'}</button>
          <p className="text-xs text-amber-200">O código de barras e a linha acima não são documentos bancários válidos.</p>
        </div>}
      </section>}
    </fieldset>
    {error && <p role="alert" className="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-200">{error}</p>}
    <button type="submit" disabled={!available || busy} className="w-full rounded-xl bg-red-600 px-5 py-4 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">{cta}</button>
    <p className="flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-zinc-500"><ShieldCheck className="h-4 w-4 shrink-0"/> Checkout 100% demonstrativo. Nenhuma cobrança financeira é realizada.</p>
  </form>;
}
