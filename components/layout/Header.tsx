// ============================================================================
// CORE MOTIOM — HEADER (Cabeçalho global)
// Barra superior + navegação desktop/mobile, busca, carrinho,
// troca rápida de papel (demo) e indicador de status do Supabase.
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  PlusCircle,
  ShieldCheck,
  Store as StoreIcon,
  Sparkles,
  Users,
  Compass,
  Menu,
  X,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';

export default function Header() {
  const {
    activeView,
    setActiveView,
    user,
    role,
    isVisitor,
    cartCount,
    favorites,
    setAuthModalOpen,
    setAuthModalMode,
    setCheckoutOpen,
    searchQuery,
    setSearchQuery,
    logout,
    switchRole,
    isSupabaseLive,
    setSupabaseConfigOpen,
    addToast,
  } = useCoreMotiom();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const navItems: { id: typeof activeView; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'home', label: 'Início', icon: Compass },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'stores', label: 'Lojas Oficiais', icon: StoreIcon },
    { id: 'sell', label: 'Vender', icon: PlusCircle, badge: 'C2C' },
    { id: 'smartscan', label: 'SmartScan', icon: Sparkles },
    { id: 'coaches', label: 'Treinadores', icon: Users },
    { id: 'community', label: 'Comunidade', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0D11]/95 backdrop-blur-md text-white border-b border-[#1E232F]">
      {/* Top Banner - Minimalist */}
      <div className="bg-[#08090C] border-b border-[#181C25] py-1.5 px-4 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-[#CBD5E1] text-[11px] font-medium truncate">
              Marketplace Esportivo de Alta Performance • Custódia C2C & Lojas Verificadas
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            {/* Supabase status indicator */}
            <button
              onClick={() => setSupabaseConfigOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#12151C] hover:bg-[#1A1F2A] text-[#CBD5E1] border border-[#232A38] transition-colors"
              title="Configurações do Banco de Dados"
            >
              <Database className="w-3 h-3 text-red-400" />
              <span className="text-[10px] font-medium">{isSupabaseLive ? 'Supabase Conectado' : 'Configurar Banco'}</span>
            </button>

            {/* Quick role switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#12151C] hover:bg-[#1A1F2A] text-[#CBD5E1] border border-[#232A38] transition-colors"
              >
                <SlidersHorizontal className="w-3 h-3 text-red-400" />
                <span className="text-[10px] uppercase font-medium">
                  {role === 'visitor' ? 'Visitante' : role === 'seller' ? 'Lojista' : role === 'admin' ? 'Admin' : 'Atleta'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-[#12151C] border border-[#232A38] rounded-lg shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] border-b border-[#1E2430]">
                    Modo de Visualização
                  </div>
                  <button
                    onClick={() => { switchRole('visitor'); setIsRoleMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#1A1F2A] flex items-center justify-between ${role === 'visitor' ? 'text-red-400 font-semibold' : 'text-[#CBD5E1]'}`}
                  >
                    <span>Visitante (Sem Conta)</span>
                    {role === 'visitor' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                  <button
                    onClick={() => { switchRole('user'); setIsRoleMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#1A1F2A] flex items-center justify-between ${role === 'user' ? 'text-red-400 font-semibold' : 'text-[#CBD5E1]'}`}
                  >
                    <span>Usuário Atleta (C2C)</span>
                    {role === 'user' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                  <button
                    onClick={() => { switchRole('seller'); setIsRoleMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#1A1F2A] flex items-center justify-between ${role === 'seller' ? 'text-red-400 font-semibold' : 'text-[#CBD5E1]'}`}
                  >
                    <span>Lojista Oficial (B2C)</span>
                    {role === 'seller' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                  <button
                    onClick={() => { switchRole('admin'); setIsRoleMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#1A1F2A] flex items-center justify-between ${role === 'admin' ? 'text-red-400 font-semibold' : 'text-[#CBD5E1]'}`}
                  >
                    <span>Administrador</span>
                    {role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Minimalist */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveView('home'); }}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform group-hover:scale-105">
                CM
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  CoreMotiom
                  <span className="text-red-400 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">PRO</span>
                </span>
                <span className="text-[10px] text-[#64748B] -mt-0.5">
                  Marketplace & Performance
                </span>
              </div>
            </button>
          </div>

          {/* Minimalist Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'marketplace' && e.target.value.length > 0) {
                    setActiveView('marketplace');
                  }
                }}
                placeholder="Buscar equipamentos, marcas, tênis, GPS..."
                className="w-full pl-9 pr-12 py-2 bg-[#12151C] text-xs text-white placeholder-[#64748B] rounded-lg border border-[#232836] focus:border-red-500/60 focus:bg-[#161B24] focus:outline-none transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="px-1.5 py-0.5 rounded bg-[#1A1F2A] border border-[#2D3546] text-[#64748B] text-[9px]">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Vender CTA Button */}
            <button
              onClick={() => {
                if (isVisitor) {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                } else {
                  setActiveView('sell');
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Anunciar</span>
            </button>

            {/* Favorites Icon */}
            <button
              onClick={() => {
                if (isVisitor) {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                } else {
                  addToast('Favoritos', 'Sua lista de favoritos estará disponível em breve.', 'info');
                }
              }}
              aria-label="Ver Favoritos"
              className="relative p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161B22] border border-transparent hover:border-[#232836] transition-colors"
              title="Favoritos"
            >
              <Heart className="w-4 h-4" />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCheckoutOpen(true)}
              aria-label="Abrir Carrinho de Compras"
              className="relative p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161B22] border border-transparent hover:border-[#232836] transition-colors"
              title="Carrinho"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {isVisitor ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#CBD5E1] hover:text-white hover:bg-[#161B22] transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#181D26] hover:bg-[#202634] text-white text-xs font-semibold border border-[#2A3344] transition-colors"
                >
                  Cadastrar
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-[#12151C] hover:bg-[#181C25] border border-[#232836] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                      {user?.name}
                    </span>
                    <span className="text-[9px] text-[#64748B] uppercase">
                      {role === 'admin' ? 'Admin' : role === 'seller' ? 'Lojista' : 'Atleta'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#64748B]" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#12151C] border border-[#232836] rounded-xl shadow-2xl py-2 z-50 divide-y divide-[#1A1F2A]">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-white">{user?.name}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-semibold rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                        {role === 'admin' ? 'Administrador' : role === 'seller' ? 'Loja Verificada' : 'Atleta C2C'}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => { addToast('Meu Perfil', 'Página de perfil e pedidos disponível em breve.', 'info'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-[#181C25] text-[#CBD5E1] flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Meu Perfil & Pedidos</span>
                      </button>
                      <button
                        onClick={() => { setActiveView('sell'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-[#181C25] text-[#CBD5E1] flex items-center gap-2"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Meus Anúncios</span>
                      </button>
                      <button
                        onClick={() => { setActiveView('stores'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-[#181C25] text-[#CBD5E1] flex items-center gap-2"
                      >
                        <StoreIcon className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Minha Loja</span>
                      </button>
                      {role === 'admin' && (
                        <button
                          onClick={() => { setActiveView('admin'); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-[#181C25] text-red-400 font-semibold flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                          <span>Painel Administrativo</span>
                        </button>
                      )}
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-[#181C25] text-[#F87171] flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair da Conta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161B22]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Clean Minimalist Navigation (Desktop) */}
        <nav className="hidden md:flex items-center justify-between border-t border-[#181C25] py-2 overflow-x-auto text-xs font-medium">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30 font-semibold'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#141720] border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-400' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {role === 'admin' && (
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#12151C] border-t border-[#232836] px-4 pt-2 pb-6 space-y-3">
          {/* Mobile Search */}
          <div className="relative w-full mb-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos e lojas..."
              className="w-full pl-9 pr-3 py-2 bg-[#0B0D11] text-xs text-white rounded-lg border border-[#232836]"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-left ${
                    isActive ? 'bg-red-500/15 text-red-400 font-semibold border border-red-500/30' : 'text-[#D1D5DB] hover:bg-[#181C25]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-red-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {role === 'admin' && (
            <button
              onClick={() => { setActiveView('admin'); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Acessar Painel Admin</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

