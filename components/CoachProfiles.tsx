'use client';
import { matchesSport } from '@/lib/modalities';
import { scopedQuickStorage } from '@/lib/quick-access';
import { coachContactUrl } from '@/lib/coach-contact';
import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, Clock, GraduationCap, MessageCircle } from 'lucide-react';
import { loadSportsPreview } from '@/fixtures/sports-preview';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useCoreMotiom } from '@/lib/store';
import type { SportsRecord } from '@/lib/sports';
import UserAvatar from './shared/UserAvatar';

const COACH_PROFILE_SOURCES = [{ table: 'sports_records' }] as const;

export default function CoachProfiles({ sport, search }: { sport: string; search: string }) {
  const { user, setActiveView } = useCoreMotiom();
  const [profiles, setProfiles] = useState<SportsRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const client = getSupabaseClient();
  const refresh = useCallback(async () => {
    try {
      if (client) {
        const { data, error } = await client.from('sports_records').select('*').eq('kind', 'coach');
        if (error) throw error;
        setProfiles(data || []);
      } else {
        setProfiles(loadSportsPreview(scopedQuickStorage(localStorage)).filter(record => record.kind === 'coach'));
      }
      setError('');
    } catch {
      setError('Perfis profissionais indisponíveis no momento.');
    } finally { setLoading(false); }
  }, [client]);
  useEffect(() => { setProfiles([]); setLoading(true); void refresh(); }, [refresh, user?.id]);
  useRealtimeRefresh(client, COACH_PROFILE_SOURCES, refresh, Boolean(client), 'coach-profiles-' + (user?.id || 'visitor'));
  const visible = profiles.filter(record => matchesSport(record.data.sport, sport) && Object.values(record.data).join(' ').toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-5 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-5 sm:p-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-red-400">Conheça quem vai orientar você</p><h2 className="mt-2 text-2xl font-black">Profissionais da comunidade</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">Compare modalidades, formação, metodologia e horários. Converse diretamente com o treinador sobre seus objetivos, valores e local das aulas.</p></div>
      {user?.account_type === 'coach' && <button type="button" onClick={() => setActiveView('sports-profile')} className="rounded-xl border border-zinc-600 px-4 py-2 text-xs font-bold hover:bg-zinc-800">Editar meu perfil profissional</button>}
    </div>
    {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
    {loading && <p role="status" className="text-sm text-zinc-400">Carregando profissionais…</p>}
    {!loading && !error && visible.length === 0 && <p className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">Nenhum perfil profissional nesta seleção. Experimente outra modalidade ou cidade.</p>}
    <div className="grid gap-5 md:grid-cols-2">{visible.map(record => {
      const contact = coachContactUrl(record.data.contact);
      return <article key={record.id} className="flex flex-col rounded-2xl border border-zinc-700/70 bg-zinc-950/80 p-5">
        <header className="flex items-center gap-3"><UserAvatar large src={record.data.avatar_url} name={record.data.name || 'Treinador'} /><div className="min-w-0"><h3 className="break-words text-xl font-bold">{record.data.name}</h3><span className="mt-1 inline-flex rounded-full bg-red-950/50 px-3 py-1 text-xs font-semibold text-red-300">{record.data.sport}</span><p className="mt-2 flex items-center gap-1 text-xs text-zinc-400"><MapPin className="h-3 w-3" />{record.data.city || 'Cidade não informada'}</p></div></header>
        <dl className="mt-5 flex-1 space-y-4 text-sm">
          <div><dt className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-500"><GraduationCap className="h-4 w-4" />Formação e experiência</dt><dd className="mt-2 whitespace-pre-wrap break-words text-zinc-300">{record.data.qualifications || 'Consulte a formação diretamente com o profissional.'}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-zinc-500">Sobre as aulas</dt><dd className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-zinc-300">{record.data.methodology || 'Converse com o treinador para conhecer a metodologia e o público atendido.'}</dd></div>
          <div><dt className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-500"><Clock className="h-4 w-4" />Locais e horários</dt><dd className="mt-2 whitespace-pre-wrap text-zinc-300">{record.data.availability || 'Disponibilidade a combinar.'}</dd></div>
        </dl>
        <footer className="mt-5 border-t border-zinc-800 pt-4"><p className="text-xs font-bold text-zinc-500">CONTATO PROFISSIONAL</p><p className="mt-2 break-words text-sm text-zinc-300">{record.data.contact || 'Contato não informado.'}</p>
          {contact && <a href={contact} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500"><MessageCircle className="h-4 w-4" />Conversar com o treinador</a>}
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">Informações fornecidas pelo profissional. Confira formação, valores e condições antes de contratar.</p>
        </footer>
      </article>;
    })}</div>
  </section>;
}
