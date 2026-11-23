# Atendimento CoreMotion

## Fluxo disponível
- Cliente: rodapé → Ajuda / Fale conosco / Relatar problema → entrar → registrar solicitação. O UUID exibido é o protocolo real salvo no Supabase.
- Categorias: dúvidas gerais, tamanho, entregas, pedidos, devoluções, pagamentos, produtos, corporativo, contato e problema técnico.
- Abra a conversa do protocolo para complementar a solicitação ou ler as respostas da equipe.
- Equipe: painel de admin/supervisor → Atendimento → Abrir fila de atendimento. Pesquise protocolos, assuntos e referências nos registros carregados; filtre a situação. Mostrar mais carrega mais solicitações em blocos de 20.
- Equipe responde e altera situação para aberta/em atendimento/resolvida. Mensagem posterior do cliente reabre o protocolo. Respostas antigas em `support_tickets.response` continuam visíveis; novas respostas não sobrescrevem o histórico.

## Dados e segurança
Migração `20261122230000_support_conversations.sql` já aplicada ao Supabase. Mensagens privadas com RLS; cliente lê somente suas conversas, equipe ativa lê as solicitações para atender. Autoria e identificação de equipe são derivadas de Auth/perfil no servidor, não aceitas do navegador. O RPC serializa gravações, valida tamanho e usa UUID de repetição para impedir duplicações após falhas de rede. Somente a equipe pode mudar a situação. Texto é preservado em falhas enquanto a conversa permanece aberta. Não há salvamento persistente de rascunho ao fechar a central.

Exclusão de ticket ou conta remove mensagens vinculadas por cascata, respeitando o fluxo existente de remoção de contas. Realtime, foco/retorno online, atualização manual e consulta periódica atualizam conversas. Realtime depende de conectividade; não se promete entrega instantânea.

## Operação humana ainda necessária
Este fluxo permite atendimento real **dentro do aplicativo**, mas exige que uma pessoa da equipe entre na fila e responda. Não é um bot, não envia respostas fictícias, não garante prazo e não encaminha solicitações automaticamente para e-mail ou WhatsApp. O link de e-mail apenas abre o aplicativo de e-mail do cliente. Nenhuma integração de cobrança, estorno ou logística foi ativada. Removido do rodapé o horário de atendimento não confirmado.

## Validação
- TypeScript/build aprovados, lint sem erros.
- 210 testes unitários aprovados, incluindo contratos de privacidade e repetição segura.
- Navegador desktop e celular, backend simulado: registro, histórico, falha de envio com rascunho preservado, nova tentativa e reabertura da central sem erros de execução.
- Banco real, teste transacional com rollback: cliente escreve no próprio ticket, repetição não duplica, terceiro não envia, supervisor responde e resolve, cliente reabre ao escrever e não pode impor status de equipe. Nenhuma conta ou mensagem de teste permaneceu gravada.
