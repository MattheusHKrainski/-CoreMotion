'use client';

import React, { useState, type ReactNode } from 'react';
import { openExternalStore } from '@/lib/open-external-store';

/** Keep a real href for context menus and modifier clicks; never silently swallow blocked navigation. */
export default function ExternalStoreLink({ href, children, className, label }: {
  href: string;
  children: ReactNode;
  className: string;
  label?: string;
}) {
  const [blocked, setBlocked] = useState(false);
  return <span className="flex flex-col gap-2">
    <a href={href} target="_blank" rel="noopener noreferrer sponsored" aria-label={label} className={className}
      onClick={event => {
        event.stopPropagation();
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        // Must run synchronously inside the user's click, not after an await.
        const opened = openExternalStore(href);
        setBlocked(!opened);
        // Leave native navigation enabled if a popup was denied.
        if (opened) event.preventDefault();
      }}>
      {children}
    </a>
    {blocked && <span role="status" className="text-xs font-normal text-zinc-300">
      O navegador pode ter bloqueado a nova aba.{' '}
      <a href={href} target="_top" rel="sponsored" onClick={event => event.stopPropagation()} className="font-semibold text-red-300 underline">Abrir a loja nesta aba</a>
      <span className="block mt-1">Se estiver no preview, abra o CoreMotion fora do painel e tente novamente.</span>
    </span>}
  </span>;
}
