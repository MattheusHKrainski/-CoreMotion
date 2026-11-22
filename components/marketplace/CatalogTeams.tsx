'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ShieldCheck, Trophy } from 'lucide-react';
import type { ExternalOffer } from '@/lib/types';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';

export interface CatalogTeam {
  id: string;
  club_name: string;
  league: string;
  country: string;
  season: string;
  sport: string;
  source_url: string;
}
const LEAGUES = [
  {id:'brasileirao-2026', label:'Brasileirão Série A', season:'2026', expected:20},
  {id:'superlega-italia-2026-27',label:'SuperLega Italiana',season:'2026/27',expected:12},
  {id:'svleague-japao-2026-27',label:'SV.League Japão',season:'2026/27',expected:12},
] as const;
const SOURCES = [{ table:'catalog_teams' }] as const;

export default function CatalogTeams({ offers, selected, onSelect }: {
  offers: ExternalOffer[];
  selected: CatalogTeam | null;
  onSelect: (team: CatalogTeam | null) => void;
}) {
  const client = getSupabaseClient();
  const [teams, setTeams] = useState<CatalogTeam[]>([]);
  const [league, setLeague] = useState<string>('brasileirao-2026');
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    if (!client) return;
    const { data, error } = await client.from('catalog_teams').select('id,club_name,league,country,season,sport,source_url').order('club_name');
    if (error) { setError('Clubes temporariamente indisponíveis.'); return; }
    setTeams(data || []);
    setError('');
  }, [client]);
  useEffect(() => { void refresh(); }, [refresh]);
  useRealtimeRefresh(client, SOURCES, refresh, Boolean(client), 'catalog-teams');
  const displayed = useMemo(() => teams.filter(t=>t.league===league), [teams,league]);
  const counts = useMemo(() => {
    const map=new Map<string,number>();
    for(const offer of offers){
      if(offer.is_active===false || !offer.team_id)continue;
      map.set(offer.team_id,(map.get(offer.team_id)||0)+1);
    }
    return map;
  },[offers]);
  return <section aria-label="Clubes esportivos" className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-red-600/15 p-2 text-red-400"><Trophy className="h-5 w-5"/></span><div><h2 className="text-sm font-black text-white">Explore por clube</h2><p className="mt-0.5 text-[11px] text-zinc-400">Campeonatos brasileiro, italiano e japonês</p></div></div>
      <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-200 hover:border-red-500">Ver clubes ({teams.length})<ChevronDown className={'h-4 w-4 transition-transform '+(expanded?'rotate-180':'')}/></button>
    </div>
    {selected && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 bg-red-950/20 px-5 py-3"><p className="text-xs font-semibold text-red-200">Clube selecionado: {selected.club_name}</p><button type="button" onClick={()=>onSelect(null)} className="text-xs font-bold text-red-400 underline">Limpar seleção</button></div>}
    {expanded && <div className="space-y-4 border-t border-zinc-800 px-4 py-5 sm:px-5">
      <div role="group" aria-label="Campeonato" className="flex flex-wrap gap-2">{LEAGUES.map(item=><button key={item.id} type="button" aria-pressed={league===item.id} onClick={()=>setLeague(item.id)} className={'rounded-full px-4 py-2 text-xs font-semibold '+(league===item.id?'bg-red-600 text-white':'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-white')}>{item.label} · {item.season}</button>)}</div>
      {error && <p role="alert" className="text-xs text-amber-400">{error}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{displayed.map(team=><button type="button" key={team.id} aria-pressed={selected?.id===team.id} onClick={()=>onSelect(selected?.id===team.id?null:team)} className={'group min-h-16 rounded-xl border p-3 text-left transition '+(selected?.id===team.id?'border-red-500 bg-red-950/50':'border-zinc-800 bg-zinc-950 hover:border-zinc-600')}>
        <span className="block text-xs font-semibold text-white">{team.club_name}</span>
        <span className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500">{(counts.get(team.id)||0)>0?<><ShieldCheck className="h-3 w-3 text-emerald-500"/>{counts.get(team.id)} produtos cadastrados</>:'Ver catálogo do clube'}</span>
      </button>)}</div>
      <p className="text-[11px] leading-relaxed text-zinc-500">A relação de clubes é completa. Só aparecem produtos que correspondem a anúncios identificados e conferidos de cada equipe.</p>
    </div>}
  </section>;
}
