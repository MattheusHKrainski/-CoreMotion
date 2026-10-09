/**
 * Hierarquia de papéis e matriz de permissões do CoreMotiom.
 *
 * Hierarquia (do maior para o menor privilégio):
 *   admin      → Administrador: acesso total (papéis, exclusão de contas, verificação de lojas, moderação)
 *   supervisor → Supervisor: moderação (suspender contas comuns, verificar lojas, moderar comunidade,
 *                gerenciar pedidos e produtos). NÃO altera papéis, NÃO exclui contas, NÃO age sobre administradores.
 *   seller     → Lojista: gerencia a própria loja e seus produtos B2C, além das funções de atleta.
 *   user       → Atleta/Usuário: compra, anuncia equipamentos C2C, publica na comunidade.
 *   visitor    → Visitante: navegação pública (sem login).
 *
 * Este módulo é puro (sem dependências de servidor/navegador) para poder ser usado
 * tanto no cliente quanto nas rotas de API. A função SQL public.is_master_email()
 * (migrações em supabase/migrations) deve manter a mesma lista de e-mails.
 */
import type { UserRole } from './types';

/** E-mails das contas-mestre (Super Admin). Comparação exata, sem prefixos. */
const MASTER_ADMIN_EMAILS: readonly string[] = [
  'mattheusxmljz@gmail.com',
  'operacaoamd@gmail.com',
  'professorchines2026@gmail.com',
  'admin@coremotiom.com',
];

export function isMasterAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export const ROLE_LABELS: Record<UserRole, string> = {
  visitor: 'Visitante',
  user: 'Atleta',
  seller: 'Lojista',
  supervisor: 'Supervisor',
  admin: 'Administrador',
};


type Capability =
  | 'listings.create' // anunciar equipamento C2C
  | 'orders.place' // comprar
  | 'community.post' // publicar, comentar, curtir e denunciar
  | 'store.create' // solicitar/criar loja
  | 'store.manage_own' // gerenciar a própria loja e produtos B2C
  | 'community.moderate' // remover publicações denunciadas
  | 'users.view' // listar contas
  | 'users.suspend' // suspender/reativar contas (não administradores)
  | 'users.change_role' // alterar papéis
  | 'users.delete' // excluir contas
  | 'stores.verify' // aprovar/reprovar verificação de loja
  | 'products.moderate' // suspender/reativar produtos e excluir anúncios de terceiros
  | 'orders.manage'; // alterar status e confirmar pagamentos de pedidos

const ATHLETE_CAPS: Capability[] = ['listings.create', 'orders.place', 'community.post', 'store.create'];
const SELLER_CAPS: Capability[] = [...ATHLETE_CAPS, 'store.manage_own'];
const SUPERVISOR_CAPS: Capability[] = [
  'orders.place',
  'community.post',
  'community.moderate',
  'users.view',
  'users.suspend',
  'stores.verify',
  'products.moderate',
  'orders.manage',
];
const ADMIN_CAPS: Capability[] = [
  ...SELLER_CAPS,
  ...SUPERVISOR_CAPS,
  'users.change_role',
  'users.delete',
];

const CAPABILITIES: Record<UserRole, ReadonlySet<Capability>> = {
  visitor: new Set<Capability>(),
  user: new Set(ATHLETE_CAPS),
  seller: new Set(SELLER_CAPS),
  supervisor: new Set(SUPERVISOR_CAPS),
  admin: new Set(ADMIN_CAPS),
};

export function hasCapability(role: UserRole | null | undefined, capability: Capability): boolean {
  if (!role) return false;
  return CAPABILITIES[role]?.has(capability) ?? false;
}

export function isAdminRole(role?: UserRole | null): boolean {
  return role === 'admin';
}

/** Administrador ou supervisor: acesso ao painel de gestão. */
export function isStaffRole(role?: UserRole | null): boolean {
  return role === 'admin' || role === 'supervisor';
}

/**
 * Um ator pode suspender/reativar um alvo?
 * - Ninguém age sobre contas-mestre.
 * - Administradores agem sobre qualquer conta (exceto mestre).
 * - Supervisores agem apenas sobre atletas e lojistas.
 */
export function canSuspendTarget(actorRole: UserRole | null | undefined, targetRole: UserRole, targetEmail?: string | null): boolean {
  if (isMasterAdminEmail(targetEmail)) return false;
  if (actorRole === 'admin') return true;
  if (actorRole === 'supervisor') return targetRole === 'user' || targetRole === 'seller';
  return false;
}

/** Excluir conta: somente administradores, nunca contas-mestre. */
export function canDeleteTarget(actorRole: UserRole | null | undefined, targetEmail?: string | null): boolean {
  return actorRole === 'admin' && !isMasterAdminEmail(targetEmail);
}

/** Alterar papel: somente administradores; contas-mestre permanecem administradoras. */
export function canChangeRoleOf(actorRole: UserRole | null | undefined, targetEmail?: string | null): boolean {
  return actorRole === 'admin' && !isMasterAdminEmail(targetEmail);
}

const ASSIGNABLE_ROLES: readonly UserRole[] = ['user', 'seller', 'supervisor', 'admin'];

export function isAssignableRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (ASSIGNABLE_ROLES as readonly string[]).includes(value);
}
