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

## Revisão de suspensão

A tela de entrada oferece **Ver motivo e falar com a moderação** quando o login é recusado por suspensão. A pessoa confirma a senha em um cliente Supabase isolado, sem sessão persistida e sem definir um usuário ativo no aplicativo. O motivo vem do próprio perfil autenticado, não de uma busca por e-mail. A sessão isolada é descartada ao sair da tela.

As RPCs `suspension_appeal_state` e `send_suspension_appeal` usam exclusivamente `auth.uid()`. A relação privada `suspension_appeals` associa cada conta a um protocolo da fila de atendimento, com exclusão em cascata. Não foram relaxadas as permissões gerais para contas suspensas. Mensagens têm UUID de idempotência e intervalo mínimo de 15 segundos; o cliente preserva o rascunho quando há falha. A consulta mostra as últimas 200 mensagens e possui atualização manual. Não há garantia de prazo de resposta nem reversão automática.

A equipe encontra o assunto **Revisão de suspensão da conta** no atendimento e responde pela conversa já existente. Resolver o protocolo não remove a suspensão: a decisão continua na gestão de contas, com as proteções administrativas existentes. Após a remoção, a pessoa deve entrar novamente pelo formulário normal.

Validação: teste transacional no Supabase com conta suspensa existente, consulta do motivo, envio/retry sem duplicação, resposta da equipe, recuperação da conversa e rejeição de acesso anônimo/conta sem suspensão. Tudo revertido por `ROLLBACK`; nenhuma mensagem de teste foi mantida. Esse teste valida as RPCs com sujeitos JWT definidos em SQL, não substitui um teste completo de login no navegador.

## Lixeira administrativa de contas (30 dias)

No painel de contas há filtros **Todas as contas**, **Ativas**, **Suspensas** e **Excluídas · lixeira**. “Todas” mostra apenas contas fora da lixeira. Administradores podem restaurar até a data indicada; supervisores apenas consultam. A suspensão anterior é restaurada exatamente como estava — restaurar não significa necessariamente reativar. Contas protegidas e a própria conta continuam indisponíveis para exclusão administrativa. Durante a lixeira, as sessões são revogadas e o login fica bloqueado. Políticas restritivas ocultam perfil público, anúncios, publicações e registros esportivos; a equipe mantém acesso para revisão. Arquivos são preservados no Storage para possibilitar recuperação (URLs públicas já conhecidas não são revogadas durante a retenção).

A tabela privada `account_trash` controla prazo, autor e estado anterior. A RPC `moderate_account` é a única interface de exclusão/restauração para clientes; a implementação antiga não tem execução concedida aos usuários. Alterações de papel ou tentativas de reativação direta são recusadas para contas na lixeira. A rota administrativa `/api/users DELETE` também usa a lixeira e não remove mídia antecipadamente. A exclusão voluntária pelo próprio usuário não foi alterada e continua definitiva.

### Limpeza programada

A Edge Function `purge-account-trash` está publicada e o job `coremotion-purge-account-trash` roda no minuto 17 de cada hora, via pg_cron + pg_net. Seleciona até 10 entradas vencidas por execução, apaga mídia usando a API do Storage e então remove a identidade Auth (cascatas existentes limpam os dados associados). Falhas mantêm o item para nova tentativa; o prazo de recuperação continua encerrado. O endpoint não recebe IDs, datas nem parâmetros de exclusão: chamadas externas apenas podem antecipar uma tentativa da fila que JÁ venceu, nunca indicar contas ou encurtar os 30 dias. Nenhum segredo é enviado pelo cron. A auditoria registra a exclusão definitiva após a remoção; se esse registro falhar, a remoção não pode ser revertida e o erro é registrado nos logs da função.

Validação: envio à lixeira/restauração em transação revertida, prazo de 30 dias, estado de suspensão anterior preservado, proteção da própria conta, tentativa de reativação sem restauração e restrição de supervisor. Consulta anônima real sob RLS verificou ocultação de anúncios/publicações de conta arquivada. Endpoint de limpeza respondeu HTTP 200; agendamento ativo confirmado. Não foi executada exclusão irreversível de conta real para testar o vencimento. Exclusões definitivas anteriores à implantação não são recuperáveis por esta função.

## Vídeos na comunidade e imagens indisponíveis

O compositor aceita vídeo MP4 ou WebM de até 50 MB, com prévia e remoção do anexo antes de publicar. A publicação continua exigindo texto (também usado para descrever o vídeo). O player possui controles, reprodução inline e não inicia automaticamente nem baixa o arquivo inteiro ao abrir o feed. O perfil público de autor usa o mesmo player. Links de vídeo externos não são aceitos: o app usa o bucket `user-media`, em `<uid>/community-videos/<uuid>.<ext>`. Mantém-se a limpeza da mídia na exclusão definitiva da conta, inclusive na lixeira programada, pois a pasta raiz continua sendo o ID do usuário.

Há validação de tamanho/MIME no cliente e verificação inicial da assinatura do arquivo. O banco restringe a URL do vídeo à pasta do autor; o Storage limita o bucket a 50 MB, permite somente os tipos listados e mantém imagens limitadas a 8 MB por política restritiva de upload. Isto não é transcodificação, inspeção antivírus nem garantia de compatibilidade de todos os codecs: o navegador pode recusar vídeos com codec incompatível. Falhas de reprodução exibem orientação; falhas de envio não publicam silenciosamente.

A imagem externa indisponível do exemplo “Treino coletivo: como acolher quem está começando?” foi substituída por ilustração editorial local gerada por IA, com o aviso de personagem/imagem ilustrativa já existente preservado. O arquivo `/community/treino-coletivo.jpg` precisa acompanhar o deploy do código. As demais imagens que falham agora mostram um aviso compacto, sem ocupar um grande retângulo vazio.

Validação: build e testes unitários; transação revertida no Supabase confirmou persistência de URL própria e rejeição de URL externa. Não foi realizado upload de arquivo real no navegador contra produção nesta alteração.
