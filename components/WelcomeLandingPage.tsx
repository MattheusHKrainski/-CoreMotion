'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCoreMotiom } from '@/lib/store';
import { ACCOUNT_TYPES } from '@/lib/sports';
import BrandMark from '@/components/shared/BrandMark';
import Footer from '@/components/shared/Footer';
import {
  ArrowRight,
  ArrowUp,
  Award,
  CheckCircle2,
  Compass,
  Flame,
  Layers,
  Lock,
  LogIn,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

export default function WelcomeLandingPage() {
  const {
    products,
    activeOffers,
    coaches,
    communityPosts,
    setAuthAccountType,
    setAuthModalMode,
    setAuthModalOpen,
    enterPlatform,
  } = useCoreMotiom();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'atleta' | 'treinador' | 'casual' | 'visitante'>('atleta');

  const c2cCount = products.filter((p) => p.product_type === 'c2c' && p.status === 'active').length;

  const handleOpenLogin = () => {
    setMobileMenuOpen(false);
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setMobileMenuOpen(false);
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const handleEnterAsVisitor = (target: 'home' | 'marketplace' | 'coaches' | 'community' = 'home') => {
    setMobileMenuOpen(false);
    enterPlatform(target);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#F8FAFC] selection:bg-red-600 selection:text-white antialiased">
      {/* BARRA SUPERIOR MINIMALISTA DE ENTRADA */}
      <header className="sticky top-0 z-40 w-full bg-[#0B0C10]/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Esquerda: Marca CoreMotion + Navegação */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <BrandMark className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <span className="font-extrabold text-base tracking-tight text-white">
                CoreMotion
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-zinc-300">
              <button
                type="button"
                onClick={() => scrollToSection('proposta')}
                className="hover:text-white transition-colors"
              >
                Nossa proposta
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('como-funciona')}
                className="hover:text-white transition-colors"
              >
                Como funciona
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleTab('atleta');
                  scrollToSection('perfis');
                }}
                className="hover:text-white transition-colors"
              >
                Atletas & Clientes
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleTab('treinador');
                  scrollToSection('perfis');
                }}
                className="hover:text-white transition-colors"
              >
                Treinadores
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('seguranca')}
                className="hover:text-white transition-colors"
              >
                Compra Garantida
              </button>
            </nav>
          </div>

          {/* Direita: Atalho Catálogo + Visitante + Entrar + Cadastrar */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleEnterAsVisitor('marketplace')}
              className="hidden xl:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-red-400" />
              <span>Explorar catálogo</span>
            </button>

            <button
              type="button"
              onClick={() => handleEnterAsVisitor('home')}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              Visitante
            </button>
            <button
              type="button"
              onClick={handleOpenLogin}
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white border border-zinc-700 hover:border-zinc-400 transition-colors"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={handleOpenRegister}
              className="px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors"
            >
              Cadastrar-se
            </button>
          </div>

          {/* Menu Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Abrir menu inicial"
            className="sm:hidden p-2 rounded-lg border border-zinc-800 text-zinc-200 hover:bg-zinc-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-zinc-300">
              <button
                type="button"
                onClick={() => scrollToSection('proposta')}
                className="p-2.5 rounded-lg bg-zinc-900 text-left hover:text-white"
              >
                Nossa proposta
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('como-funciona')}
                className="p-2.5 rounded-lg bg-zinc-900 text-left hover:text-white"
              >
                Como funciona
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('perfis')}
                className="p-2.5 rounded-lg bg-zinc-900 text-left hover:text-white"
              >
                Clientes & Atletas
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleTab('treinador');
                  scrollToSection('perfis');
                }}
                className="p-2.5 rounded-lg bg-zinc-900 text-left hover:text-white"
              >
                Treinadores
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleOpenRegister}
                className="w-full py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Cadastrar-se grátis
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="py-2.5 rounded-xl border border-zinc-700 text-white text-xs font-semibold"
                >
                  Fazer login
                </button>
                <button
                  type="button"
                  onClick={() => handleEnterAsVisitor('home')}
                  className="py-2.5 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-semibold"
                >
                  Entrar como visitante
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* HERO CENTRAL DE ALTO IMPACTO COM ESCOLHA IMEDIATA: CADASTRAR, LOGAR OU VISITANTE */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-zinc-800/80">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(220,38,38,0.16),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[980px] h-[300px] rounded-full bg-gradient-to-r from-zinc-900 via-red-950/35 to-zinc-900 blur-3xl"
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Plataforma Esportiva CoreMotion • Equipamentos, Ofertas e Treinadores</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-[-0.03em] leading-[1.07] text-white max-w-4xl mx-auto">
              O futuro de quem vive o esporte acontece em conjunto
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-xl text-zinc-300 leading-relaxed font-normal">
              As modalidades e os desafios evoluem, mas a dedicação permanece. Na CoreMotion, clientes, atletas e treinadores se unem em uma única plataforma segura.
            </p>

            {/* BARRA CENTRAL DE ESCOLHA DIRETA: CADASTRAR, LOGAR OU ENTRAR COMO VISITANTE */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3.5 max-w-3xl mx-auto">
              <button
                type="button"
                onClick={handleOpenRegister}
                className="px-7 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-red-950/50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar-se grátis</span>
              </button>

              <button
                type="button"
                onClick={handleOpenLogin}
                className="px-7 py-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-extrabold text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Fazer login</span>
              </button>

              <button
                type="button"
                onClick={() => handleEnterAsVisitor('home')}
                className="px-7 py-4 rounded-xl border border-zinc-600 hover:border-white bg-zinc-900/70 hover:bg-zinc-800 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
              >
                <span>Entrar como visitante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* FAIXA DE DADOS VIVOS DA PLATAFORMA (ORDEM: ENTRE ATLETAS -> OFERTAS -> TREINADORES -> COMUNIDADE) */}
            <div className="pt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left max-w-4xl mx-auto">
              <button
                type="button"
                onClick={() => handleEnterAsVisitor('marketplace')}
                className="group p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Entre Atletas</span>
                  <ShoppingBag className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-white mt-1">{c2cCount}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Equipamentos com Compra Garantida</p>
              </button>

              <button
                type="button"
                onClick={() => handleEnterAsVisitor('marketplace')}
                className="group p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Ofertas Verificadas</span>
                  <Tag className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-white mt-1">{activeOffers.length}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Promoções reais selecionadas</p>
              </button>

              <button
                type="button"
                onClick={() => handleEnterAsVisitor('coaches')}
                className="group p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Treinadores</span>
                  <Award className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-white mt-1">{coaches.length}+</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Assessorias online e presenciais</p>
              </button>

              <button
                type="button"
                onClick={() => handleEnterAsVisitor('community')}
                className="group p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Comunidade Ativa</span>
                  <Layers className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-white mt-1">{communityPosts.length}+</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Relatos de treinos, provas e dicas</p>
              </button>
            </div>

            {/* VITRINE VISUAL AUTÊNTICA COREMOTION */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
              <div
                onClick={() => handleEnterAsVisitor('marketplace')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleEnterAsVisitor('marketplace');
                }}
                style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', minWidth: 0 }}
                className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[16/10] cursor-pointer"
              >
                <Image
                  src="/products/raquete-tenis.jpg"
                  alt="Equipamentos esportivos entre atletas"
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">De Atletas</span>
                  <p className="text-sm font-bold text-white">Seminovos revisados com garantia</p>
                </div>
              </div>

              <div
                onClick={() => handleEnterAsVisitor('marketplace')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleEnterAsVisitor('marketplace');
                }}
                style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', minWidth: 0 }}
                className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[16/10] cursor-pointer"
              >
                <Image
                  src="/offers/gps-ciclocomputador-bike.jpg"
                  alt="Ofertas esportivas verificadas"
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Ofertas</span>
                  <p className="text-sm font-bold text-white">Descontos e cupons selecionados</p>
                </div>
              </div>

              <div
                onClick={() => handleEnterAsVisitor('coaches')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleEnterAsVisitor('coaches');
                }}
                style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', minWidth: 0 }}
                className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[16/10] cursor-pointer"
              >
                <Image
                  src="/products/kimono-jiujitsu.jpg"
                  alt="Treinadores e modalidades esportivas"
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Treinadores</span>
                  <p className="text-sm font-bold text-white">Evolução guiada em 10+ esportes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 1: NOSSA PROPOSTA */}
        <section id="proposta" className="py-20 sm:py-24 bg-[#0e1017] border-b border-zinc-800/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                Nossa proposta
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Tudo o que move sua rotina esportiva reunido em um só lugar
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Quem pratica esporte sabe como tudo costumava ficar espalhado: promoções difíceis de achar, grupos inseguros para negociar material usado e falta de referência na hora de escolher um bom treinador. A <strong className="text-white">CoreMotion</strong> nasceu para resolver exatamente isso com transparência, economia e segurança.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800 p-6 sm:p-7 space-y-3 hover:border-red-500/35 transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Compra e Venda Entre Atletas</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Tem um equipamento parado em ótimo estado ou quer subir de nível pagando menos? Negocie kimonos, raquetes, tênis, chuteiras, relógios GPS e bikes com pagamento em custódia e entrega rastreada.
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800 p-6 sm:p-7 space-y-3 hover:border-red-500/35 transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Curadoria de Ofertas Reais</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Reunimos descontos verificados e cupons ativos nos principais varejistas esportivos do mercado, levando você direto para a página oficial de cada promoção.
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800 p-6 sm:p-7 space-y-3 hover:border-red-500/35 transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Treinadores & Comunidade</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Encontre treinadores especializados para corrida, musculação, ciclismo, lutas, quadra ou natação, e troque relatos sinceros com atletas reais que testam os equipamentos na prática.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: COMO FUNCIONA O SITE */}
        <section id="como-funciona" className="py-20 sm:py-24 bg-[#0B0C10] border-b border-zinc-800/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                Passo a passo simples
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Como funciona a CoreMotion
              </h2>
              <p className="text-sm sm:text-base text-zinc-400">
                Você escolhe como quer começar — sem cadastro obrigatório para navegar ou com conta gratuita para aproveitar todos os recursos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: '01',
                  title: 'Escolha seu acesso',
                  description:
                    'Entre imediatamente como visitante para conhecer tudo, ou faça login / cadastro gratuito em segundos.',
                  icon: Compass,
                },
                {
                  step: '02',
                  title: 'Explore ou anuncie',
                  description:
                    'Filtre equipamentos de atletas e ofertas por modalidade, estado de conservação e preço — ou publique seu anúncio.',
                  icon: Search,
                },
                {
                  step: '03',
                  title: 'Pague com segurança',
                  description:
                    'Nos equipamentos de atletas, finalize com PIX (5% de desconto automático), cartão ou boleto e frete PAC/SEDEX protegido.',
                  icon: Lock,
                },
                {
                  step: '04',
                  title: 'Evolua seu treino',
                  description:
                    'Conecte-se com treinadores certificados na sua modalidade e participe do feed da comunidade com relatos e dicas.',
                  icon: Users,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-widest text-red-400 bg-red-600/15 border border-red-500/30 px-2.5 py-1 rounded-full">
                          PASSO {item.step}
                        </span>
                        <Icon className="w-5 h-5 text-zinc-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SEÇÃO 3: O QUE CADA PERFIL PODE FAZER (CLIENTE/ATLETA, TREINADOR E VISITANTE) */}
        <section id="perfis" className="py-20 sm:py-24 bg-[#0e1017] border-b border-zinc-800/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                  Feito para cada perfil
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  Escolha seu caminho: Atleta, Treinador ou Casual
                </h2>
                <p className="text-sm sm:text-base text-zinc-400">
                  Seja para economizar em equipamentos, vender material parado, captar novos alunos ou apenas pesquisar preços, cada perfil tem ferramentas sob medida.
                </p>
              </div>

              <div className="inline-flex flex-wrap p-1 rounded-2xl bg-zinc-900 border border-zinc-800 self-start">
                <button
                  type="button"
                  onClick={() => setSelectedRoleTab('atleta')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedRoleTab === 'atleta'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Cliente / Atleta
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleTab('treinador')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedRoleTab === 'treinador'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Treinador
                </button>
                <button type="button" onClick={() => setSelectedRoleTab('casual')} className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${selectedRoleTab === 'casual' ? 'bg-red-600 text-white' : 'text-zinc-400'}`}>Casual</button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleTab('visitante')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedRoleTab === 'visitante'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Visitante
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">{Object.entries(ACCOUNT_TYPES).map(([key, value]) => <article key={key} className={`rounded-2xl border bg-zinc-950 p-6 space-y-3 ${selectedRoleTab === ({ athlete: 'atleta', coach: 'treinador', casual: 'casual' } as Record<string, string>)[key] ? 'border-zinc-600' : 'border-zinc-800'}`}><h3 className="text-xl font-bold text-white">{value.label}</h3><p className="text-sm text-zinc-400 leading-relaxed">{value.description}</p><button type="button" className="text-red-400 text-sm font-bold" onClick={() => { setAuthAccountType(key as keyof typeof ACCOUNT_TYPES); handleOpenRegister(); }}>Criar perfil {value.label}</button></article>)}</div>
            <p className="text-sm text-zinc-400">O visitante navega sem conta. O perfil Casual é uma conta para compras, comunidade e atividades de rotina, sem acesso ao recrutamento. Atletas personalizam altura, peso, idade, tempo de prática, posição, estatísticas, medalhas e histórico. Treinadores apresentam formação, certificações, equipe e metodologia. Nas seletivas, veja endereço, data, horário, categoria SUB e a rotina de treinos após aprovação. Publique somente informações que deseja compartilhar.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: CLIENTES & ATLETAS */}
              <div
                id="atletas"
                className={`rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between space-y-6 ${
                  selectedRoleTab === 'atleta'
                    ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-600'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/15 text-red-300 border border-red-500/30">
                      <UserCheck className="w-3.5 h-3.5" />
                      Para Clientes e Atletas
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Conta gratuita</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Compre melhor, venda o que não usa mais e evolua no seu esporte
                  </h3>

                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Comprar com Compra Garantida:</strong> adquira equipamentos novos e seminovos com PIX (5% OFF), cartão ou boleto e custódia até o recebimento.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Anunciar e vender seus equipamentos:</strong> publique fotos, estado de conservação e preço em poucos cliques no menu <em>Quero Vender</em>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Aproveitar ofertas reais e cupons:</strong> acesse descontos selecionados em lojas esportivas e copie cupons promocionais em 1 clique.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Encontrar treinadores e interagir:</strong> filtre especialistas por esporte/cidade, salve favoritos, acompanhe pedidos e publique na Comunidade.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => { setAuthAccountType('athlete'); handleOpenRegister(); }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Criar conta de Atleta / Cliente</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenLogin}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Já tenho conta</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: TREINADORES & ASSESSORIAS */}
              <div
                id="treinadores"
                className={`rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between space-y-6 ${
                  selectedRoleTab === 'treinador'
                    ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-600'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <Award className="w-3.5 h-3.5" />
                      Para Treinadores e Assessorias
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Presencial, Online ou Híbrido</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Amplie seu alcance, conquiste novos alunos e construa autoridade
                  </h3>

                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Vitrine especializada por modalidade:</strong> apresente sua metodologia, certificações (CREF, federações, graduações), experiência e valores.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Conexão direta com alunos qualificados:</strong> seja encontrado por praticantes que já procuram planilhas, preparação para provas e acompanhamento técnico.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Destaque técnico na Comunidade:</strong> publique orientações de treino, prevenção de lesão e análises de equipamentos para engajar atletas de todo o país.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Renovação de materiais esportivos:</strong> compre acessórios de treino com desconto ou anuncie materiais seminovos da sua assessoria com segurança.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => { setAuthAccountType('coach'); handleOpenRegister(); }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    <span>Cadastrar perfil na plataforma</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnterAsVisitor('coaches')}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Ver vitrine de Treinadores</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FAIXA DEDICADA: O QUE O VISITANTE PODE FAZER SEM CONTA */}
            <div
              className={`rounded-3xl p-6 sm:p-7 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                selectedRoleTab === 'visitante'
                  ? 'bg-zinc-900 border-zinc-600'
                  : 'bg-zinc-900/50 border-zinc-800'
              }`}
            >
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Prefere só conhecer primeiro?
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Entrando como Visitante, você navega livremente sem precisar criar conta agora
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Veja todos os equipamentos de atletas, abra ofertas selecionadas, consulte perfis de treinadores e leia os relatos da comunidade. Se depois quiser comprar, anunciar ou publicar, você entra ou se cadastra em um clique.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleEnterAsVisitor('home')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-extrabold text-xs sm:text-sm whitespace-nowrap transition-colors shrink-0"
              >
                <span>Entrar agora como visitante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: GARANTIAS + CHAMADA FINAL COM AS 3 OPÇÕES CLARAS */}
        <section id="seguranca" className="py-20 sm:py-24 bg-[#0B0C10]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Pronto para entrar na CoreMotion?
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
                Escolha abaixo como deseja acessar agora: crie sua conta gratuita, entre com seu login existente ou conheça a plataforma completa como visitante.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenRegister}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-950/50"
                >
                  Criar minha conta gratuita
                </button>
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-zinc-600 hover:border-white bg-zinc-900/80 text-white font-bold text-sm transition-colors"
                >
                  Fazer login
                </button>
                <button
                  type="button"
                  onClick={() => handleEnterAsVisitor('home')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-sm transition-colors"
                >
                  Entrar como visitante
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
        className="fixed bottom-5 right-5 z-30 w-10 h-10 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center shadow-xl transition-all"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  );
}
