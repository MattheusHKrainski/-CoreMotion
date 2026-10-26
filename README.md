# CoreMotion

**Marketplace esportivo para atletas de todos os tipos.**

O CoreMotion é uma plataforma web que reúne produtos e ofertas esportivas, anúncios de equipamentos entre usuários e recursos de comunidade em um único ambiente. O projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC), com foco em facilitar a descoberta de produtos e aproximar pessoas que praticam esportes.

> **Situação dos pagamentos:** o sistema contempla opções de pagamento no fluxo de compra, mas não realiza processamento financeiro real. A integração com um provedor de pagamentos e a estrutura comercial necessária ainda precisam ser configuradas. Não considere um pedido como pago apenas por selecionar uma forma de pagamento.

---

## Sumário

- [Principais funcionalidades](#principais-funcionalidades)
- [Perfis e permissões](#perfis-e-permissões)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Configuração local](#configuração-local)
- [Banco de dados](#banco-de-dados)
- [Qualidade e testes](#qualidade-e-testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Equipe](#equipe)

## Principais funcionalidades

### Marketplace esportivo
- Catálogo de produtos esportivos com pesquisa e opções de filtragem.
- Exibição de produtos e ofertas de lojas externas, com acesso ao endereço de origem da oferta.
- Anúncios de equipamentos entre atletas, incluindo informações sobre condição, modalidade e preço.
- Detalhes do produto, carrinho, favoritos e criação/acompanhamento de pedidos.
- Área de perfil para informações da conta e atividades relacionadas ao usuário.

### Comunidade esportiva
- Publicações sobre treinos, equipamentos, eventos, dúvidas e conquistas.
- Curtidas, comentários e denúncias de publicações.
- Recursos voltados à descoberta de atletas e treinadores.

### Gestão e moderação
- Painel administrativo para gerenciamento de usuários, produtos, ofertas, pedidos e conteúdo denunciado.
- Perfis de acesso com permissões diferentes.
- Gestão de ofertas externas, incluindo cadastro, atualização, ativação e remoção.
- Recursos de moderação para ajudar a manter a plataforma organizada.

### Pagamento e checkout
O checkout contempla métodos como **PIX, cartão de crédito e boleto**, além de informações de pedido e entrega. Entretanto, o CoreMotion **não está conectado a um gateway financeiro para liquidar transações reais**. A seleção de um método ou a atualização administrativa de um status não substitui a confirmação de pagamento por uma instituição financeira.

## Perfis e permissões

As permissões são organizadas conforme o papel da conta:

| Perfil | Acesso geral |
|---|---|
| **Visitante** | Explorar as áreas públicas da plataforma. |
| **Atleta / usuário** | Participar da comunidade, interagir com publicações e anunciar equipamentos entre usuários. |
| **Anunciante** | Utilizar os recursos de usuário e administrar seus anúncios conforme as permissões disponíveis. |
| **Supervisor** | Apoiar a moderação de conteúdo, anúncios, contas e pedidos. |
| **Administrador** | Gerenciar a plataforma e as permissões administrativas. |

As permissões são definidas no código e reforçadas no servidor e no banco de dados. As ações disponíveis podem variar conforme o recurso e a configuração do ambiente.

## Tecnologias

| Área | Tecnologias | Uso |
|---|---|---|
| **Front-end** | Next.js 15, React 19, TypeScript, Tailwind CSS 4 | Interface, navegação e componentes da aplicação. |
| **Back-end** | Rotas de API do Next.js, Node.js | Regras de negócio, validação e operações executadas no servidor. |
| **Banco de dados** | Supabase, PostgreSQL | Persistência e relacionamento dos dados. |
| **Autenticação** | Supabase Auth | Cadastro, login e sessão de usuário. |
| **Validação** | Zod | Validação de dados de entrada. |
| **Qualidade** | ESLint, TypeScript, testes automatizados | Verificações de código e testes. |
| **Versionamento e CI** | Git, GitHub, GitHub Actions | Colaboração, histórico e execução automatizada de verificações. |

## Arquitetura

A aplicação utiliza Next.js para a interface e para as rotas de API. O Supabase fornece autenticação e banco de dados PostgreSQL. As rotas de servidor executam operações que exigem validação e acesso protegido aos dados.

Em linhas gerais:

1. **Interface:** páginas, visualizações e componentes React.
2. **Aplicação:** regras de negócio e rotas de API do Next.js.
3. **Dados:** PostgreSQL hospedado no Supabase, com políticas de Row Level Security (RLS).
4. **Acesso:** autenticação e verificação de permissões antes de operações restritas.

A segurança depende também da configuração correta das políticas RLS, das variáveis de ambiente e das permissões no Supabase. Chaves privadas não devem ser expostas no navegador nem enviadas ao repositório.

## Configuração local

### Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Um projeto no [Supabase](https://supabase.com).

### 1. Clonar o repositório

```bash
git clone https://github.com/MattheusHKrainski/-CoreMotion.git
cd ./-CoreMotion
npm install
```

### 2. Configurar as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Preencha os valores de acordo com seu projeto Supabase:

| Variável | Finalidade |
|---|---|
| `DATABASE_URL` | Conexão do servidor com o PostgreSQL, preferencialmente pelo Session Pooler do Supabase. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase utilizada pelo cliente. |
| `DATABASE_SSL_CA` | Opcional; certificado da autoridade certificadora, caso seja necessário para a conexão TLS. |

O arquivo `.env.local` contém configurações locais e **não deve ser enviado ao GitHub**. Nunca exponha credenciais do banco ou chaves privadas no front-end.

O arquivo `.env.example` também pode conter opções auxiliares de desenvolvimento. Antes de publicar ou fazer um novo deploy, confira se os modos de acesso temporário e demonstração estão desativados no ambiente de produção.

### 3. Preparar o banco de dados

No painel do Supabase, abra o **SQL Editor** e execute, na ordem, as migrações disponíveis em `supabase/migrations/`. Consulte também a documentação em [`database/README.md`](database/README.md) para detalhes sobre o esquema, as políticas e os testes do banco.

### 4. Iniciar o projeto

```bash
npm run dev
```

A aplicação ficará disponível, por padrão, em http://localhost:3000.

### Comandos úteis

| Comando | Finalidade |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera a versão de produção. |
| `npm run start` | Executa a versão de produção após o build. |
| `npm run lint` | Executa o ESLint. |
| `npm run type-check` | Verifica os tipos TypeScript. |
| `npm run test:db` | Executa os testes do banco de dados. |
| `npm run test:unit` | Executa os testes unitários. |
| `npm run ci` | Executa lint, verificação de tipos e build. |

Alguns comandos de teste dependem das configurações e dependências definidas no próprio projeto.

## Banco de dados

O CoreMotion utiliza PostgreSQL no Supabase para organizar informações relacionadas a:

- Perfis e permissões de usuários.
- Produtos e anúncios.
- Ofertas externas.
- Carrinho, pedidos e informações de entrega.
- Publicações e interações da comunidade.
- Denúncias, notificações e registros de gestão.

As tabelas, políticas e funções SQL versionadas encontram-se em `supabase/migrations/`. A documentação complementar está em [`database/README.md`](database/README.md).

## Qualidade e testes

O projeto inclui verificações estáticas com ESLint e TypeScript, além de scripts de teste para partes do sistema e do banco de dados. Para conferir a situação atual antes de uma entrega, execute:

```bash
npm run lint
npm run type-check
npm run test:unit
npm run test:db
npm run build
```

O resultado dos testes pode variar conforme as variáveis de ambiente e a configuração local. Não considere um teste aprovado sem executar o comando e conferir sua saída no ambiente atual.

## Estrutura do projeto

```text
app/                    Páginas e rotas da aplicação Next.js
  api/                  Endpoints de API
components/             Componentes e telas da interface
lib/                    Tipos, permissões, estado e regras auxiliares
services/               Integrações e acesso a dados
fixtures/               Dados iniciais e conteúdo de referência do projeto
supabase/
  migrations/           Migrações SQL e políticas do banco
database/               Documentação e testes do banco de dados
scripts/                Scripts auxiliares
tests/                  Testes automatizados
docs/                   Diagramas, validações e documentos do TCC
.github/workflows/      Fluxos de integração contínua
```

## Equipe

Projeto desenvolvido por uma equipe de cinco integrantes, com organização de tarefas inspirada na metodologia ágil Scrum.

| Integrante | Responsabilidade principal |
|---|---|
| **Marcus** | Liderança e Scrum Master; organização das sprints e acompanhamento das tarefas. |
| **André** | Design; identidade visual, UI/UX, telas e componentes. |
| **Alfeu** | Banco de dados; modelagem, Supabase, SQL e integridade dos dados. |
| **Mattheus Krainski** | Funcionalidades e back-end; rotas, APIs, marketplace, carrinho e fluxo de compra. |
| **Bruno e Mattheus** | Comunidade; feed, perfis, publicações e interações. |

## Links

- **Repositório:** https://github.com/MattheusHKrainski/-CoreMotion
- **Supabase:** configurar o acesso pelo painel do projeto; não publicar chaves privadas ou credenciais.
- **Documentação do banco:** [`database/README.md`](database/README.md)
- **Migrações:** [`supabase/migrations/`](supabase/migrations/)

---

**CoreMotion — Marketplace esportivo para atletas de todos os tipos.**
