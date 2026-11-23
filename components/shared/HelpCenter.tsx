'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, RefreshCw, X } from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import { isStaffRole } from '@/lib/permissions';
import { HELP_TOPICS, SUPPORT_EMAIL, TICKET_STATUSES, supportMailto, type HelpTopic, type SupportTicket } from '@/lib/support';
import SupportFAQ from './SupportFAQ';
import SupportConversation from './SupportConversation';
import { createSupportTicket, listSupportTickets } from '@/services/support';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';

const SUPPORT_LIVE_SOURCES = [{ table: 'support_tickets' }] as const;

export default function HelpCenter({ initialTopic, onClose, initialFaq = false }: { initialTopic: HelpTopic; onClose: () => void; initialFaq?: boolean }) {
  const { user, setActiveView, setAuthModalMode, setAuthModalOpen } = useCoreMotiom();
  const dialog = useRef<HTMLDialogElement>(null);
  const [showFaq, setShowFaq] = useState(initialFaq);
  const [topic, setTopic] = useState<HelpTopic>(initialTopic);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [queueStatus, setQueueStatus] = useState('all');
  const [queueSearch, setQueueSearch] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const pageSize = useRef(20);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const staff = isStaffRole(user?.role);
  const identity = user?.id;
  const client = getSupabaseClient();
  const version = useRef(0);
  const refresh = useCallback(async () => {
    if (!identity) return;
    const current = ++version.current; setLoading(true);
    try { const data = await listSupportTickets(pageSize.current); if (current === version.current) { setHasMore(data.length === pageSize.current); setTickets(data); setError(''); } }
    catch (reason) { if (current === version.current) setError(reason instanceof Error ? reason.message : 'Solicitações indisponíveis.'); }
    finally { if (current === version.current) setLoading(false); }
  }, [identity]);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => { node?.close(); }; }, []);
  useEffect(() => { const requestVersion = version; setTickets([]); void refresh(); return () => { requestVersion.current++; }; }, [refresh]);
  useRealtimeRefresh(client, SUPPORT_LIVE_SOURCES, refresh, Boolean(identity), 'help-center-' + (identity || 'visitor'));

  const go = (target: 'profile' | 'marketplace') => { onClose(); setActiveView(target); };
  return createPortal(<dialog ref={dialog} aria-labelledby="help-center-title" onCancel={event => { if (busy) event.preventDefault(); else onClose(); }} className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-5xl overflow-y-auto rounded-3xl border border-zinc-700 bg-zinc-950 p-5 text-white shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm sm:p-7">
    <header className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-red-400">CoreMotion</p><h2 id="help-center-title" className="mt-2 text-2xl font-black">Central de Atendimento</h2><a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 inline-flex items-center gap-2 break-all text-xs text-zinc-400 hover:text-white"><Mail className="h-4 w-4 shrink-0" />{SUPPORT_EMAIL}</a></div><button type="button" autoFocus disabled={busy} onClick={onClose} aria-label="Fechar atendimento" className="rounded-full p-2 hover:bg-zinc-800"><X className="h-5 w-5" /></button></header>
    <div className="grid gap-6 md:grid-cols-[190px_1fr]">
      <nav aria-label="Assuntos de ajuda" className="flex flex-wrap gap-2 content-start md:flex-col"><button type="button" aria-current={showFaq ? 'page' : undefined} onClick={() => setShowFaq(true)} className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold ${showFaq ? 'border-red-600 bg-red-950/40 text-white' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'}`}>Perguntas frequentes</button>{Object.entries(HELP_TOPICS).map(([id,item]) => <button key={id} type="button" aria-current={!showFaq && topic === id ? 'page' : undefined} onClick={() => { setShowFaq(false); setTopic(id as HelpTopic); setNotice(''); }} className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold ${!showFaq && topic === id ? 'border-red-600 bg-red-950/40 text-white' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'}`}>{item.label}</button>)}</nav>
      <div className="min-w-0 space-y-6">
        {showFaq && <SupportFAQ onContact={() => {setTopic('contact');setShowFaq(false);}} />}
        <div hidden={showFaq} className="space-y-6">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><h3 className="text-lg font-bold">{HELP_TOPICS[topic].title}</h3><p className="mt-3 text-sm leading-relaxed text-zinc-300">{HELP_TOPICS[topic].text}</p>
          <div className="mt-4 flex flex-wrap gap-3"><a href={supportMailto(topic)} className="text-xs font-bold text-red-400 underline">Enviar e-mail</a>{topic === 'orders' && <button type="button" onClick={() => { if (!user) { onClose(); setAuthModalMode('login'); setAuthModalOpen(true); } else go('profile'); }} className="text-xs font-bold text-red-400 underline">Abrir minha conta e pedidos</button>}{topic === 'products' && <button type="button" onClick={() => go('marketplace')} className="text-xs font-bold text-red-400 underline">Explorar produtos</button>}</div>
        </article>
        <section aria-labelledby="support-form-title" className="rounded-2xl border border-zinc-800 p-5"><h3 id="support-form-title" className="font-bold">Registrar solicitação</h3><p className="mt-2 text-xs leading-relaxed text-zinc-400">Converse com a equipe e acompanhe o histórico pelo protocolo. A resposta fica disponível aqui, em suas solicitações. Não envie senhas, códigos de acesso ou dados de cartão.</p>
          {!user ? <button type="button" onClick={() => { onClose(); setAuthModalMode('login'); setAuthModalOpen(true); }} className="mt-4 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold">Entrar para registrar e acompanhar</button> : <form className="mt-4 space-y-3" onSubmit={async event => {
            event.preventDefault(); if (busy || loading) return; setBusy(true); setError(''); setNotice('');
            try { const saved = await createSupportTicket({ category: topic, subject, message, reference }); setTickets(items => [saved, ...items]); setSubject(''); setMessage(''); setReference(''); setNotice(`Solicitação registrada. Protocolo: ${saved.id}. Acompanhe a resposta abaixo.`); }
            catch (reason) { setError(reason instanceof Error ? reason.message : 'Solicitação não enviada.'); }
            finally { setBusy(false); }
          }}>
            <p className="text-xs text-zinc-400">Categoria: <strong>{HELP_TOPICS[topic].label}</strong></p>
            <label className="block text-xs text-zinc-400">Assunto<input required minLength={3} maxLength={200} value={subject} onChange={event => setSubject(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-white" /></label>
            <label className="block text-xs text-zinc-400">Descrição da solicitação<textarea required minLength={10} maxLength={4000} rows={4} value={message} onChange={event => setMessage(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-white" /></label>
            <label className="block text-xs text-zinc-400">Referência do anúncio ou pedido (opcional)<input maxLength={200} value={reference} onChange={event => setReference(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-white" /></label>
            <button type="submit" disabled={busy || loading || user.is_banned} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold disabled:opacity-50">{busy ? 'Registrando…' : 'Registrar solicitação'}</button>
          </form>}
        </section>
        {notice && <p role="status" className="break-words rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-300">{notice}</p>}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        {user && <section aria-labelledby="support-history-title" className="space-y-4"><div className="flex items-center justify-between gap-3"><h3 id="support-history-title" className="font-bold">{staff ? 'Solicitações dos clientes' : 'Minhas solicitações'}</h3><button type="button" disabled={loading || busy} onClick={() => void refresh()} className="inline-flex items-center gap-2 text-xs text-zinc-400"><RefreshCw className="h-3.5 w-3.5" />Atualizar</button></div>
          {loading && <p role="status" className="text-xs text-zinc-500">Carregando solicitações…</p>}
          {!loading && tickets.length === 0 && <p className="text-sm text-zinc-500">Nenhuma solicitação registrada.</p>}
          <div className="flex flex-wrap gap-3"><input type="search" aria-label="Buscar solicitações" placeholder="Buscar protocolo, assunto ou referência" value={queueSearch} onChange={event=>setQueueSearch(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-sm" /><select aria-label="Filtrar situação do atendimento" value={queueStatus} onChange={event=>setQueueStatus(event.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-xs"><option value="all">Todas as situações</option>{Object.entries(TICKET_STATUSES).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></div>
          {tickets.filter(ticket=>(queueStatus==='all'||ticket.status===queueStatus)&&`${ticket.id} ${ticket.subject} ${ticket.reference}`.toLocaleLowerCase('pt-BR').includes(queueSearch.toLocaleLowerCase('pt-BR'))).map(ticket => <article key={ticket.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"><div className="flex flex-wrap justify-between gap-2"><h4 className="break-words text-sm font-bold">{ticket.subject}</h4><span className="text-xs text-red-300">{TICKET_STATUSES[ticket.status]}</span></div><p className="mt-2 break-all text-[10px] text-zinc-500">Protocolo: {ticket.id} · {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm text-zinc-300">{ticket.message}</p>{ticket.reference && <p className="mt-2 break-words text-xs text-zinc-500">Referência: {ticket.reference}</p>}{ticket.response && <div className="mt-3 rounded-xl border border-zinc-700 p-3"><p className="text-xs font-bold text-zinc-400">Resposta da equipe</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{ticket.response}</p></div>}<SupportConversation ticket={ticket} staff={staff} onSaved={refresh} /></article>)}
          {hasMore && <button type="button" disabled={loading} onClick={()=>{pageSize.current+=20;void refresh();}} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold">Mostrar mais solicitações</button>}
        </section>}
        </div>
      </div>
    </div>
  </dialog>, document.body);
}
