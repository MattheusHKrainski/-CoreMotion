/**
 * Hierarquia de papéis e matriz de permissões do CoreMotion.
 *
 * Hierarquia (do maior para o menor privilégio):
 *   admin      → Administrador: acesso total (papéis, exclusão de contas e moderação)
 *   supervisor → Supervisor: moderação de contas, anúncios, comunidade e pedidos.
 *                NÃO altera papéis, NÃO exclui contas, NÃO age sobre administradores.
 *   seller     → Anunciante legado: publica anúncios C2C, além das funções de atleta.
 *   user       → Atleta/Usuário: publica anúncios C2C e participa da comunidade.
 *   visitor    → Visitante: navegação pública (sem login).
 *
 * Este módulo é puro (sem dependências de servidor/navegador) para poder ser usado
 * tanto no cliente quanto nas rotas de API. A lista histórica de e-mails não concede privilégios: o papel persistido
 * no banco é a autoridade para autenticação e autorização.
 */
import type { UserRole } from './types';

/** E-mails históricos para atalhos e compatibilidade; não substituem o papel no banco. */
const MASTER_ADMIN_EMAILS: readonly string[] = [
  'mattheus.h.krainski@gmail.com',
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
  user: 'Conta comum',
  seller: 'Anunciante C2C',
  supervisor: 'Supervisor',
  admin: 'Administrador',
};


type Capability =
  | 'listings.create' // anunciar equipamento C2C
  | 'orders.place' // comprar
  | 'community.post' // publicar, comentar, curtir e denunciar
  | 'community.moderate' // remover publicações denunciadas
  | 'users.view' // listar contas
  | 'users.suspend' // suspender/reativar contas (não administradores)
  | 'users.change_role' // alterar papéis
  | 'users.delete' // excluir contas
  | 'products.moderate' // suspender/reativar produtos e excluir anúncios de terceiros
  | 'orders.manage'; // alterar status e confirmar pagamentos de pedidos

const ATHLETE_CAPS: Capability[] = ['listings.create', 'orders.place', 'community.post'];
const SELLER_CAPS: Capability[] = [...ATHLETE_CAPS];
const SUPERVISOR_CAPS: Capability[] = [
  'orders.place',
  'community.post',
  'community.moderate',
  'users.view',
  'users.suspend',
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
 * - Administradores agem sobre outras contas, inclusive da administração.
 * - A RPC e a interface protegem a conta em uso.
 * - Supervisores agem apenas sobre atletas e anunciantes.
 */
export function canSuspendTarget(actorRole: UserRole | null | undefined, targetRole: UserRole, targetEmail?: string | null): boolean {
  if (actorRole === 'admin') return true;
  if (isMasterAdminEmail(targetEmail)) return false;
  if (actorRole === 'supervisor') return targetRole === 'user' || targetRole === 'seller';
  return false;
}

/** Excluir outra conta: somente administradores; a própria conta é bloqueada pela RPC. */
export function canDeleteTarget(actorRole: UserRole | null | undefined, _targetEmail?: string | null): boolean {
  // Compatibility parameter only: an email neither grants nor prevents administration.
  void _targetEmail;
  return actorRole === 'admin';
}

/** Alterar papel de outra conta: somente administradores. */
export function canChangeRoleOf(actorRole: UserRole | null | undefined, _targetEmail?: string | null): boolean {
  // Compatibility parameter only: an email neither grants nor prevents administration.
  void _targetEmail;
  return actorRole === 'admin';
}

const ASSIGNABLE_ROLES: readonly UserRole[] = ['user', 'seller', 'supervisor', 'admin'];

export function isAssignableRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (ASSIGNABLE_ROLES as readonly string[]).includes(value);
}
