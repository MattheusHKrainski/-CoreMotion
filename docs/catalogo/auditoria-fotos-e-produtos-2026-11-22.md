# Auditoria das fotos e dos anúncios do CoreMotion — 22/11/2026

## Escopo e evidências

Revisados **885 produtos CoreShop** e **26 anúncios C2C ativos** do Supabase, antes da próxima expansão do catálogo. Não foram criados novos SKUs nesta revisão.

A checagem automática de URL e `Content-Type`, executada no GitHub Actions ([resultado da auditoria](https://github.com/MattheusHKrainski/-CoreMotion/actions/runs/45079909303)), testou **3.738 fotos distintas**, incluindo as imagens das galerias e referências externas dos anúncios C2C: **3.725 retornaram imagens**, **nenhuma retornou 404/410**, e **13 retornaram HTTP 403** por CDN Shopify. HTTP 403 não comprova que a foto esteja quebrada no navegador do comprador; elas permanecem como **acesso não confirmado**, sem serem trocadas por fotografias de outro modelo. Os arquivos locais usados pelos 26 anúncios C2C estavam presentes no repositório.

## Modificações aplicadas no banco

- Recuperação na API pública dos próprios fabricantes **Vollo (165 anúncios)** e **Penalty (200 anúncios)**, com comparação da URL exata do produto e da **foto principal dentro da SKU exata** antes de selecionar as fotos adicionais. A verificação final consta na [auditoria de SKU](https://github.com/MattheusHKrainski/-CoreMotion/actions/runs/45080236614).
- Os **365 registros** ganharam descrições mais completas fornecidas pelos respectivos fabricantes e galerias coerentes com o item existente. As atualizações são condicionadas à correspondência com o estado anterior, para não sobrescrever edições posteriores feitas por um administrador.
- Quantidade de ofertas com **múltiplas fotografias verificadas: 624 antes → 809 depois**. O número total de ofertas permanece em **885**, sem exclusão nem repetição.
- Criada a função e o trigger `normalize_external_offer_gallery` para manter a capa como primeira foto, eliminar URLs repetidas e preservar as outras fotos quando uma capa for trocada. Restrição `external_offers_gallery_primary_check` exige que a galeria e a capa estejam consistentes. Testado com alterações em transação e `ROLLBACK`.
- Em C2C, duas listagens mantiveram as duas fotos do item, mas deixaram de apresentar uma terceira imagem de banco de imagens que não comprovava representar o produto. Uma imagem ASICS vinculada a uma listagem de tênis Nike foi retirada, e a listagem passa a sinalizar foto pendente, em vez de mostrar a marca errada.

## Modificações na aplicação

- O componente `ProductImage` tenta outras imagens **do mesmo produto** se uma fotografia falhar; o comportamento foi integrado ao cartão do CoreShop, ao modal, à página de produto e aos cartões C2C.
- Containers das fotos do CoreShop usam o tema escuro já definido pelo projeto. As imagens reais dos fornecedores não são recoloridas nem recortadas para simular outras versões.
- O seletor de variantes respeita as numerações reais cadastradas e usa a cadeia exata esperada pelo banco (`40`, não `Tamanho: 40`). A página de produto não oferece listas de tamanhos inventadas quando não houver dados confiáveis; nesses casos, apresenta acesso à loja para consultar.
- Compatibilização com o trabalho paralelo do PR #52: manter opções de produto, galeria e funcionalidades de login/comentários introduzidas naquele PR sem reverter os arquivos alterados por ele.

## Pontos a resolver antes de expandir mais 400 itens

- **76 ofertas** ainda têm apenas uma imagem válida/documentada na origem; não se deve preencher essa diferença com imagens de outros produtos.
- **13 URLs Shopify** retornaram HTTP 403 em verificação automatizada; exigem confirmação visual em navegador real ou URLs alternativas autenticadas pelo fornecedor.
- **16 ofertas de vestuário e calçados** não têm grade de tamanhos registrada; novas numerações só devem ser adicionadas após constarem nos dados dos fornecedores.
- **9 descrições** do catálogo ainda repetem exatamente o título. Elas não serão enriquecidas com propriedades técnicas inventadas.
- Anúncios C2C com fotos de referência precisam receber fotos do próprio anunciante para comprovação de condição e modelo.
- A publicação na Vercel depende de cota do projeto; passar CI não substitui verificar a implantação efetiva.

## Política de integridade

Nenhuma fotografia foi gerada ou inventada. As atualizações preservam os links do fornecedor, títulos, preços, ofertas de usuários, funções administrativas, políticas RLS e atualização em tempo real. Imagens com acesso bloqueado são tratadas como **não verificadas**, não como 404. Mais 400 produtos serão analisados somente após esta auditoria.
