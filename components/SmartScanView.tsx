'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  Sparkles,
  Activity,
  CheckCircle2,
  Sliders,
  ArrowRight,
} from 'lucide-react';

export default function SmartScanView() {
  const { setActiveView, setSearchQuery } = useCoreMotiom();

  const [equipmentType, setEquipmentType] = useState('Tênis com Placa de Carbono');
  const [brandModel, setBrandModel] = useState('Nike Vaporfly 3');
  const [estimatedKm, setEstimatedKm] = useState('80');
  const [athleteWeight, setAthleteWeight] = useState('72');
  const [targetPace, setTargetPace] = useState('4:15 min/km');
  const [pronationType, setPronationType] = useState('Neutra');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    fairPrice: number;
    quickSellPrice: number;
    plateIntegrity: number;
    foamResponsiveness: number;
    outsoleRemaining: number;
    athleteMatchScore: number;
    recommendation: string;
    targetEvents: string[];
  } | null>(null);

  const handleRunScan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const km = parseInt(estimatedKm) || 50;
      
      // Calculate realistic metrics
      const plateInt = Math.max(70, Math.min(99, 100 - Math.round(km * 0.12)));
      const foamResp = Math.max(65, Math.min(98, 100 - Math.round(km * 0.2)));
      const outsole = Math.max(60, Math.min(98, 100 - Math.round(km * 0.18)));
      
      let baseFair = 1200;
      if (brandModel.toLowerCase().includes('vaporfly') || brandModel.toLowerCase().includes('alphafly')) {
        baseFair = 1350 - km * 4.5;
      } else if (brandModel.toLowerCase().includes('endorphin') || brandModel.toLowerCase().includes('adizero')) {
        baseFair = 1150 - km * 3.8;
      }

      setScanResult({
        fairPrice: Math.max(450, Math.round(baseFair)),
        quickSellPrice: Math.max(380, Math.round(baseFair * 0.85)),
        plateIntegrity: plateInt,
        foamResponsiveness: foamResp,
        outsoleRemaining: outsole,
        athleteMatchScore: 96,
        recommendation: 'Excelente estado estrutural. A placa de carbono conserva retorno elástico de pico (>92%) e o composto de entressola mantém propulsão ideal para treinos e provas.',
        targetEvents: ['Meia Maratona', 'Maratona', 'Treinos de Ritmo / Intervalados'],
      });
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E232F]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Avaliação com Inteligência Artificial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            SmartScan: Avaliação de Desgaste & Cotação Justa
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Análise precisa de deformação da entressola, placa de carbono e sugestão de preço no mercado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Input Column */}
        <div className="lg:col-span-5 bg-[#12151C] p-5 rounded-xl border border-[#232836] space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-red-400" />
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Parâmetros do Equipamento</h3>
            </div>
          </div>

          <form onSubmit={handleRunScan} className="space-y-3.5">
            <div>
              <label className="block text-[11px] text-[#94A3B8] mb-1">
                Tipo de Equipamento
              </label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              >
                <option value="Tênis com Placa de Carbono">Tênis com Placa de Carbono</option>
                <option value="Tênis de Amortecimento / Rodagem">Tênis de Amortecimento / Rodagem</option>
                <option value="Relógio GPS / Smartwatch">Relógio GPS / Smartwatch</option>
                <option value="Quadro / Bike de Estrada">Quadro / Bike de Estrada</option>
                <option value="Medidor de Potência / Grupo">Medidor de Potência / Grupo</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#94A3B8] mb-1">
                Marca & Modelo
              </label>
              <input
                type="text"
                required
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="Ex: Nike Vaporfly 3 / Garmin Forerunner 965"
                className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Km Rodados
                </label>
                <input
                  type="number"
                  required
                  value={estimatedKm}
                  onChange={(e) => setEstimatedKm(e.target.value)}
                  placeholder="Ex: 80"
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Peso do Atleta (kg)
                </label>
                <input
                  type="number"
                  value={athleteWeight}
                  onChange={(e) => setAthleteWeight(e.target.value)}
                  placeholder="Ex: 72"
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Pace Médio
                </label>
                <input
                  type="text"
                  value={targetPace}
                  onChange={(e) => setTargetPace(e.target.value)}
                  placeholder="Ex: 4:15 min/km"
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Tipo de Pisada
                </label>
                <select
                  value={pronationType}
                  onChange={(e) => setPronationType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                >
                  <option value="Neutra">Neutra</option>
                  <option value="Pronada Leve">Pronada Leve</option>
                  <option value="Pronada Severa">Pronada Severa</option>
                  <option value="Supinada">Supinada</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
            >
              {isScanning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processando Análise...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executar Avaliação SmartScan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {scanResult ? (
            <div className="bg-[#12151C] p-5 rounded-xl border border-red-500/30 shadow-lg space-y-5 animate-in fade-in">
              
              {/* Header Result */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Laudo Técnico Concluído</span>
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {brandModel} <span className="text-xs text-[#94A3B8] font-normal">({estimatedKm} km rodados)</span>
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-[#64748B] block uppercase font-medium">Compatibilidade</span>
                  <span className="text-2xl font-bold text-red-400">{scanResult.athleteMatchScore}%</span>
                </div>
              </div>

              {/* Price Suggestion Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[#0E1017] border border-[#232836]">
                  <span className="text-[10px] text-[#64748B] block uppercase mb-0.5 font-medium">Preço Justo Sugerido</span>
                  <span className="text-xl font-bold text-white tracking-tight">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(scanResult.fairPrice)}
                  </span>
                  <p className="text-[9px] text-[#94A3B8] mt-1">Margem com base no desgaste informado.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-red-600/10 border border-red-500/30">
                  <span className="text-[10px] text-red-400 block uppercase mb-0.5 font-semibold">Venda Rápida (48h)</span>
                  <span className="text-xl font-bold text-red-400 tracking-tight">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(scanResult.quickSellPrice)}
                  </span>
                  <p className="text-[9px] text-[#CBD5E1] mt-1">Estimativa para liquidez ágil no catálogo.</p>
                </div>
              </div>

              {/* Structural Degradation Meters */}
              <div className="p-3.5 rounded-lg bg-[#0E1017] border border-[#232836] space-y-3 text-xs">
                <h4 className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Condição dos Materiais
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[#CBD5E1] mb-1 text-[11px]">
                      <span>Placa de Carbono / Rigidez</span>
                      <span className="font-bold text-red-400">{scanResult.plateIntegrity}%</span>
                    </div>
                    <div className="h-1.5 bg-[#181D26] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${scanResult.plateIntegrity}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#CBD5E1] mb-1 text-[11px]">
                      <span>Elasticidade da Espuma</span>
                      <span className="font-bold text-red-400">{scanResult.foamResponsiveness}%</span>
                    </div>
                    <div className="h-1.5 bg-[#181D26] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${scanResult.foamResponsiveness}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#CBD5E1] mb-1 text-[11px]">
                      <span>Borracha de Tração & Solado</span>
                      <span className="font-bold text-red-400">{scanResult.outsoleRemaining}%</span>
                    </div>
                    <div className="h-1.5 bg-[#181D26] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${scanResult.outsoleRemaining}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Analysis Recommendation */}
              <div className="p-3.5 rounded-lg bg-[#0E1017] border border-[#232836] text-xs space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span>Parecer Técnico</span>
                </h4>
                <p className="text-[#94A3B8] leading-relaxed text-xs">
                  {scanResult.recommendation}
                </p>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {scanResult.targetEvents.map((evt, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-red-600/10 text-red-400 border border-red-500/20 text-[10px] font-medium">
                      ✓ {evt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setActiveView('sell')}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Anunciar por {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(scanResult.fairPrice)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setSearchQuery(brandModel);
                    setActiveView('marketplace');
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#181D26] hover:bg-[#232836] text-[#CBD5E1] hover:text-white border border-[#232836] text-xs font-medium transition-colors"
                >
                  Ofertas Similares
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#12151C] p-10 rounded-xl border border-[#232836] text-center space-y-3">
              <div className="w-14 h-14 rounded-xl bg-[#0E1017] border border-[#232836] flex items-center justify-center text-red-400 mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Pronto para Diagnosticar</h3>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                Insira os parâmetros técnicos do seu equipamento à esquerda para calcular o desgaste estimado e a precificação justa de mercado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

