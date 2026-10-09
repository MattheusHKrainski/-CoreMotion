'use client';

import React, { useState, useEffect } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { isStaffRole, ROLE_LABELS } from '@/lib/permissions';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  PlusCircle,
  ShieldCheck,
  Store as StoreIcon,
  Users,
  Compass,
  Menu,
  X,
  LogOut,
  SlidersHorizontal,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const {
    activeView,
    setActiveView,
    user,
    role,
    isVisitor,
    cartCount,
    cart,
    favorites,
    setAuthModalOpen,
    setAuthModalMode,
    setCheckoutOpen,
    searchQuery,
    setSearchQuery,
    logout,
    switchRole,
    setSupabaseConfigOpen,
    addToast,
    stores,
  } = useCoreMotiom();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Check if current user has admin role or master admin email
  // Papel vem sempre da conta autenticada (banco) ou do perfil de demonstração.
  const userIsAdmin = user?.role === 'admin';
  const userIsStaff = isStaffRole(user?.role);
  const showDemoSwitcher = !isSupabaseConfigured;

  // Calculate cart subtotal
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  interface NavItem {
    id: typeof activeView;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Início',
      description: 'Destaques & Novidades',
      icon: Compass,
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      description: 'Catálogo de Produtos',
      icon: ShoppingBag,
    },
    {
      id: 'stores',
      label: 'Lojas Oficiais',
      description: `${stores.length} Lojas Parceiras`,
      icon: StoreIcon,
      badge: `${stores.length}`,
    },
    {
      id: 'sell',
      label: 'Vender C2C',
      description: 'Anuncie seus Equipamentos',
      icon: PlusCircle,
      badge: 'Anunciar',
      highlight: true,
    },
    {
      id: 'coaches',
      label: 'Treinadores',
      description: 'Planilhas & Assessoria',
      icon: Users,
    },
    {
      id: 'community',
      label: 'Comunidade',
      description: 'Feed de Atletas',
      icon: Layers,
    },
    ...(userIsStaff
      ? [
          {
            id: 'admin' as const,
            label: 'Painel Admin',
            description: 'Gestão, Lojas & Usuários',
            icon: ShieldCheck,
            badge: 'ADMIN',
            highlight: true,
          },
        ]
      : []),
  ];

  const handleNavClick = (id: typeof activeView) => {
    if (id === 'sell' && isVisitor) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      addToast('Acesso Restrito', 'Faça login para anunciar seus equipamentos com custódia segura.', 'info');
      return;
    }
    setActiveView(id);
    setIsMobileOpen(false);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('sidebar-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Shared Sidebar Content (Used in desktop fixed bar and mobile drawer)
  const renderSidebarContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full justify-between">
      {/* Top Section: Brand & Search & Navigation */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group focus:outline-none text-left"
            title="CoreMotiom PRO"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-red-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform shrink-0">
              CM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-red-400 transition-colors">
                  CoreMotiom
                </span>
                <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium leading-none mt-0.5">
                Hub de Alta Performance
              </p>
            </div>
          </button>

          {isMobileDrawer && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* System & DB Status Pill */}
        <div className="px-2">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-300 font-semibold">Sistema Online</span>
            </div>
            <button
              onClick={() => setSupabaseConfigOpen(true)}
              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-emerald-400 transition-colors"
              title="Status do Banco Supabase"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>PostgreSQL</span>
            </button>
          </div>
        </div>

        {/* Global Instant Search Box */}
        <div className="px-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="sidebar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'marketplace' && e.target.value.length > 0) {
                  setActiveView('marketplace');
                }
              }}
              placeholder="Buscar produtos, marcas..."
              className="w-full pl-9 pr-12 py-2 bg-zinc-900/90 hover:bg-zinc-900 text-xs text-white placeholder-zinc-500 rounded-xl border border-zinc-800 focus:border-red-500/60 focus:bg-zinc-950 focus:outline-none transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] border border-zinc-700 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Main Function Navigation Menu */}
        <div className="px-1 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Navegação Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-950/40 font-semibold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-red-400 group-hover:border-red-500/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight truncate">
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-white/80' : 'text-zinc-500 group-hover:text-zinc-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ml-2 ${
                      isActive
                        ? 'bg-white text-red-600'
                        : item.badge === 'ADMIN'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Function Utilities (Cart & Favorites) */}
        <div className="px-1 pt-1 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Ações Rápidas
          </div>

          {/* Cart Button with Counter */}
          <button
            onClick={() => {
              setCheckoutOpen(true);
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                  Meu Carrinho
                </div>
                <div className="text-[10px] text-zinc-400">
                  {cartCount > 0 ? `R$ ${cartSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Vazio'}
                </div>
              </div>
            </div>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Favorites Button (if logged in) */}
          {!isVisitor && (
            <button
              onClick={() => {
                setActiveView('profile');
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-300 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                    Meus Favoritos
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {favorites.length} {favorites.length === 1 ? 'item salvo' : 'itens salvos'}
                  </div>
                </div>
              </div>
              {favorites.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[10px]">
                  {favorites.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Section: Profile & Authentication */}
      <div className="pt-4 border-t border-zinc-800/80 px-2 space-y-2">
        {isVisitor ? (
          <div className="p-3 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Acesso à Plataforma</p>
                <p className="text-[10px] text-zinc-400">Faça login para comprar e anunciar</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                  setIsMobileOpen(false);
                }}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition-colors text-center"
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setAuthModalOpen(true);
                  setIsMobileOpen(false);
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950/50 transition-all text-center"
              >
                Cadastrar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
            {/* User Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-400 text-white flex items-center justify-center font-bold text-xs shadow shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                title="Desconectar / Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* User Role Badge */}
            <div className="flex items-center justify-between pt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                  userIsAdmin
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : role === 'supervisor'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : role === 'seller'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {userIsAdmin ? (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>{ROLE_LABELS.admin}</span>
                  </>
                ) : role === 'supervisor' ? (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>{ROLE_LABELS.supervisor}</span>
                  </>
                ) : role === 'seller' ? (
                  <>
                    <StoreIcon className="w-2.5 h-2.5" />
                    <span>{ROLE_LABELS.seller}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{ROLE_LABELS.user}</span>
                  </>
                )}
              </span>

              {showDemoSwitcher && (
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Alternar Papel para Teste"
              >
                <SlidersHorizontal className="w-3 h-3 text-red-400" />
                <span>Modo</span>
              </button>
              )}
            </div>

            {/* Quick Test Role Switcher Accordion */}
            {showDemoSwitcher && showRoleSwitcher && (
              <div className="pt-2 border-t border-zinc-800/80 animate-in fade-in duration-150">
                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Simulação de Papel (demonstração)
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {(['visitor', 'user', 'seller', 'supervisor', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleSwitcher(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold text-center transition-all ${
                        (r === 'visitor' && isVisitor) || (r !== 'visitor' && role === r)
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT LEFT SIDEBAR FUNCTION BAR */}
      <aside
        id="core-left-sidebar"
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-64 xl:w-72 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/80 z-40 flex-col py-5 px-3 select-none overflow-y-auto ${className}`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. MOBILE TOP NAVIGATION BAR WITH HAMBURGER DRAWER TRIGGER */}
      <div className="lg:hidden sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        {/* Left: Mobile Drawer Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Abrir barra de funções"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white font-black text-xs shadow-md">
              CM
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              CoreMotiom <span className="text-red-500 text-xs">PRO</span>
            </span>
          </button>
        </div>

        {/* Right: Cart & User Shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCheckoutOpen(true)}
            className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            aria-label="Ver carrinho"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {isVisitor ? (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-sm"
            >
              Entrar
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-400 text-white flex items-center justify-center font-bold text-xs"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>
          )}
        </div>
      </div>

      {/* 3. MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Slide-in Sidebar */}
          <div className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-zinc-950 border-r border-zinc-800 p-4 flex flex-col z-50 overflow-y-auto animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
