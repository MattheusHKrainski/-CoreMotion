# Fotografias reais de usados — correspondência e proveniência (23/11/2026)

## Política editorial
O objetivo é exibir **fotografias reais de objetos usados**, sem afirmar que a imagem é do exemplar à venda. Nenhum registro sem `seller_id` é anúncio vendável; preço anterior (quando houver) é apenas referência histórica, não oferta atual.

## Substituições realizadas diretamente no Supabase

| ID preservado | Nome atualizado | Fotografia realmente retratada | Crédito | Licença |
|---|---|---|---|---|
| b1a824e3-c2e6-4051-8dc0-ed3052bc990f | Tênis Nike usado — modelo não identificado | par de tênis Nike usado, branco/preto e desgaste visível | Joxemai, [arquivo original](https://commons.wikimedia.org/wiki/File:Nike_used_shoes_01.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| e81a1d5d-c0ea-4928-a3c6-fc6159e84ad4 | Tênis adidas usado e desgastado — modelo não identificado | calçado adidas usado/deteriorado, modelo não documentado | Joxemai, [arquivo original](https://commons.wikimedia.org/wiki/File:Adidas_used_0001.JPG) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| a8227c26-8a3b-4b9e-811c-347598f56c36 | Tênis Avia usado — modelo não identificado | calçado Avia usado, modelo não documentado | Joxemai, [arquivo original](https://commons.wikimedia.org/wiki/File:Avia_used_shoes.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

As três galerias usam URL direta do Wikimedia Commons, com imagem de referência e `stock=0` (não vendáveis). Não foram inventados modelo, cor de lançamento, tamanho, vendedor ou estado individual de conservação. Fotografias não foram editadas. Não sugerimos que Joxemai endosse o CoreMotion.

## Pendência para os demais 23
Os outros registros ainda não possuem uma imagem de item **usado** com licença e correspondência individual verificadas. Mantê-los sinalizados como referência até identificar fotografia concreta, verificar marca e variante, e documentar autoria/licença; não reutilizar imagens de Enjoei/OLX/eBay sem licença ou consentimento.

O campo `seller_id` continua nulo nesses registros, portanto a interface e o carrinho devem tratá-los como referências editoriais e não produtos que o usuário possa adquirir. A separação de C2C verdadeiro e catálogo de inspiração deve ser mantida mesmo com imagens licenciadas.

## Regra para ativar uma venda real
Vendedor autenticado + fotos autorizadas do próprio exemplar, estado real e preço/estoque confirmado. Atualizar todas as informações em conjunto. O campo `image_is_reference=false` só pode representar fotos desse exemplar, não fotografias de outro indivíduo.
