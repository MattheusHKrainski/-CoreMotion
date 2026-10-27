# Modalidades, contato e curtidas únicas

## Alterações
- Atleta e Treinador escolhem a modalidade principal no cadastro. É enviada ao Auth como `sport`, sincronizada em `profiles.sport_interests` e destacada na área da conta. O editor de currículo usa essa modalidade como valor inicial; publicar currículo continua sendo uma ação explícita.
- O seletor pesquisável de modalidades usa sugestões nativas do navegador, aceita novas modalidades e reaproveita os esportes presentes nos dados. Filtros de Marketplace, treinadores, seletivas e banco de atletas aceitam buscas parciais sem depender de acentos.
- Treinadores têm busca por nome/cidade/especialidade, modalidade pesquisável, ordenação do catálogo e limpeza dos filtros. Os perfis publicados pela comunidade permanecem separados do catálogo.
- Novos anúncios exigem WhatsApp com DDD. O número é público, conforme aviso no formulário. O detalhe do produto permite conversar diretamente com o anunciante pelo WhatsApp sobre condição, preço, pagamento e entrega. Anúncios antigos sem contato não recebem números inventados.
- Curtidas são alternáveis: uma por conta/publicação. A interface recupera o estado salvo e previne solicitações simultâneas. Perfis temporários continuam isolados. No banco, uma chave primária composta e RPC idempotente impedem curtidas duplicadas; contador não pode ser incrementado diretamente pelo cliente.

## Implantação necessária

Antes de disponibilizar esta versão em produção, aplicar a migração:
`supabase/migrations/20261026160000_seller_contact_and_unique_likes.sql`

Ela cria a coluna de contato, exige telefone em novos anúncios, cria `community_likes`, o RPC `set_community_like`, permissões e o gatilho que preserva a modalidade no cadastro. **Esta migração não foi aplicada a nenhum banco remoto nesta tarefa.** Sem ela, curtidas autenticadas não funcionarão e a criação de produtos com a nova coluna falhará; a interface informa falhas em vez de confirmar gravações inexistentes.

As contagens históricas de curtidas são preservadas, pois não há identidade disponível para migrá-las. Novas publicações começam em zero e cada nova conta só pode adicionar uma curtida por publicação. Registros temporários anteriores não são transportados entre perfis.

## Validação
- `npm run test:unit`
- `npm run test:db` (inclui novo teste de RLS, RPC, duplicidade, conta banida, modalidade do cadastro e telefone obrigatório)
- `npm run type-check`, `npm run lint`, `npm run build`
- Navegador: seleção condicional no cadastro, curtir/descurtir sem acumular, telefone no formulário e filtros de treinadores/seletivas.
