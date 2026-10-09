'use client';

import React, { useEffect, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { OrderService } from '@/services';
import { ROLE_LABELS, isStaffRole } from '@/lib/permissions';
import type { Order, UserProfile, UserRole } from '@/lib/types';
import { LogOut, Save, ShieldCheck, Store, UserCircle2 } from 'lucide-react';

/** Descrição curta do que cada papel pode fazer (espelha lib/permissions.ts). */
const ROLE_DESCRIPTIONS: Record<Exclude<UserRole, 'visitor'>, string> = {
  user: 'Atleta: compra produtos, anuncia equipamentos entre atletas e participa da comunidade. Para vender como loja oficial, crie uma loja na seção Lojas.',
  seller: 'Lojista: gerencia a própria loja e os produtos oficiais, além das funções de atleta.',
  supervisor:
    'Supervisor: modera a comunidade e os anúncios, gerencia pedidos, verifica lojas e suspende atletas e lojistas. Não altera papéis nem exclui contas.',
  admin: 'Administrador: acesso total, incluindo alteração de papéis e exclusão de contas (contas-mestre são protegidas).',
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Aguardando pagamento',
  approved: 'Aprovado',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Reembolsado',
  cancelled: 'Cancelado',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Aguardando pagamento',
  escrow_locked: 'Pagamento simulado',
  preparing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

function formatCurrency(value: number): string {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
}

const inputClass =
  'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600/60';

export default function ProfileView() {
  const { user, isVisitor, setAuthModalOpen, updateUserProfile, setActiveView, logout, orders } = useCoreMotiom();

  if (isVisitor || !user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <UserCircle2 className="w-14 h-14 mx-auto text-zinc-600" aria-hidden="true" />
        <h1 className="text-2xl font-black text-white">Entre para acessar seu perfil</h1>
        <p className="text-zinc-400 text-sm">Seus dados, seu papel no sistema e suas compras ficam disponíveis após o login.</p>
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm"
        >
          Entrar
        </button>
      </div>
    );
  }

  // Ao salvar, o store atualiza `user`; a chave muda e o formulário é recriado com os dados salvos.
  const formKey = [user.id, user.name, user.phone ?? '', user.city ?? '', user.state ?? ''].join('|');

  return (
    <ProfileContent
      key={formKey}
      user={user}
      storeOrders={orders}
      onSave={updateUserProfile}
      onOpenStores={() => setActiveView('stores')}
      onOpenAdmin={() => setActiveView('admin')}
      onLogout={() => logout()}
    />
  );
}

interface ProfileContentProps {
  user: UserProfile;
  storeOrders: Order[];
  onSave: (data: Partial<UserProfile>) => void;
  onOpenStores: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

function ProfileContent({ user, storeOrders, onSave, onOpenStores, onOpenAdmin, onLogout }: ProfileContentProps) {
  const [form, setForm] = useState({
    name: user.name ?? '',
    phone: user.phone ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);

  // Com Supabase, os pedidos vêm do banco (a RLS devolve apenas os do próprio comprador).
  // Sem Supabase (demonstração), usa os pedidos mantidos pelo store.
  const userId = user.id;
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    OrderService.getMyOrders(userId).then((list) => {
      if (active) setRemoteOrders(list);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const myOrders = isSupabaseConfigured ? remoteOrders : storeOrders.filter((o) => o.user_id === userId);

  const role = (user.role === 'visitor' ? 'user' : user.role) as Exclude<UserRole, 'visitor'>;
  const roleLabel = ROLE_LABELS[user.role] ?? 'Atleta';
  const roleDescription = ROLE_DESCRIPTIONS[role] ?? ROLE_DESCRIPTIONS.user;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = form.name.trim();
    const state = form.state.trim().toUpperCase();
    if (name.length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    if (state && !/^[A-Z]{2}$/.test(state)) {
      setError('A UF deve ter duas letras (ex.: SP).');
      return;
    }
    setError(null);
    onSave({ name, phone: form.phone.trim(), city: form.city.trim(), state });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">Meu perfil</h1>
        <p className="text-sm text-zinc-400 mt-1">Dados da sua conta e papel no sistema.</p>
      </div>

      {user.is_banned && (
        <div role="alert" className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          <strong className="font-bold">Conta suspensa.</strong> Você pode consultar o aplicativo, mas não pode criar nem alterar conteúdo.
          {user.ban_reason ? ` Motivo: ${user.ban_reason}` : ''}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-red-400 text-white flex items-center justify-center text-2xl font-black shrink-0"
            aria-hidden="true"
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-white truncate">{user.name}</p>
            <p className="text-sm text-zinc-400 truncate">{user.email}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-red-600/15 border border-red-600/40 text-red-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            {roleLabel}
          </span>
        </div>
        <p className="mt-4 text-sm text-zinc-300 leading-relaxed">{roleDescription}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(user.role === 'seller' || user.role === 'admin') && (
            <button
              type="button"
              onClick={onOpenStores}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold"
            >
              <Store className="w-4 h-4" aria-hidden="true" />
              Minha loja
            </button>
          )}
          {isStaffRole(user.role) && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Painel de gestão
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Meus pedidos</h2>
        {myOrders.length === 0 ? (
          <p className="text-sm text-zinc-400">Você ainda não fez pedidos. Eles aparecem aqui depois da finalização da compra.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {myOrders.map((order) => {
              const itemCount = (order.items ?? []).length;
              return (
                <li key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Pedido #{String(order.id).slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(order.created_at)} • {itemCount} {itemCount === 1 ? 'item' : 'itens'} • {formatCurrency(order.total)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-200">
                      {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-red-600/15 text-red-300">
                      {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <form onSubmit={handleSave} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Dados pessoais</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="profile-name" className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Nome completo
            </label>
            <input
              id="profile-name"
              type="text"
              value={form.name}
              maxLength={120}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="profile-phone" className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Telefone
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={form.phone}
              maxLength={30}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-city" className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Cidade
            </label>
            <input
              id="profile-city"
              type="text"
              value={form.city}
              maxLength={80}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-state" className="block text-xs font-semibold text-zinc-400 mb-1.5">
              UF
            </label>
            <input
              id="profile-state"
              type="text"
              value={form.state}
              maxLength={2}
              placeholder="SP"
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-zinc-500">O papel não pode ser alterado aqui: somente um administrador pode fazê-lo.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sair
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              Salvar alterações
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
