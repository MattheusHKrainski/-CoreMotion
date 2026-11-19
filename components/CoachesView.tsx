'use client';

import SportPicker from '@/components/shared/SportPicker';
import { matchesSport } from '@/lib/modalities';
import React, { useMemo, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import CoachProfiles from './CoachProfiles';
import CoachActivities from './CoachActivities';
import { Coach } from '@/lib/types';
import {
  Users,
  ShieldCheck,
  Star,
  X,
  ArrowRight,
  Search,
  MapPin,
} from 'lucide-react';

export default function CoachesView() {
  const { coaches, isVisitor, setAuthModalOpen } = useCoreMotiom();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const activeCoaches = coaches;
  const [bookingCoach, setBookingCoach] = useState<Coach | null>(null);


  const sportsList = [...new Set(coaches.flatMap(coach => coach.sports))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const filteredCoaches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return activeCoaches.filter((coach) => {
      if (!coach.sports.some((s) => matchesSport(s, selectedSport))) {
        return false;
      }
      if (!query) return true;
      const haystack = `${coach.name} ${coach.title} ${coach.specialty} ${coach.location} ${coach.sports.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    }).sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : a.name.localeCompare(b.name, 'pt-BR'));
  }, [activeCoaches, selectedSport, searchTerm, sortBy]);

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
              <span>Prática leve, aulas e convivência</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Treinadores e associações esportivas
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
              Encontre professores, grupos e associações para praticar esporte com tranquilidade, fazer amizades e cuidar do bem-estar. Explore caminhada, pilates, yoga, ginástica e atividades adaptadas ao seu ritmo.
            </p>
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar treinador por nome, cidade ou especialidade"
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

        <div className="flex items-center gap-2 text-xs">
          <div className="px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span className="font-semibold">{coaches.length} opções de acompanhamento</span>
          </div>
        </div>
      </div>

      <section aria-label="Filtros de treinadores" className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3"><SportPicker value={selectedSport} onChange={setSelectedSport} options={sportsList} /><label className="block text-xs text-zinc-400 space-y-2">Ordenar catálogo<select value={sortBy} onChange={e => setSortBy(e.target.value)} className="block rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white"><option value="name">Nome: A–Z</option><option value="rating">Melhores avaliações</option></select></label><div className="flex flex-wrap justify-between gap-3 text-sm text-zinc-400"><span>{filteredCoaches.length} treinadores no catálogo • perfis da comunidade abaixo</span><button type="button" onClick={() => { setSelectedSport('all'); setSearchTerm(''); setSortBy('name'); }} className="text-red-400">Limpar filtros</button></div></section>

      <CoachProfiles sport={selectedSport} search={searchTerm} />
      <CoachActivities sport={selectedSport} search={searchTerm} />

      <header className="border-t border-zinc-800 pt-6 space-y-2"><h2 className="text-xl font-bold">Catálogo de treinadores</h2><p className="text-sm text-zinc-400">Compare modalidades, localização, formação e planos antes de escolher um profissional.</p></header>
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
                      {coach.is_certified && <ShieldCheck className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    </h3>
                    <span className="text-xs text-red-400 block font-semibold line-clamp-1">{coach.title}</span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{coach.location}</span>
                    </span>
                  </div>
                </div>
              {/* Rating and active badge */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{coach.reviews_count > 0 ? coach.rating : 'Sem avaliações'}</span>
                  <span className="text-zinc-500 font-normal text-[11px]">({coach.reviews_count})</span>
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

                <p className="text-xs text-zinc-400 leading-relaxed ">{coach.bio}</p>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-400"><p className="mb-1 font-bold text-zinc-300">Horários de atendimento</p>{coach.availability}</div>
                <p className="text-xs text-zinc-500">Especialidade: {coach.specialty}</p>
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
                  <span>Ver informações</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookingCoach && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setBookingCoach(null)}>
        <section role="dialog" aria-modal="true" aria-label={`Informações de ${bookingCoach.name}`} className="relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl border border-zinc-700 bg-zinc-950 p-6" onClick={event => event.stopPropagation()}>
          <button type="button" aria-label="Fechar informações" onClick={() => setBookingCoach(null)} className="absolute right-4 top-4 rounded-full p-2 hover:bg-zinc-800"><X className="h-5 w-5" /></button>
          <h2 className="pr-8 text-2xl font-black">{bookingCoach.name}</h2><p className="text-red-400">{bookingCoach.title}</p>
          <p className="text-sm leading-relaxed text-zinc-300">{bookingCoach.bio}</p>
          <dl className="space-y-3 text-sm"><div><dt className="font-bold">Modalidades</dt><dd className="text-zinc-400">{bookingCoach.sports.join(', ')}</dd></div><div><dt className="font-bold">Localização</dt><dd className="text-zinc-400">{bookingCoach.location}</dd></div><div><dt className="font-bold">Disponibilidade</dt><dd className="text-zinc-400">{bookingCoach.availability}</dd></div>{bookingCoach.cref_number && <div><dt className="font-bold">Registro informado</dt><dd className="text-zinc-400">{bookingCoach.cref_number}</dd></div>}</dl>
          <p className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">Este perfil do catálogo ainda não possui contato publicado. Para conversar e combinar uma aula, escolha um profissional com contato informado na seção Profissionais da comunidade.</p>
        </section>
      </div>}
    </div>
  );
}
