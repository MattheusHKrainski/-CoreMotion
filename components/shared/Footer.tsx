'use client';

import React from 'react';
import { useCoreMotiom } from '@/lib/store';
import BrandMark from '@/components/shared/BrandMark';
import { Lock, Mail, Clock, Instagram, Youtube, Globe } from 'lucide-react';

const PAYMENT_METHODS = ['PIX', 'Visa', 'Mastercard', 'Elo', 'Hipercard', 'Boleto'];

export default function Footer() {
  const { setActiveView, setSearchQuery, setCheckoutOpen, isVisitor, setAuthModalOpen } = useCoreMotiom();

  const openSport = (sport?: string) => {
    setSearchQuery(sport || '');
    setActiveView('marketplace');
  };

  const handleAccountLink = (target: 'profile' | 'sell') => {
    if (isVisitor) setAuthModalOpen(true);
    else setActiveView(target);
  };

  return (
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
              Plataforma completa de esportes para comprar equipamentos das principais marcas, desapegar com segurança e treinar com profissionais qualificados.
            </p>

            <div className="space-y-1.5 pt-1 text-xs text-zinc-400">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>contato@coremotion.com.br</span>
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
              <a
                href="#comunidade"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView('community');
                }}
                aria-label="Comunidade CoreMotion"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
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
              <li><span className="cursor-default">Trabalhe Conosco</span></li>
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
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5">Minha Conta</h5>
            <ul className="space-y-2.5 text-xs">
              <li><button type="button" onClick={() => handleAccountLink('profile')} className="hover:text-white transition-colors">Meu Perfil</button></li>
              <li><button type="button" onClick={() => handleAccountLink('profile')} className="hover:text-white transition-colors">Meus Pedidos</button></li>
              <li><button type="button" onClick={() => setCheckoutOpen(true)} className="hover:text-white transition-colors">Meu Carrinho</button></li>
              <li><button type="button" onClick={() => handleAccountLink('sell')} className="hover:text-white transition-colors">Quero Vender</button></li>
              <li><button type="button" onClick={() => setActiveView('coaches')} className="hover:text-white transition-colors">Treinadores</button></li>
            </ul>
          </div>

          {/* Column 4: Ajuda e Atendimento */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5">Ajuda & Suporte</h5>
            <ul className="space-y-2.5 text-xs">
              <li><span className="cursor-default">Central de Atendimento</span></li>
              <li><span className="cursor-default">Prazos e Entregas</span></li>
              <li><span className="cursor-default">Trocas e Devoluções</span></li>
              <li><span className="cursor-default">Compra Garantida</span></li>
              <li><span className="cursor-default">Perguntas Frequentes</span></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Security Row */}
        <div className="py-6 border-b border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mr-1">
              Formas de pagamento:
            </span>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300"
              >
                {method}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Ambiente Seguro · Certificado SSL 256-bit</span>
          </div>
        </div>

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
  );
}
