'use client';

import { calculateCheckoutTotals } from '@/lib/checkout';
import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  X,
  Truck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setCheckoutOpen,
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    user,
    createOrder,
    addToast,
  } = useCoreMotiom();

  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string>('');

  // Shipping Form State
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('01310-100');
  const [address, setAddress] = useState('Av. Paulista, 1000');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  if (!isCheckoutOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  // Mesma regra do servidor (lib/checkout.ts): PIX com 5% de desconto; frete PAC.
  const checkoutTotals = calculateCheckoutTotals(subtotal, 'pac', paymentMethod);
  const shippingCost = cart.length > 0 ? checkoutTotals.shippingFee : 0;
  const discount = checkoutTotals.discount;
  const total = checkoutTotals.subtotal - discount + shippingCost;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleCopyPix = () => {
    const pixPayload = `00020126580014br.gov.bcb.pix0136coremotiom-pay-${Date.now()}520400005303986540${total.toFixed(2)}5802BR5916COREMOTIOM SPORTS6009SAO PAULO62070503***6304`;
    navigator.clipboard?.writeText(pixPayload);
    setCopiedPix(true);
    addToast('Código PIX Copiado', 'Cole no app do seu banco para pagar.', 'success');
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleFinishPayment = async () => {
    setIsProcessing(true);
    try {
      const order = await createOrder({
        address: {
          recipient_name: recipientName || user?.name || 'Atleta Comprador',
          phone: phone || '(11) 99999-9999',
          cep: cep || '01310-100',
          street: address || 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: city || 'São Paulo',
          state: state || 'SP',
        },
        shippingMethod: 'pac',
        paymentMethod,
      });

      setCompletedOrderId(order.id);
      setStep('success');
      clearCart();
    } catch (err) {
      // C8: falha do servidor é mostrada; nenhum pedido aparece como concluído.
      addToast('Pedido não concluído', err instanceof Error ? err.message : 'Tente novamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header with Progress Steps */}
        <div className="p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/10 text-red-500 border border-red-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {step === 'cart' && 'Meu Carrinho de Compras'}
                {step === 'shipping' && 'Endereço de Entrega & Envio'}
                {step === 'payment' && 'Pagamento Seguro'}
                {step === 'success' && 'Pedido Confirmado!'}
              </h3>
              <p className="text-xs text-zinc-400">
                {step === 'cart' && `${cart.length} item(s) selecionado(s)`}
                {step === 'shipping' && 'Informe onde você deseja receber seu equipamento'}
                {step === 'payment' && 'Transação criptografada com custódia segura'}
                {step === 'success' && 'Seu pedido já está sendo preparado'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCheckoutOpen(false);
              if (step === 'success') setStep('cart');
            }}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Cart Items */}
        {step === 'cart' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
            {cart.length > 0 ? (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.product.images[0]}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover bg-zinc-950 border border-zinc-800"
                        />
                        <div>
                          <h4 className="font-extrabold text-xs text-white line-clamp-1">
                            {item.product.title}
                          </h4>
                          <span className="text-[10px] text-zinc-400">
                            {item.selected_size ? `Tamanho: ${item.selected_size} • ` : ''}
                            {item.product.store_name || item.product.seller_name}
                          </span>
                          <div className="font-black text-white text-xs mt-0.5">
                            {formatPrice(item.product.price)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-zinc-800 rounded-full bg-zinc-950 overflow-hidden px-1">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-zinc-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 text-white font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-zinc-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal summary */}
                <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Frete com Seguro Nacional</span>
                    <span className="text-white font-semibold">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-zinc-800/80">
                    <span>Total Estimado</span>
                    <span className="text-red-400 font-black">{formatPrice(subtotal + shippingCost)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('shipping')}
                  className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
                >
                  <span>Continuar para Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="py-12 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
                <h4 className="font-bold text-white text-sm">Seu carrinho está vazio</h4>
                <p className="text-xs text-zinc-400">
                  Explore o catálogo para adicionar super tênis, vestuário e acessórios.
                </p>
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full shadow-md shadow-red-950/40"
                >
                  Ver Catálogo Geral
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Shipping Form */}
        {step === 'shipping' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep('payment');
            }}
            className="p-6 overflow-y-auto flex-1 space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5 uppercase text-[11px]">Nome Completo do Destinatário</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: Matheus Silveira"
                className="w-full px-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5 uppercase text-[11px]">CEP de Entrega</label>
                <input
                  type="text"
                  required
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full px-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5 uppercase text-[11px]">Telefone WhatsApp</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5 uppercase text-[11px]">Endereço Completo & Número</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número, Complemento, Bairro"
                className="w-full px-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5 uppercase text-[11px]">Cidade</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full px-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5 uppercase text-[11px]">Estado (UF)</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="SP"
                  className="w-full px-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="px-5 py-2.5 rounded-full bg-zinc-900 text-zinc-300 font-semibold hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 hover:scale-[1.01]"
              >
                <span>Avançar para Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Payment Method */}
        {step === 'payment' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
            
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-red-600/15 border-red-500 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <QrCode className="w-5 h-5 text-red-400" />
                <span className="font-bold text-xs">PIX (-5%)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'bg-red-600/15 border-red-500 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <CreditCard className="w-5 h-5 text-white" />
                <span className="font-bold text-xs">Cartão de Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'boleto'
                    ? 'bg-red-600/15 border-red-500 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <Truck className="w-5 h-5 text-zinc-400" />
                <span className="font-bold text-xs">Boleto Bancário</span>
              </button>
            </div>

            {/* PIX Form */}
            {paymentMethod === 'pix' && (
              <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-4 text-center shadow-md">
                <div className="w-36 h-36 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=coremotiom-pix-${total.toFixed(2)}`}
                    alt="PIX QR Code"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Pague com o QR Code no seu aplicativo bancário</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Aprovação instantânea com desconto de 5% aplicado.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
                >
                  {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPix ? 'Código PIX Copiado!' : 'Copiar Chave Copia e Cola'}</span>
                </button>
              </div>
            )}

            {/* Credit Card Form */}
            {paymentMethod === 'credit_card' && (
              <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-3.5 shadow-md">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase">Número do Cartão</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase">Nome Impresso no Cartão</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="NOME COMO NO CARTAO"
                    className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase">Validade (MM/AA)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase">Parcelamento</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  >
                    <option value={1}>1x de {formatPrice(total)} sem juros</option>
                    <option value={3}>3x de {formatPrice(total / 3)} sem juros</option>
                    <option value={6}>6x de {formatPrice(total / 6)} sem juros</option>
                    <option value={12}>12x de {formatPrice(total / 12)} sem juros</option>
                  </select>
                </div>
              </div>
            )}

            {/* Total breakdown */}
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-400 font-semibold">
                  <span>Desconto PIX (-5%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Frete com Seguro</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-zinc-800">
                <span>Total com Custódia Protegida</span>
                <span className="text-red-400 font-black">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="px-5 py-2.5 rounded-full bg-zinc-900 text-zinc-300 font-semibold hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFinishPayment}
                className="flex-1 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 hover:scale-[1.01]"
              >
                <Lock className="w-4 h-4" />
                <span>{isProcessing ? 'Processando...' : `Finalizar Compra (${formatPrice(total)})`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success Screen */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5 text-xs">
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Pedido Realizado com Sucesso!</h3>
              <p className="text-zinc-400 mt-1">
                Identificador do Pedido: <strong className="text-white">{completedOrderId}</strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-left space-y-2.5 max-w-md mx-auto text-xs text-zinc-300 shadow-md">
              <div className="flex justify-between">
                <span className="text-zinc-400">Status do Pagamento:</span>
                <span className="text-red-400 font-bold inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Retido em Custódia Segura
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Destinatário:</span>
                <span className="text-white font-semibold">{recipientName || 'Atleta CoreMotiom'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Prazo Estimado de Envio:</span>
                <span className="text-white font-semibold">2 a 4 dias úteis</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCheckoutOpen(false);
                setStep('cart');
              }}
              className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-950/50 hover:scale-105"
            >
              Continuar Navegando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
