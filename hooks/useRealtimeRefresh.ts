'use client';

import { useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export type RealtimeSource = Readonly<{ table: string; filter?: string }>;

/**
 * Re-fetch the authoritative, RLS-filtered rows when another device commits a change.
 * Payloads are only invalidation signals: never trust them as the complete/authorized dataset.
 * Re-sync on subscription/reconnect, focus and online; poll as a fallback for dropped sockets.
 */
export function useRealtimeRefresh(
  client: SupabaseClient | null,
  sources: readonly RealtimeSource[],
  refresh: () => void | Promise<void>,
  enabled: boolean,
  channelId: string,
  fallbackMs = 60000,
): void {
  useEffect(() => {
    if (!client || !enabled || sources.length === 0) return;
    let active = true;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;
    let pending = false;
    const perform = async () => {
      if (!active) return;
      if (inFlight) { pending = true; return; }
      inFlight = true;
      try { await refresh(); }
      catch (error) { console.warn('[CoreMotion Realtime] Sincronização indisponível:', error); }
      finally {
        inFlight = false;
        if (pending && active) { pending = false; schedule(); }
      }
    };
    const schedule = () => {
      if (!active || document.visibilityState === 'hidden') return;
      if (debounce !== undefined) clearTimeout(debounce);
      debounce = setTimeout(() => {
        debounce = undefined;
        void perform();
      }, 120);
    };
    const channel = client.channel('coremotion-' + channelId);
    for (const source of sources) {
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: source.table,
        ...(source.filter ? { filter: source.filter } : {}),
      }, schedule);
    }
    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') schedule(); // recovers changes between fetch and subscription
      if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
        console.warn('[CoreMotion Realtime] Conexão temporariamente indisponível:', channelId, status);
      }
    });
    const onVisibility = () => { if (document.visibilityState === 'visible') schedule(); };
    window.addEventListener('focus', schedule);
    window.addEventListener('online', schedule);
    document.addEventListener('visibilitychange', onVisibility);
    const fallback = window.setInterval(schedule, fallbackMs);
    return () => {
      active = false;
      if (debounce !== undefined) clearTimeout(debounce);
      clearInterval(fallback);
      window.removeEventListener('focus', schedule);
      window.removeEventListener('online', schedule);
      document.removeEventListener('visibilitychange', onVisibility);
      void client.removeChannel(channel);
    };
  }, [client, sources, refresh, enabled, channelId, fallbackMs]);
}
