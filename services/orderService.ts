import { getSupabaseClient } from './supabaseClient';
import { CartItem, Order, PaymentMethod, ShippingAddress, OrderStatus } from '@/lib/types';

export class OrderService {
  /**
   * Creates a new order in Supabase with PIX code generation & escrow custody.
   */
  static async createOrder(orderPayload: {
    userId?: string;
    userEmail: string;
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    discount?: number;
    total: number;
    paymentMethod: PaymentMethod;
    shippingAddress: ShippingAddress;
    shippingMethod: 'pac' | 'sedex' | 'express';
  }): Promise<{ success: boolean; data?: Order; error?: string }> {
    const sb = getSupabaseClient();
    const pixCode =
      orderPayload.paymentMethod === 'pix'
        ? `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${orderPayload.total.toFixed(2)}5802BR5925COREMOTIOM PLATAFORMA6009SAO PAULO62070503***6304`
        : undefined;

    const initialStatus: OrderStatus = 'pending_payment';

    if (!sb) {
      // Fallback local memory order
      const localOrder: Order = {
        id: `ord-${Date.now()}`,
        user_id: orderPayload.userId || 'user-anon',
        user_email: orderPayload.userEmail,
        items: orderPayload.items,
        subtotal: orderPayload.subtotal,
        shipping_fee: orderPayload.shippingFee,
        discount: orderPayload.discount || 0,
        total: orderPayload.total,
        payment_method: orderPayload.paymentMethod,
        payment_status: 'pending',
        pix_code: pixCode,
        shipping_address: orderPayload.shippingAddress,
        shipping_method: orderPayload.shippingMethod,
        order_status: initialStatus,
        created_at: new Date().toISOString(),
      };
      return { success: true, data: localOrder };
    }

    try {
      const isUuid = Boolean(
        orderPayload.userId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderPayload.userId)
      );

      const { data, error } = await sb
        .from('orders')
        .insert([
          {
            user_id: isUuid ? orderPayload.userId : null,
            user_email: orderPayload.userEmail,
            items: orderPayload.items,
            subtotal: orderPayload.subtotal,
            shipping_fee: orderPayload.shippingFee,
            discount: orderPayload.discount || 0,
            total: orderPayload.total,
            payment_method: orderPayload.paymentMethod,
            payment_status: 'pending',
            pix_code: pixCode,
            shipping_address: orderPayload.shippingAddress,
            shipping_method: orderPayload.shippingMethod,
            order_status: initialStatus,
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: this.mapDbOrderToModel(data) };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Fetches orders placed by a specific user.
   */
  static async getUserOrders(userId: string): Promise<Order[]> {
    const sb = getSupabaseClient();
    if (!sb) return [];

    try {
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(this.mapDbOrderToModel);
    } catch {
      return [];
    }
  }

  /**
   * Admin: retrieves all platform orders for financial custody overview.
   */
  /**
   * Pedidos do próprio comprador. O filtro por user_id é uma camada extra: a RLS
   * (orders_select) já restringe as linhas ao dono do pedido e ao staff.
   */
  static async getMyOrders(userId: string): Promise<Order[]> {
    const sb = getSupabaseClient();
    if (!sb || !userId) return [];

    try {
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(this.mapDbOrderToModel);
    } catch {
      return [];
    }
  }

  static async getAllOrdersAdmin(): Promise<Order[]> {
    const sb = getSupabaseClient();
    if (!sb) return [];

    try {
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(this.mapDbOrderToModel);
    } catch {
      return [];
    }
  }

  /**
   * Simulates immediate sandbox approval with escrow lock.
   */
  static async confirmPaymentSandbox(orderId: string): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: true };

    try {
      const { error } = await sb
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'escrow_locked',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Atualização administrativa de status (RLS: somente administrador ou supervisor).
   */
  static async updateOrderStatus(
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus?: Order['payment_status']
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: true };

    const patch: Record<string, unknown> = {
      order_status: orderStatus,
      updated_at: new Date().toISOString(),
    };
    if (paymentStatus) patch.payment_status = paymentStatus;

    const { error } = await sb.from('orders').update(patch).eq('id', orderId);
    return error ? { success: false, error: error.message } : { success: true };
  }

  /**
   * Maps Database order row to Client Order model.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- linha crua do banco; tipada na correção de pedidos/comunidade
  private static mapDbOrderToModel(dbRow: any): Order {
    return {
      id: String(dbRow.id),
      user_id: String(dbRow.user_id || ''),
      user_email: dbRow.user_email || '',
      items: Array.isArray(dbRow.items) ? dbRow.items : [],
      subtotal: Number(dbRow.subtotal) || 0,
      shipping_fee: Number(dbRow.shipping_fee) || 0,
      discount: Number(dbRow.discount) || 0,
      total: Number(dbRow.total) || 0,
      payment_method: (dbRow.payment_method as PaymentMethod) || 'pix',
      payment_status: dbRow.payment_status || 'pending',
      pix_code: dbRow.pix_code,
      shipping_address: dbRow.shipping_address || {},
      shipping_method: dbRow.shipping_method || 'pac',
      order_status: (dbRow.order_status as OrderStatus) || 'pending_payment',
      tracking_code: dbRow.tracking_code,
      created_at: dbRow.created_at || new Date().toISOString(),
    };
  }
}
