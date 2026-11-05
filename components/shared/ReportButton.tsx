'use client';
import React, { useState } from 'react';
import { REPORT_REASONS, buildReportReason } from '@/lib/report-reasons';
import { Flag, X } from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import { submitReport, type ReportCategory } from '@/services/moderation';

export default function ReportButton({
  category,
  targetId,
  title,
}: {
  category: ReportCategory;
  targetId: string;
  title: string;
}) {
  const { user, setAuthModalOpen, setAuthModalMode, addToast } =
    useCoreMotiom();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonCode, setReasonCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="text-xs" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-zinc-400 hover:text-red-400 focus-visible:outline-red-500"
        aria-expanded={open}
        onClick={() => {
          if (!user) {
            setAuthModalMode('login');
            setAuthModalOpen(true);
            return;
          }
          setOpen(!open);
          setError('');
        }}
      >
        <Flag className="h-3.5 w-3.5" /> Denunciar
      </button>
      {open && (
        <form
          className="mt-2 space-y-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setError('');
            try {
              await submitReport(category, targetId, title, buildReportReason(reasonCode, reason));
              setReason('');
              setReasonCode('');
              setOpen(false);
              addToast(
                'Denúncia enviada',
                'A equipe poderá analisar o conteúdo. Você receberá a resposta em Notificações.',
                'success'
              );
            } catch (err) {
              setError(
                err instanceof Error ? err.message : 'Não foi possível enviar.'
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-white">Reportar: {title}</p>
            <button
              type="button"
              aria-label="Fechar denúncia"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <label className="block text-zinc-300">
            Motivo da denúncia
            <select required value={reasonCode} onChange={e => setReasonCode(e.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white">
              <option value="" disabled>Escolha o motivo</option>
              {Object.entries(REPORT_REASONS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <label className="block text-zinc-300">
            {reasonCode === 'other' ? 'Descreva o motivo' : 'Detalhes adicionais (opcional)'}
            <textarea
              required={reasonCode === 'other'}
              minLength={reasonCode === 'other' ? 5 : undefined}
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Informe o erro, abuso ou informação que precisa de revisão."
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white"
              rows={3}
            />
          </label>
          {error && (
            <p role="alert" className="text-red-400">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-40"
          >
            {busy ? 'Enviando…' : 'Enviar à moderação'}
          </button>
        </form>
      )}
    </div>
  );
}
