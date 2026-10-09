'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  canDeleteTarget,
  canSuspendTarget,
  isAdminRole,
  isMasterAdminEmail,
  isStaffRole,
  ROLE_LABELS,
} from '@/lib/permissions';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { UserRole } from '@/lib/types';
import {
  ShieldCheck,
  Store,
  Store as StoreIcon,
  Package,
  CheckCircle2,
  XCircle,
  Database,
  Trash2,
  DollarSign,
  Users,
  Search,
  Lock,
  TrendingUp,
  Activity,
  Award,
  UserPlus,
  X,
  RefreshCw,
  Ban,
  Truck,
  CheckCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    user,
    setActiveView,
    stores,
    products,
    allUsers,
    orders,
    updateUserRole,
    adminCreateUser,
    adminDeleteUser,
    adminBanUser,
    adminUnbanUser,
    adminVerifyStore,
    deleteProduct,
    adminToggleProductStatus,
    adminUpdateOrderStatus,
    adminSyncSupabase,
    confirmPaymentSandbox,
    communityPosts,
    adminDeleteCommunityPost,
    loginAsMasterAdmin,
    setSupabaseConfigOpen,
    addToast,
  } = useCoreMotiom();

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productFilterType, setProductFilterType] = useState<'all' | 'b2c' | 'c2c'>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // New user creation state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [newUserCity, setNewUserCity] = useState('');
  const [newUserState, setNewUserState] = useState('');

  // Publicações denunciadas aguardando moderação (supervisor ou administrador).
  const reportedPosts = communityPosts.filter((post) => post.is_reported);

  // Guarda de acesso: o papel vem do banco (ver lib/permissions.ts).
  // Painel liberado a administradores e supervisores (papel vindo do banco).
  // Ações de gestão de papéis, criação e exclusão de contas são exclusivas do administrador.
  const hasAdminAccess = isStaffRole(user?.role);
  const isAdminUser = isAdminRole(user?.role);

  if (!hasAdminAccess) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 sm:p-10 bg-zinc-900/90 rounded-3xl border border-red-500/30 text-center space-y-6 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30">
            Acesso Restrito
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Painel Administrativo & Desenvolvedor Fechado
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Esta área é restrita a administradores e supervisores autenticados. Faça login com uma conta autorizada.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isSupabaseConfigured && <button
            onClick={() => {
              loginAsMasterAdmin();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Entrar como Super Admin Master</span>
          </button>}
          
          <button
            onClick={() => setActiveView('marketplace')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs transition-colors hover:bg-zinc-700"
          >
            Ir para o Marketplace
          </button>
        </div>
      </div>
    );
  }

  // Pending store verifications
  const pendingStores = stores.filter(
    (s) => s.verification_status === 'pending' || (!s.is_verified && s.id === 'store-new')
  );

  // Metrics
  const totalGMV = products.reduce((acc, p) => acc + p.price * (p.stock || 1), 0);
  const estimatedCustodyRevenue = totalGMV * 0.045; // 4.5% custody & guarantee commission
  const verifiedStoresCount = stores.filter((s) => s.is_verified).length;
  const c2cCount = products.filter((p) => p.product_type === 'c2c').length;
  const b2cCount = products.filter((p) => p.product_type === 'b2c').length;
  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.total, 0);

  // Filtered lists
  const filteredUsers = allUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.includes(q) ||
      (u.city && u.city.toLowerCase().includes(q))
    );
  });

  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.sport.toLowerCase().includes(q) ||
      (p.store_name || p.seller_name || '').toLowerCase().includes(q);
    const matchesType =
      productFilterType === 'all' ? true : p.product_type === productFilterType;
    return matchesSearch && matchesType;
  });

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      addToast('Dados Incompletos', 'Preencha o nome e o e-mail do usuário.', 'error');
      return;
    }
    adminCreateUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      city: newUserCity.trim() || 'São Paulo',
      state: newUserState.trim() || 'SP',
    });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserCity('');
    setNewUserState('');
    setNewUserRole('user');
    setIsCreateUserOpen(false);
  };

  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    await adminSyncSupabase();
    setIsSyncing(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. TOP MASTER BAR: Admin Identity & Immediate Controls */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 p-6 rounded-3xl border border-red-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-xl shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Painel Executivo Master
                </h1>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-600 text-white shadow-md shadow-red-950/60">
                  Todas as Funções Abertas
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Conectado como <strong className="text-white">{user?.email || 'conta de gestão'}</strong> • Papel: {ROLE_LABELS[user?.role ?? 'visitor'] ?? 'Visitante'}Motiom.
              </p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSyncSupabase}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Sincronizar produtos, lojas e usuários com o banco de dados Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Supabase'}</span>
            </button>

            {isAdminUser && <button
              onClick={() => setIsCreateUserOpen(true)}
              className="px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-red-950/50 hover:scale-105"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Novo Usuário</span>
            </button>}

            <button
              onClick={() => setSupabaseConfigOpen(true)}
              className="px-4 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Database className="w-3.5 h-3.5 text-red-500" />
              <span>Console SQL</span>
            </button>
          </div>
        </div>

        {/* Quick Anchor Navigation Dock (Instant Jump across open panels) */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-semibold text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 mr-1 hidden sm:inline">Módulos Abertos:</span>
          <button
            onClick={() => scrollToSection('sec-metricas')}
            className="px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-red-400" />
            <span>Métricas & Ecossistema</span>
          </button>
          <button
            onClick={() => scrollToSection('sec-auditoria')}
            className="px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Auditoria de Lojas ({pendingStores.length})</span>
          </button>
          <button
            onClick={() => scrollToSection('sec-produtos')}
            className="px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5 text-blue-400" />
            <span>Moderar Catálogo ({products.length})</span>
          </button>
          <button
            onClick={() => scrollToSection('sec-usuarios')}
            className="px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Usuários & Atletas ({allUsers.length})</span>
          </button>
          <button
            onClick={() => scrollToSection('sec-pedidos')}
            className="px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pedidos & Custódia ({orders.length})</span>
          </button>
          <button
            onClick={() => scrollToSection('sec-lojas')}
            className="px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lojas Oficiais ({stores.length})</span>
          </button>
          <button
            onClick={() => scrollToSection('sec-banco')}
            className="px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-red-500" />
            <span>Supabase Database</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION: MÉTRICAS & INDICADORES (Aberto) */}
      <section id="sec-metricas" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-black text-white tracking-tight">1. Indicadores em Tempo Real & Métricas Financeiras</h2>
          </div>
          <span className="text-[11px] text-zinc-500 uppercase font-semibold">Atualização Contínua</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* GMV */}
          <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-2 shadow-xl hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase text-[10px] tracking-wider">Catálogo sob Custódia (GMV)</span>
              <DollarSign className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGMV)}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              {products.length} itens ativos no catálogo
            </p>
          </div>

          {/* Custody revenue */}
          <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-2 shadow-xl hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase text-[10px] tracking-wider">Taxa de Custódia (4.5%)</span>
              <Activity className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedCustodyRevenue)}
            </div>
            <p className="text-[11px] text-zinc-400">Garantia e antifraude CoreMotiom</p>
          </div>

          {/* Users */}
          <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-2 shadow-xl hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase text-[10px] tracking-wider">Usuários & Atletas</span>
              <Users className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white">{allUsers.length}</div>
            <p className="text-[11px] text-zinc-400">
              {allUsers.filter((u) => u.role === 'admin').length} admins • {allUsers.filter((u) => u.role === 'seller').length} lojistas • {allUsers.filter((u) => u.role === 'user').length} atletas
            </p>
          </div>

          {/* Stores */}
          <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-2 shadow-xl hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase text-[10px] tracking-wider">Lojas Auditadas</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{verifiedStoresCount} / {stores.length}</div>
            <p className="text-[11px] text-zinc-400">
              {pendingStores.length} pendentes de aprovação de CNPJ
            </p>
          </div>
        </div>

        {/* Dual Insight Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-red-400" />
              <span>Distribuição do Catálogo Esportivo</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Atletas C2C (Desapego de Alta Performance)</span>
                  <span className="font-bold text-white">{c2cCount} anúncios ({products.length > 0 ? Math.round((c2cCount / products.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div className="bg-red-600 h-full rounded-full" style={{ width: `${products.length > 0 ? (c2cCount / products.length) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Lojas Oficiais B2C (Marcas Verificadas)</span>
                  <span className="font-bold text-white">{b2cCount} produtos ({products.length > 0 ? Math.round((b2cCount / products.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${products.length > 0 ? (b2cCount / products.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protocolo de Custódia & Antifraude</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Prazo de Liberação</span>
                <span className="text-white font-bold text-xs mt-0.5 block">48h pós-entrega</span>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Taxa de Custódia</span>
                <span className="text-white font-bold text-xs mt-0.5 block">4.5% retido</span>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Pagamentos PIX</span>
                <span className="text-emerald-400 font-bold text-xs mt-0.5 block">Instantâneo</span>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Disputas Abertas</span>
                <span className="text-white font-bold text-xs mt-0.5 block">0 ativas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: AUDITORIA & VERIFICAÇÃO DE LOJAS (Aberto) */}
      <section id="sec-auditoria" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white tracking-tight">2. Central de Homologação & Auditoria de Lojas B2C</h2>
          </div>
          <span className="text-xs text-zinc-400">
            {pendingStores.length} loja(s) aguardando homologação de CNPJ
          </span>
        </div>

        {pendingStores.length > 0 ? (
          <div className="space-y-3">
            {pendingStores.map((store) => (
              <div
                key={store.id}
                className="bg-zinc-900/80 rounded-3xl border border-amber-500/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={store.logo_url}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border border-zinc-800 bg-zinc-950"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{store.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pendente de Aprovação
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{store.category} • {store.location}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                      <span>CNPJ: <strong className="text-zinc-200">{store.verification_docs?.cnpj || 'não informado'}</strong></span>
                      <span>•</span>
                      <span>Razão Social: <strong className="text-zinc-200">{store.verification_docs?.company_name || 'não informado'}</strong></span>
                      <span>•</span>
                      <span>E-mail: {store.contact_email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => adminVerifyStore(store.id, false, 'Documentação pendente ou inconsistente')}
                    className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-zinc-700"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Recusar</span>
                  </button>

                  <button
                    onClick={() => adminVerifyStore(store.id, true)}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 hover:scale-105"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar Selo Oficial Verificado</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Fila de Homologação Limpa</h4>
            <p>Todas as lojas ativas já possuem conformidade auditada e selos oficiais concedidos.</p>
          </div>
        )}
      </section>

      {/* 2.1 SECTION: REDE DE LOJISTAS CREDENCIADAS & POLÍTICA LGPD DE SIGILO FINANCEIRO */}
      <section id="sec-lojistas" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-black text-white tracking-tight">
              2.1 Rede de Lojistas Credenciadas ({stores.length} Lojas)
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            {verifiedStoresCount} lojas verificadas com selo oficial
          </span>
        </div>

        {/* Banner de Conformidade LGPD & Sigilo Comercial */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-blue-500/30 text-xs text-zinc-300 space-y-1.5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Política de Proteção de Dados & Sigilo Financeiro Comercial (LGPD - Lei 13.709/18)</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Em conformidade com as diretrizes regulatórias e de sigilo comercial, os demonstrativos financeiros, lucros líquidos, extratos bancários e margens de venda de cada lojista parceiro são <strong className="text-zinc-200">estritamente restritos ao titular da loja</strong>. Contas administrativas e de desenvolvimento não têm acesso a essas informações privadas das lojas parceiras.
          </p>
        </div>

        {/* Stores Catalog Grid in Admin */}
        <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Loja Parceira</th>
                  <th className="p-4">Segmento</th>
                  <th className="p-4">Localização & CNPJ</th>
                  <th className="p-4">Catálogo Ativo</th>
                  <th className="p-4">Avaliação</th>
                  <th className="p-4">Demonstrativo Financeiro</th>
                  <th className="p-4 text-right">Status do Selo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={s.logo_url}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block">{s.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {s.id}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {s.category}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-zinc-400">
                      <div className="text-zinc-200 font-medium">{s.location}</div>
                      <div className="text-[10px] text-zinc-500">
                        CNPJ: {s.verification_docs?.cnpj || 'não informado'}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-white">{s.products_count || 0} produtos</span>
                      <span className="text-[10px] text-zinc-500 block">no marketplace</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <span>★</span>
                        <span>{s.rating.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-950 text-zinc-400 border border-zinc-800">
                        <Lock className="w-3 h-3 text-blue-400" />
                        <span>Sigilo Comercial LGPD</span>
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {s.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verificada</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => adminVerifyStore(s.id, true)}
                          className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors"
                        >
                          Conceder Selo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. SECTION: MODERAÇÃO DO CATÁLOGO DE PRODUTOS (Aberto) */}
      <section id="sec-produtos" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-black text-white tracking-tight">3. Moderação Geral do Catálogo ({filteredProducts.length} itens)</h2>
          </div>

          {/* Inline filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar por título, modalidade..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 text-xs text-white placeholder-zinc-500 rounded-full border border-zinc-800 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center bg-zinc-950 p-0.5 rounded-full border border-zinc-800 text-[11px] font-semibold">
              <button
                onClick={() => setProductFilterType('all')}
                className={`px-3 py-1 rounded-full transition-colors ${productFilterType === 'all' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Todos ({products.length})
              </button>
              <button
                onClick={() => setProductFilterType('b2c')}
                className={`px-3 py-1 rounded-full transition-colors ${productFilterType === 'b2c' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Lojas B2C ({b2cCount})
              </button>
              <button
                onClick={() => setProductFilterType('c2c')}
                className={`px-3 py-1 rounded-full transition-colors ${productFilterType === 'c2c' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Atletas C2C ({c2cCount})
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Vendedor / Loja</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações Imediatas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                      />
                      <div className="max-w-xs sm:max-w-md">
                        <span className="font-bold text-white block truncate">{p.title}</span>
                        <span className="text-[10px] text-zinc-400">
                          {p.sport} • {p.category} • Condição: {p.condition}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.product_type === 'b2c'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {p.product_type === 'b2c' ? 'Loja B2C' : 'Atleta C2C'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-white font-medium">{p.store_name || p.seller_name}</span>
                    </td>
                    <td className="p-4 font-bold text-white whitespace-nowrap">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : p.status === 'suspended'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'active'
                              ? 'bg-emerald-400'
                              : p.status === 'suspended'
                              ? 'bg-amber-400'
                              : 'bg-zinc-500'
                          }`}
                        ></span>
                        {p.status === 'active' ? 'Ativo' : p.status === 'suspended' ? 'Suspenso' : 'Vendido'}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            adminToggleProductStatus(
                              p.id,
                              p.status === 'active' ? 'suspended' : 'active'
                            )
                          }
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                            p.status === 'active'
                              ? 'bg-zinc-800 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300'
                              : 'bg-zinc-800 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300'
                          }`}
                          title={p.status === 'active' ? 'Suspender anúncio' : 'Reativar anúncio'}
                        >
                          {p.status === 'active' ? 'Suspender' : 'Reativar'}
                        </button>
                        
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 rounded-full bg-zinc-800 text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                          title="Excluir do Catálogo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. SECTION: GESTÃO DE USUÁRIOS, ATLETAS E TREINADORES (Aberto) */}
      <section id="sec-usuarios" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black text-white tracking-tight">4. Gestão de Usuários, Atletas & Permissões RBAC ({filteredUsers.length})</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuário ou e-mail..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 text-xs text-white placeholder-zinc-500 rounded-full border border-zinc-800 focus:outline-none focus:border-red-500"
              />
            </div>

            {isAdminUser && <button
              onClick={() => setIsCreateUserOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-red-950/40"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Novo</span>
            </button>}
          </div>
        </div>

        <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Papel Atual (Role)</th>
                  <th className="p-4">Localidade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Controle Administrativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredUsers.map((u) => {
                  const isCurrentSuperAdmin = isMasterAdminEmail(u.email);
                  return (
                    <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={
                            u.avatar_url ||
                            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80`
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{u.name}</span>
                          <span className="text-[10px] text-zinc-500">ID: {u.id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                        {u.email}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {isCurrentSuperAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-500 shadow-sm">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Equipe Dev / Master Admin</span>
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={!isAdminUser || isCurrentSuperAdmin}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className="px-2.5 py-1 rounded-full bg-zinc-950 text-white border border-zinc-700 text-xs font-semibold focus:outline-none focus:border-red-500"
                          >
                            <option value="user">Usuário Atleta</option>
                            <option value="seller">{ROLE_LABELS.seller}</option>
                            <option value="supervisor">{ROLE_LABELS.supervisor}</option>
                            <option value="admin">{ROLE_LABELS.admin}</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-zinc-400">
                        {u.city ? `${u.city}, ${u.state || 'BR'}` : 'São Paulo, SP'}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {u.is_banned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            <Ban className="w-3 h-3" />
                            <span>Bloqueado no DB</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Ativo no DB</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        {isCurrentSuperAdmin ? (
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-950/40 px-2 py-1 rounded-md border border-red-900/40">
                            Protegido (Dev Master)
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {canSuspendTarget(user?.role, u.role, u.email) && (u.is_banned ? (
                              <button
                                onClick={() => adminUnbanUser(u.id)}
                                className="px-2.5 py-1 rounded-full bg-zinc-800 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors text-[10px] font-semibold"
                                title="Desbloquear conta no banco de dados"
                              >
                                Reativar
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const reason = window.prompt(
                                    `Motivo para banir o usuário ${u.name} (${u.email}):`,
                                    'Violação das diretrizes e termos de uso da comunidade CoreMotiom'
                                  );
                                  if (reason !== null) {
                                    adminBanUser(u.id, reason);
                                  }
                                }}
                                className="p-1.5 rounded-full bg-zinc-800 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                                title="Banir usuário (grava no banco de dados)"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            ))}

                            {canDeleteTarget(user?.role, u.email) && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Confirmação de Exclusão Definitiva:\nDeseja realmente excluir permanentemente "${u.name}" (${u.email}) da base de dados PostgreSQL?\n\nEsta ação não poderá ser desfeita.`
                                  )
                                ) {
                                  adminDeleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-full bg-zinc-800 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                              title="Excluir definitivamente do banco de dados"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. SECTION: GESTÃO DE PEDIDOS & CUSTÓDIA ESCROW (Aberto) */}
      <section id="sec-pedidos" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white tracking-tight">5. Pedidos, Transações & Custódia Escrow ({orders.length})</h2>
          </div>
          <span className="text-xs text-zinc-400">
            Volume em transações: <strong className="text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOrdersAmount)}</strong>
          </span>
        </div>

        {orders.length > 0 ? (
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-4">ID Pedido</th>
                    <th className="p-4">Comprador</th>
                    <th className="p-4">Valor Total</th>
                    <th className="p-4">Pagamento</th>
                    <th className="p-4">Status da Entrega</th>
                    <th className="p-4">Rastreio</th>
                    <th className="p-4 text-right">Ações Administrativas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                        {ord.id}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="block font-medium text-white">{ord.user_email}</span>
                        <span className="text-[10px] text-zinc-500">
                          {ord.items.length} item(ns) • {ord.shipping_method.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white whitespace-nowrap">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ord.total)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.payment_status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {ord.payment_status === 'paid' ? 'PIX Aprovado' : 'Aguardando PIX'}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.order_status === 'delivered'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : ord.order_status === 'shipped'
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {ord.order_status === 'pending_payment'
                            ? 'Pendente'
                            : ord.order_status === 'preparing'
                            ? 'Em Separação'
                            : ord.order_status === 'shipped'
                            ? 'Em Transporte'
                            : ord.order_status === 'delivered'
                            ? 'Entregue'
                            : ord.order_status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {ord.tracking_code || 'Aguardando envio'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {ord.payment_status !== 'paid' && (
                            <button
                              onClick={() => confirmPaymentSandbox(ord.id)}
                              className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition-colors"
                              title="Simular aprovação do PIX"
                            >
                              Aprovar PIX
                            </button>
                          )}
                          
                          {ord.order_status === 'preparing' && (
                            <button
                              onClick={() => adminUpdateOrderStatus(ord.id, 'shipped')}
                              className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold transition-colors"
                            >
                              Marcar Enviado
                            </button>
                          )}

                          {ord.order_status === 'shipped' && (
                            <button
                              onClick={() => adminUpdateOrderStatus(ord.id, 'delivered')}
                              className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition-colors"
                            >
                              Marcar Entregue
                            </button>
                          )}

                          {ord.order_status === 'delivered' && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCheck className="w-3.5 h-3.5" />
                              Custódia Liberada
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center text-xs text-zinc-400">
            Nenhum pedido registrado no momento.
          </div>
        )}
      </section>

      {/* 7. SECTION: LOJAS OFICIAIS CADASTRADAS (Aberto) */}
      <section id="sec-lojas" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-black text-white tracking-tight">6. Lojas Parceiras Oficiais B2C ({stores.length})</h2>
          </div>
          <span className="text-xs text-zinc-400">
            {verifiedStoresCount} lojas verificadas com selo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stores.map((s) => (
            <div
              key={s.id}
              className="bg-zinc-900/70 p-5 rounded-3xl border border-zinc-800 space-y-3 shadow-xl hover:border-zinc-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src={s.logo_url}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5 truncate">
                      {s.name}
                      {s.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </h4>
                    <span className="text-[10px] text-zinc-400 block truncate">{s.category}</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2">{s.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className={s.is_verified ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                  {s.is_verified ? 'Selo Verificado' : 'Aguardando'}
                </span>
                <button
                  onClick={() => adminVerifyStore(s.id, !s.is_verified)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                    s.is_verified
                      ? 'bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {s.is_verified ? 'Revogar Selo' : 'Conceder Selo'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SECTION: MODERAÇÃO DA COMUNIDADE (publicações denunciadas) */}
      <section id="sec-moderacao-comunidade" className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight">
          7. Moderação da Comunidade ({reportedPosts.length} {reportedPosts.length === 1 ? 'denúncia' : 'denúncias'})
        </h2>
        {reportedPosts.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhuma publicação denunciada no momento.</p>
        ) : (
          <ul className="space-y-3">
            {reportedPosts.map((post) => (
              <li
                key={post.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{post.title}</p>
                  <p className="text-xs text-zinc-500">
                    por {post.author_name} • {post.category}
                  </p>
                  <p className="text-sm text-zinc-300 mt-2 line-clamp-3">{post.content}</p>
                  <p className="text-xs text-red-300 mt-2">Motivo da denúncia: {post.report_reason || 'não informado'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => adminDeleteCommunityPost(post.id)}
                  className="shrink-0 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Remover publicação
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 8. SECTION: DIAGNÓSTICO DO BANCO DE DADOS SUPABASE (Aberto) */}
      <section id="sec-banco" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-black text-white tracking-tight">8. Diagnóstico & Status do Banco de Dados Supabase (PostgreSQL)</h2>
          </div>
          <button
            onClick={() => setSupabaseConfigOpen(true)}
            className="px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-red-400" />
            <span>Abrir Console SQL</span>
          </button>
        </div>

        <div className="bg-zinc-900/70 p-6 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tabela Products</span>
              <span className="text-lg font-black text-white">{products.length}</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">Sincronizado</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tabela Stores</span>
              <span className="text-lg font-black text-white">{stores.length}</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">Sincronizado</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tabela Users</span>
              <span className="text-lg font-black text-white">{allUsers.length}</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">Sincronizado</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tabela Orders</span>
              <span className="text-lg font-black text-white">{orders.length}</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">Sincronizado</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tabela Coaches</span>
              <span className="text-lg font-black text-white">3</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">Sincronizado</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tabela Posts</span>
              <span className="text-lg font-black text-white">2</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">Sincronizado</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">PostgreSQL Host:</span>
              <span className="text-zinc-300">aws-0-sa-east-1.pooler.supabase.com (Porta 5432 / 6543)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">Row Level Security (RLS):</span>
              <span className="text-emerald-400 font-bold">Ativo & Auditado para anon / authenticated</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">Contas-mestre:</span>
              <span className="text-white font-bold">protegidas no servidor (lib/permissions.ts)</span>
            </div>
          </div>
        </div>
      </section>

      {/* User Creation Modal */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Cadastrar Novo Usuário</h3>
              </div>
              <button
                onClick={() => setIsCreateUserOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Carlos Albuquerque"
                  className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white placeholder-zinc-500 rounded-xl border border-zinc-800 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">Endereço de E-mail</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="carlos@exemplo.com"
                  className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white placeholder-zinc-500 rounded-xl border border-zinc-800 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">Cidade</label>
                  <input
                    type="text"
                    value={newUserCity}
                    onChange={(e) => setNewUserCity(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white placeholder-zinc-500 rounded-xl border border-zinc-800 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newUserState}
                    onChange={(e) => setNewUserState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white placeholder-zinc-500 rounded-xl border border-zinc-800 focus:outline-none focus:border-red-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">Papel / Nível de Acesso</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:outline-none focus:border-red-500"
                >
                  <option value="user">Usuário Atleta (C2C)</option>
                  <option value="seller">Lojista Oficial Parceiro (B2C)</option>
                  <option value="admin">Administrador Auxiliar</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shadow-md shadow-red-950/50 hover:scale-105"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
