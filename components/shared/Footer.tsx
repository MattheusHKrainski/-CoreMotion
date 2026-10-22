'use client';

import React from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  Tag,
  Truck,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export default function Footer() {
  const { setActiveView } = useCoreMotiom();

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800/80 mt-20">
      <div className="border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Ofertas B2C Verificadas</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Curadoria de calçados, vestuário e acessórios de performance em lojas esportivas parceiras.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Checkout Facilitado</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Pagamento via PIX com 5% de desconto à vista, cartão de crédito em até 12x ou boleto bancário.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Envio para Todo o Brasil</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Opções de frete expresso SEDEX e PAC com acompanhamento completo até a entrega.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Compra Protegida C2C</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Negociação segura de equipamentos diretamente entre atletas com suporte dedicado.
                </p>
              </div>
            </div>
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
              Plataforma esportiva de alta performance reunindo ofertas de lojas parceiras (B2C), compra e venda entre atletas (C2C), treinadores certificados e comunidade.
            </p>
          </div>

          {/* Col 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Marketplace</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Ofertas de corrida</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Tecnologia & Wearables</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Ciclismo & acessórios</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Triatlo & natação</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Anúncios de Atletas C2C</button></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Plataforma</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Explorar ofertas B2C</button></li>
              <li><button onClick={() => setActiveView('sell')} className="hover:text-white transition-colors">Anunciar Equipamento C2C</button></li>
              <li><button onClick={() => setActiveView('coaches')} className="hover:text-white transition-colors">Treinadores</button></li>
              <li><button onClick={() => setActiveView('community')} className="hover:text-white transition-colors">Comunidade de Atletas</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Atendimento</h5>
            <ul className="space-y-2 text-xs">
              <li><span>Central de Ajuda ao Atleta</span></li>
              <li><span>Compra Protegida C2C</span></li>
              <li><span>Política de Privacidade e Termos</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} CoreMotion · Todos os direitos reservados.</p>
          <p>Hub esportivo de performance para atletas em todo o Brasil.</p>
        </div>
      </div>
    </footer>
  );
}
