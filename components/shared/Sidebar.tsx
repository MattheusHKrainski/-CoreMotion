'use client';

import React, { useState, useEffect } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { isStaffRole, ROLE_LABELS } from '@/lib/permissions';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { IS_QUICK_ACCESS } from '@/lib/quick-access';
import { ACCOUNT_TYPES, canAccessSports, canRecruit } from '@/lib/sports';
import UserAvatar from './UserAvatar';
import BrandMark from '@/components/shared/BrandMark';
import {
  Menu,
  ShoppingBag,
  User,
  PlusCircle,
  ShieldCheck,
  Users,
  Compass,
  Heart,
  Search,
  X,
  LogOut,
  SlidersHorizontal,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onOpenFavorites: () => void;
}

export default function Sidebar({ className = '', onOpenFavorites }: SidebarProps) {
  const {
    activeView,
    setActiveView,
    user,
    role,
    isVisitor,
    favorites,
    searchQuery,
    setSearchQuery,
    setAuthModalOpen,
    setAuthModalMode,
    logout,
    switchRole,
    addToast,
  } = useCoreMotiom();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const userIsAdmin = user?.role === 'admin';
  const userIsStaff = isStaffRole(user?.role);
  const showRoleMenu = !isSupabaseConfigured && !IS_QUICK_ACCESS && userIsStaff;



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
      description: 'Destaques e novidades',
      icon: Compass,
    },
    {
      id: 'marketplace',
      label: 'CoreShop',
      description: 'Equipamentos e ofertas',
      icon: ShoppingBag,
    },
    {
      id: 'sell',
      label: 'Quero Vender',
      description: 'Publique e gerencie anúncios',
      icon: PlusCircle,
      highlight: true,
    },
    {
      id: 'coaches',
      label: 'Treinadores e associações',
      description: 'Encontre orientação para treinar',
      icon: Users,
    },
    {
      id: 'community',
      label: 'Comunidade',
      description: 'Relatos e trocas entre atletas',
      icon: Layers,
    },
    ...(canAccessSports(user) ? [
      { id: 'trials' as const, label: 'Seletivas e treinos', description: 'Oportunidades e inscrições', icon: Users },
      { id: 'talents' as const, label: canRecruit(user) ? 'Banco de atletas' : 'Convocações e inscrições', description: canRecruit(user) ? 'Buscar atletas e convocar' : 'Convites, treinos e respostas', icon: Users },
      ...(canRecruit(user) ? [{ id: 'sports-activity' as const, label: 'Convocações e inscritos', description: 'Minhas convocações e atletas inscritos', icon: Users }] : []),
      { id: 'sports-profile' as const, label: user?.account_type === 'coach' ? 'Meu perfil profissional' : 'Meu currículo esportivo', description: user?.account_type === 'coach' ? 'Formação, metodologia e horários' : 'Trajetória e conquistas', icon: User },
    ] : []),
    ...(userIsStaff
      ? [
          {
            id: 'admin' as const,
            label: userIsAdmin ? 'Painel Admin' : 'Painel Supervisor',
            description: 'Gestão, anúncios e usuários',
            icon: ShieldCheck,
            badge: userIsAdmin ? 'ADMIN' : 'SUPERVISOR',
            highlight: true,
          },
        ]
      : []),
  ];

  const handleNavClick = (id: typeof activeView) => {
    if (id === 'sell' && isVisitor) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      addToast('Acesso Restrito', 'Faça login para anunciar seus equipamentos.', 'info');
      return;
    }
    setActiveView(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsMobileOpen(false);
  };

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

  useEffect(() => {
    if (!isMobileOpen) return;
    const before = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const drawer = document.getElementById('core-left-sidebar');
    const focusable = () => Array.from(drawer?.querySelectorAll<HTMLElement>('button, a[href], input, select, [tabindex="0"]') || []).filter(node => !node.hasAttribute('disabled'));
    focusable()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileOpen(false);
      if (event.key === 'Tab') { const items = focusable(), first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); if (before instanceof HTMLElement) before.focus(); };
  }, [isMobileOpen]);

  const renderSidebarContent = (isMobileDrawer = false) => (
    <div className="flex flex-col min-h-full justify-between gap-6">
      {/* Top Section: Brand & Search & Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group focus:outline-none text-left"
            title="CoreMotion"
          >
            <BrandMark className="w-9 h-9 group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-red-400 transition-colors">
                  CoreMotion
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium leading-none mt-0.5">
                Tudo para o Seu Esporte
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

        {/* Main Function Navigation Menu */}
        <nav aria-label="Navegação da plataforma" className="px-1 space-y-4">
          {[
            { title: 'Explorar', description: 'Descubra a plataforma', ids: ['home', 'marketplace', 'community'] },
            { title: 'Anunciar e treinar', description: 'Equipamentos e orientação', ids: ['sell', 'coaches'] },
            { title: 'Carreira esportiva', description: 'Oportunidades e trajetória', ids: ['trials', 'talents', 'sports-profile', 'sports-activity'] },
            { title: 'Gestão', description: 'Ferramentas da equipe', ids: ['admin'] },
          ].map((section) => {
            const items = navItems.filter((item) => section.ids.includes(item.id));
            if (!items.length) return null;
            return (
              <section key={section.title} aria-label={section.title} className="border-t border-zinc-800 pt-3 first:border-t-0 first:pt-0">
                <div className="px-3 pb-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">{section.title}</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{section.description}</p>
                </div>
                <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`core-sidebar-action w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left group ${
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
                      className={`text-[11px] leading-relaxed mt-1 whitespace-normal ${
                        isActive ? 'text-white/80' : 'text-zinc-400 group-hover:text-zinc-300'
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
              </section>
            );
          })}
        </nav>


      </div>

      {/* Bottom Section: Profile & Authentication */}
      <div className="shrink-0 pt-4 border-t border-zinc-800/80 px-2 space-y-2">
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
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => handleNavClick('profile')} aria-label="Abrir minha conta" className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80">
                <UserAvatar src={user?.avatar_url} name={user?.name || 'Sua conta'} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                title="Desconectar / Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>


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
                    <Layers className="w-2.5 h-2.5" />
                    <span>{ROLE_LABELS.seller}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{user?.account_type ? ACCOUNT_TYPES[user.account_type].label : ROLE_LABELS.user}</span>
                  </>
                )}
              </span>

              {showRoleMenu && (
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Alternar Papel de Acesso"
              >
                <SlidersHorizontal className="w-3 h-3 text-red-400" />
                <span>Perfil</span>
              </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-zinc-800 pt-2">
              <button type="button" onClick={() => handleNavClick('profile')} className="text-left text-xs font-bold text-red-400">Minha conta →</button>
              <button type="button" onClick={() => { setAuthModalMode('switch'); setAuthModalOpen(true); setIsMobileOpen(false); }} className="text-right text-[11px] font-bold text-zinc-400 hover:text-white">Trocar conta</button>
            </div>
            {showRoleMenu && showRoleSwitcher && (
              <div className="pt-2 border-t border-zinc-800/80 animate-in fade-in duration-150">
                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Alternar Papel de Acesso
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
      <div className={`sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-3 sm:px-7 py-3 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            type="button" aria-expanded={isMobileOpen} aria-controls="core-left-sidebar" className="group rounded-xl focus-visible:outline focus-visible:outline-red-500"
            aria-label="Abrir barra de funções"
          >
            <Menu className="h-6 w-6" />
          </button>
          <button type="button" onClick={() => handleNavClick('home')} aria-label="Voltar à tela principal" className="rounded-xl focus-visible:outline focus-visible:outline-red-500"><BrandMark className="h-10 w-10" /></button>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <form role="search" onSubmit={event => { event.preventDefault(); setActiveView('marketplace'); window.dispatchEvent(new Event('coremotion:catalog-search')); }} className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-2">
            <button type="submit" aria-label="Pesquisar produtos"><Search className="h-4 w-4 text-zinc-400" /></button>
            <input type="search" aria-label="Buscar no CoreShop" placeholder="Buscar" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} className="w-16 sm:w-24 lg:w-40 bg-transparent text-xs outline-none" />
          </form>
          <button type="button" onClick={onOpenFavorites} aria-label="Ver favoritos e salvos" className="relative rounded-full p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"><Heart className="h-5 w-5" />{favorites.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1 text-[10px] text-white">{favorites.length}</span>}</button>
          <button
            onClick={() => window.location.assign('/compras')}
            className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            aria-label="Ver carrinho"
          >
            <ShoppingBag className="w-4 h-4" />

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
              aria-label="Abrir minha conta"
              onClick={() => handleNavClick('profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-400 text-white flex items-center justify-center font-bold text-xs"
            >
              <UserAvatar src={user?.avatar_url} name={user?.name || 'Sua conta'} />
            </button>
          )}
        </div>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          <div id="core-left-sidebar" role="dialog" aria-modal="true" aria-label="Menu CoreMotion" className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-zinc-950 border-r border-zinc-800 p-4 flex flex-col z-50 overflow-y-auto animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
