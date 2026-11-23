'use client';
import { reportUpdateUnread } from '@/lib/report-groups';
import ModerationTargetLink from '@/components/shared/ModerationTargetLink';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialogScrollLock } from '@/hooks/useDialogScrollLock';
import { Bell, RefreshCw, X } from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import {
  listReports,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  type AccountNotification,
  type ModerationReport,
} from '@/services/moderation';
const NOTIFICATION_SOURCES = [{ table: 'account_notifications' }, { table: 'moderation_reports' }] as const;

export default function NotificationsInbox() {
  const { user } = useCoreMotiom();
  const userId = user?.id;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AccountNotification[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const version = useRef(0);
  useDialogScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  const client = getSupabaseClient();
  const refresh = useCallback(async () => {
    if (!client || !userId) return;
    const current = ++version.current;
    setBusy(true);
    try {
      const [{ data, error }, allReports] = await Promise.all([
        client
          .from('account_notifications')
          .select('*')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false }),
        listReports(),
      ]);
      if (current !== version.current) return;
      if (error) throw new Error(error.message);
      setNotifications((data || []).filter((item:AccountNotification)=>!item.read_at));
      setReports(allReports.filter((r) => r.reporter_id === userId && reportUpdateUnread(r)));
      setError('');
    } catch (err) {
      if (current === version.current)
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível consultar as notificações.'
        );
    } finally {
      if (current === version.current) setBusy(false);
    }
  }, [client, userId]);
  useEffect(() => {
    setNotifications([]);
    setReports([]);
    setOpen(false);
    if (!userId || !client) return;
    void refresh();
    const invalidate = () => {
      version.current += 1;
    };
    return () => {
      invalidate();
    };
  }, [userId, client, refresh]);
  useRealtimeRefresh(client, NOTIFICATION_SOURCES, refresh, Boolean(userId), 'notifications-' + (userId || 'signed-out'), 30000);
  if (!user) return null;
  const unread = notifications.filter((n) => !n.read_at).length;
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          void refresh();
        }}
        aria-label={unread > 0 ? `Notificações: ${unread} não lidas` : 'Notificações'}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:outline focus-visible:outline-red-500"
      >
        <Bell aria-hidden="true" className="h-5 w-5" />
        {unread > 0 && (
          <span aria-hidden="true" className="absolute -right-1 -top-0.5 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && createPortal(
        <div
          className="fixed inset-0 z-[80] bg-black/80 p-4 sm:p-8 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Notificações da conta"
            className="mx-auto max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-950 p-5 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                Notificações e minhas denúncias
              </h2>
              <button
                aria-label="Fechar notificações"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </header>
            <button
              disabled={busy}
              className="flex gap-2 text-sm text-zinc-400"
              onClick={() => void refresh()}
            >
              <RefreshCw className="h-4 w-4" />{' '}
              {busy ? 'Consultando…' : 'Atualizar'}
            </button>
            {!client && (
              <p className="text-sm text-zinc-400">
                Entre com sua conta real para receber orientações da equipe.
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-400">
                Não foi possível atualizar: {error}
              </p>
            )}
            <h3 className="font-semibold">Orientações e respostas da equipe</h3>
            {!notifications.length && !error && (
              <p className="text-sm text-zinc-500">
                Nenhuma notificação recebida.
              </p>
            )}
            {notifications.map((n) => (
              <article
                key={n.id}
                className={`rounded-xl border p-4 space-y-2 ${n.read_at ? 'border-zinc-700' : 'border-red-500/50'}`}
              >
                <p className="text-xs text-zinc-500">
                  {REPORT_CATEGORIES[n.category] || 'Conta'} •{' '}
                  {new Date(n.created_at).toLocaleString('pt-BR')}
                </p>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {n.message}
                </p>
                <ModerationTargetLink category={n.category} targetId={n.target_id}/>
                {!n.read_at && (
                  <button
                    className="text-xs text-red-400"
                    onClick={async () => {
                      const { error } = await client!.rpc(
                        'read_account_notification',
                        { p_id: n.id }
                      );
                      if (error) setError(error.message);
                      else void refresh();
                    }}
                  >
                    Marcar como lida
                  </button>
                )}
              </article>
            ))}
            <h3 className="font-semibold">Denúncias enviadas</h3>
            {!reports.length && (
              <p className="text-sm text-zinc-500">
                Você ainda não enviou denúncias.
              </p>
            )}
            {reports.map((r) => (
              <article
                key={r.id}
                className="rounded-xl border border-zinc-700 p-4 text-sm space-y-2"
              >
                <p className="font-bold">{r.target_title}</p>
                <ModerationTargetLink category={r.category} targetId={r.target_id}/>
                <p className="text-xs text-zinc-400">
                  {REPORT_CATEGORIES[r.category]} • {REPORT_STATUSES[r.status]}
                </p>
                <p className="whitespace-pre-wrap break-words">{r.reason}</p>
                {r.reviewed_at && <button type="button" disabled={busy} className="text-xs font-bold text-red-400" onClick={async()=>{
                  const {error}=await client!.rpc('read_report_update',{p_id:r.id});
                  if(error)setError('Não foi possível marcar como lida. Tente novamente.');else void refresh();
                }}>Marcar atualização como lida</button>}
                {r.response && (
                  <p className="text-emerald-300">Resposta: {r.response}</p>
                )}
              </article>
            ))}
          </section>
        </div>, document.body
      )}
    </div>
  );
}
