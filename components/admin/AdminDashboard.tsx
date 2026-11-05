'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Users,
  Package,
  Tag,
  MessageSquare,
  Flag,
  Truck,
  Database,
  Trophy,
} from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import {
  canDeleteTarget,
  canSuspendTarget,
  isAdminRole,
  isStaffRole,
  isMasterAdminEmail,
  ROLE_LABELS,
} from '@/lib/permissions';
import { AuthService } from '@/services/auth';
import { ProductService } from '@/services/products';
import { OrderService } from '@/services/orderService';
import { getSupabaseClient } from '@/services/supabaseClient';
import {
  getDiagnostics,
  listReports,
  notifyOwner,
  reviewReport,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  type ModerationDiagnostics,
  type ModerationReport,
  type ReportCategory,
  type ReportStatus,
} from '@/services/moderation';
import type {
  UserProfile,
  Product,
  Order,
  OrderStatus,
  CommunityPost,
} from '@/lib/types';
import { ACCOUNT_TYPES, type AccountType } from '@/lib/sports';
import AdminOffersManager from './AdminOffersManager';
import SportsHub from '@/components/SportsHub';

const TABS = [
  ['accounts', 'Contas', Users],
  ['products', 'Produtos de atletas', Package],
  ['offers', 'Ofertas externas', Tag],
  ['community', 'Comunidade', MessageSquare],
  ['sports', 'Talentos e seletivas', Trophy],
  ['reports', 'Denúncias e feedback', Flag],
  ['orders', 'Pedidos', Truck],
  ['diagnostics', 'Banco de dados', Database],
] as const;
type Tab = (typeof TABS)[number][0];
const field =
  'rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white w-full';
const button =
  'rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40';
const card = 'rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 sm:p-5';
const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Aguardando pagamento',
  escrow_locked: 'Pagamento informado',
  preparing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};
const date = (value: string) => new Date(value).toLocaleString('pt-BR');
const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function AccountRoleEditor({
  account,
  busy,
  onSave,
}: {
  account: UserProfile;
  busy: boolean;
  onSave: (role: string, type: AccountType) => void;
}) {
  const [role, setRole] = useState(
    account.role === 'supervisor' ? 'supervisor' : 'user'
  );
  const [type, setType] = useState<AccountType>(
    account.account_type || 'casual'
  );
  return (
    <form
      className="flex flex-wrap items-center gap-2 pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(role, type);
      }}
    >
      <select
        aria-label={`Papel de ${account.name}`}
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className={`${field} !w-auto`}
      >
        <option value="user">Conta comum</option>
        <option value="supervisor">Supervisor</option>
      </select>
      <select
        aria-label={`Tipo de perfil de ${account.name}`}
        value={type}
        onChange={(e) => setType(e.target.value as AccountType)}
        className={`${field} !w-auto`}
      >
        {Object.entries(ACCOUNT_TYPES).map(([id, value]) => (
          <option key={id} value={id}>
            {value.label}
          </option>
        ))}
      </select>
      <button
        disabled={
          busy || (role === account.role && type === account.account_type)
        }
        className={button}
      >
        Salvar papel e tipo
      </button>
    </form>
  );
}
function ReportReview({
  report,
  busy,
  onSave,
  onOpen,
}: {
  report: ModerationReport;
  busy: boolean;
  onSave: (status: Exclude<ReportStatus, 'open'>, response: string) => void;
  onOpen: () => void;
}) {
  const [status, setStatus] = useState<Exclude<ReportStatus, 'open'>>(
    report.status === 'open' ? 'reviewing' : report.status
  );
  const [response, setResponse] = useState(report.response || '');
  return (
    <article className={`${card} space-y-3`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-red-400">
            {REPORT_CATEGORIES[report.category]} •{' '}
            {REPORT_STATUSES[report.status]}
          </p>
          <h3 className="mt-1 font-bold break-words">{report.target_title}</h3>
        </div>
        <time className="text-xs text-zinc-500">{date(report.created_at)}</time>
      </div>
      <p className="whitespace-pre-wrap text-sm text-zinc-300 break-words">
        {report.reason}
      </p>
      <details className="text-xs text-zinc-500">
        <summary>Identificadores</summary>
        <p className="break-all">
          Conteúdo: {report.target_id}
          <br />
          Conta denunciante: {report.reporter_id}
        </p>
      </details>
      <button className={button} onClick={onOpen}>
        Localizar conteúdo na aba de moderação
      </button>
      <form
        className="space-y-3 border-t border-zinc-700 pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(status, response);
        }}
      >
        <label className="block text-xs text-zinc-400">
          Decisão
          <select
            className={`${field} mt-1`}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as Exclude<ReportStatus, 'open'>)
            }
          >
            {Object.entries(REPORT_STATUSES)
              .filter(([s]) => s !== 'open')
              .map(([s, title]) => (
                <option key={s} value={s}>
                  {title}
                </option>
              ))}
          </select>
        </label>
        <label className="block text-xs text-zinc-400">
          Resposta ao denunciante
          <textarea
            className={`${field} mt-1`}
            rows={2}
            required
            minLength={5}
            maxLength={2000}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Explique a análise e as providências tomadas."
          />
        </label>
        <p className="text-xs text-zinc-500">
          Salvar a análise envia uma notificação. Remova ou corrija o conteúdo
          na aba correspondente quando necessário.
        </p>
        <button disabled={busy} className={button}>
          Salvar análise e notificar
        </button>
      </form>
    </article>
  );
}

export default function AdminDashboard() {
  const store = useCoreMotiom();
  const { user, addToast, adminSyncSupabase } = store;
  const staff = isStaffRole(user?.role);
  const admin = isAdminRole(user?.role);
  const client = getSupabaseClient();
  const [tab, setTab] = useState<Tab>('accounts');
  const [query, setQuery] = useState('');
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [diagnostics, setDiagnostics] = useState<ModerationDiagnostics | null>(
    null
  );
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState('');
  const [category, setCategory] = useState<ReportCategory | 'all'>('all');
  const [reportStatus, setReportStatus] = useState<ReportStatus | 'all'>(
    'open'
  );
  const [sportsRefresh, setSportsRefresh] = useState(0);
  const [sportsView, setSportsView] = useState<'talents' | 'trials'>('talents');
  const request = useRef(0);
  const refresh = useCallback(async () => {
    if (!staff) return;
    const version = ++request.current;
    setLoading(true);
    if (tab === 'sports') {
      setSportsRefresh((n) => n + 1);
      setLoading(false);
      return;
    }
    try {
      if (!client)
        throw new Error(
          'Entre na conta real da equipe para consultar e salvar dados no banco.'
        );
      if (tab === 'offers') {
        const result = await adminSyncSupabase(true);
        if (!result.success)
          throw new Error(result.error || 'Ofertas indisponíveis.');
      }
      if (tab === 'accounts') {
        const data = await AuthService.listUsers();
        if (version === request.current) setAccounts(data);
      }
      if (tab === 'products') {
        const data = await ProductService.getProducts({ status: 'all' });
        if (version === request.current) setProducts(data);
      }
      if (tab === 'community') {
        const { data, error } = await client
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        if (version === request.current) setPosts(data || []);
      }
      if (tab === 'orders') {
        const { data, error } = await client
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        if (version === request.current) setOrders(data || []);
      }
      if (tab === 'reports') {
        const data = await listReports();
        if (version === request.current) setReports(data);
      }
      if (tab === 'diagnostics') {
        const start = performance.now();
        const data = await getDiagnostics();
        if (version === request.current) {
          setDiagnostics(data);
          setLatency(Math.round(performance.now() - start));
        }
      }
      if (version === request.current) {
        setError('');
        setLastChecked(new Date().toISOString());
      }
    } catch (err) {
      if (version === request.current)
        setError(err instanceof Error ? err.message : 'Consulta indisponível.');
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, [client, staff, tab, adminSyncSupabase]);
  useEffect(() => {
    setError('');
    setLastChecked('');
    void refresh();
    const interval = window.setInterval(() => void refresh(), 15000);
    const focus = () => void refresh();
    window.addEventListener('focus', focus);
    // Invalidate requests started for a previous tab.
    const invalidate = () => {
      request.current += 1;
    };
    return () => {
      invalidate();
      window.clearInterval(interval);
      window.removeEventListener('focus', focus);
    };
  }, [refresh]);
  async function act(operation: () => Promise<void>, success: string) {
    if (busy) return;
    setBusy(true);
    try {
      await operation();
      void store.adminSyncSupabase(true);
      addToast('Alteração salva', success, 'success');
      await refresh();
    } catch (err) {
      addToast(
        'Não foi possível salvar',
        err instanceof Error ? err.message : 'Verifique sua conexão.',
        'error'
      );
    } finally {
      setBusy(false);
    }
  }
  async function accountAction(
    account: UserProfile,
    action: string,
    role?: string,
    type?: AccountType
  ) {
    let reason: string | null = null;
    if (action === 'ban') {
      reason = window.prompt('Motivo da suspensão (mínimo 5 caracteres):');
      if (reason === null) return;
      if (reason.trim().length < 5) {
        addToast(
          'Motivo obrigatório',
          'Descreva o motivo da suspensão.',
          'error'
        );
        return;
      }
    }
    if (
      action === 'delete' &&
      !window.confirm(
        `Excluir definitivamente a conta de ${account.name}? Esta ação não pode ser desfeita.`
      )
    )
      return;
    await act(
      async () => {
        if (!client) throw new Error('Conexão indisponível.');
        const { error } = await client.rpc('moderate_account', {
          p_target: account.id,
          p_action: action,
          p_role: role || null,
          p_account_type: type || null,
          p_reason: reason,
        });
        if (error) throw new Error(error.message);
      },
      action === 'delete' ? 'Conta excluída.' : 'Conta atualizada.'
    );
  }
  function feedback(contentCategory: ReportCategory, id: string) {
    const message = window.prompt(
      'Orientação ao anunciante / solicitação de correção (mínimo 5 caracteres):'
    );
    if (!message?.trim()) return;
    void act(
      () => notifyOwner(contentCategory, id, message),
      'Orientação enviada às notificações do anunciante.'
    );
  }
  function navigate(next: Tab) {
    setQuery('');
    setTab(next);
  }
  if (!staff)
    return (
      <div className={`${card} text-center text-zinc-400`}>
        <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-red-500" />
        Área restrita a administradores e supervisores autenticados.
      </div>
    );
  const matches = (...values: (string | undefined)[]) =>
    values.join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase());
  const visibleReports = reports.filter(
    (r) =>
      (category === 'all' || r.category === category) &&
      (reportStatus === 'all' || r.status === reportStatus) &&
      matches(r.target_title, r.reason, r.target_id)
  );
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
            <ShieldCheck className="h-4 w-4" />{' '}
            {admin ? 'Administração' : 'Supervisão'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Central de gestão</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Contas, conteúdo e solicitações em um só lugar.{' '}
            {admin
              ? 'Alterações de papel e exclusão de contas são exclusivas de administradores.'
              : 'Você pode moderar conteúdo e suspender contas comuns, mas não excluir contas nem alterar papéis ou tipos.'}
          </p>
        </div>
        <button
          className={`${button} flex items-center gap-2`}
          disabled={loading || busy}
          onClick={() => void refresh()}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{' '}
          Atualizar
        </button>
      </header>
      <div
        role="tablist"
        aria-label="Áreas administrativas"
        className="flex flex-wrap gap-2 border-b border-zinc-700 pb-4"
      >
        {TABS.map(([id, title, Icon]) => (
          <button
            key={id}
            id={`admin-tab-${id}`}
            aria-controls={`admin-panel-${id}`}
            role="tab"
            aria-selected={tab === id}
            onClick={() => navigate(id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${tab === id ? 'border-red-600 bg-red-600 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white'}`}
          >
            <Icon className="h-4 w-4" />
            {title}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <span>
          {loading
            ? 'Consultando o banco…'
            : lastChecked
              ? `Última consulta: ${date(lastChecked)} • atualização automática a cada 15 s`
              : tab === 'sports'
                ? 'A listagem esportiva informa erros de carregamento na própria aba.'
                : 'Consulta pendente'}
        </span>
        {!['offers', 'sports', 'diagnostics'].includes(tab) && (
          <label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <input
              aria-label="Buscar nesta aba"
              placeholder="Buscar nesta aba…"
              className={field}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-300"
        >
          Consulta não concluída: {error} Dados anteriores, quando exibidos, não
          representam uma confirmação de sincronização.
        </div>
      )}
      <section
        role="tabpanel"
        id={`admin-panel-${tab}`}
        aria-labelledby={`admin-tab-${tab}`}
        className="space-y-4"
      >
        {tab === 'accounts' && (
          <>
            <div>
              <h2 className="text-lg font-bold">
                Contas cadastradas ({accounts.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Cadastros aparecem automaticamente, inclusive os que aguardam
                confirmação de e-mail. Perfis temporários não entram nesta
                lista.
              </p>
            </div>
            {accounts
              .filter((a) => matches(a.name, a.email, a.role, a.account_type))
              .map((a) => {
                const protectedAccount =
                  a.id === user!.id ||
                  a.role === 'admin' ||
                  isMasterAdminEmail(a.email);
                const suspend =
                  !protectedAccount &&
                  canSuspendTarget(user!.role, a.role, a.email);
                return (
                  <article key={a.id} className={`${card} space-y-2`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold">
                          {a.name}{' '}
                          {protectedAccount && (
                            <span className="text-xs text-zinc-500">
                              • conta protegida
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-zinc-400 break-all">
                          {a.email}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {ROLE_LABELS[a.role]} •{' '}
                          {ACCOUNT_TYPES[a.account_type || 'casual']?.label} •{' '}
                          {a.is_banned ? 'Suspensa' : 'Ativa'} • cadastro{' '}
                          {date(a.created_at)}
                        </p>
                        {a.ban_reason && (
                          <p className="mt-2 text-xs text-red-400">
                            Motivo: {a.ban_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suspend && (
                          <button
                            disabled={busy}
                            className={button}
                            onClick={() =>
                              void accountAction(
                                a,
                                a.is_banned ? 'unban' : 'ban'
                              )
                            }
                          >
                            {a.is_banned ? 'Reativar conta' : 'Suspender conta'}
                          </button>
                        )}
                        {admin &&
                          !protectedAccount &&
                          canDeleteTarget(user!.role, a.email) && (
                            <button
                              disabled={busy}
                              className={`${button} !text-red-400`}
                              onClick={() => void accountAction(a, 'delete')}
                            >
                              Excluir conta
                            </button>
                          )}
                      </div>
                    </div>
                    {admin && !protectedAccount && (
                      <AccountRoleEditor
                        key={`${a.id}-${a.role}-${a.account_type}`}
                        account={a}
                        busy={busy}
                        onSave={(role, type) =>
                          void accountAction(a, 'role', role, type)
                        }
                      />
                    )}
                  </article>
                );
              })}
            {!loading && !error && !accounts.length && (
              <p className="text-zinc-500">Nenhuma conta cadastrada.</p>
            )}
          </>
        )}
        {tab === 'offers' && <AdminOffersManager />}
        {tab === 'products' && (
          <>
            <h2 className="text-lg font-bold">
              Anúncios de atletas ({products.length})
            </h2>
            {products
              .filter((p) => matches(p.title, p.id, p.seller_name))
              .map((p) => (
                <article key={p.id} className={`${card} space-y-3`}>
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="text-sm text-zinc-400">
                    {p.seller_name} • {money(p.price)} •{' '}
                    {p.status === 'active'
                      ? 'Publicado'
                      : p.status === 'suspended'
                        ? 'Suspenso'
                        : p.status === 'sold'
                          ? 'Vendido'
                          : 'Rascunho'}
                  </p>
                  <p className="text-sm text-zinc-400 line-clamp-3">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={button}
                      disabled={busy}
                      onClick={() => feedback('athlete_listing', p.id)}
                    >
                      Enviar feedback / pedir correção
                    </button>
                    <button
                      className={button}
                      disabled={busy}
                      onClick={() =>
                        void act(async () => {
                          const result = await ProductService.updateProduct(
                            p.id,
                            {
                              status:
                                p.status === 'suspended'
                                  ? 'active'
                                  : 'suspended',
                            }
                          );
                          if (!result.success) throw new Error(result.error);
                        }, 'Status do anúncio atualizado.')
                      }
                    >
                      {p.status === 'suspended'
                        ? 'Reativar anúncio'
                        : 'Suspender anúncio'}
                    </button>
                    <button
                      className={`${button} !text-red-400`}
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`Excluir o anúncio “${p.title}”?`))
                          void act(async () => {
                            const result = await ProductService.deleteProduct(
                              p.id
                            );
                            if (!result.success) throw new Error(result.error);
                          }, 'Anúncio excluído.');
                      }}
                    >
                      Excluir anúncio
                    </button>
                  </div>
                </article>
              ))}
            {!products.length && !loading && !error && (
              <p className="text-zinc-500">Nenhum anúncio encontrado.</p>
            )}
          </>
        )}
        {tab === 'community' && (
          <>
            <h2 className="text-lg font-bold">
              Moderação da comunidade ({posts.length})
            </h2>
            {posts
              .filter((p) => matches(p.title, p.id, p.author_name, p.content))
              .map((p) => (
                <article key={p.id} className={`${card} space-y-3`}>
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="text-xs text-zinc-500">
                    {p.author_name} • {date(p.created_at)}
                  </p>
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap break-words">
                    {p.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={busy}
                      className={button}
                      onClick={() => feedback('community', p.id)}
                    >
                      Enviar orientação ao autor
                    </button>
                    <button
                      disabled={busy}
                      className={`${button} !text-red-400`}
                      onClick={() => {
                        if (window.confirm('Excluir esta publicação?'))
                          void act(async () => {
                            const { data, error } = await client!
                              .from('community_posts')
                              .delete()
                              .eq('id', p.id)
                              .select('id');
                            if (error || !data?.length)
                              throw new Error(
                                error?.message ||
                                  'Publicação não encontrada ou sem permissão.'
                              );
                          }, 'Publicação excluída.');
                      }}
                    >
                      Excluir publicação
                    </button>
                  </div>
                </article>
              ))}
            {!posts.length && !loading && !error && (
              <p className="text-zinc-500">Nenhuma publicação encontrada.</p>
            )}
          </>
        )}
        {tab === 'sports' && (
          <>
            <div className="flex gap-2">
              <button
                className={button}
                aria-pressed={sportsView === 'talents'}
                onClick={() => setSportsView('talents')}
              >
                Banco de talentos
              </button>
              <button
                className={button}
                aria-pressed={sportsView === 'trials'}
                onClick={() => setSportsView('trials')}
              >
                Seletivas e treinos
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              A equipe pode editar, remover e solicitar correções nas
              publicações esportivas.
            </p>
            <SportsHub
              key={sportsView}
              view={sportsView}
              targetId={query}
              refreshToken={sportsRefresh}
            />
          </>
        )}
        {tab === 'reports' && (
          <>
            <h2 className="text-lg font-bold">Fila de denúncias e respostas</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-xs text-zinc-400">
                Categoria
                <select
                  className={`${field} mt-1`}
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ReportCategory | 'all')
                  }
                >
                  <option value="all">Todas as categorias</option>
                  {Object.entries(REPORT_CATEGORIES).map(([id, title]) => (
                    <option key={id} value={id}>
                      {title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-zinc-400">
                Status
                <select
                  className={`${field} mt-1`}
                  value={reportStatus}
                  onChange={(e) =>
                    setReportStatus(e.target.value as ReportStatus | 'all')
                  }
                >
                  <option value="all">Todos os status</option>
                  {Object.entries(REPORT_STATUSES).map(([id, title]) => (
                    <option key={id} value={id}>
                      {title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-xs text-zinc-500">
              {visibleReports.length} solicitação(ões). As respostas ficam
              disponíveis nas notificações de quem denunciou.
            </p>
            {visibleReports.map((r) => (
              <ReportReview
                key={`${r.id}-${r.reviewed_at}`}
                report={r}
                busy={busy}
                onSave={(status, response) =>
                  void act(
                    () => reviewReport(r.id, status, response),
                    'Análise salva e resposta enviada.'
                  )
                }
                onOpen={() => {
                  const targetTab: Tab =
                    r.category === 'external_offer'
                      ? 'offers'
                      : r.category === 'athlete_listing'
                        ? 'products'
                        : r.category === 'community'
                          ? 'community'
                          : 'sports';
                  setTab(targetTab);
                  setQuery(r.target_id);
                  if (targetTab === 'offers')
                    store.setEditingOfferId(r.target_id);
                  if (targetTab === 'sports')
                    setSportsView(
                      r.category === 'trial' ? 'trials' : 'talents'
                    );
                }}
              />
            ))}
            {!visibleReports.length && !loading && !error && (
              <p className="text-sm text-zinc-500">
                Nenhuma denúncia corresponde aos filtros.
              </p>
            )}
          </>
        )}
        {tab === 'orders' && (
          <>
            <h2 className="text-lg font-bold">
              Pedidos registrados ({orders.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Acompanhamento dos registros de pedidos. A CoreMotion não recebe
              nem garante pagamentos entre anunciantes e interessados.
            </p>
            {orders
              .filter((o) => matches(o.id, o.user_email))
              .map((o) => (
                <article key={o.id} className={`${card} space-y-3`}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="font-bold break-all">Pedido {o.id}</h3>
                      <p className="text-sm text-zinc-400">
                        {o.user_email} • {money(o.total)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {date(o.created_at)} • {o.items?.length || 0} item(ns)
                      </p>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {ORDER_STATUS_LABEL[o.order_status]}
                    </p>
                  </div>
                  <details className="text-xs text-zinc-400">
                    <summary>Itens do pedido</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words">
                      {JSON.stringify(o.items, null, 2)}
                    </pre>
                  </details>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs text-zinc-400">
                      Atualizar andamento
                      <select
                        className={`${field} mt-1`}
                        value={o.order_status}
                        disabled={busy}
                        onChange={(e) => {
                          const status = e.target.value as OrderStatus;
                          if (
                            window.confirm(
                              `Alterar andamento para “${ORDER_STATUS_LABEL[status]}”?`
                            )
                          )
                            void act(async () => {
                              const result =
                                await OrderService.updateOrderStatus(
                                  o.id,
                                  status
                                );
                              if (!result.success)
                                throw new Error(result.error);
                            }, 'Andamento atualizado.');
                        }}
                      >
                        {Object.entries(ORDER_STATUS_LABEL).map(
                          ([status, label]) => (
                            <option key={status} value={status}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                    <button
                      className={button}
                      disabled={busy}
                      onClick={() => {
                        const tracking = window.prompt(
                          'Código de rastreamento (deixe vazio para remover):',
                          o.tracking_code || ''
                        );
                        if (tracking === null) return;
                        void act(async () => {
                          const { data, error } = await client!
                            .from('orders')
                            .update({
                              tracking_code: tracking.trim().slice(0, 200),
                              updated_at: new Date().toISOString(),
                            })
                            .eq('id', o.id)
                            .select('id')
                            .single();
                          if (error || !data)
                            throw new Error(
                              error?.message || 'Pedido não encontrado.'
                            );
                        }, 'Rastreamento salvo.');
                      }}
                    >
                      Editar rastreamento
                    </button>
                  </div>
                </article>
              ))}
            {!orders.length && !loading && !error && (
              <p className="text-sm text-zinc-500">Nenhum pedido registrado.</p>
            )}
          </>
        )}
        {tab === 'diagnostics' && (
          <>
            <h2 className="text-lg font-bold">Diagnóstico do banco</h2>
            <p className="text-sm text-zinc-400">
              Consulta autenticada ao banco. Os totais abaixo vêm das tabelas
              reais, não da quantidade de cartões carregados no navegador.
            </p>
            {diagnostics && (
              <>
                <div className={`${card} text-sm space-y-2`}>
                  <p className={error ? 'text-amber-400' : 'text-emerald-400'}>
                    {error
                      ? 'Último resultado disponível — atualização falhou'
                      : 'Consulta autenticada concluída'}
                  </p>
                  <p className="text-zinc-400">
                    Horário do servidor: {date(diagnostics.checked_at)} •
                    duração da consulta: {latency} ms
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(
                    [
                      ['Contas', diagnostics.profiles],
                      ['Contas suspensas', diagnostics.suspended],
                      ['Anúncios', diagnostics.products],
                      ['Ofertas externas', diagnostics.offers],
                      ['Pedidos', diagnostics.orders],
                      [
                        'Denúncias abertas / em análise',
                        diagnostics.reports_open,
                      ],
                    ] as const
                  ).map(([title, count]) => (
                    <div key={title} className={card}>
                      <p className="text-xs text-zinc-500">{title}</p>
                      <strong className="mt-2 block text-2xl">{count}</strong>
                    </div>
                  ))}
                </div>
                <div className={`${card} space-y-3`}>
                  <h3 className="font-bold">
                    Proteção por linha (RLS) nas tabelas
                  </h3>
                  {Object.entries(diagnostics.rls).map(([table, enabled]) => (
                    <div
                      key={table}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="font-mono text-zinc-400">{table}</span>
                      <span
                        className={
                          enabled ? 'text-emerald-400' : 'text-red-400'
                        }
                      >
                        {enabled ? 'Ativada' : 'Desativada — atenção'}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-zinc-500">
                    RLS ativada não equivale a uma auditoria completa de todas
                    as políticas. Esta consulta não verifica envio de e-mail,
                    disponibilidade de lojas externas ou pagamentos.
                  </p>
                </div>
              </>
            )}
            {!diagnostics && !loading && (
              <p className="text-sm text-zinc-500">
                Nenhum diagnóstico confirmado. Atualize para consultar o banco.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
