# Auditoria e consolidação do Supabase — 22/11/2026

## Banco auditado
Projeto: **CoreMotion** (`erpwfjdycdlygxwkdakv`).
A revisão tratou diretamente o PostgreSQL do Supabase e registrou todas as mudanças em migrações versionadas.

## Integridade verificada
| Métrica | Resultado após as alterações |
| --- | ---: |
| Tabelas da aplicação no esquema `public` | 32 (todas com RLS) |
| Contas ativas no Auth | 9 |
| Perfis na aplicação | 9 |
| Ofertas externas | 448 |
| Anúncios C2C | 26 |
| Pedidos de venda direta | 0 (não criar pedidos artificiais) |
| Inconsistências conta ↔ perfil | 0 |
| Produtos sem URL de imagem ou preço positivo | 0 |

Testou-se a criação de identidade sintética em `auth.users` **dentro de subtransação revertida**: o trigger gerou um perfil vinculado, com `role=user`, sem deixar contas de teste. Testaram-se também chamadas RPC sob `ROLE authenticated` sem sessão: nenhuma elevou privilégios ou preparou pedido.

## Migrações desta auditoria

1. `20261122200203_coremotion_database_access_hardening.sql`
   - Políticas de escrita administrativa `coaches` / `news` separadas de leitura pública;
   - remoção da política de leitura redundante de curtidas;
   - guardas de exclusão/alteração para identidades administrativas principais em `moderate_account`;
   - revogação de execução de funções de trigger via API;
   - remoção da função legada de autoconfirmação de e-mail, sem trigger ativo;
   - acesso ao ledger interno de importação explicitamente restrito.
2. `20261122200319_coremotion_database_query_performance.sql`
   - 15 políticas RLS otimizadas para avaliação eficiente do usuário da sessão;
   - 20 índices para relacionamentos com chaves estrangeiras;
   - remoção de índice redundante de e-mail (a constraint `users_email_key` foi preservada);
   - índice parcial para a listagem de ofertas ativas.
3. `20261122200426_coremotion_private_legacy_tables_and_sports_rpc.sql`
   - 11 tabelas legadas/internas, antes sem política, agora com política explícita **deny-all** para visitantes/usuários comuns;
   - RPCs de autorização esportiva deixam de ser executáveis anonimamente; continuam disponíveis para usuários autenticados.
4. `20261122200519_coremotion_definer_search_path_hardening.sql`
   - `search_path` restrito a `pg_catalog` em cinco funções privilegiadas com referências a tabelas devidamente qualificadas.

## Alertas após implementação
- Advisor de **saúde**: sem alertas.
- Advisor de **desempenho**: sem problemas de FK sem índice, políticas RLS recalculadas por linha, políticas permissivas sobrepostas ou índices duplicados. Registros informativos de índices ainda sem uso são esperados em um banco pequeno e recém-indexado; não excluir índices úteis apenas por essa informação.
- Advisor de **segurança**: as RPCs `SECURITY DEFINER` que precisam ser chamadas por contas autenticadas continuam sinalizadas genericamente. Seu controle de autorização deve ser mantido e testado sempre que a função mudar.
- **Configuração de proteção contra senhas vazadas**: aviso do Supabase Auth depende de alteração nas configurações do serviço (não é alterada por migração SQL).

## Limites da verificação
Os testes de permissões não substituem testes completos de navegador, login Google real, cobrança nem despachos. As ofertas são referências comerciais com preços e disponibilidade que devem ser revalidados junto aos fornecedores. Não alterar dados de usuários sem necessidade e não reabrir políticas legadas por conveniência.
