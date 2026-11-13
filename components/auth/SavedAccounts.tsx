'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserRound } from 'lucide-react';
import { ACCOUNT_TYPES } from '@/lib/sports';
import { SAVED_ACCOUNTS_EVENT, type SavedAccount } from '@/lib/saved-accounts';
import { notifySavedAccounts, savedAccountVault } from '@/services/savedAccounts';

export default function SavedAccounts({ busy, onSelect }: { busy: boolean; onSelect: (id: string) => void }) {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [removing, setRemoving] = useState<SavedAccount | null>(null);
  const [error, setError] = useState('');
  const confirmation = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!removing) return;
    const dialog = confirmation.current;
    // The native top layer overlays the login dialog and makes its controls inert.
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, [removing]);
  useEffect(() => {
    const load = () => {
      try { setAccounts(savedAccountVault().list()); }
      catch { setError('O navegador não permite ler as contas salvas.'); }
    };
    load();
    window.addEventListener(SAVED_ACCOUNTS_EVENT, load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener(SAVED_ACCOUNTS_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  const remove = () => {
    if (!removing) return;
    try {
      savedAccountVault().remove(removing.id);
      notifySavedAccounts();
      setRemoving(null);
      setError('');
    } catch { setError('Não foi possível remover. Tente novamente.'); }
  };
  return <section aria-label="Acesso rápido" className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5">
    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-300">Acesso rápido</h4>
    <p className="mb-3 text-xs text-zinc-400">Contas que você escolheu salvar neste navegador.</p>
    {accounts.length === 0 && <p className="text-xs text-zinc-400">Nenhuma conta salva. Marque a opção ao entrar ou criar sua conta.</p>}
    <div className="grid grid-cols-2 gap-2">
      {accounts.map(account => <div key={account.id} className="relative rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-600">
        <button type="button" disabled={busy || Boolean(removing)} onClick={() => onSelect(account.id)} aria-label={`Entrar como ${account.name}`} className="h-full w-full p-3 pr-8 text-left disabled:opacity-50">
          <UserRound className="mb-2 h-5 w-5 text-red-400" />
          <span className="block break-words text-xs font-bold text-white">{account.name}</span>
          <span className="mt-1 block text-[11px] text-zinc-400">{ACCOUNT_TYPES[account.account_type].label}</span>
          {(account.role === 'admin' || account.role === 'supervisor') && <span className="block text-[11px] text-zinc-400">{account.role === 'admin' ? 'Administrador' : 'Supervisor'}</span>}
          {account.needsLogin && <span className="mt-1 block text-[11px] text-amber-300">Entrar novamente</span>}
        </button>
        <button type="button" disabled={busy || Boolean(removing)} onClick={() => { setError(''); setRemoving(account); }} aria-label={`Remover ${account.name} do acesso rápido`} className="absolute right-1 top-1 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-50"><X className="h-3.5 w-3.5" /></button>
      </div>)}
    </div>
    {removing && createPortal(<dialog ref={confirmation} role="alertdialog" aria-modal="true" aria-labelledby="remove-saved-title" aria-describedby="remove-saved-description"
      onCancel={event => { event.preventDefault(); setRemoving(null); setError(''); }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-5 text-white shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm">
      <h5 id="remove-saved-title" className="text-sm font-bold">Remover {removing.name} do acesso rápido?</h5>
      <p id="remove-saved-description" className="mt-2 text-xs text-zinc-400">A conta não será excluída e a sessão atual não será encerrada. Para entrar novamente depois de sair, use e-mail e senha.</p>
      <div className="mt-3 flex gap-2">
        <button autoFocus type="button" onClick={() => { setRemoving(null); setError(''); }} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs">Cancelar</button>
        <button type="button" onClick={remove} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold">Confirmar remoção</button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
    </dialog>, document.body)}
    {error && !removing && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
  </section>;
}
