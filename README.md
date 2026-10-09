# CoreMotiom

Marketplace esportivo com **lojas oficiais** (B2C), **venda entre atletas** (C2C), **comunidade**, **compra com pagamento simulado** e **painel de gestão** com hierarquia de três papéis: **Administrador**, **Supervisor** e **Usuário**. O papel **Lojista** é o atleta que cria uma loja.

Trabalho de Conclusão de Curso (TCC) desenvolvido pela equipe da disciplina, com metodologia Scrum.

---

## Links do projeto

| Item | Onde encontrar |
|---|---|
| Código-fonte completo (frontend, API e banco) | Repositório: https://github.com/MattheusHKrainski/-CoreMotion |
| Documentação do aplicativo | Este README e [`database/README.md`](database/README.md) |
| Scripts de banco de dados | [`supabase/migrations/`](supabase/migrations/) e [`database/`](database/) |
| Documento do TCC (ABNT) | [`docs/tcc/TCC-CoreMotiom-ABNT.docx`](docs/tcc/TCC-CoreMotiom-ABNT.docx) |
| Diagrama de casos de uso | [`docs/diagramas/caso-de-uso.png`](docs/diagramas/caso-de-uso.png) |
| Validação (plano e resultados) | [`docs/validacao/`](docs/validacao/) |
| Roteiro da apresentação | [`docs/apresentacao/roteiro-slides.md`](docs/apresentacao/roteiro-slides.md) |
| Apresentação (Google Slides ou PowerPoint Online) | _Link a ser inserido pela equipe_ |
| Sistema publicado | _A definir pela equipe (ver [Publicação](#publicação))_ |

---

## Funcionalidades

- **Catálogo**: busca por texto; filtros por tipo de venda (todos, lojas oficiais ou venda entre atletas), categoria, modalidade, condição e *Somente Lojas Oficiais (CNPJ)*, que mostra apenas produtos de lojas verificadas; ordenação por relevância, menor ou maior preço e lançamentos recentes.
- **Lojas oficiais**: qualquer atleta pode criar uma loja e passa a ser lojista. A loja pode solicitar o **selo de verificação**, aprovado ou reprovado por supervisor ou administrador. A reprovação registra o motivo padrão "Documentação pendente ou inconsistente"; não há campo para observações.
- **Anúncios**: o lojista publica produtos oficiais (B2C) pela própria loja, escolhendo *Loja oficial* no campo *Tipo de venda*. Atletas e lojistas anunciam equipamentos usados entre atletas (C2C). Quem anunciou pode excluir o próprio anúncio. Supervisores e administradores podem suspender e reativar produtos e excluir anúncios de terceiros. A interface não tem tela de edição de anúncios: a API aceita alterações do dono, mas nenhum formulário as envia.
- **Carrinho e compra**: PIX (com desconto de 5%), cartão de crédito e boleto. **O pagamento é simulado**: não há integração com gateway financeiro. A aprovação do pagamento é simulada no painel de gestão, pelo botão *Simular aprovação do PIX*, na seção de pedidos.
- **Meus pedidos**: o comprador acompanha seus pedidos e seus status em **Perfil**. Supervisores e administradores alteram o status dos pedidos no painel.
- **Comunidade**: publicações, curtidas e comentários. A denúncia usa um dos motivos fixos (*Spam*, *Conteúdo ofensivo*, *Informação falsa* ou *Outro*) e marca a publicação para moderação; supervisores e administradores podem removê-la.
- **Perfil**: edição de nome, telefone, cidade e UF, com exibição do papel, das regras que se aplicam a ele e dos pedidos.
- **Painel de gestão** (supervisor e administrador): indicadores, verificação de lojas, moderação do catálogo e da comunidade, usuários (a troca de papel é exclusiva do administrador), pedidos e diagnóstico do banco.
- Treinadores são **dados estáticos de demonstração**.

## Papéis e permissões

Os três papéis da hierarquia do curso são **Administrador** (`admin`), **Supervisor** (`supervisor`) e **Usuário** (`user`, o atleta). O **Lojista** (`seller`) é um Usuário que criou uma loja, e o **Visitante** é quem não entrou na conta.

A matriz abaixo reflete `lib/permissions.ts` e é aplicada no servidor (rotas de API) e no banco (políticas RLS e triggers).

| Capacidade | Visitante | Atleta | Lojista | Supervisor | Administrador |
|---|:-:|:-:|:-:|:-:|:-:|
| Navegar no catálogo, nas lojas e na comunidade | ✔ | ✔ | ✔ | ✔ | ✔ |
| Comprar e acompanhar os próprios pedidos | | ✔ | ✔ | ✔ | ✔ |
| Publicar, curtir, comentar e denunciar | | ✔ | ✔ | ✔ | ✔ |
| Anunciar equipamento entre atletas (C2C) | | ✔ | ✔ | | ✔ |
| Criar loja (o atleta passa a lojista) | | ✔ | ✔ | | ✔ |
| Gerenciar a própria loja e os produtos oficiais (B2C) | | | ✔ | | ✔ |
| Solicitar selo de verificação da própria loja | | | ✔ | | ✔ |
| Aprovar ou reprovar verificação de loja | | | | ✔ | ✔ |
| Moderar publicações denunciadas e anúncios de terceiros | | | | ✔ | ✔ |
| Gerenciar pedidos (status e confirmação de pagamento) | | | | ✔ | ✔ |
| Listar contas | | | | ✔ | ✔ |
| Suspender e reativar contas | | | | ✔ (só atletas e lojistas) | ✔ (exceto contas-mestre) |
| Alterar papéis | | | | | ✔ (exceto contas-mestre) |
| Excluir contas | | | | | ✔ (exceto contas-mestre) |

**Hierarquia** (níveis de `ROLE_RANK`): Administrador > Supervisor > Lojista > Atleta > Visitante. O administrador tem todas as capacidades. O supervisor modera e gerencia pedidos, mas não anuncia, não cria lojas, não altera papéis e não exclui contas.

**Como o papel é definido**: o papel fica na tabela `public.profiles` e é validado **no servidor** em cada requisição, a partir do token de sessão do Supabase Auth. O navegador não decide permissões. Ao criar a primeira loja, o atleta passa a lojista; administradores e supervisores não são rebaixados.

**Contas-mestre**: as contas listadas em `MASTER_ADMIN_EMAILS` (`lib/permissions.ts`) recebem o papel de administrador no cadastro e na migração. A mesma lista está na função SQL `public.is_master_email`; ao alterar uma, altere a outra. O aplicativo não permite suspender, rebaixar nem excluir essas contas (`canSuspendTarget`, `canChangeRoleOf` e `canDeleteTarget`).

---

## Tecnologias

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript e Tailwind CSS 4.
- **Backend**: rotas de API do Next.js (`app/api/*`), com validação de sessão e de papel em cada rota de escrita e validação das entradas por utilitários próprios (`lib/api-utils.ts`).
- **Autenticação**: Supabase Auth (token JWT).
- **Banco de dados**: PostgreSQL (Supabase), com Row Level Security (RLS), triggers e funções de autorização. O servidor acessa o banco com o driver `pg`.
- **Qualidade**: ESLint, verificação de tipos com TypeScript, testes de autorização do banco com PGlite (PostgreSQL em WebAssembly), teste de fumaça das rotas de API e CI no GitHub Actions.

---

## Como executar localmente

### Pré-requisitos

- Node.js 20 ou superior (versão usada no CI; o Next.js 15 aceita Node.js 18.18 ou superior) e npm.
- Um projeto no [Supabase](https://supabase.com) (plano gratuito é suficiente).

### 1. Obter o código e instalar as dependências

```bash
git clone https://github.com/MattheusHKrainski/-CoreMotion.git
cd ./-CoreMotion
npm install
```

O nome da pasta começa com hífen; por isso o comando é `cd ./-CoreMotion`.

### 2. Configurar as variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local`:

| Variável | Uso | Onde obter no Supabase |
|---|---|---|
| `DATABASE_URL` | Conexão do servidor com o PostgreSQL (rotas de API) | *Project Settings › Database › Connection string › Session pooler* |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto (navegador) | *Project Settings › API › Project URL* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (navegador) | *Project Settings › API › anon public* |

> `.env.local` **nunca** deve ser versionado. A chave `service_role` **não** é usada por este projeto e não deve ser colocada no navegador.

Sem as variáveis do Supabase, o aplicativo funciona em **modo demonstração**: dados locais, sem persistência e com controles de simulação de papel na barra lateral.

### 3. Criar o banco de dados

No *SQL Editor* do Supabase (ou via `psql`), execute **nesta ordem**:

1. `supabase/migrations/20250101000000_coremotiom_initial_schema.sql`: tabelas, triggers e políticas iniciais.
2. `supabase/migrations/20261008000000_roles_hierarchy_and_security.sql`: hierarquia de papéis e endurecimento de segurança. É idempotente, ou seja, pode ser executada mais de uma vez.

Detalhes do modelo, das políticas e dos scripts auxiliares estão em [`database/README.md`](database/README.md).

### 4. Criar a conta administradora

Cadastre-se no aplicativo com um dos e-mails listados em `MASTER_ADMIN_EMAILS` (`lib/permissions.ts`) e confirme o e-mail, se o Supabase exigir confirmação. Ao cadastrar, ou ao executar a migração para contas já existentes, o banco atribui o papel de administrador. Outras contas administradoras só podem ser criadas por um administrador, na seção *Usuários e RBAC* do painel.

### 5. Executar

```bash
npm run dev        # desenvolvimento: http://localhost:3000
```

Para produção:

```bash
npm run build
npm run start      # o Next.js exibe um aviso sobre a saída "standalone", mas o servidor funciona
```

### 6. Dados de demonstração (opcional)

Os scripts em `scripts/seed-*.mjs` preenchem o catálogo para desenvolvimento. Os scripts `seed-catalog.mjs` e `seed-rich-catalog.mjs` **apagam** a tabela de produtos antes de inserir os dados; leia o cabeçalho de cada script antes de executá-lo.

---

## Testes e verificações

| Verificação | Comando | Resultado |
|---|---|---|
| Verificação de tipos | `npm run type-check` | Sem erros |
| Lint | `npm run lint` | 0 erros; 23 avisos (uso de `<img>`, não bloqueiam o build) |
| Build de produção | `npm run build` | Aprovado |
| Autorização do banco (47 cenários) | `npm run test:db` | **47 de 47 aprovados** no esquema endurecido |
| Teste de fumaça das rotas de API | `BASE_URL=http://localhost:3000 bash scripts/smoke-api.sh` | **22 de 22 aprovados** (sem token e com token forjado: 401) |

Resultados registrados em:

- [`docs/validacao/resultados-testes-banco.txt`](docs/validacao/resultados-testes-banco.txt): a **linha de base** (esquema inicial, antes da correção) reprova **29 de 47** cenários. Entre as falhas estavam autoescalonamento de papel pelos metadados do cadastro, leitura anônima de perfis, pedido marcado como pago pelo cliente e exclusão de tabela (`TRUNCATE`) por usuários autenticados.
- [`docs/validacao/smoke-api.txt`](docs/validacao/smoke-api.txt): resultado do teste de fumaça das rotas de API.
- [`docs/validacao/plano-de-testes.md`](docs/validacao/plano-de-testes.md): o que é testado, como e com quais limitações.

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) executa essas verificações em cada *push* e em cada *pull request* direcionados à branch `main`.

---

## Estrutura do projeto

```
app/
  api/                    Rotas de API: users, auth/sync, products, listings, stores
  auth/callback/          Retorno da autenticação
  page.tsx                Aplicação (navegação por visões)
components/               Telas e componentes (Sidebar, AdminDashboard, ProfileView, CheckoutModal, ...)
lib/
  permissions.ts          Hierarquia de papéis, matriz de capacidades e contas-mestre (fonte única no TypeScript)
  server-auth.ts          Validação de sessão e de papel nas rotas de API (servidor)
  auth-fetch.ts           Envio do token de sessão nas chamadas à API (navegador)
  api-utils.ts            Leitura e validação básica das entradas das rotas
  db.ts, db-queries.ts    Conexão e consultas SQL parametrizadas (servidor)
  schemas/                Esquemas Zod (ainda não aplicados às rotas)
  store.tsx               Estado global e ações do aplicativo
services/                 Acesso a dados (Supabase no navegador e API interna)
supabase/migrations/      Esquema e segurança do banco (SQL versionado)
database/
  README.md               Documentação do banco
  tests/                  Testes de autorização do banco (PGlite)
  legacy/                 Scripts antigos e destrutivos, mantidos só como referência
scripts/                  Seeds, utilitários e teste de fumaça das rotas de API
docs/
  diagramas/              Diagrama de casos de uso (PNG e SVG) e gerador (Python)
  validacao/              Plano de testes e resultados
  tcc/                    Documento do TCC (ABNT)
  apresentacao/           Roteiro da apresentação
.github/workflows/        Integração contínua (CI)
```

---

## Segurança

Medidas implementadas nesta versão:

- **Sem credenciais no código**: URLs e chaves vêm de variáveis de ambiente. Uma versão anterior tinha uma senha de banco embutida no código, que continua no histórico do Git.
- **Sessão obrigatória nas escritas**: toda rota de escrita valida o token antes de ler o corpo da requisição. Sem token válido, a resposta é `401`. Sem papel suficiente ou com conta suspensa, a resposta é `403`.
- **Papel vem do banco, nunca do cliente**: o cadastro ignora qualquer papel enviado pelo navegador. Ao criar o perfil, o banco atribui `user`, ou `admin` apenas para contas-mestre.
- **Anúncios B2C**: a rota lê o nome e o selo de verificação da loja no banco. O navegador não informa se a loja é verificada, e o lojista só anuncia pela própria loja.
- **RLS endurecida**: políticas por dono e por staff; contas suspensas não criam nem alteram conteúdo; visitantes anônimos leem apenas a vitrine (produtos, lojas e comunidade).
- **Triggers de proteção de colunas**: papel, suspensão, verificação de loja, status de pagamento e status de pedido só podem ser alterados pelo perfil correto.
- **Privilégios mínimos**: `REVOKE` de privilégios amplos (inclusive `TRUNCATE`, que o RLS não controla) e `GRANT` apenas do necessário.
- **Consultas parametrizadas** no servidor, contra injeção de SQL.

**Ação necessária antes da publicação**: a senha do banco que esteve no código do repositório **deve ser redefinida** no painel do Supabase (*Project Settings › Database › Reset database password*). A nova URI deve ser usada apenas no `.env.local` de cada desenvolvedor. Trate como comprometida qualquer credencial que tenha sido publicada.

---

## Limitações conhecidas

- Pagamentos (PIX, cartão e boleto) são **simulados**. Não há integração com gateway financeiro.
- Treinadores são **dados estáticos** de demonstração.
- Não há testes automatizados de interface (ponta a ponta). A interface foi verificada por tipos, lint, build e pelo teste de fumaça das rotas.
- A interface não tem tela para editar anúncios já publicados.
- Os esquemas Zod em `lib/schemas/` ainda não são usados pelas rotas; a validação atual está em `lib/api-utils.ts`.
- A conexão do servidor com o PostgreSQL aceita certificado sem verificação (`rejectUnauthorized: false`). Em produção de alto risco, configure a verificação do certificado.
- Sem a configuração do Supabase, o aplicativo mostra controles de demonstração (troca de papel e perfis de teste).

---

## Publicação

O repositório aponta, no campo *homepage*, para uma implantação na Vercel (https://core-motion-siyz.vercel.app). A exigência do curso é que o sistema publicado esteja **somente no github.com**. Por isso, a equipe precisa escolher entre:

1. manter a implantação em um serviço com suporte a Node.js (o que não atende à exigência acima); ou
2. publicar uma versão estática no GitHub Pages, o que exige substituir as rotas de API por acesso direto ao Supabase protegido por RLS.

Enquanto a decisão não for tomada, o campo **Sistema publicado** da tabela de links permanece em aberto.

---

## Equipe

Os integrantes são listados em ordem numérica.

| Nº | Integrante | Papel no Scrum e função no projeto |
|---|---|---|
| 1 | _a definir_ | _a definir_ |
| 2 | _a definir_ | _a definir_ |
| 3 | _a definir_ | _a definir_ |
| 4 | _a definir_ | _a definir_ |
| 5 | _a definir_ | _a definir_ |

Contribuições seguem o [CONTRIBUTING.md](CONTRIBUTING.md): fluxo com branches, *pull requests* e revisão obrigatória antes de integrar à `main`.
