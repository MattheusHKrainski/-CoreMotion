# Central de gestão e persistência autenticada

## Implementação de 4 de novembro de 2026

- O perfil pessoal salva com o JWT da sessão no Supabase, sem depender de `DATABASE_URL` ou de `/api/users`. A operação confirma a identidade com Auth, limita os campos pessoais e exige uma linha retornada pelo banco antes de mostrar sucesso.
- Publicação, alteração e exclusão de anúncios usam o cliente autenticado e RLS. Oferta externa conectada também só apresenta sucesso depois da confirmação do banco: erro de conexão não vira uma oferta local publicada.
- Abas da central: **Contas**, **Produtos de atletas**, **Ofertas externas**, **Comunidade**, **Talentos e seletivas**, **Denúncias e feedback**, **Pedidos** e **Banco de dados**.
- Contas são consultadas automaticamente a cada 15 segundos e ao retornar à janela. São perfis reais criados pelo trigger de Auth, não atalhos temporários. A listagem distingue erro de consulta de uma lista vazia.
- Administradores podem promover a supervisor e escolher Atleta, Treinador ou Casual, suspender/reativar e excluir uma conta. Contas da administração e a própria conta são protegidas contra ações destrutivas na central.
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

Também foi removido o trigger legado **BEFORE INSERT** que confirmava automaticamente todo e-mail, contradizendo a configuração de Auth. O trigger **AFTER INSERT** de criação de perfil permanece. A migração versionada identifica especificamente o trigger legado para não remover um trigger de criação de perfil com o mesmo nome em instalações antigas.

Nenhuma chave privilegiada ou senha é necessária no navegador. Exclusão de conta, mudanças de papel, análise de denúncia e feedback são funções `SECURITY DEFINER` com `search_path` fixo, execução revogada de visitantes e verificações explícitas do autor autenticado. O trigger de perfil impede autoelevação por chamadas REST diretas.

## Verificação

- `npm run test:unit`: 100 testes, incluindo gravação com JWT, campos permitidos, identidade divergente, ausência de linhas afetadas, erro de consulta e escrita sem sucesso falso.
- `npm run test:db`: suíte existente de 77 cenários, testes de ofertas/contatos/curtidas e **45 verificações adicionais de moderação** com PostgreSQL/PGlite, papéis reais, RLS, triggers e RPCs. Nenhuma conta de teste é criada no projeto de produção.
- Verificação de interface com Chromium e respostas HTTP controladas: abas, permissões de administrador e supervisor, feedback, análise, denúncia pública, diagnóstico, notificações, salvamento do perfil e retorno ao login no logout. Essa verificação não equivale a um login real contra o provedor.
- `npm run type-check`, `npm run lint` e `npm run build`.
- Consulta de conferência ao banco conectado: 4 perfis, 26 anúncios de atletas e 14 ofertas; trigger de perfil e validação esportiva presentes; bypass de confirmação ausente. Denúncias/notificações inicialmente vazias, sem dados de teste publicados.

A atualização das migrações no Supabase é independente da publicação do frontend. A prévia usa os arquivos locais; GitHub/Vercel só mudam após publicação específica.
