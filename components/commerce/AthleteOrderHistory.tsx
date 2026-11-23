'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { OrderService } from '@/services/orderService';
import { money, retailPriceCents } from '@/lib/commerce';
import type { Order } from '@/lib/types';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
const SOURCES = [{table:'orders'}] as const;
export default function AthleteOrderHistory({userId}:{userId:string}) {
 const [orders,setOrders]=useState<Order[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const [visible,setVisible]=useState(10);
 const client=getSupabaseClient();
 const refresh=useCallback(async()=>{setLoading(true);try{setOrders(await OrderService.getMyOrders(userId,true));setError('');}catch{setError('Não foi possível carregar os pedidos de atletas. Tente novamente.');}finally{setLoading(false);}},[userId]);
 useEffect(()=>{void refresh();},[refresh]);
 useRealtimeRefresh(client,SOURCES,refresh,true,`account-athlete-orders-${userId}`);
 return <section className="space-y-4 rounded-2xl border border-zinc-800 p-5" aria-label="Pedidos com atletas"><h2 className="text-lg font-bold">Compras com atletas</h2><p className="text-xs text-zinc-400">Registros disponíveis na plataforma. Conversas ou acordos feitos fora do aplicativo não geram pedidos automaticamente.</p>
 {loading && <p role="status" className="text-sm text-zinc-400">Carregando…</p>}
 {error && <div role="alert" className="text-sm text-red-300">{error}<button type="button" onClick={()=>void refresh()} className="ml-3 underline">Tentar novamente</button></div>}
 {!loading&&!error&&!orders.length&&<p className="text-sm text-zinc-500">Nenhum pedido com atletas registrado.</p>}
 {orders.slice(0,visible).map(order=><article key={order.id} className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><p className="text-xs font-bold text-red-400">Vendido por atletas</p><h3 className="break-all text-sm font-bold">Pedido {order.id}</h3><p className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleString('pt-BR')}</p><ul className="space-y-2">{order.items.map((item,index)=><li key={`${item.product.id}-${index}`} className="text-sm">{item.quantity} × {item.product.title}<span className="block text-xs text-zinc-400">Vendedor: {item.product.seller_name || 'Atleta'}</span></li>)}</ul><p className="text-sm">Valor registrado: {money(retailPriceCents(order.total))}</p>{order.tracking_code&&<p className="break-all text-xs text-zinc-400">Rastreamento informado: {order.tracking_code}</p>}</article>)}
 {orders.length>visible&&<button type="button" onClick={()=>setVisible(value=>value+10)} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold">Mostrar mais</button>}
 </section>;
}
