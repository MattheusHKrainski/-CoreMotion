export const SUPPORT_EMAIL = 'coremotionempresas@gmail.com';
export const HELP_TOPICS = {
  general: { label: 'Dúvidas gerais', title: 'Como a CoreMotion funciona?', text: 'Explore os produtos sem cadastro. Entre na sua conta para anunciar, favoritar e participar da comunidade. Anúncios de atletas são negociados diretamente com o anunciante; os produtos da vitrine CoreMotion podem ser explorados por modalidade, marca e categoria. Consulte as condições do pedido no carrinho antes de confirmar.' },
  size: { label: 'Encontre seu tamanho', title: 'Escolha o tamanho com mais segurança', text: 'Meça seus pés ou corpo em centímetros e compare com a tabela da marca e do modelo. Numerações variam. Em anúncios de atletas, peça medidas e fotos atuais ao vendedor; em produtos CoreMotion, a variante deve ser confirmada antes da ativação da venda.' },
  delivery: { label: 'Entregas', title: 'Frete, prazo e rastreamento', text: 'Nos anúncios de atletas, combine entrega, retirada, custo e prazo diretamente com o anunciante. Nas vendas CoreMotion, frete, prazo e envio estão pendentes de configuração. Confira as condições de entrega antes de combinar a retirada ou o envio.' },
  orders: { label: 'Pedidos', title: 'Acompanhe seus pedidos', text: 'Acesse Meus pedidos CoreMotion pelo carrinho para acompanhar preparações e observações reais da equipe. O checkout confirma pagamentos de teste, sem transações bancárias. O andamento fica registrado no pedido. Negociações de atletas continuam separadas, na conta e no contato com o anunciante.' },
  returns: { label: 'Devoluções', title: 'Trocas, devoluções e cancelamentos', text: 'Se a compra aconteceu em uma loja externa, solicite atendimento diretamente à loja e consulte as condições e os direitos aplicáveis. Em negociações com atletas, entre em contato com o anunciante e guarde os comprovantes. A CoreMotion não executa reembolsos de transações de terceiros. Você também pode denunciar um anúncio ou pedir orientação abaixo.' },
  payments: { label: 'Pagamentos', title: 'Antes de pagar', text: 'Confira a identidade do vendedor, as condições e o destinatário do pagamento. O checkout CoreMotion aceita somente confirmação de teste, sem emissão de Pix, boleto ou cobrança em cartão. Negociações entre atletas seguem separadas e não recebem garantia da plataforma. Não envie senhas, códigos de acesso ou dados completos de cartão ao atendimento.' },
  products: { label: 'Produtos', title: 'Informações sobre equipamentos', text: 'Consulte descrição, fotos, preço, conservação e contato nos detalhes do anúncio. Tire dúvidas sobre medidas, autenticidade e itens inclusos com o anunciante antes de negociar. Nas vendas CoreMotion, confira a variante desejada e os detalhes de entrega antes de confirmar.' },
  corporate: { label: 'Corporativo', title: 'Parcerias e assuntos comerciais', text: 'Para propostas comerciais, parcerias e assuntos institucionais, envie um e-mail para a CoreMotion ou registre uma solicitação. Inclua o nome da empresa, a proposta e uma forma de contato, sem documentos ou dados sensíveis.' },
  contact: { label: 'Fale conosco', title: 'Converse com a equipe CoreMotion', text: 'Registre uma solicitação e acompanhe a resposta nesta central. Se preferir, abra seu aplicativo de e-mail pelo link abaixo. O histórico da conversa é salvo no site; a equipe responde quando disponível. Não há envio automático de e-mail nem garantia de resposta imediata.' },
  problem: { label: 'Relatar problema', title: 'Algo não funcionou?', text: 'Descreva a tela, o que tentou fazer e a mensagem de erro, se houver. Informe o navegador e a referência do anúncio ou pedido, quando disponíveis. Para conteúdo impróprio ou suspeita de fraude, use também o botão Denunciar no próprio conteúdo.' },
} as const;
export type HelpTopic = keyof typeof HELP_TOPICS;
export const TICKET_STATUSES = { open: 'Aberta', reviewing: 'Em atendimento', resolved: 'Resolvida' } as const;
export type TicketStatus = keyof typeof TICKET_STATUSES;
export interface SupportTicket { id: string; owner: string; category: HelpTopic; subject: string; message: string; reference: string; status: TicketStatus; response: string; created_at: string; updated_at: string }
export function supportMailto(topic: HelpTopic): string { return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`CoreMotion — ${HELP_TOPICS[topic].label}`)}`; }

/** Compact navigation; legacy ticket categories remain valid for saved protocols. */
export const HELP_SECTIONS: readonly { id: HelpTopic; label: string; topics: readonly HelpTopic[] }[] = [
  { id: 'general', label: 'Central de Atendimento', topics: ['general'] },
  { id: 'orders', label: 'Pedidos e entregas', topics: ['orders','delivery'] },
  { id: 'payments', label: 'Pagamentos e devoluções', topics: ['payments','returns'] },
  { id: 'products', label: 'Produtos', topics: ['products','size'] },
  { id: 'contact', label: 'Contato e parcerias', topics: ['contact','corporate'] },
  { id: 'problem', label: 'Relatar problema', topics: ['problem'] },
];
export function helpSection(topic: HelpTopic) {
  return HELP_SECTIONS.find(section => section.topics.includes(topic)) || HELP_SECTIONS[0];
}
