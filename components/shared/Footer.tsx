'use client';

import React from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  Sparkles,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const CUSTOMER_GUARANTEES = [
  {
    badge: 'Marcas Originais',
    title: 'Grandes Marcas com Desconto',
    description:
      'Economize em tênis de placa, relógios GPS, bikes e vestuário selecionado nas melhores lojas esportivas.',
    icon: Sparkles,
  },
  {
    badge: '5% OFF à vista',
    title: 'Pague do Seu Jeito',
    description:
      'Ganhe 5% de desconto imediato no PIX, parcele suas compras em até 12x no cartão ou pague via boleto.',
    icon: CreditCard,
  },
  {
    badge: 'Rastreio Completo',
    title: 'Entrega Rápida em Todo o Brasil',
    description:
      'Receba no seu endereço via SEDEX ou PAC com código de rastreamento em todas as etapas do envio.',
    icon: Truck,
  },
  {
    badge: 'Seu Dinheiro Seguro',
    title: 'Compra 100% Garantida',
    description:
      'Seu pagamento fica protegido até você receber e aprovar o equipamento — ou devolvemos 100% do valor.',
    icon: ShieldCheck,
  },
] as const;

export default function Footer() {
  const { setActiveView } = useCoreMotiom();

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800/80 mt-20">
      <div className="border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-red-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Compre com tranquilidade
              </span>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                Por que milhares de atletas escolhem a CoreMotion
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Segurança do clique à linha de chegada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {CUSTOMER_GUARANTEES.map(({ badge, title, description, icon: Icon }) => (
              <div
                key={title}
                className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-zinc-800/90 hover:border-red-500/40 transition-all duration-300 shadow-lg shadow-black/25 flex flex-col justify-between gap-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-red-600/15 text-red-400 border border-red-500/25 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-500 transition-colors shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800/90 text-zinc-200 border border-zinc-700/70 group-hover:border-red-500/30 group-hover:text-red-200 transition-colors">
                    {badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-[15px] font-extrabold text-white tracking-tight">
                    {title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-red-950/40">
                CM
              </div>
              <span className="text-lg font-black tracking-tight text-white">CoreMotion</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Seu ponto de encontro no esporte: descontos nas melhores marcas, compra e venda segura de equipamentos entre atletas, treinadores certificados e comunidade ativa.
            </p>
          </div>

          {/* Col 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Comprar</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Corrida & Maratona</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Relógios GPS & Eletrônicos</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Ciclismo & Acessórios</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Triatlo & Natação</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Seminovos de Atletas</button></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Para Você</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Ofertas do Dia</button></li>
              <li><button onClick={() => setActiveView('sell')} className="hover:text-white transition-colors">Vender meu Equipamento</button></li>
              <li><button onClick={() => setActiveView('coaches')} className="hover:text-white transition-colors">Encontrar Treinador</button></li>
              <li><button onClick={() => setActiveView('community')} className="hover:text-white transition-colors">Comunidade de Atletas</button></li>
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
