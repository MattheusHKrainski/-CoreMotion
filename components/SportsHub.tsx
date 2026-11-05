'use client';
import { notifyOwner } from '@/services/moderation';
import ReportButton from '@/components/shared/ReportButton';
import { scopedQuickStorage } from '@/lib/quick-access';
import SportPicker from '@/components/shared/SportPicker';
import { matchesSportsRecord } from '@/lib/sports-workflow';
import SportsActivityView from './SportsActivityView';
import React, { useEffect, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { canAccessSports, canRecruit, type SportsRecord } from '@/lib/sports';
import { loadSportsPreview } from '@/fixtures/sports-preview';
import { getSupabaseClient } from '@/services/supabaseClient';

const input =
  'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const button =
  'rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40';
const fields = {
  athlete: {
    name: 'Nome esportivo',
    sport: 'Esporte',
    city: 'Cidade / UF',
    age: 'Idade',
    height: 'Altura (cm)',
    weight: 'Peso (kg)',
    experience: 'Tempo de prática (anos)',
    position: 'Posição / especialidade',
    achievements: 'Medalhas e conquistas',
    history: 'Equipes anteriores e estatísticas',
    availability: 'Disponibilidade para treinar',
    contact: 'Contato para treinadores',
  },
  coach: {
    name: 'Nome profissional',
    sport: 'Modalidades (inclua pilates, ginástica etc.)',
    city: 'Cidade / UF',
    experience: 'Experiência (anos)',
    qualifications: 'Formação e certificações / registro profissional',
    team: 'Equipe / instituição',
    methodology: 'Metodologia e público atendido',
    availability: 'Locais e horários de atendimento',
    contact: 'Contato profissional (será público)',
  },
  trial: {
    name: 'Nome da seletiva / treino / peneira',
    team: 'Equipe / organização',
    sport: 'Esporte',
    city: 'Cidade / UF',
    address: 'Local e endereço completo',
    date: 'Data da seletiva',
    time: 'Horário e fuso local',
    minAge: 'Idade mínima',
    maxAge: 'Idade máxima',
    category: 'Categoria / SUB (ex.: SUB-17)',
    requirements: 'Requisitos, documentos e materiais',
    deadline: 'Data limite para inscrição',
    trainingDays: 'Dias / datas dos treinos após aprovação',
    trainingTime: 'Horários dos treinos após aprovação',
    trainingLocation: 'Local dos treinos após aprovação',
    contact: 'Contato da organização',
  },
};
export default function SportsHub({
  view,
  targetId = '',
  refreshToken = 0,
}: {
  view: 'trials' | 'talents' | 'sports-profile';
  targetId?: string;
  refreshToken?: number;
}) {
  const { user, addToast, setActiveView } = useCoreMotiom();
  const [records, setRecords] = useState<SportsRecord[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState({
    name: '', sport: '', age: '', city: '', category: '',
  });
  const client = getSupabaseClient();
  const owner = user?.supabase_id || user?.id || '';
  const editingRecord = records.find((r) => r.id === editing);
  const kind =
    editingRecord && ['trial', 'athlete', 'coach'].includes(editingRecord.kind)
      ? (editingRecord.kind as 'trial' | 'athlete' | 'coach')
      : view === 'trials'
        ? 'trial'
        : user?.account_type === 'coach'
          ? 'coach'
          : 'athlete';
  const sportsAllowed = canAccessSports(user);
  const recruiting = canRecruit(user);
  useEffect(() => {
    setRecords([]);
    setError('');
    setForm({});
    setEditing(null);
    setShowForm(false);
  }, [owner, view]);
  useEffect(() => {
    let active = true;
    if (!sportsAllowed || (view === 'talents' && !recruiting)) return;
    if (client) {
      client
        .from('sports_records')
        .select('*')
        .then(({ data, error }) => {
          if (!active) return;
          if (error)
            setError(
              'Não foi possível carregar os dados esportivos. Verifique a conexão e a migração do banco.'
            );
          else {
            setRecords(data || []);
            setError('');
          }
        });
    } else {
      try {
        setRecords(loadSportsPreview(scopedQuickStorage(localStorage)));
      } catch {
        setError('Não foi possível ler os dados locais.');
      }
    }
    return () => {
      active = false;
    };
  }, [owner, view, client, sportsAllowed, refreshToken, recruiting]);
  if (!canAccessSports(user))
    return (
      <div className="p-8 text-zinc-300">
        Esta área é exclusiva para atletas, treinadores e administradores.
      </div>
    );

  if (view === 'talents' && !recruiting) return <SportsActivityView />;

  async function persist(record: SportsRecord, remove = false) {
    setBusy(true);
    setError('');
    try {
      if (client) {
        const exists = records.some((r) => r.id === record.id);
        const query = remove
          ? client.from('sports_records').delete().eq('id', record.id).select()
          : exists
            ? client
                .from('sports_records')
                .update({ data: record.data })
                .eq('id', record.id)
                .select()
            : client.from('sports_records').insert(record).select();
        const { data, error } = await query;
        if (error || !data?.length)
          throw new Error(
            'Operação não autorizada ou indisponível. Tente novamente.'
          );
      }
      const next = remove
        ? records.filter((r) => r.id !== record.id)
        : [...records.filter((r) => r.id !== record.id), record];
      if (!client)
        scopedQuickStorage(localStorage).setItem(
          'coremotion_sports_v1',
          JSON.stringify(next)
        );
      setRecords(next);
      addToast(
        'Salvo',
        remove ? 'Publicação removida.' : 'Dados atualizados com sucesso.',
        'success'
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar.');
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (
      kind === 'trial' &&
      (!canRecruit(user) ||
        Number(form.minAge) > Number(form.maxAge) ||
        form.deadline > form.date)
    ) {
      setError('Confira as idades e o prazo de inscrição.');
      return;
    }
    const existing =
      view === 'sports-profile'
        ? records.find((r) => r.owner === owner && r.kind === kind)
        : undefined;
    if (
      await persist({
        id: editing || existing?.id || crypto.randomUUID(),
        owner: editingRecord?.owner || owner,
        kind,
        data: { ...form, name: form.name || user!.name },
      })
    ) {
      setShowForm(false);
      setEditing(null);
      setForm({});
    }
  }
  const listKind =
    view === 'trials' ? 'trial' : view === 'talents' ? 'athlete' : kind;
  const visible = records
    .filter(
      (r) =>
        r.kind === listKind &&
        (!targetId || r.id === targetId) &&
        (view !== 'sports-profile' || r.owner === owner)
    )
    .filter(r => matchesSportsRecord(r, filters));
  const myProfile = records.find(
    (r) => r.owner === owner && r.kind === 'athlete'
  );
  return (
    <section className="max-w-6xl mx-auto space-y-6 py-6">
      <header className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-red-950/40 to-zinc-950 p-7 space-y-3">
        <p className="text-xs uppercase tracking-widest text-red-400">
          CoreMotion • Conexões esportivas
        </p>
        <h1 className="text-3xl font-black">
          {view === 'trials'
            ? 'Seletivas e treinos'
            : view === 'talents'
              ? 'Banco de atletas'
              : user?.account_type === 'coach' ? 'Meu perfil profissional' : 'Meu currículo esportivo'}
        </h1>
        <p className="text-sm text-zinc-400">
          {view === 'trials'
            ? 'Encontre sua próxima equipe. Confira requisitos e a rotina de treinos antes de se inscrever.'
            : view === 'talents'
              ? 'Currículos publicados pelos próprios atletas. Treinadores podem filtrar talentos e enviar convocações.'
              : user?.account_type === 'coach' ? 'Apresente sua formação, modalidades, metodologia e horários para a comunidade. Este é seu perfil profissional, não um currículo de atleta.' : 'Personalize seu currículo. Seu perfil é visível a treinadores e à equipe de moderação.'}
        </p>
        {((view === 'trials' && canRecruit(user)) ||
          view === 'sports-profile') && (
          <button
            className={button}
            onClick={() => {
              const mine = records.find(
                (r) => r.owner === owner && r.kind === kind
              );
              setForm(
                view === 'sports-profile'
                  ? mine?.data || {
                      name: user?.name || '',
                      sport: user?.sport_interests?.[0] || '',
                      city: [user?.city, user?.state]
                        .filter(Boolean)
                        .join(' / '),
                    }
                  : {}
              );
              setEditing(view === 'sports-profile' ? mine?.id || null : null);
              setShowForm(true);
            }}
          >
            {view === 'trials'
              ? 'Publicar seletiva / treino'
              : user?.account_type === 'coach' ? 'Editar meu perfil profissional' : 'Editar meu currículo'}
          </button>
        )}
      </header>
      {error && (
        <p
          role="alert"
          className="text-red-300 border border-red-900 p-4 rounded-xl"
        >
          {error}
        </p>
      )}
      {showForm && (
        <form
          onSubmit={submit}
          className="grid sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
        >
          <h2 className="sm:col-span-2 font-bold text-xl">
            {kind === 'trial'
              ? 'Informações da oportunidade'
              : kind === 'coach'
                ? 'Currículo de treinador'
                : 'Currículo de atleta'}
          </h2>
          {Object.entries(fields[kind]).map(([key, label]) => (
            <label key={key} className="text-sm text-zinc-300 space-y-2">
              {label}
              <input
                required={
                  !['achievements', 'history', 'position'].includes(key)
                }
                className={input}
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                type={
                  ['date', 'deadline'].includes(key)
                    ? 'date'
                    : [
                          'age',
                          'minAge',
                          'maxAge',
                          'height',
                          'weight',
                          'experience',
                        ].includes(key)
                      ? 'number'
                      : 'text'
                }
                min={0}
                max={key.toLowerCase().includes('age') ? 120 : undefined}
                maxLength={1500}
              />
            </label>
          ))}
          <p className="text-xs text-zinc-400 sm:col-span-2">
            Não publique documentos pessoais, endereço residencial ou
            informações sensíveis. Para menores de idade, a inscrição e o
            contato devem ter acompanhamento do responsável.
          </p>
          <label className="text-sm sm:col-span-2">
            <input type="checkbox" required /> Concordo com a publicação destes
            dados para os participantes da área esportiva.
          </label>
          <div className="flex gap-3">
            <button disabled={busy} className={button}>
              Salvar e publicar
            </button>
            <button type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      {view !== 'sports-profile' && (
        <section
          aria-label="Filtros esportivos"
          className="rounded-2xl border border-zinc-800 p-4 space-y-4"
        >
          <SportPicker
            value={filters.sport}
            onChange={(sport) => setFilters({ ...filters, sport })}
            options={records.map((r) => r.data.sport).filter(Boolean)}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(view === 'trials' ? ['city', 'category'] as const : ['name', 'age'] as const).map(k => <label className="text-xs text-zinc-400 space-y-2" key={k}>
              <span className="block">{{ name: 'Nome do atleta', age: 'Idade', city: 'Local (cidade)', category: 'SUB / categoria' }[k]}</span>
              <input className={input} type={k === 'age' ? 'number' : 'text'} min={k === 'age' ? '1' : undefined} max={k === 'age' ? '120' : undefined} value={filters[k]} onChange={e => setFilters({ ...filters, [k]: e.target.value })} placeholder={k === 'category' ? 'Ex.: SUB-17' : undefined} />
            </label>)}
          </div>
          <div className="flex justify-between gap-3 text-sm text-zinc-400">
            <span role="status">{visible.length} resultados</span>
            <button
              type="button"
              className="text-red-400"
              onClick={() =>
                setFilters({ name: '', sport: '', age: '', city: '', category: '' })
              }
            >
              Limpar filtros
            </button>
          </div>
        </section>
      )}
      {visible.length === 0 && (
        <p
          role="status"
          className="rounded-2xl border border-zinc-800 p-6 text-sm text-zinc-400"
        >
          Nenhum resultado encontrado. Ajuste os filtros ou limpe a busca.
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {visible.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3"
          >
            <h2 className="text-xl font-bold">{r.data.name}</h2>
            <p className="text-red-400 text-sm">
              {r.data.sport} • {r.data.city}
            </p>
            <dl className="text-sm space-y-2">
              {Object.entries(r.data)
                .filter(([key]) => !['name', 'sport', 'city'].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-zinc-500">
                      {(
                        fields[
                          r.kind === 'trial'
                            ? 'trial'
                            : r.kind === 'coach'
                              ? 'coach'
                              : 'athlete'
                        ] as Record<string, string>
                      )[key] || key}
                    </dt>
                    <dd className="break-words whitespace-pre-wrap">{value}</dd>
                  </div>
                ))}
            </dl>
            {r.kind === 'trial' &&
              user?.account_type === 'athlete' &&
              (() => {
                const applied = records.some(
                  (a) =>
                    a.kind === 'application' &&
                    a.owner === owner &&
                    a.data.target === r.id
                );
                const closed =
                  r.data.deadline < new Date().toISOString().slice(0, 10);
                return (
                  <button
                    className={button}
                    disabled={busy || applied || closed || !myProfile}
                    onClick={() => {
                      if (
                        !myProfile ||
                        Number(myProfile.data.age) < Number(r.data.minAge) ||
                        Number(myProfile.data.age) > Number(r.data.maxAge)
                      ) {
                        setError(
                          'Seu perfil não atende à faixa etária desta seletiva.'
                        );
                        return;
                      }
                      void persist({
                        id: crypto.randomUUID(),
                        owner,
                        kind: 'application',
                        data: {
                          target: r.id,
                          recipient: r.owner,
                          name: user!.name,
                          profile: myProfile.id,
                          targetName: r.data.name,
                        },
                      });
                    }}
                  >
                    {applied
                      ? 'Inscrição enviada'
                      : closed
                        ? 'Inscrições encerradas'
                        : !myProfile
                          ? 'Publique seu currículo para se inscrever'
                          : 'Inscrever-me'}
                  </button>
                );
              })()}
            {r.kind === 'athlete' && canRecruit(user) && r.owner !== owner && (
              <button
                className={button}
                disabled={
                  busy ||
                  records.some(
                    (i) =>
                      i.kind === 'invite' &&
                      i.owner === owner &&
                      i.data.target === r.id
                  )
                }
                onClick={() => {
                  const message = window.prompt(
                    'Informe equipe, motivo da convocação e contato:'
                  );
                  if (message?.trim())
                    void persist({
                      id: crypto.randomUUID(),
                      owner,
                      kind: 'invite',
                      data: {
                        target: r.id,
                        recipient: r.owner,
                        name: user!.name,
                        message,
                        targetName: r.data.name,
                      },
                    });
                }}
              >
                Convidar / convocar
              </button>
            )}
            <ReportButton
              category={r.kind === 'trial' ? 'trial' : 'athlete_profile'}
              targetId={r.id}
              title={r.data.name || 'Perfil esportivo'}
            />
            {['admin', 'supervisor'].includes(user?.role || '') && (
              <button
                disabled={busy}
                className="text-sm text-zinc-300"
                onClick={async () => {
                  const message = window.prompt(
                    'Orientação / solicitação de correção para o anunciante:'
                  );
                  if (!message?.trim()) return;
                  setBusy(true);
                  try {
                    await notifyOwner(
                      r.kind === 'trial' ? 'trial' : 'athlete_profile',
                      r.id,
                      message
                    );
                    addToast(
                      'Orientação enviada',
                      'O anunciante receberá a solicitação em Notificações.',
                      'success'
                    );
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : 'Não foi possível enviar.'
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Enviar orientação / pedir correção
              </button>
            )}
            {(r.owner === owner ||
              ['admin', 'supervisor'].includes(user?.role || '')) && (
              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => {
                    setForm(r.data);
                    setEditing(r.id);
                    setShowForm(true);
                    window.scrollTo({ top: 0 });
                  }}
                >
                  Editar
                </button>
                <button
                  disabled={busy}
                  className="text-red-400"
                  onClick={() => {
                    if (window.confirm('Excluir esta publicação?'))
                      void persist(r, true);
                  }}
                >
                  Excluir
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!visible.length && (
        <p className="p-8 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-xl">
          Nenhuma publicação encontrada. Ajuste os filtros ou publique seu
          perfil.
        </p>
      )}
      <aside className="p-6 border border-zinc-700 rounded-2xl space-y-3"><h2 className="font-bold">Acompanhe suas atividades</h2><button className="text-sm text-red-400 font-bold" onClick={() => setActiveView(recruiting ? 'sports-activity' : 'talents')}>{recruiting ? 'Ver minhas convocações e inscritos →' : 'Ver convocações e minhas inscrições →'}</button></aside>
    </section>
  );
}
