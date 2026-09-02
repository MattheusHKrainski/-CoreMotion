'use client';

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
  const [shippingCost, setShippingCost] = useState(24.9);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  if (!isCheckoutOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const total = subtotal - discount + (cart.length > 0 ? shippingCost : 0);

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
    } catch {
      // ignore
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#12151C] text-white rounded-2xl border border-[#232836] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header with Progress Steps */}
        <div className="p-4 sm:p-6 border-b border-[#232836] bg-[#0E1017] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {step === 'cart' && 'Meu Carrinho de Compras'}
                {step === 'shipping' && 'Endereço de Entrega & Envio'}
                {step === 'payment' && 'Pagamento Seguro'}
                {step === 'success' && 'Pedido Confirmado!'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {step === 'cart' && `${cart.length} item(s) selecionado(s)`}
                {step === 'shipping' && 'Informe onde você deseja receber seu equipamento'}
                {step === 'payment' && 'Transação criptografada de ponta a ponta'}
                {step === 'success' && 'Seu pedido já está sendo preparado'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCheckoutOpen(false);
              if (step === 'success') setStep('cart');
            }}
            className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#181D26] rounded-lg transition-colors"
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
                      className="p-3.5 rounded-xl bg-[#0E1017] border border-[#232836] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover bg-[#181D26]"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-white line-clamp-1">
                            {item.product.title}
                          </h4>
                          <span className="text-[10px] text-[#94A3B8]">
                            {item.selected_size ? `Tamanho: ${item.selected_size} • ` : ''}
                            {item.product.store_name || item.product.seller_name}
                          </span>
                          <div className="font-bold text-white text-xs mt-0.5">
                            {formatPrice(item.product.price)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[#232836] rounded-lg bg-[#181D26] overflow-hidden">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                            className="px-2 py-1 text-[#94A3B8] hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 text-white font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 text-[#94A3B8] hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal summary */}
                <div className="p-4 rounded-xl bg-[#0E1017] border border-[#232836] space-y-2 text-xs">
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Frete Estimado</span>
                    <span className="text-white font-semibold">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-[#232836]">
                    <span>Total Estimado</span>
                    <span className="text-red-400">{formatPrice(subtotal + shippingCost)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('shipping')}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Continuar para Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="py-12 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-[#94A3B8] mx-auto" />
                <h4 className="font-bold text-white text-sm">Seu carrinho está vazio</h4>
                <p className="text-xs text-[#94A3B8]">
                  Explore o marketplace para adicionar equipamentos de performance.
                </p>
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
                >
                  Ver Catálogo de Produtos
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
              <label className="block font-semibold text-[#D1D5DB] mb-1">Nome Completo do Destinatário</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: Matheus Silveira"
                className="w-full px-3 py-2.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">CEP de Entrega</label>
                <input
                  type="text"
                  required
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full px-3 py-2.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Telefone WhatsApp</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#D1D5DB] mb-1">Endereço Completo & Número</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número, Complemento, Bairro"
                className="w-full px-3 py-2.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Cidade</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full px-3 py-2.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Estado (UF)</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="SP"
                  className="w-full px-3 py-2.5 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3 border-t border-[#232836]">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="px-4 py-2.5 rounded-xl bg-[#181D26] text-white font-semibold hover:bg-[#232836]"
              >
                Voltar ao Carrinho
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
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
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-red-600/15 border-red-500 text-white shadow-sm'
                    : 'bg-[#0E1017] border-[#232836] text-[#94A3B8]'
                }`}
              >
                <QrCode className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-xs">PIX (5% OFF)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'bg-red-600/15 border-red-500 text-white shadow-sm'
                    : 'bg-[#0E1017] border-[#232836] text-[#94A3B8]'
                }`}
              >
                <CreditCard className="w-5 h-5 text-white" />
                <span className="font-semibold text-xs">Cartão de Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'boleto'
                    ? 'bg-red-600/15 border-red-500 text-white shadow-sm'
                    : 'bg-[#0E1017] border-[#232836] text-[#94A3B8]'
                }`}
              >
                <Truck className="w-5 h-5 text-[#94A3B8]" />
                <span className="font-semibold text-xs">Boleto Bancário</span>
              </button>
            </div>

            {/* PIX Form */}
            {paymentMethod === 'pix' && (
              <div className="p-5 rounded-2xl bg-[#0E1017] border border-[#232836] space-y-4 text-center">
                <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=coremotiom-pix-${total.toFixed(2)}`}
                    alt="PIX QR Code"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Escaneie o QR Code com seu banco</h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">Aprovação imediata com 5% de desconto exclusivo.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full py-2.5 rounded-lg bg-[#181D26] hover:bg-[#232836] text-white font-semibold flex items-center justify-center gap-2 border border-[#232836]"
                >
                  {copiedPix ? <Check className="w-4 h-4 text-red-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPix ? 'Código PIX Copiado!' : 'Copiar Chave Copia e Cola'}</span>
                </button>
              </div>
            )}

            {/* Credit Card Form */}
            {paymentMethod === 'credit_card' && (
              <div className="p-4 rounded-xl bg-[#0E1017] border border-[#232836] space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-3 py-2 bg-[#181D26] text-xs text-white rounded-lg border border-[#232836]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">Nome Impresso no Cartão</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="NOME COMO NO CARTAO"
                    className="w-full px-3 py-2 bg-[#181D26] text-xs text-white rounded-lg border border-[#232836]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">Validade (MM/AA)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3 py-2 bg-[#181D26] text-xs text-white rounded-lg border border-[#232836]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 bg-[#181D26] text-xs text-white rounded-lg border border-[#232836]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">Parcelamento</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#181D26] text-xs text-white rounded-lg border border-[#232836]"
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
            <div className="p-4 rounded-xl bg-[#0E1017] border border-[#232836] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Desconto PIX (-5%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#94A3B8]">
                <span>Frete</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-[#232836]">
                <span>Total a Pagar</span>
                <span className="text-red-400">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="px-4 py-2.5 rounded-xl bg-[#181D26] text-white font-semibold hover:bg-[#232836]"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFinishPayment}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>{isProcessing ? 'Processando Pagamento...' : `Finalizar Compra (${formatPrice(total)})`}</span>
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
              <h3 className="text-xl font-bold text-white">Pedido Realizado com Sucesso!</h3>
              <p className="text-[#94A3B8] mt-1">
                Identificador do Pedido: <strong className="text-white">{completedOrderId}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1017] border border-[#232836] text-left space-y-2 max-w-md mx-auto text-xs text-[#D1D5DB]">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Status do Pagamento:</span>
                <span className="text-red-400 font-semibold">Aprovado ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Destinatário:</span>
                <span className="text-white">{recipientName || 'Atleta CoreMotiom'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Prazo Estimado de Envio:</span>
                <span className="text-white">2 a 4 dias úteis</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCheckoutOpen(false);
                setStep('cart');
              }}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
            >
              Continuar Navegando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

