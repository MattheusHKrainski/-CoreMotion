# Banco de dados do CoreMotiom

Este documento descreve o modelo de dados, o controle de acesso (papéis, RLS e triggers), os scripts e os testes do banco PostgreSQL usado pelo CoreMotiom (projeto Supabase).

- Esquema inicial: [`supabase/migrations/20250101000000_coremotiom_initial_schema.sql`](../supabase/migrations/20250101000000_coremotiom_initial_schema.sql)
- Hierarquia de papéis e endurecimento de segurança: [`supabase/migrations/20261008000000_roles_hierarchy_and_security.sql`](../supabase/migrations/20261008000000_roles_hierarchy_and_security.sql)
- Testes de autorização: [`database/tests/`](tests/)

---

## 1. Ordem de execução

Execute os scripts **nesta ordem**, no *SQL Editor* do Supabase ou com `psql`:

1. `20250101000000_coremotiom_initial_schema.sql`: cria as tabelas, os triggers e as políticas iniciais.
2. `20261008000000_roles_hierarchy_and_security.sql`: aplica a hierarquia de papéis e o endurecimento. É **idempotente**: pode ser executado mais de uma vez.

A migração 2 faz o seguinte, nesta ordem:

- converte o papel legado `merchant` em `seller` antes de recriar a restrição de papéis;
- recria a restrição `profiles_role_check` com os papéis `admin`, `supervisor`, `seller` e `user`;
- promove a `admin` as contas-mestre já cadastradas;
- substitui todas as políticas RLS antigas por regras de dono e de staff;
- cria os triggers de proteção de colunas e revoga privilégios amplos.

## 2. Modelo de dados

| Tabela | Finalidade | Colunas principais |
|---|---|---|
| `profiles` | Perfil de cada conta; `id` referencia `auth.users` | `role`, `is_banned`, `ban_reason`, `store_id`, `city`, `state`, `sport_interests` |
| `stores` | Lojas oficiais (B2C) e seu selo de verificação | `owner_id`, `slug`, `is_verified`, `verification_status`, `verification_requested_at`, `verification_docs` |
| `products` | Anúncios: produtos de lojas (`b2c`) e anúncios entre atletas (`c2c`) | `seller_id`, `store_id`, `product_type`, `price`, `stock`, `status` (`active` ou suspenso) |
| `orders` | Pedidos e seus estados de pagamento e de entrega | `user_id`, `items` (JSONB), `total`, `payment_method`, `payment_status`, `order_status` |
| `community_posts` | Publicações da comunidade, com curtidas, comentários e denúncias | `author_id`, `category`, `comments` (JSONB), `is_reported`, `report_reason` |

**Papéis** (`profiles.role`): `admin` (administrador), `supervisor`, `seller` (lojista) e `user` (atleta). O visitante não é gravado no banco; é o estado de quem não está autenticado.

**Status de verificação** (`stores.verification_status`) e **de pedido** (`orders.order_status`) são restritos por `CHECK` no próprio esquema, o que impede valores fora do domínio.

## 3. Funções de autorização

As funções que consultam tabelas usam `SECURITY DEFINER` com `search_path` fixo, para evitar sequestro de caminho de busca. `is_master_email` é uma função SQL imutável, sem acesso a tabelas.

| Função | Retorno | Uso |
|---|---|---|
| `public.is_master_email(email)` | `boolean` | Verifica se o e-mail é de conta-mestre. Deve manter a mesma lista de `lib/permissions.ts` |
| `public.is_admin()` | `boolean` | Usuário autenticado tem papel `admin` |
| `public.is_staff()` | `boolean` | Usuário autenticado tem papel `admin` ou `supervisor` |
| `public.current_user_role()` | `text` | Papel do usuário autenticado |
| `public.is_banned_user()` | `boolean` | Conta suspensa; usada nas políticas de escrita |

## 4. Triggers de proteção

| Trigger | Tabela | Regra |
|---|---|---|
| `on_auth_user_created` | `auth.users` | Cria o perfil. O papel é `admin` apenas para contas-mestre; caso contrário, `user` |
| `profiles_protect_columns` | `profiles` | Usuário comum não altera `role`, `is_banned`, `ban_reason` nem `email` |
| `stores_protect_columns` | `stores` | Só o staff altera a verificação (`is_verified`, `verification_status`, revisão) |
| `products_protect_columns` | `products` | Vendedor não altera a moderação (`status` suspenso pelo staff) |
| `orders_protect_columns` | `orders` | Cliente não define `payment_status` nem `order_status`; só o staff confirma pagamento |
| `community_protect_columns` | `community_posts` | Qualquer atleta ativo pode curtir, comentar e denunciar. Autoria, título, texto, imagem e categoria só o autor ou o staff altera |

Os triggers só restringem chamadas **com JWT** (`auth.uid()` não nulo). Conexões sem JWT, como o servidor com `DATABASE_URL`, migrações e o painel do Supabase, não são restringidas pelos triggers, porque o servidor valida o papel antes de gravar (ver a seção 7).

## 5. Políticas RLS

RLS está **habilitada** nas cinco tabelas. As políticas combinam-se com `OR`; por isso, as políticas antigas permissivas foram removidas.

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Próprio perfil ou staff | Próprio `id` ou administrador | Próprio perfil ou staff | Administrador |
| `stores` | Todos (vitrine pública) | Dono não suspenso ou administrador | Dono não suspenso ou staff | Dono ou administrador |
| `products` | Anúncio ativo, dono ou staff | Vendedor não suspenso ou administrador | Vendedor não suspenso ou staff | Vendedor ou staff |
| `orders` | Comprador ou staff | Comprador não suspenso ou administrador | Comprador não suspenso ou staff | Administrador |
| `community_posts` | Todos | Autor não suspenso ou administrador | Autenticado não suspenso ou staff (colunas protegidas por trigger) | Autor ou staff |

## 6. Privilégios

```sql
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON public.products, public.stores, public.community_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
```

- **Visitante anônimo** lê apenas a vitrine: produtos, lojas e comunidade.
- **Autenticado** passa pelas políticas RLS. O privilégio `TRUNCATE` **não** é concedido: RLS não controla `TRUNCATE`, por isso ele é revogado.

## 7. Conexão do servidor

As rotas de API (`app/api/*`) acessam o banco com `DATABASE_URL`, pelo driver `pg`. Essa conexão não carrega o JWT do usuário, então **as políticas RLS não se aplicam a ela**. Por isso, a autorização é aplicada duas vezes:

1. **No servidor**: toda rota de escrita valida o token com `requireAuth` (`lib/server-auth.ts`) e verifica a capacidade com `lib/permissions.ts` antes de executar a consulta.
2. **No banco**: as consultas do cliente Supabase (navegador) passam pela RLS e pelos triggers.

A string `DATABASE_URL` é lida apenas no servidor e nunca é versionada.

## 8. Scripts auxiliares

| Caminho | Finalidade | Atenção |
|---|---|---|
| `scripts/seed-catalog.mjs` | Carrega catálogo de demonstração | **Apaga** a tabela `products` antes de inserir |
| `scripts/seed-rich-catalog.mjs` | Carrega catálogo ampliado | **Apaga** a tabela `products` antes de inserir |
| `scripts/seed-all-products.mjs`, `seed-extended-catalog.mjs`, `seed-50-stores.mjs`, `seed-data.mjs` | Dados de demonstração | Leia o código antes de executar |
| `scripts/update-product-images.mjs` | Atualiza a coluna `images` dos produtos | Altera dados; uso em desenvolvimento |
| `scripts/inspect-db.mjs` | Inspeciona o banco | Somente leitura |
| `scripts/smoke-api.sh` | Teste de fumaça das rotas de API (sem banco) | Requer o servidor no ar |
| `database/legacy/*.mjs` | Scripts antigos (migração e organização) | **Não usar.** Mantidos apenas como referência |

Execute scripts de dados somente em desenvolvimento ou com backup disponível.

## 9. Testes de autorização

A suíte `database/tests/rls.test.mjs` executa **47 cenários** sobre PostgreSQL em memória (PGlite 0.3.2). Cada cenário conecta-se com um papel (`anon`, `authenticated`) e um JWT de teste, e verifica se a operação é permitida ou negada. Os cenários cobrem:

- escalonamento de privilégio pelos metadados do cadastro e por alteração do próprio papel;
- leitura anônima e acesso a dados de outros usuários;
- suspensão de conta (escrita bloqueada) e exclusão de contas (somente administrador);
- proteção de colunas (pagamento, status de pedido, verificação de loja, moderação);
- privilégios de tabela (`TRUNCATE` negado) e exclusão em cascata de `auth.users`.

Comandos:

```bash
npm run test:db                                   # esquema endurecido: 47 de 47
BASELINE=1 npm --prefix database/tests test       # linha de base (esquema inicial)
```

Resultados em [`docs/validacao/resultados-testes-banco.txt`](../docs/validacao/resultados-testes-banco.txt):

| Esquema | Aprovados | Reprovados |
|---|:-:|:-:|
| Inicial (linha de base) | 18 | 29 |
| Endurecido (inicial + migração 2) | **47** | 0 |

Na linha de base, as falhas mais graves permitiam que um atleta se tornasse administrador, que um visitante lesse perfis, que um cliente marcasse o próprio pedido como pago e que um usuário autenticado executasse `TRUNCATE`.

## 10. Segurança operacional

- **Senha do banco**: a senha que esteve no código do repositório deve ser redefinida no Supabase (*Project Settings › Database › Reset database password*). Use a nova URI apenas no `.env.local`.
- **Backups**: mantenha backups automáticos ativos no projeto Supabase antes de executar scripts de dados.
- **Certificado**: a conexão do servidor verifica o certificado do PostgreSQL (`rejectUnauthorized: true`). Se o pooler usar uma CA própria (ex.: a do Supabase), informe o certificado em `DATABASE_SSL_CA`.
