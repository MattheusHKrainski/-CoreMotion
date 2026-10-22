'use client';

import React from 'react';
import { useCoreMotiom } from '@/lib/store';
import BrandMark from '@/components/shared/BrandMark';

export default function Footer() {
  const { setActiveView, setSearchQuery } = useCoreMotiom();

  const openSport = (sport?: string) => {
    setSearchQuery(sport || '');
    setActiveView('marketplace');
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <BrandMark className="w-8 h-8" />
              <span className="text-lg font-black tracking-tight text-white">CoreMotion</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Seu ponto de encontro no esporte: ofertas das melhores marcas, compra e venda segura de equipamentos, treinadores especializados e comunidade para Jiu-Jitsu, Basquete, Vôlei, Tênis, Karatê, Futebol, Corrida e muito mais.
            </p>
          </div>

          {/* Col 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Esportes</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => openSport('Jiu-Jitsu')} className="hover:text-white transition-colors">Jiu-Jitsu & Karatê</button></li>
              <li><button onClick={() => openSport('Basquete')} className="hover:text-white transition-colors">Basquete & Vôlei</button></li>
              <li><button onClick={() => openSport('Tênis')} className="hover:text-white transition-colors">Tênis & Raquetes</button></li>
              <li><button onClick={() => openSport('Futebol')} className="hover:text-white transition-colors">Futebol & Chuteiras</button></li>
              <li><button onClick={() => openSport('Corrida')} className="hover:text-white transition-colors">Corrida & Musculação</button></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Para Você</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => openSport()} className="hover:text-white transition-colors">Ofertas do Dia</button></li>
              <li><button onClick={() => setActiveView('sell')} className="hover:text-white transition-colors">Vender meu Equipamento</button></li>
              <li><button onClick={() => setActiveView('coaches')} className="hover:text-white transition-colors">Encontrar Treinador</button></li>
              <li><button onClick={() => setActiveView('community')} className="hover:text-white transition-colors">Comunidade Esportiva</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Ajuda & Segurança</h5>
            <ul className="space-y-2 text-xs">
              <li><span>Central de Ajuda</span></li>
              <li><span>Compra 100% Garantida</span></li>
              <li><span>Trocas, Devoluções e Privacidade</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} CoreMotion · Todos os direitos reservados.</p>
          <p>Feito para quem vive o esporte todos os dias.</p>
        </div>
      </div>
    </footer>
  );
}
