'use client';

import React, { useState } from 'react';
import { uploadImage } from '@/services/media';
import ProductImage from './ProductImage';

export default function ImageEditor({ value, onChange, purpose, onBusyChange }: {
  value: string; onChange: (url: string) => void; purpose: 'avatars' | 'community'; onBusyChange?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
    <p className="text-sm font-bold text-white">{purpose === 'avatars' ? 'Foto de perfil' : 'Imagem da publicação (opcional)'}</p>
    {value.startsWith('https://') && <div className="relative h-24 w-24 overflow-hidden rounded-2xl"><ProductImage src={value} alt="Imagem selecionada" sizes="96px" /></div>}
    <label className="block text-xs text-zinc-400">Importar foto · {purpose === 'community' ? 'até 20 MB' : 'até 8 MB'}
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="mt-2 block max-w-full text-xs text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:p-2 file:text-white" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
        setBusy(true); onBusyChange?.(true); setError('');
        try { onChange(await uploadImage(file, purpose)); }
        catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível enviar a foto.'); }
        finally { setBusy(false); onBusyChange?.(false); }
      }} />
    </label>
    <label className="block text-xs text-zinc-400">Ou link da imagem
      <input type="url" value={value} disabled={busy} onChange={event => onChange(event.target.value)} placeholder="https://…" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-white" />
    </label>
    {value && <button type="button" disabled={busy} onClick={() => onChange('')} className="text-xs text-zinc-400 underline">Remover imagem</button>}
    {busy && <p role="status" className="text-xs text-zinc-400">Enviando imagem…</p>}
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
  </div>;
}
