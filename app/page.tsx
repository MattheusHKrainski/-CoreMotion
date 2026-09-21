'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Product } from '@/lib/types';
import { Sidebar, Footer } from '@/components/shared';
import { AuthModal } from '@/components/auth';
import { MarketplaceView, ProductDetailModal } from '@/components/marketplace';
import { StoresView, CreateStoreModal } from '@/components/stores';
import { AdminDashboard } from '@/components/admin';
import HomeHeroAndHighlights from '@/components/HomeHeroAndHighlights';
import SellC2CView from '@/components/SellC2CView';
import CoachesView from '@/components/CoachesView';
import CommunityView from '@/components/CommunityView';
import SupabaseConfigModal from '@/components/SupabaseConfigModal';
import CheckoutModal from '@/components/CheckoutModal';
import { X, CheckCircle, AlertCircle, Info, Lock } from 'lucide-react';

export default function CoreMotiomApp() {
  const {
    activeView,
    setActiveView,
    toasts,
    removeToast,
    selectedStore,
    setSelectedStore,
    stores,
    user,
    role,
    isVisitor,
    setAuthModalOpen,
    setAuthModalMode,
  } = useCoreMotiom();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleOpenStore = (storeId: string) => {
    const st = stores.find((s) => s.id === storeId);
    if (st) {
      setSelectedStore(st);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#F8FAFC] selection:bg-red-600 selection:text-white antialiased">
      
      {/* Left Sidebar Function Bar */}
      <Sidebar />

      {/* Main Dynamic View Content & Footer (Offset on desktop for left sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72 transition-all">
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {activeView === 'home' && (
            <HomeHeroAndHighlights onSelectProduct={(p) => setSelectedProduct(p)} />
          )}

          {activeView === 'marketplace' && (
            <MarketplaceView onSelectProduct={(p) => setSelectedProduct(p)} />
          )}

          {activeView === 'stores' && (
            <StoresView onSelectProduct={(p) => setSelectedProduct(p)} />
          )}

          {activeView === 'sell' && (
            isVisitor ? (
              <div className="max-w-xl mx-auto my-20 p-8 sm:p-10 bg-zinc-900/70 rounded-3xl border border-zinc-800 text-center space-y-5 shadow-2xl shadow-black/80">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Acesso Restrito para Atletas Cadastrados
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Para anunciar seus equipamentos com custódia garantida e proteção anti-golpe, conecte-se à sua conta ou cadastre-se em instantes.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-lg shadow-red-950/50 hover:scale-105"
                  >
                    Entrar na Minha Conta
                  </button>
                  <button
                    onClick={() => setActiveView('marketplace')}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs transition-all hover:bg-zinc-700"
                  >
                    Explorar Marketplace
                  </button>
                </div>
              </div>
            ) : (
              <SellC2CView />
            )
          )}

          {activeView === 'coaches' && <CoachesView />}

          {activeView === 'community' && <CommunityView />}

          {activeView === 'admin' && <AdminDashboard />}
        </main>

        {/* Global Footer */}
        <Footer />
      </div>

      {/* Global Modals */}
      <AuthModal />
      <SupabaseConfigModal />
      <CheckoutModal />
      <CreateStoreModal />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenStore={handleOpenStore}
      />

      {/* Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start justify-between gap-3 text-xs transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-zinc-900/95 border-emerald-500/40 text-white shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-zinc-900/95 border-red-500/40 text-white shadow-red-950/20'
                : 'bg-zinc-900/95 border-zinc-700 text-white shadow-black/60'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
              <div>
                <h5 className="font-bold text-white text-xs">{toast.title}</h5>
                <p className="text-zinc-400 text-[11px] mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
