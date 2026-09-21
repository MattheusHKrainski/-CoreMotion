'use client';

import React from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  const { setActiveView } = useCoreMotiom();

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800/80 mt-20">
      {/* Value Proposition Bar in Capsule Bento Layout */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Lojas Oficiais Verificadas</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Selo oficial concedido mediante validação jurídica, nota fiscal e procedência.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Custódia Segura C2C</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Pagamento retido com segurança até o atleta inspecionar e aprovar o equipamento.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Logística com Rastreio</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Envios com seguro e acompanhamento ponto a ponto em todo o território nacional.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Garantia CoreMotiom</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Proteção integral contra divergências com suporte direto de atletas para atletas.
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
              <span className="text-lg font-black tracking-tight text-white">CoreMotiom</span>
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Ecossistema esportivo de alta performance. Marketplace curado, lojas oficiais com nota fiscal, intermediação com custódia segura entre atletas e assessoria de treinadores de elite.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 bg-zinc-900/90 px-3 py-1 rounded-full border border-zinc-800">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                Segurança Supabase Auth & PostgreSQL
              </span>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Marketplace</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Super Tênis com Placa</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Relógios GPS & Wearables</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Ciclismo & Rodas de Carbono</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Triatlo & Wetsuits</button></li>
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white transition-colors">Anúncios de Atletas C2C</button></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Plataforma</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView('stores')} className="hover:text-white transition-colors">Lojas Verificadas</button></li>
              <li><button onClick={() => setActiveView('sell')} className="hover:text-white transition-colors">Anunciar Equipamento C2C</button></li>
              <li><button onClick={() => setActiveView('coaches')} className="hover:text-white transition-colors">Treinadores Certificados</button></li>
              <li><button onClick={() => setActiveView('community')} className="hover:text-white transition-colors">Comunidade de Atletas</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Segurança & Legal</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Protocolo de Custódia Segura</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Diretrizes de Verificação de Lojas</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Termos de Uso e Intermediação</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Política de Privacidade</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Canal de Atendimento ao Atleta</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} CoreMotiom Sports Technologies. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            <span>Dark High-Performance Mode</span>
            <span>•</span>
            <span className="text-red-500 font-semibold">Crimson Pro Engine</span>
            <span>•</span>
            <span>PostgreSQL & Supabase Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
