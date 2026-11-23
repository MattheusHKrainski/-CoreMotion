import { getSupabaseClient } from './supabaseClient';
import { validateAddress, validateCart, type SaleCartLine, type SaleOrder, type ShippingAddress } from '@/lib/commerce';
import type { DemoPaymentMethod } from '@/lib/demo-payments';
function client() { const sb = getSupabaseClient(); if (!sb) throw new Error('O banco de vendas não está configurado neste ambiente. Nenhum pedido foi registrado.'); return sb; }
export async function prepareSale(lines: SaleCartLine[], address: ShippingAddress, key: string): Promise<string> {
  validateCart(lines); validateAddress(address);
  const { data, error } = await client().rpc('prepare_core_sale', { p_items: lines, p_address: address, p_request_key: key });
  if (error || !data) throw new Error('Não foi possível salvar a preparação. Verifique a conexão e a configuração do banco; tente novamente sem fechar esta tela.');
  return String(data);
}
/** Single atomic RPC: recalculate catalog prices, save the order, and mark a fictitious approval.
 * Request key is reused on network retries, so a double click cannot create a second order.
 * No real payment identifiers or card data are collected or transmitted.
 */
export async function confirmDemoSale(
  lines: SaleCartLine[], address: ShippingAddress, key: string, method: DemoPaymentMethod
): Promise<string> {
  validateCart(lines);
  validateAddress(address);
  const { data, error } = await client().rpc('confirm_demo_order', {
    p_items: lines, p_address: address, p_request_key: key, p_method: method,
  });
  if (error || !data) {
    throw new Error(error?.message || 'Não foi possível confirmar o pedido. Tente novamente; o mesmo pedido não será duplicado.');
  }
  return String(data);
}
export async function listSaleOrders(): Promise<SaleOrder[]> { const { data, error } = await client().from('core_sale_orders').select('*').order('created_at', { ascending: false }).limit(100); if (error) throw new Error('Não foi possível carregar os pedidos CoreMotion.'); return data || []; }
export async function reviewSale(id: string, status: 'reviewing' | 'cancelled', note = ''): Promise<void> { const { error } = await client().rpc('review_core_sale', { p_id: id, p_status: status, p_note: note }); if (error) throw new Error('Não foi possível atualizar o pedido.'); }
/** Only the signed-in order owner can approve a presentation-mode payment. */
export async function simulateSalePayment(orderId: string): Promise<void> {
  const { data, error } = await client().rpc('simulate_core_sale_payment', { p_id: orderId });
  if (error || data !== 'test_approved') throw new Error(error?.message || 'Não foi possível confirmar a transação de demonstração.');
}
export interface SupplierSetting { name: string; agreement_status: 'unconfirmed' | 'negotiating' | 'approved'; operation_notes: string }
export async function listSuppliers(): Promise<SupplierSetting[]> { const { data, error } = await client().from('core_supplier_settings').select('*').order('name'); if (error) throw new Error('Não foi possível carregar fornecedores.'); return data || []; }
export async function saveSupplier(setting: SupplierSetting) { const { data, error } = await client().from('core_supplier_settings').update({ agreement_status: setting.agreement_status, operation_notes: setting.operation_notes }).eq('name', setting.name).select('name'); if (error || !data?.length) throw new Error('Não foi possível salvar o fornecedor.'); }
export interface SaleEvent { id: string; order_id: string; status: 'reviewing' | 'cancelled' | 'test_approved'; note: string; created_at: string }
export async function saleEvents(orderId: string): Promise<SaleEvent[]> { const { data,error }=await client().from('core_sale_events').select('id,order_id,status,note,created_at').eq('order_id',orderId).order('created_at');if(error)throw new Error('Não foi possível carregar o histórico.');return data||[]; }
