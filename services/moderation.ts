import { getSupabaseClient } from './supabaseClient';

export const REPORT_CATEGORIES = {
  external_offer: 'Marketplace externo',
  athlete_listing: 'Anúncios de atletas',
  athlete_profile: 'Banco de talentos',
  trial: 'Seletivas e treinos',
  community: 'Comunidade',
} as const;
export type ReportCategory = keyof typeof REPORT_CATEGORIES;
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export const REPORT_STATUSES: Record<ReportStatus, string> = {
  open: 'Aberta',
  reviewing: 'Em análise',
  resolved: 'Resolvida',
  dismissed: 'Arquivada',
};
export interface ModerationReport {
  id: string;
  reporter_id: string;
  category: ReportCategory;
  target_id: string;
  target_title: string;
  reason: string;
  status: ReportStatus;
  response: string;
  created_at: string;
  reviewed_at?: string;
}
export interface AccountNotification {
  id: string;
  category: ReportCategory;
  target_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}
export interface ModerationDiagnostics {
  checked_at: string;
  profiles: number;
  suspended: number;
  products: number;
  offers: number;
  orders: number;
  reports_open: number;
  rls: Record<string, boolean>;
}
export function moderationClient() {
  const client = getSupabaseClient();
  if (!client)
    throw new Error(
      'Entre em uma conta real para enviar ou consultar dados da moderação.'
    );
  return client;
}
export async function submitReport(
  category: ReportCategory,
  target_id: string,
  target_title: string,
  reason: string
) {
  if (reason.trim().length < 5)
    throw new Error('Descreva o motivo com pelo menos 5 caracteres.');
  const { data, error } = await moderationClient()
    .from('moderation_reports')
    .insert({
      category,
      target_id,
      target_title: target_title.slice(0, 300),
      reason: reason.trim().slice(0, 2000),
    })
    .select('id')
    .single();
  if (error || !data)
    throw new Error(error?.message || 'Não foi possível gravar a denúncia.');
}
export async function listReports(): Promise<ModerationReport[]> {
  const { data, error } = await moderationClient()
    .from('moderation_reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
export async function reviewReport(
  id: string,
  status: Exclude<ReportStatus, 'open'>,
  response: string
) {
  const { error } = await moderationClient().rpc('review_moderation_report', {
    p_id: id,
    p_status: status,
    p_response: response.trim(),
  });
  if (error) throw new Error(error.message);
}
export async function notifyOwner(
  category: ReportCategory,
  target: string,
  message: string
) {
  const { error } = await moderationClient().rpc('notify_content_owner', {
    p_category: category,
    p_target: target,
    p_message: message.trim(),
  });
  if (error) throw new Error(error.message);
}
export async function getDiagnostics(): Promise<ModerationDiagnostics> {
  const { data, error } = await moderationClient().rpc(
    'moderation_diagnostics'
  );
  if (error || !data)
    throw new Error(error?.message || 'Diagnóstico indisponível.');
  return data as ModerationDiagnostics;
}
