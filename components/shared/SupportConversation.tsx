'use client';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { TICKET_STATUSES, type SupportTicket, type TicketStatus } from '@/lib/support';
import { listSupportMessages, sendSupportMessage, type SupportMessage } from '@/services/support';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';

export default function SupportConversation({ ticket, staff, onSaved }: { ticket: SupportTicket; staff: boolean; onSaved: () => Promise<void> }) {
  const [open,setOpen] = useState(false);
  const [messages,setMessages] = useState<SupportMessage[]>([]);
  const [draft,setDraft] = useState('');
  const [status,setStatus] = useState<TicketStatus>(ticket.status);
  const [busy,setBusy] = useState(false), [loading,setLoading] = useState(false);
  const [error,setError] = useState(''), [notice,setNotice] = useState('');
  const request = useRef<{ text: string; status: string; id: string } | null>(null);
  const generation = useRef(0);
  const client = getSupabaseClient();
  const sources = useMemo(() => [{table:'support_messages',filter:`ticket_id=eq.${ticket.id}`}], [ticket.id]);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    try { const rows = await listSupportMessages(ticket.id); if(current===generation.current) {setMessages(rows);setError('');} }
    catch(e) { if(current===generation.current) setError(e instanceof Error?e.message:'Conversa indisponível.'); }
    finally {if(current===generation.current) setLoading(false);}
  }, [ticket.id]);
  useEffect(() => {if(open) void refresh(); return () => {generation.current++;};}, [open,refresh]);
  useEffect(() => {setStatus(ticket.status);}, [ticket.status]);
  useRealtimeRefresh(client,sources,refresh,open,`support-thread-${ticket.id}`);
  return <div className="mt-4 border-t border-zinc-800 pt-3">
    <button type="button" aria-expanded={open} aria-controls={`support-thread-${ticket.id}`} onClick={()=>setOpen(value=>!value)} className="text-sm font-bold text-red-400">{open?'Fechar conversa':staff?'Abrir conversa e atender':'Abrir conversa / enviar mensagem'}</button>
    {open && <div id={`support-thread-${ticket.id}`} className="mt-4 space-y-3">
      <div className="flex items-center justify-between"><h5 className="text-sm font-bold">Histórico do atendimento</h5><button type="button" onClick={()=>void refresh()} disabled={loading} className="text-xs text-zinc-400">Atualizar conversa</button></div>
      {loading && <p role="status" className="text-xs text-zinc-400">Carregando conversa…</p>}
      {!loading && !error && !messages.length && <p className="text-xs text-zinc-400">Nenhuma mensagem adicional. A solicitação inicial está acima.</p>}
      <ol className="max-h-96 space-y-3 overflow-y-auto">{messages.map(item=><li key={item.id} className={`rounded-xl border p-3 ${item.from_staff?'border-red-900/50 bg-red-950/20':'border-zinc-700 bg-zinc-950'}`}><div className="flex flex-wrap justify-between gap-2 text-xs"><strong>{item.from_staff?'Equipe CoreMotion':'Cliente'}</strong><time className="text-zinc-500" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString('pt-BR')}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-sm">{item.content}</p></li>)}</ol>
      <form className="space-y-3" onSubmit={async event=>{
        event.preventDefault();if(busy)return;
        const text=draft.trim(), selectedStatus=staff?status:'';
        if(!text && !staff)return;
        if(!request.current || request.current.text!==text || request.current.status!==selectedStatus) request.current={text,status:selectedStatus,id:crypto.randomUUID()};
        setBusy(true);setError('');setNotice('');
        try {await sendSupportMessage(ticket.id,text,request.current.id,staff?status:undefined);setDraft('');request.current=null;setNotice('Salvo no atendimento.');await refresh();await onSaved();}
        catch(e) {setError(e instanceof Error?e.message:'Mensagem não enviada; texto preservado.');}
        finally {setBusy(false);}
      }}>
        <label className="block text-xs text-zinc-400">{staff?'Mensagem da equipe':'Sua mensagem'}<textarea value={draft} onChange={event=>setDraft(event.target.value)} maxLength={4000} required={!staff} disabled={busy} rows={3} placeholder="Não envie senhas, códigos ou dados de cartão." className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
        {staff && <label className="flex items-center gap-2 text-xs text-zinc-400">Situação<select value={status} disabled={busy} onChange={event=>setStatus(event.target.value as TicketStatus)} className="rounded-lg bg-zinc-800 p-2 text-white">{Object.entries(TICKET_STATUSES).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>}
        {!staff && ticket.status==='resolved' && <p className="text-xs text-zinc-400">Enviar uma mensagem reabre esta solicitação.</p>}
        <button type="submit" disabled={busy || (!staff && !draft.trim())} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold disabled:opacity-50">{busy?'Salvando…':staff?'Enviar / atualizar atendimento':'Enviar mensagem'}</button>
      </form>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      {notice && <p role="status" className="text-xs text-emerald-300">{notice}</p>}
    </div>}
  </div>;
}
