# CoreMotiom

Marketplace esportivo demonstrativo com uma **vitrine B2C de ofertas externas simuladas**, **anúncios entre atletas** (C2C), **comunidade**, **checkout e envio demonstrativos** e **painel de gestão**. As ofertas B2C usam dados fictícios; lojas, links, preços e descontos reais ainda não estão conectados.

Trabalho de Conclusão de Curso (TCC) desenvolvido pela equipe da disciplina, com metodologia Scrum.

---

## Links do projeto

| Item | Onde encontrar |
|---|---|
| Código-fonte completo (frontend, API e banco) | Repositório: https://github.com/MattheusHKrainski/-CoreMotion |
| Documentação do aplicativo | Este README e [`database/README.md`](database/README.md) |
| Scripts de banco de dados | [`supabase/migrations/`](supabase/migrations/) e [`database/`](database/) |
| Documento do TCC (ABNT) | [`docs/tcc/TCC-CoreMotiom-ABNT.docx`](docs/tcc/TCC-CoreMotiom-ABNT.docx) |
| Diagrama de casos de uso (escopo original do TCC) | [`docs/diagramas/caso-de-uso.png`](docs/diagramas/caso-de-uso.png) |
| Validação (plano e resultados) | [`docs/validacao/`](docs/validacao/) |
| Roteiro da apresentação | [`docs/apresentacao/roteiro-slides.md`](docs/apresentacao/roteiro-slides.md) |
| Apresentação (Google Slides ou PowerPoint Online) | _Link a ser inserido pela equipe_ |
| Sistema publicado | _A definir pela equipe (ver [Publicação](#publicação))_ |

---

## Funcionalidades

- **Vitrine B2C demonstrativa**: cards de ofertas mostram loja de origem, preço, desconto quando há preço original e ação simulada **Ver oferta**. Nesta etapa, lojas, links, preços e descontos são fictícios; nenhum site externo é consultado ou aberto. A integração com fontes reais fica para uma etapa posterior.
- **Anúncios C2C**: atletas publicam equipamentos entre pessoas, com filtros por texto, categoria, modalidade e condição. O catálogo interno, a moderação, o carrinho e o checkout aceitam somente C2C.
- **Perfis de loja**: não há criação, diretório ou revisão de perfis de loja na experiência atual. Registros e colunas legados (incluindo CNPJ e verificações anteriores) permanecem armazenados, mas ficam fora das rotas e da interface públicas.
- **Carrinho e checkout demonstrativo**: mantém PIX, cartão, boleto, desconto PIX, parcelamento e cálculo local de frete para apresentação. Valores, código PIX, prazos e envio são simulados; o código PIX não é válido, não há gateway nem transportadora e nenhum pagamento ou envio real é feito. A conclusão pode registrar um pedido demonstrativo C2C.
- **Meus pedidos**: o comprador acompanha os pedidos demonstrativos e seus status em **Perfil**. Supervisores e administradores alteram esses status no painel, sem confirmar pagamento ou entrega reais.
- **Comunidade**: publicações, curtidas e comentários. A denúncia usa um dos motivos fixos (*Spam*, *Conteúdo ofensivo*, *Informação falsa* ou *Outro*) e marca a publicação para moderação; supervisores e administradores podem removê-la.
- **Perfil e painel de gestão**: edição de dados básicos; moderação de anúncios C2C e da comunidade; gestão de usuários e pedidos demonstrativos; diagnóstico do banco.
- Treinadores são **dados estáticos de demonstração**.

## Papéis e permissões

Os papéis ativos são **Administrador** (`admin`), **Supervisor** (`supervisor`) e **Atleta/Usuário** (`user`). O papel legado **`seller`** é apresentado como **Anunciante C2C** e mantém apenas permissões de atleta; não concede acesso a perfis de loja nem a anúncios B2C. O **Visitante** é quem não entrou na conta.

A matriz abaixo reflete `lib/permissions.ts` e as políticas atuais do banco. Ofertas B2C demonstrativas podem ser exploradas por todos, mas não são anúncios compráveis pelo carrinho interno.

| Capacidade | Visitante | Atleta | Anunciante C2C (`seller`) | Supervisor | Administrador |
|---|:-:|:-:|:-:|:-:|:-:|
| Explorar ofertas B2C demonstrativas, catálogo C2C e comunidade | ✔ | ✔ | ✔ | ✔ | ✔ |
| Comprar e acompanhar os próprios pedidos demonstrativos | | ✔ | ✔ | ✔ | ✔ |
| Publicar, curtir, comentar e denunciar na comunidade | | ✔ | ✔ | ✔ | ✔ |
| Anunciar equipamento entre atletas (C2C) | | ✔ | ✔ | | ✔ |
| Moderar publicações denunciadas e anúncios C2C | | | | ✔ | ✔ |
| Gerenciar pedidos demonstrativos | | | | ✔ | ✔ |
| Listar contas | | | | ✔ | ✔ |
| Suspender e reativar contas | | | | ✔ (atletas e anunciantes) | ✔ (exceto contas-mestre) |
| Alterar papéis | | | | | ✔ (exceto contas-mestre) |
| Excluir contas | | | | | ✔ (exceto contas-mestre) |

**Hierarquia de gestão**: Administrador > Supervisor. Atleta e Anunciante C2C têm as mesmas permissões de publicação C2C; o papel `seller` é mantido apenas para compatibilidade com contas legadas. O supervisor modera e gerencia pedidos demonstrativos, mas não publica, não altera papéis e não exclui contas.

**Como o papel é definido**: o papel fica em `public.profiles.role` e é validado no servidor a partir do token de sessão do Supabase Auth. Ao criar uma conta, o papel padrão é `user`; a conta-mestre é promovida a administrador. Nenhum fluxo cria ou promove uma conta por causa de uma loja.

**Contas-mestre**: as contas listadas em `MASTER_ADMIN_EMAILS` (`lib/permissions.ts`) recebem o papel de administrador no cadastro e na migração. A mesma lista está na função SQL `public.is_master_email`; ao alterar uma, altere a outra. O aplicativo não permite suspender, rebaixar nem excluir essas contas (`canSuspendTarget`, `canChangeRoleOf` e `canDeleteTarget`).

---

## Tecnologias

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript e Tailwind CSS 4.
- **Backend**: rotas de API do Next.js (`app/api/*`), validação de sessão e papel e esquemas Zod para autenticação, anúncios e pedidos (`lib/schemas/`).
- **Autenticação**: Supabase Auth (token JWT).
- **Banco de dados**: PostgreSQL (Supabase), com Row Level Security (RLS), triggers e funções de autorização. O servidor acessa o banco com o driver `pg`.
- **Qualidade**: ESLint, verificação de tipos com TypeScript, testes de autorização do banco com PGlite (PostgreSQL em WebAssembly), teste de fumaça das rotas de API e CI no GitHub Actions.

---

## Como executar localmente

### Pré-requisitos

- Node.js 22 ou superior (versão usada no CI; o `@supabase/supabase-js` atual exige WebSocket nativo, disponível a partir do Node.js 22) e npm.
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

Sem as variáveis do Supabase, o aplicativo **não carrega dados** e o login fica indisponível. Para ver a demonstração com dados fictícios de `fixtures/`, defina `NEXT_PUBLIC_DEMO_MODE=true` em `.env.local` (desligado por padrão).

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

Os dados fictícios ficam em `fixtures/` e os anúncios C2C só aparecem com `NEXT_PUBLIC_DEMO_MODE=true`. As ofertas B2C são fixtures separadas em `fixtures/demo-offers.ts`, sempre identificadas como simulação. O seed ativo de exemplo (`scripts/seed-all-products.mjs`) contém somente C2C. Seeds antigos de lojas/B2C e catálogos destrutivos estão desativados por padrão; não os habilite para dados de produção.

---

## Testes e verificações

| Verificação | Comando | Resultado |
|---|---|---|
| Verificação de tipos | `npm run type-check` | Sem erros |
| Lint | `npm run lint` | 0 erros; 17 avisos de `<img>` (não bloqueiam o build) |
| Testes unitários | `npm run test:unit` | **12 de 12 aprovados** |
| Build de produção | `npm run build` | Aprovado |
| Autorização do banco (62 cenários) | `npm run test:db` | **62 de 62 aprovados**, incluindo aposentadoria de lojas/B2C |
| Teste de fumaça das rotas de API | `BASE_URL=http://localhost:3000 bash scripts/smoke-api.sh` | **14 de 14 aprovados** (sem token e com token forjado: 401) |

Resultados registrados em:

- [`docs/validacao/resultados-testes-banco.txt`](docs/validacao/resultados-testes-banco.txt): resultado atualizado da suíte endurecida (62 cenários), incluindo bloqueio de novas publicações B2C, indisponibilidade de lojas legadas via REST e preservação dos registros existentes. A comparação da linha de base de 2026-10-08 está registrada no próprio arquivo.
- [`docs/validacao/smoke-api.txt`](docs/validacao/smoke-api.txt): resultado do teste de fumaça das rotas de API.
- [`docs/validacao/plano-de-testes.md`](docs/validacao/plano-de-testes.md): o que é testado, como e com quais limitações.

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) executa essas verificações em cada *push* e em cada *pull request* direcionados à branch `main`.

---

## Estrutura do projeto

```
app/
  api/                    Rotas de API: users, auth/sync e products (catálogo C2C)
  auth/callback/          Retorno da autenticação
  page.tsx                Aplicação (navegação por visões)
components/               Telas e componentes (Sidebar, AdminDashboard, ProfileView, CheckoutModal, ...)
lib/
  permissions.ts          Hierarquia de papéis, matriz de capacidades e contas-mestre (fonte única no TypeScript)
  server-auth.ts          Validação de sessão e de papel nas rotas de API (servidor)
  auth-fetch.ts           Envio do token de sessão nas chamadas à API (navegador)
  api-utils.ts            Leitura e validação básica das entradas das rotas
  db.ts, db-queries.ts    Conexão e consultas SQL parametrizadas (servidor)
  schemas/                Esquemas Zod para autenticação, anúncios e pedidos
  store.tsx               Estado global e ações do aplicativo
services/                 Acesso a dados (Supabase no navegador e API interna)
supabase/migrations/      Esquema e segurança do banco (SQL versionado)
database/
  README.md               Documentação do banco
  tests/                  Testes de autorização do banco (PGlite)
  legacy/                 Scripts antigos mantidos só como referência
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
- **Sessão obrigatória nas escritas**: as rotas de escrita existentes validam a sessão antes de aceitar a operação; sem token válido, a resposta é `401`.
- **Papel vem do banco, nunca do cliente**: o cadastro ignora qualquer papel enviado pelo navegador. Ao criar o perfil, o banco atribui `user`, ou `admin` apenas para contas-mestre.
- **B2C desligado no catálogo interno**: API, validação de entrada, políticas RLS e trigger do banco rejeitam novas linhas B2C; linhas legadas ficam ocultas aos papéis REST e não podem ser usadas no checkout.
- **Dados legados preservados**: a migração aditiva não apaga lojas, CNPJs, campos ou registros antigos. O acesso às lojas via `anon`/`authenticated` foi revogado; o app não possui rotas de criação, diretório ou revisão de loja.
- **RLS e privilégios mínimos**: políticas por dono e por staff; contas suspensas não criam conteúdo; visitantes veem anúncios C2C ativos, comunidade e ofertas demonstrativas locais. `TRUNCATE` não é concedido.
- **Triggers de proteção**: papel, suspensão, moderação, status de pagamento e status do pedido são validados no banco. Os pedidos também são limitados a anúncios C2C.
- **Consultas parametrizadas** no servidor, contra injeção de SQL.

**Ação necessária antes da publicação**: a senha do banco que esteve no código do repositório **deve ser redefinida** no painel do Supabase (*Project Settings › Database › Reset database password*). A nova URI deve ser usada apenas no `.env.local` de cada desenvolvedor. Trate como comprometida qualquer credencial que tenha sido publicada.

---

## Limitações conhecidas

- As ofertas B2C são totalmente fictícias nesta etapa: não existe scraping, fonte real, link externo funcional ou integração de preços. A conexão futura de fontes será feita depois.
- PIX, cartão, boleto, parcelamento e cálculo de frete são **simulados**. O checkout pode registrar pedidos demonstrativos C2C, mas não há gateway, transportadora, pagamento, venda ou envio reais.
- Treinadores são **dados estáticos** de demonstração.
- Não há testes automatizados de interface (ponta a ponta). O código é validado por tipos, lint, build e testes de banco.
- A interface não tem tela para editar anúncios já publicados.
- A conexão do servidor com o PostgreSQL verifica o certificado (`rejectUnauthorized: true`). Se o pooler usar uma CA própria, informe o certificado em `DATABASE_SSL_CA`.
- Sem a configuração do Supabase e sem `NEXT_PUBLIC_DEMO_MODE=true`, o login e o cadastro ficam indisponíveis (nenhuma sessão local é criada).

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
