'use client';
import { matchesSport } from '@/lib/modalities';
import { scopedQuickStorage } from '@/lib/quick-access';
import { useEffect, useState } from 'react';
import { loadSportsPreview } from '@/fixtures/sports-preview';
import { getSupabaseClient } from '@/services/supabaseClient';
import type { SportsRecord } from '@/lib/sports';
export default function CoachProfiles({ sport, search }: { sport: string; search: string }) {
  const [profiles, setProfiles] = useState<SportsRecord[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();
    if (client) {
      client.from('sports_records').select('*').eq('kind', 'coach').then(({ data, error }) => {
        if (active) { setProfiles(data || []); if (error) setError('Perfis profissionais indisponíveis no momento.'); }
      });
    } else {
      try { setProfiles(loadSportsPreview(scopedQuickStorage(localStorage)).filter((r: SportsRecord) => r.kind === 'coach')); } catch { setError('Não foi possível ler os perfis locais.'); }
    }
    return () => { active = false; };
  }, []);
  const visible = profiles.filter(r => matchesSport(r.data.sport, sport) && Object.values(r.data).join(' ').toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-4"><h2 className="text-xl font-bold">Profissionais da comunidade</h2><p className="text-sm text-zinc-400">Treinamento competitivo, pilates, ginástica, yoga e atividades para manter sua rotina. Confira formação, locais e horários diretamente com o profissional.</p>{error && <p role="alert" className="text-red-300 text-sm">{error}</p>}<div className="grid md:grid-cols-2 gap-4">{visible.map(r => <article className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-2" key={r.id}><h3 className="font-bold text-xl">{r.data.name}</h3><p className="text-red-400">{r.data.sport} • {r.data.city}</p><p className="text-sm text-zinc-400">{r.data.qualifications}</p><p className="text-sm">{r.data.methodology}</p><p className="text-sm">{r.data.availability}</p><p className="text-sm">Contato: {r.data.contact}</p><span className="text-xs text-zinc-500">Informações fornecidas pelo profissional.</span></article>)}</div></section>;
}
