# Expansão verificada CoreMotion — 22/11/2026

## Catálogo publicado no Supabase

- **448 ofertas existentes mantidas**, sem apagar produtos, alterações de vendedores ou referências anteriores.
- **400 ofertas novas e distintas** (IDs `curated-*`) importadas de páginas de produtos e APIs públicas oficiais de **Fila, Umbro, Mizuno e Olympikus**. A pesquisa também verificou Penalty, mas os SKUs desta faixa já existiam no catálogo e foram excluídos para não duplicar produtos.
- **848 ofertas ativas** com 848 URLs de produto distintas.
- Novidades: **220 calçados**, **141 peças de vestuário**, **35 acessórios**, **4 equipamentos**. O recorte evita expandir musculação e suplementos.
- Cada registro preserva nome real, descrição, foto principal do próprio produto, URL exata, preço anunciado no fornecedor na captura e variantes dos SKUs disponíveis na consulta.
- **396 de 400 novos itens** possuem 2 a 8 fotos do próprio produto. Outros 4 tinham apenas uma foto no fornecedor. **193 dos 448 itens existentes** receberam galeria com mais de uma foto, sempre exigindo correspondência exata da URL e da foto principal.
- **589 das 848 ofertas** contam com múltiplas fotos; outras preservam somente as imagens confirmadas. Fotos adicionais nunca são inventadas.
- A leitura do banco (visitante, administrador e supervisor) foi validada com **848 ofertas e 44 clubes**, respeitando RLS.
- Migrações: `20261122210506_verified_sportswear_catalog_01_of_08.sql` até `20261122210559_verified_sportswear_catalog_08_of_08.sql`, mais quatro lotes de atualização de galerias existentes.

## Clubes das ligas

Relação real de **44 clubes** organizada pela temporada: **Brasileirão Série A 2026 (20 clubes)**, **SuperLega italiana masculina 2026/27 (12 clubes)**, **SV.League japonesa masculina 2026/27 (12 clubes)**. URLs de referência institucional disponíveis em `public.catalog_teams`. Tabela com RLS de leitura pública, conectada ao Realtime. A loja tem um seletor com três ligas e todos os clubes.

Não há produtos fictícios criados para completar as 44 equipes: associações `external_offers.team_id` somente ligam anúncios que trazem nome de clube com identificação conferida. Atualmente as ofertas com clube associado representam Santos, Botafogo e Grêmio. Times sem oferta verificada podem ser selecionados, mas a vitrine informa que não há itens naquela seleção em vez de criar camisas inexistentes.

## Experiência inspirada nas referências do usuário

A página `/produto/core/{id}` usa galeria 2×2 com miniaturas e ampliador, cores/versões quando houver anúncios associados, preço anterior/desconto, tamanho em botões, compra, carrinho, descrição e consulta de CEP. Os tamanhos exibidos são opções da SKU consultada quando documentadas; as mensagens amarelas repetitivas sobre disponibilidade foram retiradas. O administrador e o supervisor podem inserir e editar até 12 fotos do mesmo produto via painel.

## Pagamento de teste e pedidos

Foi criada a RPC autenticada `simulate_core_sale_payment(uuid)`:
- exige sessão, perfil ativo e propriedade do pedido;
- realiza bloqueio transacional e não permite dupla aprovação;
- salva `payment_status='test_approved'` e registra um evento único no histórico;
- cancelar uma preparação aprovada muda o estado para `test_cancelled`;
- não chama sistemas financeiros externos nem registra cobrança bancária.

O checkout agora tem carrinho, endereço, revisão, confirmação do pagamento de teste, tela de sucesso e acompanhamento de pedidos. O Supabase é a fonte oficial dos valores e dos pedidos; o servidor calcula os preços em centavos. O frete não é inventado. Os dados de endereço do usuário não são divulgados no catálogo.

**Teste SQL:** pedido temporário criado via `prepare_core_sale`, confirmação de pagamento executada duas vezes, cancelamento e verificação final; `ROLLBACK` para não deixar pedidos de teste. Zero pedidos reais alterados. Testes unitários no GitHub cobrem as migrações e as telas.

## Limitações objetivas

Preços e disponibilidade foram capturados no fornecedor em 22/11/2026, não são sincronizados automaticamente com cada loja. A autenticação, publicação Realtime e CI foram verificados no código/Supabase; a entrega real do site publicado e um teste visual completo em dois navegadores dependem de acesso ao deployment. Não se oferece produto de uma equipe estrangeira sem página comprovada, mesmo que o clube esteja listado na plataforma.
