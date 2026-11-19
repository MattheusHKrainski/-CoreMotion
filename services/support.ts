import { getSupabaseClient } from './supabaseClient';
import { HELP_TOPICS, type HelpTopic, type SupportTicket, type TicketStatus } from '@/lib/support';
function client() { const value = getSupabaseClient(); if (!value) throw new Error('Entre em uma conta para acessar o atendimento.'); return value; }
export async function listSupportTickets(): Promise<SupportTicket[]> {
  const { data, error } = await client().from('support_tickets').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw new Error('Não foi possível carregar as solicitações. Tente atualizar.');
  return data || [];
}
export async function createSupportTicket(input: { category: HelpTopic; subject: string; message: string; reference: string }): Promise<SupportTicket> {
  const subject = input.subject.trim(), message = input.message.trim(), reference = input.reference.trim();
  if (!Object.prototype.hasOwnProperty.call(HELP_TOPICS, input.category) || subject.length < 3 || subject.length > 200 || message.length < 10 || message.length > 4000 || reference.length > 200) throw new Error('Informe um assunto e descreva o problema com pelo menos 10 caracteres.');
  const { data, error } = await client().from('support_tickets').insert({ category: input.category, subject, message, reference }).select('*').single();
  if (error || !data) throw new Error('Não foi possível registrar. Sua solicitação não foi enviada; tente novamente.');
  return data;
}
export async function reviewSupportTicket(id: string, status: TicketStatus, response: string): Promise<void> {
  if (!['open','reviewing','resolved'].includes(status) || response.trim().length < 3 || response.length > 4000) throw new Error('Escreva uma resposta com pelo menos 3 caracteres.');
  const { data, error } = await client().from('support_tickets').update({ status, response: response.trim() }).eq('id', id).select('id');
  if (error || !data?.length) throw new Error('Resposta não salva. Verifique sua permissão e tente novamente.');
}
