// ============================================================================
// CORE MOTIOM — TREINADORES (Assessorias esportivas)
// Filtro por modalidade, cards com registro CREF e modal de agendamento
// com planos (mensal, avulso e semestral).
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Coach } from '@/lib/types';
import {
  Users,
  ShieldCheck,
  Star,
  Award,
  Filter,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';

/* ===========================================================
   VISTA DE TREINADORES
=========================================================== */

export default function CoachesView() {
  const { coaches, isVisitor, setAuthModalOpen, addToast } = useCoreMotiom();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [bookingCoach, setBookingCoach] = useState<Coach | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'consultation' | 'season'>('monthly');

  const sportsList = [
    'Corrida',
    'Maratona',
    'Triatlo',
    'Ciclismo',
    'Trail Running',
  ];

  const filteredCoaches = coaches.filter((c) => {
    if (selectedSport !== 'all' && !c.sports.includes(selectedSport)) {
      return false;
    }
    return true;
  });

  /* ===========================================================
     CONFIRMAR AGENDAMENTO
  =========================================================== */

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    addToast('Agendamento Realizado', `Sua solicitação foi enviada para o treinador ${bookingCoach?.name}.`, 'success');
    setTimeout(() => {
      setBookingCoach(null);
      setBookingConfirmed(false);
    }, 2500);
  };

  /* ===========================================================
     FORMATAR PREÇO EM REAIS
  =========================================================== */

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E232F]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Assessoria Esportiva & Performance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Treinadores Especializados
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Profissionais certificados com registro no CREF para periodização de treinos, maratona e triatlo.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-2 rounded-lg bg-[#12151C] border border-[#232836] text-[#94A3B8] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Registro CREF Validado</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedSport('all')}
          className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedSport === 'all'
              ? 'bg-red-600 text-white font-medium shadow-sm'
              : 'bg-[#12151C] text-[#94A3B8] hover:text-white border border-[#232836]'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Todas as modalidades</span>
        </button>

        {sportsList.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
              selectedSport === sport
                ? 'bg-red-600 text-white font-medium shadow-sm'
                : 'bg-[#12151C] text-[#94A3B8] hover:text-white border border-[#232836]'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-[#12151C] rounded-xl border border-[#232836] hover:border-red-500/40 p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all group"
          >
            <div className="space-y-3.5">
              {/* Profile Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[#0E1017] border-2 border-red-500 overflow-hidden shrink-0 shadow-md">
                  <img src={coach.avatar_url} alt={coach.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5 group-hover:text-red-400 transition-colors">
                    {coach.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  </h3>
                  <span className="text-xs text-red-400 block font-medium">{coach.title}</span>
                  <span className="text-[11px] text-[#64748B] block">
                    {coach.cref_number} • {coach.location}
                  </span>
                </div>
              </div>

              {/* Rating and active badge */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1017] border border-[#232836] text-xs">
                <div className="flex items-center gap-1 text-[#FBBF24] font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{coach.rating}</span>
                  <span className="text-[#64748B] font-normal text-[11px]">({coach.reviews_count})</span>
                </div>
                <div className="text-red-400 font-medium text-[11px] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{coach.specialty}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
                {coach.bio}
              </p>

              {/* Sports Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {coach.sports.map((sport, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-[#0E1017] text-[#94A3B8] text-[10px] border border-[#232836]"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            </div>

            {/* Price & Booking Button */}
            <div className="pt-3.5 border-t border-[#1E232F] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#64748B] block uppercase">Sessão Avulsa</span>
                <span className="text-sm font-bold text-white">
                  {formatPrice(coach.hourly_rate)}
                  <span className="text-[11px] font-normal text-[#64748B]"> /hora</span>
                </span>
              </div>

              <button
                onClick={() => {
                  if (isVisitor) setAuthModalOpen(true);
                  else setBookingCoach(coach);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>Contratar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#12151C] text-white rounded-xl border border-[#232836] shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-[#1E232F] bg-[#0E1017] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={bookingCoach.avatar_url}
                  alt={bookingCoach.name}
                  className="w-11 h-11 rounded-lg object-cover border border-red-500"
                />
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {bookingCoach.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  </h3>
                  <span className="text-xs text-red-400">{bookingCoach.cref_number}</span>
                </div>
              </div>
              <button
                onClick={() => setBookingCoach(null)}
                className="p-1 text-[#94A3B8] hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {bookingConfirmed ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">Solicitação de Treino Confirmada</h4>
                <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
                  O treinador {bookingCoach.name} recebeu suas informações de anamnese e entrará em contato via WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-2 uppercase">
                    Modalidade de Plano
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('monthly')}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        selectedPlan === 'monthly'
                          ? 'bg-red-600/10 border-red-500 text-white shadow-sm'
                          : 'bg-[#0E1017] border-[#232836] text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-semibold block text-xs">Mensal</span>
                      <span className="text-[10px] text-red-400">{formatPrice(bookingCoach.hourly_rate * 2.5)}/mês</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan('consultation')}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        selectedPlan === 'consultation'
                          ? 'bg-red-600/10 border-red-500 text-white shadow-sm'
                          : 'bg-[#0E1017] border-[#232836] text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-semibold block text-xs">Avulsa</span>
                      <span className="text-[10px] text-red-400">{formatPrice(bookingCoach.hourly_rate)}/sessão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan('season')}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        selectedPlan === 'season'
                          ? 'bg-red-600/10 border-red-500 text-white shadow-sm'
                          : 'bg-[#0E1017] border-[#232836] text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-semibold block text-xs">Semestral</span>
                      <span className="text-[10px] text-red-400">{formatPrice(bookingCoach.hourly_rate * 6)} (6m)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">
                    Objetivo Principal (Prova / Meta)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sub-3h na Maratona de Berlim ou Primeiro 70.3"
                    className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">
                    WhatsApp para Contato Direto
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Enviar Solicitação ao Treinador</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

