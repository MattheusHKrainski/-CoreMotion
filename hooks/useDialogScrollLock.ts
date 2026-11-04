'use client';

import { useEffect } from 'react';

/** Freeze the background, including mobile Safari, without losing the page's scroll position. */
export function useDialogScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const root = document.documentElement;
    const scrollY = window.scrollY;
    const previous = {
      overflow: body.style.overflow, position: body.style.position,
      top: body.style.top, width: body.style.width,
      paddingRight: body.style.paddingRight, rootOverflow: root.style.overflow,
    };
    const gutter = window.innerWidth - root.clientWidth;
    const padding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    if (gutter > 0) body.style.paddingRight = `${padding + gutter}px`;
    return () => {
      Object.assign(body.style, {
        overflow: previous.overflow, position: previous.position,
        top: previous.top, width: previous.width, paddingRight: previous.paddingRight,
      });
      root.style.overflow = previous.rootOverflow;
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [open]);
}
