'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useCoreMotiom } from './store';
import { validateCart, type SaleCartLine } from './commerce';
interface CommerceContextValue { lines: SaleCartLine[]; add: (offerId: string, variant: string) => void; update: (index: number, quantity: number) => void; remove: (index: number) => void; clear: () => void; count: number }
const Context = createContext<CommerceContextValue | null>(null);
export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCoreMotiom();
  const key = `coremotion-sale-cart-v1:${user?.id || 'guest'}`;
  const [state, setState] = useState<{ key: string; lines: SaleCartLine[] }>({ key: '', lines: [] });
  const current = useRef(state);
  useEffect(() => {
    let lines: SaleCartLine[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]'); if (parsed.length) lines = validateCart(parsed);
      const guestKey = 'coremotion-sale-cart-v1:guest';
      if (key !== guestKey && (current.current.key === guestKey || current.current.key === '')) {
        const guest = JSON.parse(localStorage.getItem(guestKey) || '[]');
        if (guest.length) {
          for (const item of validateCart(guest)) {
            const found = lines.find(line => line.offerId === item.offerId && line.variant === item.variant);
            if (found) found.quantity = Math.min(10,found.quantity + item.quantity); else if (lines.length < 30) lines.push(item);
          }
          localStorage.setItem(key,JSON.stringify(lines)); localStorage.removeItem(guestKey);
        }
      }
    } catch { /* Ignore corrupt storage, never treat it as an order. */ }
    current.current = { key, lines }; setState(current.current);
  }, [key]);
  const lines = state.key === key ? state.lines : [];
  const change = (fn: (items: SaleCartLine[]) => SaleCartLine[]) => { if (current.current.key !== key) return; const next = fn(current.current.lines); current.current = { key, lines: next }; try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Keep the cart only in this session if storage is unavailable. */ } setState(current.current); };
  const value: CommerceContextValue = { lines, count: lines.reduce((sum,line) => sum + line.quantity, 0), add(offerId, variant) { change(items => { const found = items.find(item => item.offerId === offerId && item.variant === variant); if (found) return items.map(item => item === found ? { ...item, quantity: Math.min(10,item.quantity + 1) } : item); return items.length >= 30 ? items : [...items,{ offerId, variant, quantity: 1 }]; }); }, update(index, quantity) { if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 10) change(items => items.map((item,i) => i === index ? { ...item, quantity } : item)); }, remove(index) { change(items => items.filter((_,i) => i !== index)); }, clear() { change(() => []); } };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCommerce() { const context = useContext(Context); if (!context) throw new Error('CommerceProvider ausente'); return context; }
