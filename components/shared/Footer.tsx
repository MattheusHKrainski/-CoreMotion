'use client';

import React, { useState } from 'react';
import HelpCenter from './HelpCenter';
import { HELP_TOPICS, SUPPORT_EMAIL, type HelpTopic } from '@/lib/support';
import { useCoreMotiom } from '@/lib/store';
import BrandMark from '@/components/shared/BrandMark';
import { Mail, Clock, Instagram, Youtube } from 'lucide-react';


export default function Footer() {
  const { setActiveView, setSearchQuery, setCheckoutOpen, isVisitor, setAuthModalOpen, setAuthModalMode } = useCoreMotiom();

  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const switchAccount = () => { setAuthModalMode('switch'); setAuthModalOpen(true); };

  const openSport = (sport?: string) => {
    setSearchQuery(sport || '');
    setActiveView('marketplace');
  };

  const handleAccountLink = (target: 'profile' | 'sell') => {
    if (isVisitor) setAuthModalOpen(true);
    else setActiveView(target);
  };

  return (
    <>
    <footer className="bg-[#0b0d12] text-zinc-400 border-t border-zinc-800/90 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Main Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 pb-10 border-b border-zinc-800/80">
          {/* Brand & Contact */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 space-y-4 pr-0 lg:pr-6">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="inline-flex items-center gap-2.5 text-left focus:outline-none"
            >
              <BrandMark className="w-8 h-8" />
              <span className="text-lg font-extrabold tracking-tight text-white">CoreMotion</span>
            </button>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              CoreShop e comunidade esportiva. Vendas CoreMotion em preparação e anúncios de atletas com negociação direta.
            </p>

            <div className="space-y-1.5 pt-1 text-xs text-zinc-400">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">{SUPPORT_EMAIL}</a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Seg. a Sex. das 8h às 20h · Sáb. das 9h às 15h</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="#redes-sociais"
                onClick={(e) => e.preventDefault()}
                aria-label="Instagram CoreMotion"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#redes-sociais"
                onClick={(e) => e.preventDefault()}
                aria-label="YouTube CoreMotion"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>

            </div>
          </div>

          {/* Column 1: Institucional */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5">Institucional</h5>
            <ul className="space-y-2.5 text-xs">
              <li><button type="button" onClick={() => setActiveView('home')} className="hover:text-white transition-colors">Sobre a CoreMotion</button></li>
              <li><button type="button" onClick={() => openSport()} className="hover:text-white transition-colors">Ofertas</button></li>
              <li><button type="button" onClick={() => setActiveView('coaches')} className="hover:text-white transition-colors">Seja um Treinador</button></li>
              <li><button type="button" onClick={() => setActiveView('community')} className="hover:text-white transition-colors">Comunidade</button></li>
              <li><button type="button" onClick={() => setHelpTopic('corporate')} className="hover:text-white">Trabalhe Conosco</button></li>
            </ul>
          </div>

          {/* Column 2: Esportes */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5">Categorias</h5>
            <ul className="space-y-2.5 text-xs">
              <li><button type="button" onClick={() => openSport('Futebol')} className="hover:text-white transition-colors">Futebol & Futsal</button></li>
              <li><button type="button" onClick={() => openSport('Basquete')} className="hover:text-white transition-colors">Basquete & Vôlei</button></li>
              <li><button type="button" onClick={() => openSport('Jiu-Jitsu')} className="hover:text-white transition-colors">Jiu-Jitsu & Karatê</button></li>
              <li><button type="button" onClick={() => openSport('Tênis')} className="hover:text-white transition-colors">Tênis & Raquetes</button></li>
              <li><button type="button" onClick={() => openSport('Corrida')} className="hover:text-white transition-colors">Corrida & Academia</button></li>
            </ul>
          </div>

          {/* Column 3: Minha Conta */}
          <div className="lg:col-span-2">
            <div className="mb-3.5 flex flex-wrap items-center gap-2"><h5 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Minha Conta</h5><button type="button" onClick={switchAccount} className="text-[10px] font-bold text-red-400 hover:text-red-300">Trocar conta</button></div>
            <ul className="space-y-2.5 text-xs">
              <li><button type="button" onClick={() => handleAccountLink('profile')} className="hover:text-white transition-colors">Meu Perfil</button></li>
              <li><button type="button" onClick={() => handleAccountLink('profile')} className="hover:text-white transition-colors">Pedidos de atletas</button></li>
              <li><a href="/pedidos" className="hover:text-white">Pedidos CoreMotion</a></li>
              <li><a href="/compras" className="hover:text-white">Carrinho CoreMotion</a></li>
              <li><button type="button" onClick={() => setCheckoutOpen(true)} className="hover:text-white transition-colors">Carrinho de atletas</button></li>
              <li><button type="button" onClick={() => handleAccountLink('sell')} className="hover:text-white transition-colors">Quero Vender</button></li>
              <li><button type="button" onClick={() => setActiveView('coaches')} className="hover:text-white transition-colors">Treinadores</button></li>
            </ul>
          </div>

          {/* Column 4: Ajuda e Atendimento */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5">Ajuda & Suporte</h5>
            <ul className="space-y-2.5 text-xs">
              <li><button type="button" onClick={() => setHelpTopic('general')} className="hover:text-white">Central de Atendimento</button></li>
              {Object.entries(HELP_TOPICS).map(([id, topic]) => <li key={id}><button type="button" onClick={() => setHelpTopic(id as HelpTopic)} className="hover:text-white">{topic.label}</button></li>)}
            </ul>
          </div>
        </div>

        <p className="py-6 border-b border-zinc-800/80 text-xs leading-relaxed text-zinc-400">
          Vendas CoreMotion: pagamento e logística ainda desativados, sem compras confirmadas ou estoque reservado. Nos anúncios de atletas, pagamento, entrega e condições são combinados diretamente com o anunciante.
        </p>

        {/* Bottom Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} CoreMotion. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-zinc-300 transition-colors cursor-default">Termos de Uso</span>
            <span className="text-zinc-800">•</span>
            <span className="hover:text-zinc-300 transition-colors cursor-default">Política de Privacidade</span>
            <span className="text-zinc-800">•</span>
            <span className="hover:text-zinc-300 transition-colors cursor-default">Preferências de Cookies</span>
          </div>
        </div>
      </div>
    </footer>
    {helpTopic && <HelpCenter initialTopic={helpTopic} onClose={() => setHelpTopic(null)} />}
    </>
  );
}
