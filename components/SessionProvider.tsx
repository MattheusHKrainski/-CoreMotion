'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { CoreMotiomProvider } from '@/lib/store';

/** Query-scoped profiles and browser storage must not disagree with server markup. */
export default function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0C10] text-zinc-300" role="status" aria-live="polite">
      <span className="animate-pulse">Carregando CoreMotion…</span>
    </main>
  );
  return <CoreMotiomProvider>{children}</CoreMotiomProvider>;
}
