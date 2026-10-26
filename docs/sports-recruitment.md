# Perfis e recrutamento esportivo

## Categorias e permissões

O papel privilegiado (`role`) continua separado da categoria pública (`account_type`). O cadastro permite `athlete`, `coach` ou `casual` nos metadados do Supabase Auth; nunca permite administrador. O servidor continua validando administradores pelo perfil existente no banco.

- Atleta: currículo, medalhas, medidas, histórico, publicação no banco de talentos, filtros e inscrições em seletivas. Não publica seletivas ou convocações.
- Treinador: currículo profissional, seletivas/treinos, consulta a talentos, convocações e respostas às inscrições.
- Casual: catálogo, comunidade e profissionais de treinamento, incluindo modalidades de rotina. Sem leitura das seletivas nem dos atletas.
- Administrador: gestão já existente de contas, banimentos, catálogo e ofertas; acesso a todas as áreas esportivas e edição/exclusão de publicações.

## Publicação em produção

Aplicar `supabase/migrations/20261023130000_sports_recruitment.sql` depois das migrações anteriores no projeto Supabase antes do deploy da aplicação. A migração cria a tabela `sports_records`, índices de unicidade, políticas RLS e validações de currículo, destinatário, faixa etária, prazo e respostas. Não foi aplicada automaticamente a nenhum banco remoto.

Os metadados da categoria acompanham o cadastro, inclusive quando há confirmação de e-mail. Contas antigas sem categoria não ganham acesso esportivo automaticamente.

Os quatro acessos rápidos aparecem somente sem Supabase configurado. Nenhum deles concede acesso administrativo a um banco real. Remova esse bloco de AuthModal ao encerrar o período temporário. Nesse ambiente, os registros esportivos ficam no localStorage do navegador e não são compartilhados entre dispositivos. Com Supabase configurado, os registros são lidos e gravados no banco, sem fallback silencioso para armazenamento local em caso de erro.

## Fluxos

1. Atleta abre Meu perfil esportivo e publica o currículo com consentimento.
2. Treinador publica oportunidade com endereço, datas, horários, SUB, faixa etária, requisitos e rotina após aprovação.
3. Atleta filtra oportunidades e se inscreve dentro do prazo e da faixa etária.
4. Treinador acompanha inscrições e envia convocações pelo banco de atletas.
5. Destinatário aceita ou recusa; respostas são acompanhadas dentro da aplicação, sem envio automático de e-mail.

Os campos de contato e currículo são intencionalmente publicados para outros participantes; não armazenar documentos pessoais ou endereços residenciais. Inscrições de menores devem ser acompanhadas pelo responsável. Certificações são autodeclaradas, sem selo automático de verificação.

## Verificação

`npm run type-check`, `npm run lint`, `npm run test:unit`, `npm run test:db`, `npm run build`.

## Conteúdo inicial temporário

Sem Supabase configurado, `fixtures/sports-preview.ts` preenche as áreas com 8 currículos de atletas, 5 profissionais, 6 seletivas e 3 interações de inscrição/convocação. As datas são futuras no momento da primeira carga; os contatos usam o domínio reservado `.example.test` e não representam canais reais. As informações não correspondem a eventos ou pessoas verificados.

A carga é feita uma única vez por navegador (`coremotion_sports_content_v1`) e respeita os dados anteriores. Edições e exclusões continuam preservadas. Com Supabase configurado, essa carga não é executada e nenhum desses registros é enviado ao banco. Substituir por publicações reais quando disponíveis.

## Acesso rápido temporário no site publicado

O modal oferece Admin, Atleta, Treinador e Casual também com Supabase configurado. Nesse caso, o botão abre uma sessão local isolada usando `?acesso-rapido=admin` (ou `athlete`, `coach`, `casual`). Nessa sessão, o cliente Supabase fica desativado e `authedFetch` bloqueia chamadas protegidas, sem obter nem transmitir o token de uma conta real. A autenticação do servidor permanece intacta. O perfil Admin temporário é somente para experimentar as ferramentas locais; não administra o banco de produção.

O aviso inferior permite sair da sessão temporária e recarregar o acesso normal. O estado de usuário/carrinho e a entrada da plataforma usam chaves próprias para não substituir o estado da conta normal. Os botões não são cadastro nem autenticação reais.

Para remover o recurso ao terminar o período temporário, configure `NEXT_PUBLIC_QUICK_ACCESS_ENABLED=false` e faça novo build/deploy. Por padrão, ele fica visível enquanto esta versão estiver em uso.
