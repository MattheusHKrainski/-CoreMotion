'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import { canAccessSports, canRecruit, type SportsRecord } from '@/lib/sports';
import { activityGroups, canCancelApplication } from '@/lib/sports-workflow';
import { getSupabaseClient } from '@/services/supabaseClient';
import { loadSportsPreview } from '@/fixtures/sports-preview';
import { scopedQuickStorage } from '@/lib/quick-access';

const panel = 'rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 space-y-4';
export default function SportsActivityView() {
  const { user, addToast, setActiveView } = useCoreMotiom();
  const [records, setRecords] = useState<SportsRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const client = getSupabaseClient();
  const owner = user?.supabase_id || user?.id || '';
  const allowed = canAccessSports(user);
  const recruiting = canRecruit(user);
  const version = useRef(0);
  const refresh = useCallback(async () => {
    if (!allowed) return;
    const current = ++version.current;
    setLoading(true);
    try {
      let rows: SportsRecord[];
      if (client) {
        const { data, error } = await client.from('sports_records').select('*');
        if (error) throw new Error('Não foi possível atualizar suas atividades esportivas. Tente novamente.');
        rows = data || [];
      } else rows = loadSportsPreview(scopedQuickStorage(localStorage));
      if (current === version.current) { setRecords(rows); setError(''); }
    } catch (err) { if (current === version.current) setError(err instanceof Error ? err.message : 'Falha ao consultar atividades.'); }
    finally { if (current === version.current) setLoading(false); }
  }, [client, allowed]);
  useEffect(() => {
    setRecords([]); void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    const focus = () => void refresh();
    window.addEventListener('focus', focus);
    const invalidate = () => { version.current += 1; };
    return () => { invalidate(); window.clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [owner, refresh]);
  async function respond(record: SportsRecord, status: string) {
    if (busy || record.data.recipient !== owner || record.data.status) return;
    setBusy(true);
    try {
      const updated = { ...record, data: { ...record.data, status } };
      if (client) {
        const { data, error } = await client.from('sports_records').update({ data: updated.data }).eq('id', record.id).select('id').single();
        if (error || !data) throw new Error('Não foi possível salvar a resposta. Confira sua sessão e tente novamente.');
      } else {
        const all = loadSportsPreview(scopedQuickStorage(localStorage));
        scopedQuickStorage(localStorage).setItem('coremotion_sports_v1', JSON.stringify(all.map(r => r.id === record.id ? updated : r)));
      }
      // A refresh started before this response must not restore its old pending status.
      version.current += 1;
      setLoading(false);
      setRecords(prev => prev.map(r => r.id === record.id ? updated : r));
      addToast('Resposta salva', status === 'Aceito' ? 'Aceitação registrada. Combine os próximos passos com a outra pessoa.' : 'Recusa registrada.', 'success');
      setError('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Resposta não salva.'); }
    finally { setBusy(false); }
  }
  async function cancelApplication(record: SportsRecord) {
    if (busy || !canCancelApplication(record, owner)) return;
    if (!window.confirm('Cancelar esta inscrição? Você poderá se inscrever novamente enquanto o prazo estiver aberto.')) return;
    setBusy(true);
    try {
      if (client) {
        const { data, error } = await client.from('sports_records').delete()
          .eq('id', record.id).eq('owner', owner).eq('kind', 'application')
          .is('data->>status', null).select('id').single();
        if (error || !data) throw new Error('Não foi possível cancelar. A inscrição pode já ter recebido uma resposta. Atualize a lista e tente novamente.');
      } else {
        const storage = scopedQuickStorage(localStorage);
        const all = loadSportsPreview(storage);
        const current = all.find(r => r.id === record.id);
        if (!current || current.owner !== owner || current.kind !== 'application' || current.data.status) throw new Error('A inscrição mudou. Atualize a lista antes de cancelar.');
        storage.setItem('coremotion_sports_v1', JSON.stringify(all.filter(r => r.id !== record.id)));
      }
      version.current += 1;
      setLoading(false);
      setRecords(prev => prev.filter(r => r.id !== record.id));
      setError('');
      addToast('Inscrição cancelada', 'O envio foi cancelado. Você pode se inscrever novamente se o prazo continuar aberto.', 'success');
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível cancelar a inscrição.'); }
    finally { setBusy(false); }
  }
  if (!allowed) return <p className="p-6 text-zinc-400">Esta área é exclusiva para atletas, treinadores e equipe autorizada.</p>;
  const groups = activityGroups(records, owner);
  const sections = recruiting ? [
    { title: 'Convocações enviadas', rows: groups.sentInvites, empty: 'Você ainda não enviou convocações.' },
    { title: 'Inscritos nas minhas seletivas e treinos', rows: groups.trialApplications, empty: 'Nenhuma inscrição recebida nos seus treinos.' },
  ] : [
    { title: 'Convocações recebidas', rows: groups.receivedInvites, empty: 'Nenhuma convocação recebida.' },
    { title: 'Minhas inscrições em seletivas e treinos', rows: groups.applications, empty: 'Você ainda não se inscreveu em seletivas ou treinos.' },
  ];
  return <section className="mx-auto max-w-6xl space-y-6 py-6">
    <header className={`${panel} bg-gradient-to-br from-red-950/30 to-zinc-950`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl sm:text-3xl font-black">{recruiting ? 'Minhas convocações e inscritos' : 'Convocações e minhas inscrições'}</h1><button disabled={loading || busy} onClick={() => void refresh()} className="flex items-center gap-2 text-xs text-zinc-400"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar</button></div>
      <p className="text-sm text-zinc-400">{recruiting ? 'Acompanhe quem aceitou, quem recusou e quem ainda não respondeu às suas convocações. Analise as inscrições recebidas nos seus treinos.' : 'Receba convocações, responda aos treinadores e acompanhe suas inscrições e as decisões sobre sua participação nos treinos.'} Atualização automática a cada 15 segundos.</p>
      <button className="text-sm font-bold text-red-400" onClick={() => setActiveView(recruiting ? 'talents' : 'trials')}>{recruiting ? 'Buscar atletas para convocar →' : 'Encontrar seletivas e treinos →'}</button>
    </header>
    {error && <p role="alert" className="rounded-xl border border-red-500/40 p-4 text-sm text-red-300">{error}</p>}
    <label className="block text-xs text-zinc-400">Filtrar respostas<select className="ml-3 rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-white" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">Todas</option><option value="pending">Aguardando resposta</option><option value="Aceito">Aceitas</option><option value="Recusado">Recusadas</option></select></label>
    {sections.map(section => <section key={section.title} className={panel}>
      <h2 className="text-lg font-bold">{section.title} ({section.rows.length})</h2>
      {section.rows.filter(r => statusFilter === 'all' || (statusFilter === 'pending' ? !r.data.status : r.data.status === statusFilter)).map(r => {
        const target = records.find(t => t.id === r.data.target);
        const applicationProfile = records.find(t => t.id === r.data.profile);
        const targetName = target?.data.name || r.data.targetName || 'Publicação não disponível';
        return <article key={r.id} className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 space-y-3 text-sm">
          <h3 className="font-bold">{r.kind === 'application' ? `${r.data.name || 'Atleta'} • ${targetName}` : recruiting ? `Convocação para ${targetName}` : `Convocação de ${r.data.name || 'Treinador'}`}</h3>
          {r.kind === 'application' && recruiting && applicationProfile && <p className="text-xs text-zinc-400">{applicationProfile.data.sport} • {applicationProfile.data.age} anos • {applicationProfile.data.city}</p>}
          {r.data.message && <p className="whitespace-pre-wrap break-words text-zinc-300">{r.data.message}</p>}
          {target?.kind === 'trial' && <p className="text-xs text-zinc-400">{target.data.sport} • {target.data.city} • {target.data.category} • {target.data.date} • {target.data.time}</p>}
          <p className={r.data.status === 'Aceito' ? 'text-emerald-400' : r.data.status === 'Recusado' ? 'text-red-400' : 'text-amber-300'}>{r.data.status === 'Aceito' ? 'Aceito — participação confirmada' : r.data.status === 'Recusado' ? 'Recusado' : 'Aguardando resposta'}</p>
          {canCancelApplication(r, owner) && <button type="button" disabled={busy} onClick={() => void cancelApplication(r)} className="rounded-lg border border-zinc-700 px-4 py-2 text-red-400 font-bold disabled:opacity-40">Cancelar inscrição</button>}
          {r.data.recipient === owner && !r.data.status && <div className="flex gap-3">{['Aceito','Recusado'].map(status => <button key={status} disabled={busy} className="rounded-lg border border-zinc-700 px-4 py-2 font-bold disabled:opacity-40" onClick={() => void respond(r, status)}>{status === 'Aceito' ? 'Aceitar' : 'Recusar'}</button>)}</div>}
        </article>;
      })}
      {!section.rows.length && !loading && !error && <p className="text-sm text-zinc-500">{section.empty}</p>}
      {!!section.rows.length && !section.rows.some(r => statusFilter === 'all' || (statusFilter === 'pending' ? !r.data.status : r.data.status === statusFilter)) && <p className="text-sm text-zinc-500">Nenhuma atividade corresponde ao filtro de respostas.</p>}
    </section>)}
    <p className="text-xs text-zinc-500">Uma inscrição não garante aprovação. Confirme local, horário e condições diretamente com a organização.</p>
  </section>;
}
