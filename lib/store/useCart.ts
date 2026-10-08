// ============================================================================
// CORE MOTIOM — FATIA CART: carrinho, pedidos/checkout e favoritos
// ============================================================================

'use client';

import { useState } from 'react';
import { Product, CartItem, Order, PaymentMethod, ShippingAddress, UserProfile } from '../types';
import { readPersistedState } from './persistence';
import { CartSlice, Toast } from './types';

interface UseCartDeps {
  addToast: (title: string, message: string, type?: Toast['type']) => void;
  user: UserProfile | null;
}

export function useCart({ addToast, user }: UseCartDeps): CartSlice {
  const [cart, setCart] = useState<CartItem[]>(() => (readPersistedState()?.cart as CartItem[]) || []);
  const [orders, setOrders] = useState<Order[]>(() => (readPersistedState()?.orders as Order[]) || []);
  const [favorites, setFavorites] = useState<string[]>(() => (readPersistedState()?.favorites as string[]) || []);

  // Carrinho
  const addToCart = (product: Product, quantity = 1, selected_size?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.selected_size === selected_size);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selected_size === selected_size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selected_size }];
    });
    addToast('Carrinho Atualizado', `${product.title} adicionado ao seu carrinho.`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('Item Removido', 'Produto retirado do carrinho.', 'info');
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Favoritos
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        addToast('Favoritos', 'Produto removido da sua lista de favoritos.', 'info');
        return prev.filter((id) => id !== productId);
      }
      addToast('Favoritos', 'Produto salvo na sua lista de favoritos.', 'success');
      return [...prev, productId];
    });
  };

  // Checkout: criação de pedido com PIX sandbox e frete
  const createOrder = async (data: {
    address: ShippingAddress;
    shippingMethod: 'pac' | 'sedex' | 'express';
    paymentMethod: PaymentMethod;
  }): Promise<Order> => {
    const shippingCosts: Record<string, number> = {
      pac: 24.9,
      sedex: 42.5,
      express: 58.0,
    };
    const shippingFee = shippingCosts[data.shippingMethod] || 25.0;
    const subtotal = cartTotal;
    const total = subtotal + shippingFee;

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const pixCode = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${total.toFixed(2)}5802BR5916COREMOTIOM BRASIL6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      user_id: user?.id || 'guest-user',
      user_email: user?.email || data.address.phone,
      items: [...cart],
      subtotal,
      shipping_fee: shippingFee,
      discount: 0,
      total,
      payment_method: data.paymentMethod,
      payment_status: data.paymentMethod === 'pix' ? 'pending' : 'completed',
      pix_code: pixCode,
      pix_qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`,
      pix_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      shipping_address: data.address,
      shipping_method: data.shippingMethod,
      order_status: data.paymentMethod === 'pix' ? 'pending_payment' : 'preparing',
      tracking_code: `CM${Math.floor(100000000 + Math.random() * 900000000)}BR`,
      created_at: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const confirmPaymentSandbox = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, payment_status: 'completed', order_status: 'preparing' }
          : ord
      )
    );
    addToast('Pagamento Confirmado (Sandbox)', `Pedido ${orderId} aprovado com sucesso!`, 'success');
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartTotal,
    cartCount,
    orders,
    createOrder,
    confirmPaymentSandbox,
    favorites,
    toggleFavorite,
  };
}
