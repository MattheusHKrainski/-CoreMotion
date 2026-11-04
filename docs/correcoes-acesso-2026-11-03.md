# Ofertas, formulários e acessos rápidos — 03/11/2026

## Ofertas públicas

A falha foi reproduzida como `anon`: `permission denied for function is_staff`.
A política de SELECT de `external_offers` atendia `anon` e `authenticated`,
mas chamava `is_staff()`, cuja execução está corretamente restrita a usuários autenticados.

A migração `20261103180000_fix_public_offers_read_policy.sql`, também aplicada
no projeto conectado, separa as políticas: visitantes leem apenas ofertas ativas;
autenticados leem ofertas ativas ou as permitidas ao staff. Não foram concedidas
novas permissões de escrita nem acesso anônimo às funções administrativas.
Após a correção, consulta como `anon` retornou 14 ofertas, zero inativas.

## Login e cadastro

O diálogo possui altura máxima baseada na viewport dinâmica (`100dvh`) e área
interna com rolagem contida. O hook `useDialogScrollLock` bloqueia o fundo,
preserva os estilos anteriores e restaura a posição da página ao fechar.
O botão de fechar fica fora da região rolável. O mesmo comportamento atende
login, cadastro e recuperação.

## Quatro acessos rápidos

- Admin: mesma conta real do Supabase; reutiliza sessão validada e pede login
  quando não há sessão válida. Não existe senha embutida ou entrada pública
  administrativa.
- Atleta, Treinador e Casual: identidades prontas, cada uma em namespace local
  próprio. Catálogo, publicações, perfil, favoritos e recursos esportivos
  respeitam as capacidades do tipo de conta. Casual não acessa recrutamento.
- O modo local é ativado para esses acessos mesmo quando o site está conectado
  ao Supabase e `NEXT_PUBLIC_DEMO_MODE=false`. Nenhum cliente Supabase é criado
  e chamadas autenticadas permanecem bloqueadas durante a sessão temporária.
- As alterações desses três perfis não são inseridas no banco real. Pagamentos,
  entrega e contato externo não se tornam integrações reais por usar esse acesso.

## Validação

69 testes unitários, checagem de tipos e build aprovados. Lint sem erros, com
15 avisos preexistentes. Teste de navegador em viewport móvel verificou rolagem
interna de login/cadastro, bloqueio e restauração do fundo, quatro atalhos e
identidades/dados separados dos três perfis temporários. Testes de serviço
verificaram leitura de catálogo, criação local de anúncio, curtida e comentário
sem requisições de rede mesmo com variáveis públicas do Supabase configuradas.

A política do banco já está corrigida remotamente. As mudanças de interface
exigem publicação do código no Vercel.
