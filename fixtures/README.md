# Fixtures de demonstração

Dados inteiramente fictícios usados em modo de demonstração.

- Anúncios C2C, perfis, comunidade, treinadores e notícias só são carregados com `NEXT_PUBLIC_DEMO_MODE=true`.
- As ofertas B2C ficam separadas em `demo-offers.ts` e estão sempre marcadas como fixtures: lojas, endereços, links, preços e descontos são inventados. Os domínios `.example.test` não apontam para lojas reais; nenhum site é consultado ou aberto.
- Produtos B2C e perfis de loja em `initial-data.ts` são dados legados mantidos por compatibilidade. O aplicativo não os apresenta como anúncios, lojas oficiais ou perfis verificados.
- Qualquer nome de marca em conteúdo demonstrativo não indica parceria, autenticidade, procedência, garantia, estoque ou entrega. CNPJs que permaneçam em dados históricos são exemplos sem validação externa e não são exibidos como validados.
- Sem o modo demonstração, os anúncios C2C locais ficam vazios e o catálogo é consultado no banco; ofertas B2C continuam sendo apenas a vitrine local de demonstração até uma integração futura.

Para ver anúncios C2C de demonstração localmente, configure `NEXT_PUBLIC_DEMO_MODE=true` em `.env.local`. Não use dados de fixture para anunciar produtos ou representar lojas reais.
