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
  Sparkles,
} from 'lucide-react';

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

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    addToast('Agendamento Realizado', `Sua solicitação foi enviada para o treinador ${bookingCoach?.name}.`, 'success');
    setTimeout(() => {
      setBookingCoach(null);
      setBookingConfirmed(false);
    }, 2500);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Assessoria Esportiva & Performance</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Treinadores Especializados
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Profissionais credenciados com registro ativo no CREF para periodização de treinos, preparação para maratonas e triatlos.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span className="font-semibold">Registro CREF Validado</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs in Capsule Dock Style */}
      <div className="flex items-center gap-2 bg-zinc-900/70 p-2 rounded-2xl border border-zinc-800/80 backdrop-blur-md overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setSelectedSport('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedSport === 'all'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Todas as modalidades</span>
        </button>

        {sportsList.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSport === sport
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Coaches Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 hover:border-red-500/40 p-5 flex flex-col justify-between space-y-4 shadow-xl shadow-black/40 hover:shadow-red-950/20 transition-all duration-300 group"
          >
            <div className="space-y-3.5">
              {/* Profile Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border-2 border-red-500 overflow-hidden shrink-0 shadow-lg">
                  <img src={coach.avatar_url} alt={coach.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 group-hover:text-red-400 transition-colors">
                    {coach.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  </h3>
                  <span className="text-xs text-red-400 block font-semibold">{coach.title}</span>
                  <span className="text-[11px] text-zinc-500 block">
                    {coach.cref_number} • {coach.location}
                  </span>
                </div>
              </div>

              {/* Rating and active badge */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{coach.rating}</span>
                  <span className="text-zinc-500 font-normal text-[11px]">({coach.reviews_count})</span>
                </div>
                <div className="text-red-400 font-bold text-[11px] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{coach.specialty}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                {coach.bio}
              </p>

              {/* Sports Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {coach.sports.map((sport, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            </div>

            {/* Price & Booking Button */}
            <div className="pt-3.5 border-t border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Sessão Avulsa</span>
                <span className="text-base font-extrabold text-white">
                  {formatPrice(coach.hourly_rate)}
                  <span className="text-[11px] font-normal text-zinc-500"> /hora</span>
                </span>
              </div>

              <button
                onClick={() => {
                  if (isVisitor) setAuthModalOpen(true);
                  else setBookingCoach(coach);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-red-950/50 hover:scale-105 active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={bookingCoach.avatar_url}
                  alt={bookingCoach.name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-red-500"
                />
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {bookingCoach.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  </h3>
                  <span className="text-xs text-red-400 font-semibold">{bookingCoach.cref_number}</span>
                </div>
              </div>
              <button
                onClick={() => setBookingCoach(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
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
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  O treinador {bookingCoach.name} recebeu suas informações de anamnese e entrará em contato via WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase">
                    Modalidade de Plano
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('monthly')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedPlan === 'monthly'
                          ? 'bg-red-600/10 border-red-500 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="font-bold block text-xs">Mensal</span>
                      <span className="text-[10px] text-red-400 font-semibold">{formatPrice(bookingCoach.hourly_rate * 2.5)}/mês</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan('consultation')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedPlan === 'consultation'
                          ? 'bg-red-600/10 border-red-500 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="font-bold block text-xs">Avulsa</span>
                      <span className="text-[10px] text-red-400 font-semibold">{formatPrice(bookingCoach.hourly_rate)}/sessão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan('season')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedPlan === 'season'
                          ? 'bg-red-600/10 border-red-500 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="font-bold block text-xs">Semestral</span>
                      <span className="text-[10px] text-red-400 font-semibold">{formatPrice(bookingCoach.hourly_rate * 6)} (6m)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                    Objetivo Principal (Prova / Meta)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sub-3h na Maratona de Berlim ou Primeiro 70.3"
                    className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                    WhatsApp para Contato Direto
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-full shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
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
