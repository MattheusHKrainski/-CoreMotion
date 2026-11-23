# Central de gestão e persistência autenticada

## Implementação de 4 de novembro de 2026

- O perfil pessoal salva com o JWT da sessão no Supabase, sem depender de `DATABASE_URL` ou de `/api/users`. A operação confirma a identidade com Auth, limita os campos pessoais e exige uma linha retornada pelo banco antes de mostrar sucesso.
- Publicação, alteração e exclusão de anúncios usam o cliente autenticado e RLS. Oferta externa conectada também só apresenta sucesso depois da confirmação do banco: erro de conexão não vira uma oferta local publicada.
- Abas da central: **Contas**, **Produtos de atletas**, **Ofertas externas**, **Comunidade**, **Talentos e seletivas**, **Denúncias e feedback**, **Pedidos** e **Banco de dados**.
- Contas são consultadas automaticamente a cada 15 segundos e ao retornar à janela. São perfis reais criados pelo trigger de Auth, não atalhos temporários. A listagem distingue erro de consulta de uma lista vazia.
- Administradores podem promover outras contas a Administrador ou Supervisor e escolher Atleta, Treinador ou Casual, suspender/reativar e excluir qualquer outra conta, inclusive de administrador. Somente a própria conta em uso é protegida na central e na RPC. Não há exceção por e-mail histórico.
- Supervisores moderam anúncios, ofertas, comunidade, talentos, seletivas e pedidos, e suspendem contas comuns. Não podem excluir contas nem alterar papel ou tipo, inclusive chamando o banco diretamente. Supervisores não moderam outras contas da equipe.
- As denúncias estão nos detalhes de produtos e ofertas, nas publicações da comunidade e nos cartões esportivos. Categorias: marketplace externo, anúncios de atletas, banco de talentos, seletivas/treinos e comunidade.
- Responder a uma denúncia gera uma notificação ao denunciante. Pedir correção a um anunciante gera uma notificação à conta proprietária. Um anúncio legado sem conta vinculada não pode receber notificação interna: o banco informa essa impossibilidade em vez de inventar um destinatário.
- A caixa **Notificações** mostra orientações recebidas, respostas às denúncias e marcação de leitura, restritas à conta destinatária. Os atalhos temporários não gravam denúncias no projeto real.
- Gestão de pedidos altera andamento e rastreamento dos registros reais. O painel não usa confirmação de pagamento de teste, nem promete custódia ou garantia financeira.
- Diagnóstico consulta contagens reais e o estado de RLS por tabela, com horário do servidor e duração da consulta. RLS ativada não é apresentada como auditoria completa. Falha mostra erro e identifica os resultados anteriores como desatualizados.
- Logout retorna à página de boas-vindas com o login aberto, inclusive após sair de um perfil temporário. Navegação inicial reúne atletas/clientes/treinadores e remove os botões segmentados redundantes.

## Migrações

Aplicadas ao projeto conectado, com cópias versionadas em `supabase/migrations`:

1. `20261104130000_moderation_workspace.sql`: proteção de privilégios de perfis, fila de denúncias, notificações, histórico de moderação e RPCs restritas.
2. `20261104131000_supervisor_sports_moderation.sql`: moderação esportiva por supervisor e tipos esportivos lidos do perfil confiável, não dos metadados editáveis de Auth.
3. `20261104132000_validate_sports_records.sql`: validação das identidades, currículos, seletivas e respostas esportivas.
4. `20261104133000_harden_profile_guard.sql`: bloqueia edição por conta suspensa e alteração de vínculo de loja sem privilégio administrativo.
5. `20261104220000_administrator_account_management.sql`: corrige o CHECK legado que rejeitava supervisor; libera promoção a administrador e gestão de outros administradores, preservando o bloqueio de autoexclusão. Privilégios passam a depender somente do papel persistido: recriar um e-mail histórico não restaura administração.

Também foi removido o trigger legado **BEFORE INSERT** que confirmava automaticamente todo e-mail, contradizendo a configuração de Auth. O trigger **AFTER INSERT** de criação de perfil permanece. A migração versionada identifica especificamente o trigger legado para não remover um trigger de criação de perfil com o mesmo nome em instalações antigas.

Nenhuma chave privilegiada ou senha é necessária no navegador. Exclusão de conta, mudanças de papel, análise de denúncia e feedback são funções `SECURITY DEFINER` com `search_path` fixo, execução revogada de visitantes e verificações explícitas do autor autenticado. O trigger de perfil impede autoelevação por chamadas REST diretas.

## Verificação

- `npm run test:unit`: 107 testes, incluindo gravação com JWT, campos permitidos, identidade divergente, ausência de linhas afetadas, erro de consulta e escrita sem sucesso falso.
- `npm run test:db`: suíte existente de 77 cenários, testes de ofertas/contatos/curtidas e **63 verificações adicionais de moderação** com PostgreSQL/PGlite, papéis reais, RLS, triggers e RPCs. Nenhuma conta de teste é criada no projeto de produção.
- Verificação de interface com Chromium e respostas HTTP controladas: abas, permissões de administrador e supervisor, feedback, análise, denúncia pública, diagnóstico, notificações, salvamento do perfil e retorno ao login no logout. Essa verificação não equivale a um login real contra o provedor.
- `npm run type-check`, `npm run lint` e `npm run build`.
- Consulta de conferência ao banco conectado: 4 perfis, 26 anúncios de atletas e 14 ofertas; trigger de perfil e validação esportiva presentes; bypass de confirmação ausente. Denúncias/notificações inicialmente vazias, sem dados de teste publicados.

A atualização das migrações no Supabase é independente da publicação do frontend. A prévia usa os arquivos locais; GitHub/Vercel só mudam após publicação específica.

## Limpeza autorizada dos pedidos antigos

Foram removidos do banco conectado somente os dois registros mostrados pelo usuário:
`95d3cd1a-2b7e-47ec-b5df-d1bf4c6500b9` e
`76d89828-648d-4e06-8c4c-42e3e874b407`.
A exclusão usou IDs explícitos, não uma limpeza geral da tabela. Novos pedidos não são removidos por carregamento da interface nem pela migração de permissões.

## Acesso sem senha e exclusão de denúncias

- O atalho Admin tenta primeiro reutilizar a sessão persistida, validando a identidade e o papel no banco. Sem sessão válida, o clique solicita um link de acesso ao e-mail administrativo, com `shouldCreateUser: false`. Não há senha, chave privilegiada ou token fixo no frontend. Pedir um link não cria sessão; é preciso abrir o e-mail no mesmo navegador para concluir PKCE. Login por senha continua disponível como alternativa.
- A rota de callback reconhece o marcador fixo `admin=1` e encaminha ao atalho que valida o perfil; o parâmetro não concede privilégios. URLs específicas de retorno para produção e para a prévia atual foram adicionadas à configuração do projeto, preservando as existentes.
- O envio depende do serviço de e-mail e dos limites do Supabase. Falha ou limite de envio aparece como erro, sem informar sucesso falso. Os testes não enviam e-mails reais nem comprovam entrega na caixa postal.
- Motivos selecionáveis: abuso/assédio, palavras inapropriadas, ódio/discriminação, spam, fraude, informações incorretas, conteúdo impróprio e outro. Detalhes são opcionais, exceto em Outro; a seleção e os detalhes são persistidos no texto da denúncia.
- `20261104223000_delete_moderation_report.sql` adiciona RPC de exclusão restrita à equipe, com auditoria. Admin e Supervisor podem excluir uma denúncia junto aos controles de análise, mediante confirmação. A ação não remove o conteúdo denunciado nem envia nova notificação; respostas anteriores permanecem. Arquivar e notificar continua sendo a alternativa para explicar a decisão ao denunciante.
- Chromium com respostas controladas validou o pedido do link Admin sem senha e sem sessão fictícia, a seleção do motivo e a exclusão por supervisor. Os testes PostgreSQL comprovam bloqueio para usuário comum/visitante, exclusão por Admin/Supervisor, auditoria e preservação de outros registros.

## Atualização: destinatário das respostas e agrupamento de denúncias

A fila administrativa agrupa os relatos pela conta responsável pelo conteúdo, inclusive denúncias contra anúncios diferentes da mesma conta. O contador corresponde aos relatos carregados que atendem aos filtros atuais. Expandir o grupo mostra os relatos individuais; analisar um relato não encerra automaticamente os demais. Conteúdos sem conta responsável são agrupados apenas por categoria e ID de conteúdo, evitando reunir desconhecidos em uma única pessoa.

`list_report_owners` é exclusiva da equipe ativa e resolve os responsáveis no servidor. `review_moderation_report` envia a mensagem ao responsável denunciado, não ao denunciante. A mensagem privada fica na notificação do responsável e na auditoria da equipe, não em `moderation_reports.response`. O denunciante acompanha a decisão/status, sem receber a orientação privada. Conteúdo/conta removido ou sem responsável impede o envio com erro explícito; nunca se inventa destinatário.

A caixa de notificações mostra apenas mensagens não lidas. Atualizações de denúncias enviadas possuem `reporter_read_at`; `read_report_update` verifica a identidade do denunciante e persiste a leitura. Uma nova revisão limpa essa marca e reaparece como atualização. Marcar uma notificação antiga como lida também marca as atualizações anteriores do mesmo alvo como lidas para seu próprio denunciante. O histórico não é excluído.

Validação: teste transacional no Supabase com publicação/denúncia temporárias confirmou notificação ao responsável, ausência de notificação ao denunciante, ausência de vazamento da mensagem privada no relato e persistência das leituras. Tudo revertido por ROLLBACK. Testes unitários cobrem agrupamento entre conteúdos, isolamento de responsáveis ausentes, leitura e reaparecimento após nova revisão.

## Lixeira administrativa de produtos

`product_moderation_trash` guarda snapshots por 30 dias de produtos de atletas (`products`) e da loja (`external_offers`) excluídos diretamente pela equipe ativa. A captura ocorre em trigger: não depende de um botão específico e também cobre chamadas administrativas existentes. Exclusão pelo próprio responsável, operações sem usuário autenticado e cascatas de exclusão da conta não entram na lixeira. A remoção da conta também apaga snapshots anteriores do responsável.

O painel possui a aba **Lixeira de produtos**, com busca, foto, descrição, dados originais, datas e restauração confirmada. `restore_moderated_product` exige equipe ativa, bloqueia entrada vencida e conta removida/na lixeira, e restaura o snapshot na mesma transação que remove o arquivo da lixeira. Conflitos de ID/chave de catálogo deixam o arquivo intacto. A restauração preserva suspensão/pausa anterior; não recria interações e relacionamentos removidos por cascata na exclusão. Um cron horário descarta snapshots vencidos. Não há recuperação retroativa dos produtos excluídos antes desta migração.

Validação no Supabase com cópias temporárias e ROLLBACK: exclusão administrativa e restauração de ambas as tabelas; exclusão pelo dono sem arquivo; usuário comum impedido de restaurar. Nenhum anúncio real foi excluído pelos testes.

## Novos exemplos locais

A vitrine sem Supabase usa `fixtures/athlete-examples.ts`: oito novos exemplos com títulos e vendedores explicitamente fictícios, fotos de referência existentes, valores simulados, estoque zero e sem contato pessoal. Não são inseridos nem mesclados no catálogo real. Fixtures antigas continuam apenas para testes e compatibilidade documental. Anúncios publicados por usuários reais não são substituídos por exemplos.
