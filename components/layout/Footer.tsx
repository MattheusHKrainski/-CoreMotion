// ============================================================================
// CORE MOTIOM — FOOTER (Rodapé global)
// Pilares de valor, links de navegação e barra de copyright.
// ============================================================================

'use client';

import React from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
} from 'lucide-react';

export default function Footer() {
  const { setActiveView } = useCoreMotiom();

  return (
    <footer className="bg-[#0B0D12] text-[#94A3B8] border-t border-[#1F2430] mt-16">
      {/* Value Proposition Bar */}
      <div className="border-b border-[#1F2430] bg-[#0E1017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Lojas Oficiais Verificadas</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Selo ✓ Verificado concedido após validação cadastral e de autenticidade.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Venda Segura C2C</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Custódia de pagamento e proteção ao comprador em vendas entre atletas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Rastreamento Nacional</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Integração logística com código de acompanhamento em tempo real.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Garantia CoreMotiom</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  7 dias para devolução e suporte especializado para atletas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                CM
              </div>
              <span className="text-lg font-bold tracking-tight text-white">CoreMotiom</span>
            </div>
            <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed">
              O ecossistema esportivo definitivo. Marketplace com curadoria técnica, lojas de performance com selo oficial, venda de equipamentos entre atletas e serviços com os melhores treinadores.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#D1D5DB] bg-[#12151C] px-3 py-1 rounded-md border border-[#232836]">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                Tecnologia Supabase Auth & RLS
              </span>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Marketplace</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Calçados de Performance</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Super Tênis com Placa</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">GPS & Wearables</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Ciclismo & Triatlo</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Equipamentos C2C</button></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Ecossistema</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView('stores')} className="hover:text-white transition-colors">Lojas Parceiras</button></li>
              <li><button onClick={() => setActiveView('sell')} className="hover:text-white transition-colors">Vender meu Equipamento</button></li>
              <li><button onClick={() => setActiveView('smartscan')} className="hover:text-white transition-colors">SmartScan AI</button></li>
              <li><button onClick={() => setActiveView('coaches')} className="hover:text-white transition-colors">Treinadores Certificados</button></li>
              <li><button onClick={() => setActiveView('community')} className="hover:text-white transition-colors">Comunidade Esportiva</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Segurança & Termos</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer">Diretrizes de Verificação</span></li>
              <li><span className="hover:text-white cursor-pointer">Política de Privacidade</span></li>
              <li><span className="hover:text-white cursor-pointer">Termos de Compra & Venda</span></li>
              <li><span className="hover:text-white cursor-pointer">Proteção ao Consumidor</span></li>
              <li><span className="hover:text-white cursor-pointer">Canal de Denúncias</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1F2430] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <p>© {new Date().getFullYear()} CoreMotiom Sports Inc. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span>CoreMotiom Minimalist</span>
            <span>•</span>
            <span className="text-red-400">Crimson Red</span>
            <span>•</span>
            <span>Versão 2.4 Production Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

