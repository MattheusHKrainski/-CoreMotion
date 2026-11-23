'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Share2, X } from 'lucide-react';
import { copyText } from '@/lib/clipboard';
import { communityPostUrl } from '@/lib/community-share';

export default function CommunityShare({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [url, setUrl] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const encoded = encodeURIComponent(url);
  const links = [
    { name: 'WhatsApp', label: 'W', color: 'bg-green-600', href: `https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}` },
    { name: 'Telegram', label: 'T', color: 'bg-sky-600', href: `https://t.me/share/url?url=${encoded}&text=${encodeURIComponent(title)}` },
    { name: 'Facebook', label: 'f', color: 'bg-blue-600', href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
    { name: 'E-mail', label: '@', color: 'bg-zinc-600', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encoded}` },
  ];
  return <>
    <button ref={trigger} type="button" aria-label={`Compartilhar publicação: ${title}`} onClick={() => { setUrl(communityPostUrl(window.location.origin,id)); setStatus(''); setOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-zinc-800/70 px-3 py-2 text-zinc-200 transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-red-500"><Share2 aria-hidden="true" className="h-4 w-4" /><span>Compartilhar</span></button>
    {open && createPortal(<dialog ref={dialog} onCancel={close} onClick={event => { if (event.target === dialog.current) close(); }} aria-label="Compartilhar publicação" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-5 text-white shadow-2xl backdrop:bg-black/70">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Compartilhar</h2><button type="button" aria-label="Fechar compartilhamento" onClick={close} className="rounded-full p-2 hover:bg-zinc-800"><X className="h-5 w-5" /></button></div>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{title}</p>
      <div className="my-6 flex flex-wrap justify-center gap-5">{links.map(link => <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-xs hover:underline"><span aria-hidden="true" className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold ${link.color}`}>{link.label}</span>{link.name}</a>)}</div>
      <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 p-2"><input aria-label="Link da publicação" readOnly value={url} onFocus={event => event.target.select()} className="min-w-0 flex-1 bg-transparent px-2 text-xs text-zinc-300 outline-none" /><button type="button" onClick={async () => setStatus(await copyText(url) ? 'Link copiado!' : 'Não foi possível copiar. Selecione o link e copie manualmente.')} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold hover:bg-red-500"><Copy className="h-4 w-4" />Copiar</button></div>
      {typeof navigator.share === 'function' && <button type="button" onClick={async () => { try { await navigator.share({title,url}); } catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) setStatus('Compartilhamento indisponível. Use uma opção acima ou copie o link.'); } }} className="mt-4 text-sm font-semibold text-zinc-300 hover:text-white">Mais opções de compartilhamento</button>}
      <p role="status" className="mt-3 text-xs text-zinc-300">{status}</p>
    </dialog>,document.body)}
  </>;
}
