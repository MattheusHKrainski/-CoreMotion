# Opções de produto, fotos reais, comentários e acesso em página

## Alterações
- Seletores em botões para cor/tamanho e variante, com estado selecionado e variante composta no carrinho. Não há indicação falsa de estoque. Produtos sem grade conferida recebem grade de referência explicitamente identificada ou campo para solicitar uma especificação.
- Galeria responsiva: grade de vistas no desktop e foto selecionada com miniaturas no celular. Não são gerados ângulos nem reaproveitadas fotos de produtos similares. Anúncios de atletas mantêm as fotos do próprio anúncio.
- `/entrar`: página real para login, cadastro, recuperação e troca de conta. Não usa overlay/role dialog/bloqueio de scroll. Mantém contas salvas, consentimento desmarcado, validação real e retorno local seguro. Cancelar a troca não encerra a conta. No retorno à raiz, a view anterior é restaurada.
- Comentários consultados novamente ao expandir, com carregamento, erro, estado vazio e atualização. Resposta só é limpa após confirmação de gravação. Uma retentativa do mesmo texto usa a mesma chave idempotente.

## Fontes de imagens e opções
Conferência das páginas em 2026-10-22, sem alterar preço ou presumir estoque ao vivo:

| Produto | Fonte | Galeria / opções conferidas |
|---|---|---|
| Penalty VP 5000 amarelo/roxo | https://www.centauro.com.br/bola-de-volei-penalty-vp-5000-946720.html | Fotos 94672020A5, A1, A2, A3 do produto principal. Cor e tamanho único também correspondem à referência enviada pelo usuário. Não foram usadas as fotos de produtos similares. |
| Chuteira Campo Umbro Ultimate | https://www.decathlon.com.br/chuteira-campo-umbro-ultimate-2145645567/p | 8 fotos da galeria principal, IDs 146398870, 146398871, 146398878, 146398868, 146398877, 146398867, 146398874, 146398869. Tamanho explicitamente retornado: 42; nenhum outro tamanho anunciado como disponível. |
| Olympikus Corre Max cinza | https://www.olympikus.com.br/tenis-olympikus-corre-max-43758365-3-016/p | 5 fotos 292744–292748; página lista 34–44 e cor Cinza. Opções listadas não significam estoque confirmado. |
| Olympikus Estilo 2 verde | https://www.olympikus.com.br/tenis-olympikus-estilo-2-unissex-43359278-3-834/p | 5 fotos 281992–281996; página lista 34–44 e cor Verde. Não usamos as miniaturas de outras cores como se fossem vistas desta cor. |
| Kimono Outshock 500 preto | https://www.decathlon.com.br/kimono-adulto-de-jiu-jitsu-brasileiro-500-preto-8920531-outshock/p | 6 fotos 165327447–165327452. Cor preto e variante A1 165–175 cm retornadas na página. O filename menciona blue, mas a página e a variante são Preto; imagens conferidas pela associação à galeria do SKU, não por inferência do filename. |

Os dados estão em `lib/product-presentation.ts`. Se a referência do fornecedor for alterada para outro modelo, não se aplica automaticamente a galeria do ID antigo. Nos demais produtos preservam-se apenas as imagens já cadastradas, até existir confirmação de outras fotos do modelo exato. URLs são das lojas; disponibilidade de CDN pode variar no navegador/ambiente.

## Correção no Supabase
Migrações **já aplicadas** a `erpwfjdycdlygxwkdakv`:
- `atomic_community_comments` (arquivo `20261106060000_atomic_community_comments.sql`)
- `reconcile_community_comment_counts` (arquivo `20261106061000_reconcile_community_comment_counts.sql`)

Diagnóstico: o UPDATE de publicações era permitido só ao autor/equipe, mas o cliente tentava usar esse mesmo caminho para comentar. Havia também contadores históricos 18 e 12, enquanto os arrays continham 1 e 0 comentários. Os contadores foram corrigidos para a quantidade realmente armazenada; não há recuperação de comentários que nunca estiveram gravados nesses arrays.

A nova RPC autentica a conta, deriva autor/avatar do perfil, bloqueia contas suspensas, limita o conteúdo a 2000 caracteres e serializa o append por publicação. Retentativas não duplicam a mesma chave. A escrita direta nas colunas de comentários foi revogada. Comentários existentes são preservados.

Teste transacional remoto: comentar sem ser dono, autoria correta, incremento real, idempotência, rejeição de comentário vazio e permissões de escrita direta/anon. Tudo passou e foi revertido por rollback, sem comentários de teste persistidos.

## Validação
- Testes unitários de galerias/fontes, retorno seguro de autenticação, contagens e contratos da RPC.
- Navegador desktop e celular com backend simulado: seleção real de variante, 8 fotos no produto Umbro, login por página sem dialog e retorno ao checkout, cancelar troca preservando conta, abrir comentário já salvo, envio falho preservando rascunho e novo comentário reaparecendo ao reabrir.
- Testes de navegador não confirmam disponibilidade dos CDNs, estoque ou envio dos fornecedores. Pagamentos e logística continuam desativados.
