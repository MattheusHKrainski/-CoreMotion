# Banco de dados do CoreMotiom

Este documento descreve o PostgreSQL/Supabase usado pelo aplicativo, suas migrações, regras de acesso e testes. A versão atual mantém o esquema histórico de lojas para compatibilidade, mas retirou os perfis de loja da experiência pública. A vitrine de ofertas externas usa `public.external_offers`; anúncios de equipamentos entre usuários e o checkout interno aceitam apenas C2C. Fixtures de demonstração permanecem separadas dos registros persistidos.

## 1. Ordem de execução

Aplique as migrações **nesta ordem** pelo SQL Editor do Supabase ou com `psql`:

1. [`20250101000000_coremotiom_initial_schema.sql`](../supabase/migrations/20250101000000_coremotiom_initial_schema.sql) — esquema inicial e tabelas.
2. [`20261008000000_roles_hierarchy_and_security.sql`](../supabase/migrations/20261008000000_roles_hierarchy_and_security.sql) — hierarquia de papéis, RLS e privilégios.
3. [`20261009000000_security_fixes.sql`](../supabase/migrations/20261009000000_security_fixes.sql) — correções incrementais para produtos, pedidos e comunidade.
4. [`20261020000000_retire_store_b2c_marketplace.sql`](../supabase/migrations/20261020000000_retire_store_b2c_marketplace.sql) — desativa as rotas públicas de loja e a publicação/compra de produtos B2C.
5. [`20261023000000_external_offers_management.sql`](../supabase/migrations/20261023000000_external_offers_management.sql) — tabela e políticas para ofertas externas gerenciadas.
6. [`20261023130000_sports_recruitment.sql`](../supabase/migrations/20261023130000_sports_recruitment.sql) — perfis esportivos, seletivas, candidaturas e convites.
7. [`20261026160000_seller_contact_and_unique_likes.sql`](../supabase/migrations/20261026160000_seller_contact_and_unique_likes.sql) — contato de anúncios C2C, curtidas únicas e modalidade do cadastro.

A lista acima descreve a ordem dos arquivos no repositório, não confirma quais foram aplicados ao projeto remoto. As migrações 5–7 precisam ser verificadas no histórico/estado real antes de qualquer aplicação. As migrações existentes não foram reescritas. A última migração é idempotente e **não apaga nem transforma registros legados**: mantém tabelas, CNPJs, campos, referências e produtos B2C antigos, mas revoga o acesso REST a `stores`, oculta anúncios B2C e impede novas publicações B2C e pedidos que os incluam.

## 2. Modelo de dados

| Tabela | Uso atual | Observações |
|---|---|---|
| `profiles` | Perfil de cada conta; `id` referencia `auth.users` | `role`, suspensão, cidade, UF e interesses. `store_id` permanece como campo legado. |
| `stores` | Dados históricos de perfis de loja | Tabela e dados preservados. Não há criação, diretório ou revisão de lojas na aplicação, e `anon`/`authenticated` não têm acesso REST. |
| `products` | Anúncios entre atletas (C2C) | `product_type`, `store_id`, `store_name` e selo antigo continuam no esquema para compatibilidade. A aplicação só lê/escreve C2C. |
| `orders` | Pedidos demonstrativos | `items` é JSONB; triggers recalculam totais e recusam qualquer item que não seja C2C. Pagamento e envio continuam simulados. |
| `community_posts` | Publicações, curtidas, comentários e denúncias | Mantém as políticas de autor e moderação. |

`profiles.role` aceita os papéis históricos `admin`, `supervisor`, `seller` e `user`. O papel `seller` continua válido para contas existentes, mas na aplicação equivale a um anunciante C2C — não concede acesso a lojas nem permite publicar B2C. Visitante não é gravado no banco.

Os campos e as linhas antigos de B2C não devem ser apresentados como ofertas reais, anúncios compráveis, lojas oficiais ou entidades verificadas. As ofertas B2C do aplicativo ficam separadas em `fixtures/demo-offers.ts` e são explicitamente fictícias.

## 3. Funções e triggers de segurança

As funções de autorização usam `SECURITY DEFINER` com `search_path` fixo. Entre elas: `public.is_master_email`, `public.is_admin`, `public.is_staff`, `public.current_user_role` e `public.is_banned_user`.

| Trigger | Tabela | Regra relevante |
|---|---|---|
| `on_auth_user_created` | `auth.users` | Cria perfil como `user`, exceto contas-mestre que recebem `admin`. |
| `profiles_protect_columns` | `profiles` | Protege papel, suspensão, motivo de suspensão e e-mail. |
| `stores_protect_columns` | `stores` | Regra histórica de verificação; a tabela não está acessível pelos papéis REST. |
| `products_protect_columns` | `products` | Protege autoria, métricas e status de moderação. |
| `products_reject_new_b2c` | `products` | Rejeita inserção B2C e mudança de C2C para B2C; registros antigos permanecem. |
| `orders_compute_totals` | `orders` | Recalcula preço, frete, desconto PIX e total a partir dos produtos. |
| `orders_z_c2c_only_items` | `orders` | Recusa pedidos novos/alterações de itens que incluam produto não C2C. |
| `community_protect_columns` | `community_posts` | Protege autoria, conteúdo, curtidas, comentários e denúncias. |

Os triggers de aplicação continuam sendo complementados pelas políticas RLS. A conexão de servidor via `DATABASE_URL` tem privilégios próprios e não herda o JWT do usuário; as rotas que a usam validam sessão, papel e corpo da requisição antes de executar consultas.

## 4. Políticas RLS e privilégios

RLS permanece habilitada nas tabelas do aplicativo. As regras relevantes depois da migração de aposentadoria são:

| Tabela | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| `profiles` | Próprio perfil ou staff | Próprio perfil/staff conforme as políticas; papel e suspensão protegidos por trigger. |
| `stores` | Sem privilégio REST para `anon` ou `authenticated` | Sem privilégio REST para `anon` ou `authenticated`; acesso de administração do banco permanece separado. |
| `products` | Somente C2C ativo, próprio ou visível ao staff | Somente C2C; inserção exige usuário ativo ou admin, alterações/exclusões seguem dono e staff. |
| `orders` | Comprador ou staff | Comprador não suspenso/admin; status financeiro e total são protegidos/recalculados. O trigger rejeita itens B2C legados. |
| `community_posts` | Público | Autor ativo ou staff conforme a operação e as colunas protegidas. |

A migração `20261020000000` revoga todos os privilégios de tabela de `stores` para `anon` e `authenticated`. A leitura pública de `products` continua disponível para C2C ativo, e a comunidade mantém suas políticas existentes. `TRUNCATE` não é concedido — RLS não controla essa operação.

## 5. Rotas e serviços da aplicação

As rotas mantidas são `app/api/auth/sync`, `app/api/products` e `app/api/users`. Não há rota de lojas ou revisão de CNPJ. `GET /api/products` força `product_type=c2c`, `POST` aceita somente C2C e `PATCH`/`DELETE` não expõem linhas B2C legadas. `ProductService` e `OrderService` repetem os bloqueios no cliente de aplicação; RLS e triggers também os aplicam no banco.

O checkout permanece demonstrativo: a migração bloqueia itens B2C, mas nenhum gateway, pagamento, transportadora ou envio real é integrado.

## 6. Scripts auxiliares

- `scripts/seed-all-products.mjs` contém anúncios C2C demonstrativos. Use apenas em banco local/de teste, depois de revisar o script e confirmar o ambiente.
- Os antigos seeds de lojas oficiais e catálogo B2C foram removidos porque o fluxo de lojas foi aposentado e alguns scripts substituíam dados de produtos de forma destrutiva.
- `scripts/update-product-images.mjs` altera imagens de registros existentes; revise antes de executar.
- `scripts/inspect-db.mjs` é somente leitura; `scripts/smoke-api.sh` testa sessão nas rotas sem depender do banco.
- `database/legacy/` contém utilitários antigos mantidos apenas como referência.

## 7. Testes

Os testes em `database/tests/` usam PGlite e dados temporários para verificar políticas, regras de negócio e migrações específicas. Confira os arquivos de teste para saber quais migrações cada suíte executa; isso não garante que todas as migrações do repositório tenham sido validadas em conjunto.

```bash
npm run test:db
```

PGlite não substitui uma verificação no projeto Supabase real. A execução automatizada usa dados temporários e não conecta nem altera uma base externa. Antes de aplicar uma migração num projeto configurado, faça backup e confirme o ambiente.
