import { getSupabaseClient } from './supabaseClient';
import { HELP_TOPICS, type HelpTopic, type SupportTicket, type TicketStatus } from '@/lib/support';
function client() { const value = getSupabaseClient(); if (!value) throw new Error('Entre em uma conta para acessar o atendimento.'); return value; }
export async function listSupportTickets(limit = 20, offset = 0): Promise<SupportTicket[]> {
  const { data, error } = await client().from('support_tickets').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
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

export interface SupportMessage { id: string; ticket_id: string; author_id: string; from_staff: boolean; content: string; created_at: string }
export async function listSupportMessages(ticketId: string): Promise<SupportMessage[]> {
  const { data, error } = await client().from('support_messages').select('*').eq('ticket_id',ticketId).order('created_at').order('id');
  if (error) throw new Error('Não foi possível carregar a conversa. Tente atualizar.');
  return data || [];
}
export async function sendSupportMessage(ticketId: string, content: string, requestId: string, status?: TicketStatus): Promise<void> {
  if (content.trim().length > 4000 || (!content.trim() && !status)) throw new Error('Escreva uma mensagem de até 4.000 caracteres.');
  const { error } = await client().rpc('send_support_message',{p_ticket:ticketId,p_content:content.trim(),p_request_id:requestId,p_status:status || null});
  if (error) throw new Error('Não foi possível salvar. Seu texto foi preservado; tente novamente.');
}
