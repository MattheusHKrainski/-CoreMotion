'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  ShieldCheck,
  Store,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Trash2,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    stores,
    products,
    adminVerifyStore,
    deleteProduct,
    setSupabaseConfigOpen,
  } = useCoreMotiom();

  const [activeTab, setActiveTab] = useState<'verifications' | 'products' | 'stores'>('verifications');

  // Pending store verifications
  const pendingStores = stores.filter((s) => s.verification_status === 'pending' || (!s.is_verified && s.id === 'store-new'));

  // Metrics
  const totalGMV = products.reduce((acc, p) => acc + p.price * (p.stock || 1), 0);
  const verifiedStoresCount = stores.filter((s) => s.is_verified).length;
  const c2cCount = products.filter((p) => p.product_type === 'c2c').length;
  const b2cCount = products.filter((p) => p.product_type === 'b2c').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E232F]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Painel de Moderação & Gestão</h1>
              <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40 text-[10px] font-semibold uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Auditoria de selos oficiais, moderação de anúncios C2C e monitoramento do ecossistema.
            </p>
          </div>
        </div>

        <button
          onClick={() => setSupabaseConfigOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-[#12151C] hover:bg-[#1A1F2B] text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Database className="w-4 h-4" />
          <span>Status do Banco de Dados</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-xl bg-[#12151C] border border-[#232836] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Volume de Catálogo (GMV)</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGMV)}
          </div>
          <p className="text-[10px] text-red-400 font-medium">+14% novos itens esta semana</p>
        </div>

        <div className="p-5 rounded-xl bg-[#12151C] border border-[#232836] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Lojas Oficiais Verificadas</span>
            <Store className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {verifiedStoresCount} <span className="text-xs text-[#94A3B8] font-normal">/ {stores.length} totais</span>
          </div>
          <p className="text-[10px] text-[#94A3B8]">Selo verificado via CNPJ</p>
        </div>

        <div className="p-5 rounded-xl bg-[#12151C] border border-[#232836] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Anúncios entre Atletas (C2C)</span>
            <Package className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{c2cCount}</div>
          <p className="text-[10px] text-[#94A3B8]">{b2cCount} produtos de marcas oficiais</p>
        </div>

        <div className="p-5 rounded-xl bg-[#12151C] border border-[#232836] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Fila de Verificação Pendente</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingStores.length}</div>
          <p className="text-[10px] text-[#94A3B8]">Lojas aguardando auditoria</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E232F] pb-2 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'verifications'
              ? 'bg-red-600 text-white font-semibold'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12151C]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Fila de Verificação de Lojas ({pendingStores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'products'
              ? 'bg-red-600 text-white font-semibold'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12151C]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Moderar Produtos ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'stores'
              ? 'bg-red-600 text-white font-semibold'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12151C]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Todas as Lojas ({stores.length})</span>
        </button>
      </div>

      {/* Verification Queue Content */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="bg-[#12151C] p-4 rounded-xl border border-[#232836] text-xs text-[#94A3B8]">
            Analise o CNPJ e documentação de conformidade para aprovar ou rejeitar o selo oficial <strong className="text-white">Verificado</strong>.
          </div>

          {pendingStores.length > 0 ? (
            <div className="space-y-3">
              {pendingStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-[#12151C] rounded-xl border border-[#232836] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <img src={store.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-[#232836]" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{store.name}</h4>
                      <p className="text-xs text-[#94A3B8]">{store.category} • {store.location}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-[#64748B]">
                        <span>CNPJ: {store.verification_docs?.cnpj || '12.345.678/0001-90'}</span>
                        <span>•</span>
                        <span>E-mail: {store.contact_email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adminVerifyStore(store.id, false, 'Documentação pendente')}
                      className="px-3 py-2 rounded-lg bg-[#181D26] hover:bg-red-950/40 text-red-400 border border-red-900/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Recusar</span>
                    </button>

                    <button
                      onClick={() => adminVerifyStore(store.id, true)}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprovar Selo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#12151C] border border-[#232836] rounded-xl p-12 text-center text-xs text-[#94A3B8] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-red-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">Fila de Auditoria Limpa</h4>
              <p>Nenhuma loja com solicitação de verificação pendente neste momento.</p>
            </div>
          )}
        </div>
      )}

      {/* Products Moderation */}
      {activeTab === 'products' && (
        <div className="bg-[#12151C] rounded-xl border border-[#232836] overflow-hidden">
          <div className="p-4 border-b border-[#1E232F] flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Catálogo Geral da Plataforma</h3>
            <span className="text-xs text-[#94A3B8]">{products.length} itens registrados</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#181D26] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#232836]">
                <tr>
                  <th className="p-3.5">Produto</th>
                  <th className="p-3.5">Canal</th>
                  <th className="p-3.5">Vendedor / Loja</th>
                  <th className="p-3.5">Preço</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E232F] text-[#D1D5DB]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#181D26]/50 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#0E1017]" />
                      <div className="max-w-xs">
                        <span className="font-bold text-white block truncate">{p.title}</span>
                        <span className="text-[10px] text-[#64748B]">{p.sport} • {p.category}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.product_type === 'b2c' ? 'bg-red-600/20 text-red-400' : 'bg-[#181D26] text-[#94A3B8]'
                      }`}>
                        {p.product_type === 'b2c' ? 'Loja B2C' : 'Atleta C2C'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-white font-medium">{p.store_name || p.seller_name}</span>
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        Ativo
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded bg-[#181D26] text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                        title="Remover Anúncio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stores List */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((s) => (
            <div key={s.id} className="bg-[#12151C] p-5 rounded-xl border border-[#232836] space-y-3">
              <div className="flex items-center gap-3">
                <img src={s.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#232836]" />
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-1">
                    {s.name}
                    {s.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-red-400" />}
                  </h4>
                  <span className="text-[10px] text-[#94A3B8]">{s.category}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#D1D5DB] line-clamp-2">{s.description}</p>
              <div className="pt-2 border-t border-[#1E232F] flex items-center justify-between text-[11px] text-[#64748B]">
                <span>Status: {s.is_verified ? 'Verificada' : 'Padrão'}</span>
                <span>{s.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

