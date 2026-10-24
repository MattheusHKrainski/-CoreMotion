'use client';

import React, { useMemo, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Coach } from '@/lib/types';
import { INITIAL_COACHES } from '@/fixtures/initial-data';
import {
  Users,
  ShieldCheck,
  Star,
  Award,
  Filter,
  CheckCircle2,
  X,
  ArrowRight,
  Search,
  MapPin,
  Clock,
  Calendar,
} from 'lucide-react';

const SPORTS_FILTERS = [
  'Jiu-Jitsu',
  'Basquete',
  'Karatê',
  'Vôlei',
  'Tênis',
  'Futebol',
  'Musculação',
  'Corrida',
  'Natação',
];

export default function CoachesView() {
  const { coaches, isVisitor, setAuthModalOpen, addToast } = useCoreMotiom();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bookingCoach, setBookingCoach] = useState<Coach | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'consultation' | 'season'>('monthly');

  const activeCoaches = coaches.length > 0 ? coaches : INITIAL_COACHES;

  const filteredCoaches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return activeCoaches.filter((coach) => {
      if (selectedSport !== 'all' && !coach.sports.some((s) => s.toLowerCase() === selectedSport.toLowerCase())) {
        return false;
      }
      if (!query) return true;
      const haystack = `${coach.name} ${coach.title} ${coach.specialty} ${coach.location} ${coach.sports.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [activeCoaches, selectedSport, searchTerm]);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    addToast('Agendamento Realizado', `Sua solicitação foi enviada para ${bookingCoach?.name}.`, 'success');
    setTimeout(() => {
      setBookingCoach(null);
      setBookingConfirmed(false);
    }, 2500);
  };

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-800/90 bg-gradient-to-br from-zinc-950 via-[#11131a] to-zinc-950 p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Aulas Particulares, Turmas & Consultoria</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Treinadores e Mestres Especializados
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
              Evolua com acompanhamento individual de professores, senseis e preparadores certificados em Jiu-Jitsu, Basquete, Karatê, Vôlei, Tênis, Futebol, Musculação, Corrida e Natação.
            </p>
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar treinador, esporte ou cidade..."
              className="w-full pl-9 pr-8 py-2.5 bg-zinc-900 text-xs text-white placeholder-zinc-500 rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80 text-xs">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-4 py-3">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">{activeCoaches.length} Profissionais Ativos</span>
              <span className="text-[11px] text-zinc-400">CREF e federações verificadas</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-4 py-3">
            <Calendar className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Presencial ou Online</span>
              <span className="text-[11px] text-zinc-400">Aulas avulsas, mensais ou por temporada</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-4 py-3">
            <Star className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Avaliação Média 4,97 / 5</span>
              <span className="text-[11px] text-zinc-400">Avaliados por alunos reais da plataforma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-zinc-900/70 p-2 rounded-2xl border border-zinc-800/80 backdrop-blur-md overflow-x-auto scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setSelectedSport('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedSport === 'all'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Todas ({activeCoaches.length})</span>
        </button>

        {SPORTS_FILTERS.map((sport) => (
          <button
            key={sport}
            type="button"
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

      {/* Coaches Grid */}
      {filteredCoaches.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-10 text-center space-y-3">
          <p className="text-sm font-bold text-white">Nenhum treinador encontrado para esse filtro.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedSport('all');
              setSearchTerm('');
            }}
            className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
          >
            Mostrar todos os treinadores
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 hover:border-red-500/40 p-5 flex flex-col justify-between space-y-4 shadow-xl shadow-black/40 hover:shadow-red-950/20 transition-all duration-300 group"
            >
              <div className="space-y-3.5">
                {/* Profile Header */}
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-950 border-2 border-red-500/80 overflow-hidden shrink-0 shadow-lg">
                    <img
                      src={coach.avatar_url}
                      alt={coach.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 group-hover:text-red-400 transition-colors">
                      <span className="truncate">{coach.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    </h3>
                    <span className="text-xs text-red-400 block font-semibold line-clamp-1">{coach.title}</span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{coach.location}</span>
                    </span>
                  </div>
                </div>

                {/* Rating & Specialty */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{coach.rating.toFixed(2)}</span>
                    <span className="text-zinc-500 font-normal text-[11px]">({coach.reviews_count})</span>
                  </div>
                  <div className="text-red-400 font-bold text-[11px] flex items-center gap-1 truncate">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{coach.specialty}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {coach.bio}
                </p>

                {/* Availability */}
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{coach.availability}</span>
                </div>

                {/* Sports Pills */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {coach.sports.map((sport, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700"
                    >
                      {sport}
                    </span>
                  ))}
                  {coach.cref_number && (
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 text-zinc-400 text-[10px] font-medium border border-zinc-800">
                      {coach.cref_number}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Booking Button */}
              <div className="pt-3.5 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Aula / Sessão</span>
                  <span className="text-base font-extrabold text-white">
                    {formatPrice(coach.hourly_rate)}
                    <span className="text-[11px] font-normal text-zinc-500"> /hora</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isVisitor) setAuthModalOpen(true);
                    else setBookingCoach(coach);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-red-950/50 hover:scale-105 active:scale-95"
                >
                  <span>Agendar Aula</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                type="button"
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
                <h4 className="text-base font-bold text-white">Solicitação de Aula Enviada!</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  {bookingCoach.name} recebeu suas preferências e entrará em contato pelo WhatsApp informado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase">
                    Escolha o Formato
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
                      <span className="font-bold block text-xs">Aula Avulsa</span>
                      <span className="text-[10px] text-red-400 font-semibold">{formatPrice(bookingCoach.hourly_rate)}/aula</span>
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
                      <span className="font-bold block text-xs">Trimestral</span>
                      <span className="text-[10px] text-red-400 font-semibold">{formatPrice(bookingCoach.hourly_rate * 6)}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                    Seu Objetivo Principal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Começar no Jiu-Jitsu, melhorar arremesso no Basquete, saque no Tênis..."
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
                    <span>Confirmar Solicitação de Aula</span>
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
