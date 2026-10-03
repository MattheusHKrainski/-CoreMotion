// ============================================================================
// CORE MOTIOM — ROTEADOR DA APLICAÇÃO (SPA)
// Página única que renderiza a view ativa + modais globais + toasts.
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Product } from '@/lib/types';

// ===== LAYOUT (Cabeçalho e Rodapé) =====
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ===== VIEWS PRINCIPAIS =====
import HomeHeroAndHighlights from '@/components/home/HomeHeroAndHighlights';
import MarketplaceView from '@/components/marketplace/MarketplaceView';
import StoresView from '@/components/stores/StoresView';
import SellC2CView from '@/components/sell/SellC2CView';
import SmartScanView from '@/components/smartscan/SmartScanView';
import CoachesView from '@/components/coaches/CoachesView';
import CommunityView from '@/components/community/CommunityView';
import AdminDashboard from '@/components/admin/AdminDashboard';

// ===== MODAIS GLOBAIS =====
import AuthModal from '@/components/auth/AuthModal';
import SupabaseConfigModal from '@/components/config/SupabaseConfigModal';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import CreateStoreModal from '@/components/stores/CreateStoreModal';
import ProductDetailModal from '@/components/marketplace/ProductDetailModal';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function CoreMotiomApp() {
  const {
    activeView,
    toasts,
    removeToast,
    selectedStore,
    setSelectedStore,
    stores,
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
    <div className="min-h-screen flex flex-col bg-[#0F1115] text-[#E5E7EB] selection:bg-[#16A34A] selection:text-white">
      
      {/* Global Header */}
      <Header />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeHeroAndHighlights onSelectProduct={(p) => setSelectedProduct(p)} />
        )}

        {activeView === 'marketplace' && (
          <MarketplaceView onSelectProduct={(p) => setSelectedProduct(p)} />
        )}

        {activeView === 'stores' && (
          <StoresView onSelectProduct={(p) => setSelectedProduct(p)} />
        )}

        {activeView === 'sell' && <SellC2CView />}

        {activeView === 'smartscan' && <SmartScanView />}

        {activeView === 'coaches' && <CoachesView />}

        {activeView === 'community' && <CommunityView />}

        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Footer */}
      <Footer />

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
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start justify-between gap-3 text-xs transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-[#14171D] border-[#16A34A] text-white'
                : toast.type === 'error'
                ? 'bg-[#14171D] border-red-800 text-white'
                : 'bg-[#14171D] border-[#2D333F] text-white'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />}
              <div>
                <h5 className="font-bold text-white text-xs">{toast.title}</h5>
                <p className="text-[#9CA3AF] text-[11px] mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9CA3AF] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
