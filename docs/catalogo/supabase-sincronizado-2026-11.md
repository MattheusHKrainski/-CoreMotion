# Sincronização Supabase — 03/11/2026

Projeto conectado: **CoreMotion** (`erpwfjdycdlygxwkdakv`).

## Resultado confirmado no banco remoto

- 24 itens do catálogo de atletas adicionados, com UUID gerado pelo banco e `catalog_key` único para identificar a origem.
- Os dois anúncios que já existiam foram preservados sem alteração: total de **26 produtos**.
- **14 ofertas externas** inseridas, com links diretos, imagens e preços do catálogo revisado.
- Os 24 itens adicionados têm contato autorizado `5541988918146` e imagens explicitamente marcadas como referências.
- Nenhuma conta, pedido, anúncio anterior, curtida ou registro esportivo foi excluído ou substituído. Não foram criadas contas falsas para representar os vendedores: os itens do catálogo têm vendedor nominal e contato, mas não foram atribuídos a uma conta real.

Migrações executadas pelo conector:
- `sync_athlete_catalog_20261103` — cópia reproduzível em `supabase/migrations/20261103150000_sync_athlete_catalog.sql`.
- `sync_external_offers_20261103` — cópia reproduzível em `supabase/migrations/20261103150100_sync_external_offers.sql`.

As inserções usam chave única e `ON CONFLICT DO NOTHING`; reaplicar não duplica nem sobrescreve edições. As colunas `catalog_key`, `image_is_reference` e `usage_time` foram adicionadas apenas se ausentes.

## Aplicação

Quando configurada com Supabase, a vitrine passa a respeitar o conteúdo do banco, inclusive resultados vazios e anúncios antigos. Removido o filtro por data que escondia os dois anúncios anteriores e a sobreposição dos seeds locais sobre anúncios reais. Ofertas são lidas pelo cliente Supabase com RLS. Anúncios podem ser lidos pelo Supabase REST se a API SQL estiver indisponível. O tipo da conta, a identificação de foto de referência e o tempo de uso são preservados pelo mapeamento da API.

Leituras públicas não voltam a semear ofertas automaticamente. O mecanismo anterior continua disponível como operação de manutenção explícita, não como efeito de consultar o catálogo.

Acessos temporários continuam locais e isolados, sem token ou permissão no banco. O conteúdo do preview nesses acessos não representa uma sessão autenticada no projeto remoto. As rotas de escrita existentes continuam exigindo autenticação e a configuração SQL do servidor; não foram expostas credenciais ou removidas permissões.

## Publicação

O banco remoto já recebeu os dados. As alterações da aplicação ainda precisam de publicação/deploy para mudar o comportamento do site hospedado. As imagens com caminho `/products/` e `/c2c/` são servidas pelo próprio aplicativo, não por um bucket novo do Supabase.
