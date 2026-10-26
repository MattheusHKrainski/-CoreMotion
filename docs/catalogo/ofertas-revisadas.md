# Revisão de links e fotos — 25/10/2026

A curadoria anterior tinha buscas genéricas, kits sem correspondência e cupons sem confirmação. Foram mantidos oito produtos cujas páginas e fotos de galeria foram conferidas. Os demais foram retirados, não associados a produtos similares. As oito ofertas conferidas são da Decathlon; isso não implica parceria comercial.

As fotos usam o CDN original da loja, sem geração ou reconstrução. Não são fotos de exemplares usados de atletas. A disponibilidade das páginas e imagens pode mudar; falhas mostram uma indicação neutra, nunca outro produto.

Preços são referências da página consultada, não sincronização em tempo real. Não presumimos desconto PIX sem suas condições; não adicionamos cupons. A bola 8972765 é descrita pela loja como laranja, embora o slug contenha “azul”; título e foto seguem a variante apresentada na página.

## Produtos e proveniência

### Kimono Adulto de Jiu-Jitsu GI Outshock 500 Preto
- ID: offer-decathlon-bjj-8920531
- Página: https://www.decathlon.com.br/kimono-adulto-de-jiu-jitsu-brasileiro-500-preto-8920531-outshock/p
- Foto da galeria: https://decathlonpro.vtexassets.com/arquivos/ids/165327447/bjj-gi-500-v2-blue-a3-185-195cm-preta-a1-165-175cm1.jpg

### Tênis Adulto de Basquete Canaveral 900 Kipsta Preto
- ID: offer-decathlon-basquete-8826693
- Página: https://www.decathlon.com.br/tenis-masculino-de-basquete-canaveral-900-mid-preto-8826693-kipsta/p
- Foto da galeria: https://decathlonpro.vtexassets.com/arquivos/ids/178921311/packshot-codigo-modelo-8826693.jpg

### Corda Adulta de Pular de Treino Domyos Preta
- ID: offer-decathlon-corda-8639002
- Página: https://www.decathlon.com.br/corda-de-pular-de-treino-basica-8639002-domyos/p
- Foto da galeria: https://decathlonpro.vtexassets.com/arquivos/ids/43362978/--corda-100-pto-no-size1.jpg

### Conjunto de Tênis Adulto Essential Decathlon Preto
- ID: offer-decathlon-tenis-8808874
- Página: https://www.decathlon.com.br/conjunto-de-2-raquetes-de-tenis-essential-adulto-2-bolas-e-1-bolsa-preto-8808874-decathlon/p
- Foto da galeria: https://decathlonpro.vtexassets.com/arquivos/ids/170246474/packshot-codigo-modelo-8808874.jpg

### Mochila de Hidratação 8L Trail Running Kiprun Cinza
- ID: offer-decathlon-trail-8911457
- Página: https://www.decathlon.com.br/mochila-de-trail-running-8l-cinza-8911457-kiprun/p
- Foto da galeria: https://decathlonpro.vtexassets.com/arquivos/ids/170550376/packshot-codigo-modelo-8911457.jpg

### Bola de Vôlei VNL VB500 Tamanho 5 Kipsta Laranja
- ID: offer-decathlon-volei-8972765
- Página: https://www.decathlon.com.br/bola-de-volei-vnl-vb500-tamanho-5-azul-8972765-kipsta/p
- Foto da galeria: https://decathlonpro.vtexassets.com/arquivos/ids/174442237/bola-de-volei-kipsta-vnl-vb500-tamanho-5.jpg

### Kimono Adulto de Karatê 100 Outshock Branco
- ID: offer-decathlon-karate-8914337
- Página: https://www.decathlon.com.br/kimono-de-karate-100-branco-8914337-outshock/p
- Foto da galeria: https://decathlonpro.vtexassets.com/arquivos/ids/169563564/karate-100-adult-new-200-cm-branco-60cm1.jpg

### Chuteira Campo Umbro Ultimate
- ID: offer-decathlon-umbro-2145645567
- Página: https://www.decathlon.com.br/chuteira-campo-umbro-ultimate-2145645567/p
- Foto da galeria: https://decathlonpro.vtexassets.com/arquivos/ids/146863944/17190060914710.jpg


## Migração e prevenção

- LocalStorage: substitui IDs legados com a URL original, preservando destinos corrigidos e sem restaurar exclusões de uma curadoria atualizada.
- PostgreSQL: operação atômica na inicialização da tabela, retirando registros legados conhecidos sem autor administrativo e inserindo a nova curadoria sem sobrescrever conflitos. Destinos corrigidos e ofertas personalizadas são preservados.
- Cadastro/edição: recusa páginas iniciais, buscas e categorias conhecidas; aceita afiliados. Valida formato, não comprova a identidade do destino.
- Importação de metadados: verifica redirecionamentos e exige marcação de produto antes de importar título/foto. A conferência visual de modelo, cor e composição continua necessária.
- Fotografias de itens usados devem ser fornecidas pelo anunciante. Fotos comerciais não comprovam o estado do exemplar usado.
