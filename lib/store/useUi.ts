// ============================================================================
// CORE MOTIOM — FATIA UI: navegação, modais, busca e toasts
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
import { Product, Store } from '../types';
import { ActiveView, Toast, UiSlice } from './types';

export function useUi(): UiSlice {
  // Navegação & views
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Modais
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'switch'>('login');
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isCreateStoreModalOpen, setCreateStoreModalOpen] = useState(false);

  // Busca global
  const [searchQuery, setSearchQuery] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    activeView,
    setActiveView,
    selectedProduct,
    setSelectedProduct,
    selectedStore,
    setSelectedStore,
    isAuthModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    isCheckoutOpen,
    setCheckoutOpen,
    isCreateStoreModalOpen,
    setCreateStoreModalOpen,
    searchQuery,
    setSearchQuery,
    toasts,
    addToast,
    removeToast,
  };
}
