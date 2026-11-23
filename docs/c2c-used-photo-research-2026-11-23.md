# Auditoria fotográfica dos 26 anúncios C2C — 23/11/2026

## Critério aplicado
A consulta externa localiza **fotos reais de exemplares usados**, mas nenhuma delas representa automaticamente o item anunciado no CoreMotion. Anúncios no Enjoei, OLX, eBay e Mercado Livre não concedem licença presumida para reutilização. Fotografias com licença aberta só podem ser reutilizadas se o modelo/variante exibidos estiverem corretos e os créditos exigidos forem preservados.

**Situação do banco:** os 26 produtos C2C estão marcados com `image_is_reference = true`, sem um vendedor autenticado identificado em `seller_id`. Não converter essas referências em `false` sem fotos do próprio exemplar e procedência comprovada.

## Referências reais de produtos usados encontradas

| Produto no CoreMotion | Exemplo externo para revisão manual | Observação | Status de uso |
| --- | --- | --- | --- |
| ASICS GEL-NIMBUS 26 | https://www.ebay.com/itm/167059682540 | Exemplar usado, cor e gênero possivelmente diferentes | Pesquisa apenas, não autorizado |
| Nike Pegasus 40 | https://www.enjoei.com.br/p/tenis-nike-pegasus-40-tamanho-41-108224993 | Fotografia real de outro vendedor, cor preta | Pesquisa apenas, não autorizado |
| Garmin Forerunner 255 | https://www.enjoei.com.br/p/relogio-garmin-forerunner-255-130768782 | Exemplar de terceiros | Pesquisa apenas, não autorizado |
| adidas Ultraboost Light | https://www.enjoei.com.br/p/tenis-adidas-ultraboost-light-38-153274906 | Item usado e tamanho 38; comparar variantes | Pesquisa apenas, não autorizado |
| Luvas Everlast 14 oz | https://www.olx.com.br/anuncios/luvas-de-boxe-everlast | Resultados com unidades usadas, modelo ainda não verificado | Pesquisa apenas, não autorizado |
| Wilson NBA DRV | https://www.olx.com.br/anuncios/bola-wilson | Resultados com DRV, incluindo outras cores | Pesquisa apenas, não autorizado |
| Raqueteira Wilson | https://www.olx.com.br/anuncios/raqueteiras-wilson | Linhas e tamanhos variados | Pesquisa apenas, não autorizado |
| Regata Lakers | https://www.enjoei.com.br/regata-nba-nike/s?q=regata+nba+nike | Número, fabricante e edição diferentes | Pesquisa apenas, não autorizado |

### Fonte com licença aberta
https://commons.wikimedia.org/wiki/File:GarminForerunner255MusicWhitestone.jpg — fotografia real, autor Tomek7000, CC BY-SA 4.0. **Não** colocar na galeria do anúncio como se fosse o Garmin preto: a fotografia mostra a variante Music Whitestone. Pode servir como referência editorial separada com atribuição explícita e informação de variante.

## Organização do catálogo
- **Imagens do próprio exemplar:** futuramente registrar `image_is_reference=false` apenas quando o vendedor enviar fotos verificadas do item anunciado.
- **Fotos de catálogo ou arquivo:** manter `image_is_reference=true`, com aviso claro e sem inventar ângulo, desgaste, estado ou tempo de uso.
- **Modelo não confirmado:** não alterar nomes apenas por `catalog_key`; a chave de seed não é prova de fabricante/modelo.
- **Fotos de outro marketplace:** não copiar, fazer hotlink nem publicar como imagens próprias sem permissão e correspondência do item.
- **Fotografias que deveriam acompanhar o anúncio:** vista frontal, lateral, traseira e, quando aplicável, etiqueta/numeração, solado e sinais de desgaste; pedir o conjunto ao vendedor real.
- **Sem vendedor verificado:** apresentar como vitrine de referência, não como produto de outra pessoa disponível para contato direto.

## Pendência editorial
As fotos de outros vendedores **não foram incorporadas ao banco**. Devem ser consideradas candidatas somente após autorização de reprodução, confirmação de variante e atribuição adequada. Os IDs, preços, quantidades e galerias atuais foram preservados.
