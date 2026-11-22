# Perfil, gestão e exclusão de contas

## Interface
- A Central de Ofertas fica no painel compartilhado de administradores e supervisores, na aba **Central de Ofertas**. O perfil não renderiza mais a gestão do catálogo inteiro.
- No lugar da central, o perfil mostra anúncios com `seller_id` da conta e produtos do catálogo com `created_by` da conta. Produtos sem autor identificado não são atribuídos artificialmente a uma pessoa.
- Produtos pessoais aparecem em blocos de seis; a central mostra doze resultados inicialmente. **Mostrar mais** amplia a lista. Alterar busca/loja reinicia o limite da central.
- O cabeçalho abre o menu por um botão de três linhas à esquerda da marca C. A marca não é mais o acionador.

## Exclusão
A migração `20261122220000_account_content_cleanup.sql` foi aplicada ao projeto Supabase. Um gatilho BEFORE DELETE de profiles limpa os dados na mesma transação da exclusão. Vale para o RPC `moderate_account` e para a API de usuários, sem ampliar permissões de supervisores nem permitir excluir a própria conta.

Remove anúncios, ofertas de autoria identificada, lojas e produtos da loja, publicações, comentários embutidos, curtidas, seguidores, pedidos e eventos, registros esportivos e respostas relacionadas, atividades, tickets, notificações e histórico de autoria da conta. Os comentários restantes mantêm a ordem; os gatilhos de contagem existentes recalculam interações reais. Não há remoção retroativa de conteúdo cujo vínculo de autoria já havia sido perdido antes da migração.

## Arquivos e navegação — complemento
A exclusão pelo painel e pela API agora percorre as pastas de `user-media/<id>/`, lista todas as páginas antes de começar a apagar, e remove os arquivos pela API Storage em lotes de 100. A RLS permite isso apenas para administradores ativos excluindo outra conta. Não há chave privilegiada no cliente. A exclusão no banco é bloqueada enquanto houver objetos com proprietário ou prefixo da conta, inclusive em chamadas diretas ao RPC. Em caso de falha parcial, a conta permanece para permitir nova tentativa; arquivos já removidos não podem ser restaurados automaticamente. Arquivos legados fora do caminho padrão ou em outros buckets exigem limpeza operacional antes de excluir a conta. Não promete apagar cópias locais, caches externos nem recuperar autoria já perdida.

As abas Tudo/De Atletas/Ofertas foram retiradas. As duas seções do catálogo continuam distintas e paginadas, com **Mostrar mais**. Remover o filtro de clube restaura o catálogo completo. Os atalhos Black Friday/CoreShop/Comunidade do cabeçalho aparecem apenas para admin e supervisor; clientes mantêm acesso pelo menu. C volta à tela principal, botão de três linhas abre o menu.


## Verificações
- TypeScript e build aprovados.
- Lint: zero erros, 19 avisos.
- 200/201 testes unitários aprovados. O único teste restante é anterior ao ajuste e exige recursos ausentes de ProductPage (`image_urls`, `config.options.map`, `checkCep`); não foi enfraquecido para simular aprovação.
- Teste SQL transacional com duas contas sintéticas: remove conta, publicação, anúncio, oferta e curtida; remove comentário de autoria alvo, preserva comentário e publicação da outra conta e confere os contadores. ROLLBACK ao final, sem excluir contas reais.
- Página inicial HTTP 200 na prévia 3000.
- Testes de Storage com mocks: paginação, lotes, caminhos restritos, bloqueio a supervisor e a exclusão própria, falhas interrompem a exclusão.
- Guarda de Storage validada no banco com objeto e conta sintéticos e ROLLBACK. Não foi apagada mídia real para testar.
- Corrigidos também problemas de compilação já presentes na branch sincronizada: fechamento JSX de AuthModal, import de useCallback e referências ausentes da galeria ampliada.
