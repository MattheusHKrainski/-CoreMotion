'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCoreMotiom } from '@/lib/store';
import { isStaffRole, isAdminRole } from '@/lib/permissions';
import { money, PREPARATION_STATUS, type SaleOrder } from '@/lib/commerce';
import { demoPaymentLabel } from '@/lib/demo-payments';
import { listSaleOrders, reviewSale, listSuppliers, saveSupplier, saleEvents, type SaleEvent, type SupplierSetting } from '@/services/commerce';
import AthleteOrderHistory from './AthleteOrderHistory';
import PricingPanel from './PricingPanel';
import AuthModal from '@/components/auth/AuthModal';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
const SALE_LIVE_SOURCES = [{ table: 'core_sale_orders' }, { table: 'core_sale_events' }, { table: 'core_supplier_settings' }] as const;
const supplierStatus = {
  unconfirmed: 'Não confirmada',
  negotiating: 'Em negociação',
  approved: 'Acordo aprovado',
} satisfies Record<SupplierSetting['agreement_status'], string>;

function SupplierEditor({ supplier, onSaved }: { supplier: SupplierSetting; onSaved: () => Promise<void> }) {
  const [value,setValue]=useState(supplier),[busy,setBusy]=useState(false),[error,setError]=useState('');
  return <form className="space-y-3 rounded-xl border border-zinc-800 p-4" onSubmit={async event => {event.preventDefault();setBusy(true);setError('');try {await saveSupplier(value);await onSaved();} catch(reason) {setError(reason instanceof Error?reason.message:'Não salvo.');} finally {setBusy(false);} }}><h3 className="font-bold">{supplier.name}</h3><label className="block text-xs">Situação comercial<select value={value.agreement_status} onChange={event => setValue({...value,agreement_status:event.target.value as SupplierSetting['agreement_status']})} className="ml-3 rounded-lg bg-zinc-800 p-2"><option value="unconfirmed">Não confirmada</option><option value="negotiating">Em negociação</option><option value="approved">Acordo aprovado pela equipe</option></select></label><label className="block text-xs text-zinc-400">Notas internas<textarea maxLength={2000} value={value.operation_notes} onChange={event => setValue({...value,operation_notes:event.target.value})} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3" /></label><button disabled={busy} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold">{busy?'Salvando…':'Salvar fornecedor'}</button>{error && <p role="alert" className="text-xs text-red-300">{error}</p>}</form>;
}
function OrderCard({ order, staff, refresh }: { order: SaleOrder; staff: boolean; refresh: () => Promise<void> }) {
  const [history,setHistory]=useState<SaleEvent[]>([]);
  const [note,setNote]=useState(order.note),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const update=async (status:'reviewing'|'cancelled') => { if (busy || !window.confirm(status==='cancelled'?'Cancelar este pedido de demonstração? Nenhuma cobrança real foi realizada.':'Colocar este pedido em análise?')) return;setBusy(true);setError('');try {await reviewSale(order.id,status,note);await refresh();} catch(reason) {setError(reason instanceof Error?reason.message:'Não atualizado.');} finally {setBusy(false);} };
  return <article className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"><header><p className={`text-sm font-bold ${order.payment_status==='test_approved'?'text-emerald-300':'text-amber-200'}`}>{order.status==='cancelled'?'Pedido cancelado':order.payment_status==='test_approved'?'Pedido confirmado':PREPARATION_STATUS[order.status]}</p><h2 className="mt-2 break-all text-xs text-zinc-500">Protocolo {order.id}</h2><p className="mt-1 text-xs text-zinc-500">{new Date(order.created_at).toLocaleString('pt-BR')} · Atualizado em {new Date(order.updated_at).toLocaleString('pt-BR')}</p></header><ul className="space-y-2">{order.items.map((item,i) => <li key={i} className="flex flex-wrap justify-between gap-2 text-sm"><span>{item.quantity} × {item.title}<small className="block text-zinc-500">Fornecedor de origem: {item.supplier} · {item.variant || 'Variante não informada'}</small></span><strong>{money(item.unitPriceCents*item.quantity)}</strong></li>)}</ul><p className="text-sm">Subtotal registrado: <strong>{money(order.subtotal_cents)}</strong></p><p className="text-xs text-zinc-300">Forma de pagamento: <strong>{demoPaymentLabel(order.payment_method)}</strong></p><p className="text-xs text-zinc-400">{order.payment_status==='test_approved'?'Pagamento simulado aprovado':order.payment_status==='test_cancelled'?'Pagamento de demonstração cancelado':'Aguardando confirmação'} · Frete não contratado</p><p className="text-xs text-zinc-500">Ambiente de demonstração: sem cobrança ou envio real.</p><p className="text-xs text-zinc-400">Endereço: {order.address.street}, {order.address.number} · {order.address.city}/{order.address.state}</p>{staff && <p className="text-xs text-zinc-500">Destinatário: {order.address.recipient} · Contato: {order.address.phone} · CEP: {order.address.postalCode}</p>}{order.note && <p className="whitespace-pre-wrap break-words text-sm text-zinc-300">Equipe: {order.note}</p>}{order.status!=='cancelled' && <div className="space-y-3">{staff && <><label className="block text-xs text-zinc-400">Observação ao cliente<textarea maxLength={2000} value={note} onChange={event => setNote(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3" /></label><button type="button" disabled={busy} onClick={() => void update('reviewing')} className="mr-4 text-xs font-bold text-red-400">Salvar análise</button></>}<button type="button" disabled={busy} onClick={() => void update('cancelled')} className="text-xs text-zinc-400">Cancelar pedido</button></div>}<details onToggle={event=>{if(event.currentTarget.open)void saleEvents(order.id).then(setHistory).catch(()=>setError('Histórico indisponível.'));}} className="border-t border-zinc-800 pt-3"><summary className="cursor-pointer text-xs text-zinc-400">Histórico registrado</summary><ol className="mt-3 space-y-2 text-xs text-zinc-500"><li>{new Date(order.created_at).toLocaleString('pt-BR')} · Pedido registrado</li>{history.map(event=><li key={event.id}>{new Date(event.created_at).toLocaleString('pt-BR')} · {event.status==='test_approved'?'Pagamento de teste aprovado':PREPARATION_STATUS[event.status]}{event.note?` — ${event.note}`:''}</li>)}</ol></details>{error && <p role="alert" className="text-sm text-red-300">{error}</p>}</article>;
}
export default function OrdersPage() {
  const { user } = useCoreMotiom();
  return <AccountOrders key={JSON.stringify([user?.id, user?.role])} />;
}

function AccountOrders() {
  const { user,isVisitor,setAuthModalOpen,setAuthModalMode } = useCoreMotiom();
  const staff=isStaffRole(user?.role),id=user?.id;
  const [orders,setOrders]=useState<SaleOrder[]>([]),[suppliers,setSuppliers]=useState<SupplierSetting[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false);
  const refresh=useCallback(async () => {if(!id)return;setLoading(true);setError('');try {const rows=await listSaleOrders();setOrders(rows);if(staff)setSuppliers(await listSuppliers());} catch(reason) {setError(reason instanceof Error?reason.message:'Pedidos indisponíveis.');} finally {setLoading(false);} },[id,staff]);
  const client = getSupabaseClient();
  useRealtimeRefresh(client, SALE_LIVE_SOURCES, refresh, Boolean(id), 'sale-orders-' + (id || 'visitor'));
  useEffect(() => {let active=true;setOrders([]);setSuppliers([]);if(id){setLoading(true);listSaleOrders().then(rows=>{if(active)setOrders(rows);}).catch(()=>{if(active)setError('Não foi possível carregar os pedidos.');}).finally(()=>{if(active)setLoading(false);});if(staff)listSuppliers().then(rows=>{if(active)setSuppliers(rows);}).catch(()=>{if(active)setError('Não foi possível carregar os fornecedores.');});}return()=>{active=false;};},[id,staff]);
  const activeOrders=orders.filter(order=>order.status!=='cancelled');
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-8 text-white"><header className="flex justify-between gap-4"><Link href="/" className="font-black">← CoreShop</Link><Link href="/compras" className="text-sm text-red-400">Carrinho</Link></header><h1 className="text-3xl font-black">{staff?'Gestão de pedidos':'Meus pedidos'}</h1><p className="text-sm leading-relaxed text-zinc-400">Acompanhe seus pedidos e as atualizações registradas pela equipe.</p>{!user || isVisitor ? <button type="button" onClick={()=>{setAuthModalMode('login');setAuthModalOpen(true);}} className="rounded-xl bg-red-600 p-4 font-bold">Entrar para acompanhar</button> : <><button type="button" disabled={loading} onClick={()=>void refresh()} className="text-sm text-red-400">{loading?'Carregando…':'Atualizar pedidos'}</button>{!loading&&!activeOrders.length&&!error&&<p className="text-sm text-zinc-500">Nenhum pedido ativo registrado.</p>}<h2 className="text-lg font-bold">Vendido pela CoreMotion</h2>{activeOrders.map(order=><OrderCard key={`${order.id}-${order.updated_at}`} order={order} staff={staff} refresh={refresh}/>)}<AthleteOrderHistory key={id} userId={id!} />{staff&&<PricingPanel/>}{staff&&<section className="space-y-4 border-t border-zinc-800 pt-6"><h2 className="text-xl font-black">Fornecedores e operação</h2>{suppliers.map(supplier => isAdminRole(user.role)
    ? <SupplierEditor key={supplier.name} supplier={supplier} onSaved={refresh} />
    : <article key={supplier.name} className="rounded-xl border border-zinc-800 p-4">
        <h3 className="font-bold">{supplier.name}</h3>
        <p className="text-sm">{supplierStatus[supplier.agreement_status]}</p>
        {supplier.operation_notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-400">{supplier.operation_notes}</p>}
      </article>)}<p className="text-xs text-zinc-500">Preços de varejo e catálogo são gerenciados no painel de ofertas existente. O preço do servidor é soberano; alterações não modificam preparações anteriores.</p></section>}</>}{error&&<p role="alert" className="text-red-300">{error}</p>}<AuthModal/></main>;
}
