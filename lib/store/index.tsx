// ============================================================================
// CORE MOTIOM — ESTADO GLOBAL DA APLICAÇÃO (React Context)
// Composição das fatias (slices) em um único contexto:
//   - UI: navegação, modais, busca e toasts          (useUi)
//   - Auth: Supabase como único backend              (useAuth)
//   - Cart: carrinho, pedidos e favoritos            (useCart)
//   - Catalog: produtos, lojas e comunidade          (useCatalog)
// O contrato público `useCoreMotiom()` é idêntico ao anterior.
// ============================================================================

'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { CoreMotiomContextType } from './types';
import { writePersistedState } from './persistence';
import { useUi } from './useUi';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { useCatalog } from './useCatalog';

const CoreMotiomContext = createContext<CoreMotiomContextType | undefined>(undefined);

export function CoreMotiomProvider({ children }: { children: ReactNode }) {
  const ui = useUi();
  const { setUser, ...auth } = useAuth({
    addToast: ui.addToast,
    setActiveView: ui.setActiveView,
    setAuthModalOpen: ui.setAuthModalOpen,
  });
  const cart = useCart({ addToast: ui.addToast, user: auth.user });
  const catalog = useCatalog({ addToast: ui.addToast, user: auth.user, setUser });

  // Persistência compartilhada (mesma chave/formato da versão anterior)
  useEffect(() => {
    writePersistedState({
      user: auth.user,
      products: catalog.products,
      stores: catalog.stores,
      orders: cart.orders,
      cart: cart.cart,
      favorites: cart.favorites,
      communityPosts: catalog.communityPosts,
    });
  }, [
    auth.user,
    catalog.products,
    catalog.stores,
    catalog.communityPosts,
    cart.orders,
    cart.cart,
    cart.favorites,
  ]);

  const value: CoreMotiomContextType = { ...ui, ...auth, ...cart, ...catalog };

  return <CoreMotiomContext.Provider value={value}>{children}</CoreMotiomContext.Provider>;
}

export function useCoreMotiom(): CoreMotiomContextType {
  const context = useContext(CoreMotiomContext);
  if (!context) {
    throw new Error('useCoreMotiom must be used within a CoreMotiomProvider');
  }
  return context;
}

export type { ActiveView, CoreMotiomContextType, Toast } from './types';
