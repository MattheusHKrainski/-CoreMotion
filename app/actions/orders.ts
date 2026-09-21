'use server';

import { checkoutSchema } from '@/lib/schemas/order.schema';
import { OrderService } from '@/services/orderService';
import { CartItem } from '@/lib/types';

export async function serverProcessCheckout(
  checkoutData: unknown,
  cartItems: CartItem[],
  userId?: string,
  userEmail?: string
) {
  const parsed = checkoutSchema.safeParse(checkoutData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Dados de checkout inválidos.',
    };
  }

  if (!cartItems || cartItems.length === 0) {
    return {
      success: false,
      error: 'O carrinho de compras está vazio.',
    };
  }

  const subtotal = cartItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const shippingFee = parsed.data.shippingMethod === 'express' ? 35 : parsed.data.shippingMethod === 'sedex' ? 24.9 : 0;
  const total = subtotal + shippingFee;

  const result = await OrderService.createOrder({
    userId,
    userEmail: userEmail || parsed.data.address.phone,
    items: cartItems,
    subtotal,
    shippingFee,
    discount: 0,
    total,
    paymentMethod: parsed.data.paymentMethod,
    shippingAddress: parsed.data.address,
    shippingMethod: parsed.data.shippingMethod,
  });

  return result;
}
