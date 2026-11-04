'use client';
import { useEffect } from 'react';
export function useDialogScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const root = document.documentElement;
    const y = window.scrollY;
    const saved = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    const rootOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    Object.assign(body.style, { overflow: 'hidden', position: 'fixed', top: `-${y}px`, width: '100%' });
    return () => {
      Object.assign(body.style, saved);
      root.style.overflow = rootOverflow;
      window.scrollTo({ top: y, behavior: 'instant' });
    };
  }, [open]);
}
