'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Trophy } from 'lucide-react';
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
  merchandise_url: string | null;
  merchandise_source: 'official' | 'manufacturer' | 'retailer' | null;
}
const LEAGUES = [
  {id:'brasileirao-2026', label:'Brasileirão Série A · 2026'},
  {id:'superlega-italia-2026-27',label:'SuperLega italiana · 2026/27'},
  {id:'svleague-japao-2026-27',label:'SV.League japonesa · 2026/27'},
] as const;
const SOURCES = [{ table:'catalog_teams' }] as const;

export default function CatalogTeams({offers,selected,onSelect}: {
  offers: ExternalOffer[];
  selected: CatalogTeam | null;
  onSelect: (team: CatalogTeam | null) => void;
}) {
  const client = getSupabaseClient();
  const [teams,setTeams] = useState<CatalogTeam[]>([]);
  const [league,setLeague] = useState<string>('brasileirao-2026');
  const [error,setError] = useState('');
  const refresh = useCallback(async () => {
    if (!client) return;
    const {data,error} = await client.from('catalog_teams')
      .select('id,club_name,league,country,season,sport,source_url,merchandise_url,merchandise_source')
      .order('club_name');
    if (error) {setError('Os clubes não puderam ser carregados.');return;}
    setTeams((data || []) as CatalogTeam[]);setError('');
  },[client]);
  useEffect(()=>{void refresh()},[refresh]);
  useRealtimeRefresh(client,SOURCES,refresh,Boolean(client),'catalog-teams');
  const available = useMemo(()=>teams.filter(team=>team.league===league),[teams,league]);
  const counts = useMemo(()=>{
    const result = new Map<string,number>();
    for(const offer of offers) if(offer.team_id&&offer.is_active!==false)
      result.set(offer.team_id,(result.get(offer.team_id)||0)+1);
    return result;
  },[offers]);
  return <div className="space-y-3 border-t border-zinc-800 pt-4" aria-label="Filtros de clubes">
    <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400"><Trophy className="h-3.5 w-3.5 text-red-400"/>Campeonato e clube</h3>
    <label className="block text-[11px] text-zinc-500">Campeonato
      <select aria-label="Campeonato" value={league} onChange={event=>{
        const next=event.target.value;setLeague(next);
        if(selected && selected.league!==next)onSelect(null);
      }} className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-200 focus:border-red-500 focus:outline-none">
        {LEAGUES.map(l=><option value={l.id} key={l.id}>{l.label}</option>)}
      </select>
    </label>
    <label className="block text-[11px] text-zinc-500">Equipe
      <select aria-label="Filtrar por clube" value={selected?.id||''}
        onChange={event=>onSelect(teams.find(team=>team.id===event.target.value)||null)}
        className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-200 focus:border-red-500 focus:outline-none">
        <option value="">Todos os clubes</option>
        {available.map(team=><option key={team.id} value={team.id}>{team.club_name} {counts.get(team.id)?'· '+counts.get(team.id)+' ofertas':''}</option>)}
      </select>
    </label>
    {error&&<p role="alert" className="text-xs text-amber-400">{error}</p>}
    {selected && <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
      <p className="text-xs font-semibold text-white">{selected.club_name}</p>
      <p className="text-[11px] text-zinc-400">{counts.get(selected.id)||0} ofertas na CoreMotion</p>
      {selected.merchandise_url && <a href={selected.merchandise_url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300">
        {selected.merchandise_source==='retailer'?'Ver produtos na loja parceira':selected.merchandise_source==='manufacturer'?'Ver coleção na fornecedora':'Ver coleção do clube'}<ExternalLink className="h-3.5 w-3.5"/>
      </a>}
      <button type="button" onClick={()=>onSelect(null)} className="block text-[11px] text-zinc-400 underline hover:text-white">Limpar clube</button>
    </div>}
  </div>;
}
