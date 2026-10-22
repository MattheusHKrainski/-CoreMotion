'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import type { ExternalOffer, Product } from '@/lib/types';
import Sidebar from '@/components/shared/Sidebar';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/auth/AuthModal';
import MarketplaceView from '@/components/marketplace/MarketplaceView';
import ProductDetailModal from '@/components/marketplace/ProductDetailModal';
import ExternalOfferModal from '@/components/marketplace/ExternalOfferModal';
import AdminDashboard from '@/components/admin/AdminDashboard';
import HomeHeroAndHighlights from '@/components/HomeHeroAndHighlights';
import SellC2CView from '@/components/SellC2CView';
import CoachesView from '@/components/CoachesView';
import CommunityView from '@/components/CommunityView';
import ProfileView from '@/components/ProfileView';
import SupabaseConfigModal from '@/components/SupabaseConfigModal';
import CheckoutModal from '@/components/CheckoutModal';
import { X, CheckCircle, AlertCircle, Info, Lock } from 'lucide-react';

export default function CoreMotiomApp() {
  const { activeView, setActiveView, toasts, removeToast, isVisitor, setAuthModalOpen, setAuthModalMode } = useCoreMotiom();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<ExternalOffer | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#F8FAFC] selection:bg-red-600 selection:text-white antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72 transition-all">
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {activeView === 'home' && (
            <HomeHeroAndHighlights
              onSelectProduct={setSelectedProduct}
              onSelectOffer={setSelectedOffer}
            />
          )}

          {activeView === 'marketplace' && (
            <MarketplaceView
              onSelectProduct={setSelectedProduct}
              onSelectOffer={setSelectedOffer}
            />
          )}

          {activeView === 'sell' && (
            isVisitor ? (
              <div className="mx-auto my-20 max-w-xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-2xl shadow-black/80 sm:p-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">Acesso para atletas cadastrados</h2>
                  <p className="mx-auto max-w-md text-xs leading-relaxed text-zinc-400 sm:text-sm">Para anunciar equipamentos entre atletas, entre na sua conta ou cadastre-se.</p>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                  <button type="button" onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }} className="w-full rounded-full bg-red-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-red-950/50 transition hover:scale-105 hover:bg-red-500 sm:w-auto">Entrar na minha conta</button>
                  <button type="button" onClick={() => setActiveView('marketplace')} className="w-full rounded-full bg-zinc-800 px-6 py-3 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white sm:w-auto">Explorar marketplace</button>
                </div>
              </div>
            ) : <SellC2CView />
          )}

          {activeView === 'coaches' && <CoachesView />}
          {activeView === 'community' && <CommunityView />}
          {activeView === 'profile' && <ProfileView />}
          {activeView === 'admin' && <AdminDashboard />}
        </main>

        <Footer />
      </div>

      <AuthModal />
      <SupabaseConfigModal />
      <CheckoutModal />
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <ExternalOfferModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs shadow-2xl transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'border-emerald-500/40 bg-zinc-900/95 text-white shadow-emerald-950/20'
                : toast.type === 'error'
                  ? 'border-red-500/40 bg-zinc-900/95 text-white shadow-red-950/20'
                  : 'border-zinc-700 bg-zinc-900/95 text-white shadow-black/60'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
              {toast.type === 'info' && <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
              <div>
                <h5 className="text-xs font-bold text-white">{toast.title}</h5>
                <p className="mt-0.5 text-[11px] text-zinc-400">{toast.message}</p>
              </div>
            </div>
            <button type="button" onClick={() => removeToast(toast.id)} aria-label="Fechar notificação" className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
