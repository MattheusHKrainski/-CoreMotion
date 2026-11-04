# Login, acesso rápido e conectividade

## Admin real

O atalho Admin aponta para `mattheus.h.krainski@gmail.com`. O primeiro acesso
requer autenticação normal. Depois, o Supabase persiste e renova a sessão.
O atalho valida a identidade com `auth.getUser()` e lê o perfil confiável;
só retoma quando e-mail, identidade, papel admin e ausência de suspensão
forem confirmados. Nenhuma senha está embutida no código. Após logout,
revogação, perda da sessão ou limpeza dos dados do navegador, pede login.

## Três perfis rápidos

Atleta, Treinador e Casual usam identidades distintas e armazenamento local
separado por perfil (`coremotion_quick_v2_<perfil>_...`). Não são contas
inseridas no Supabase. O modo local funciona mesmo com variáveis públicas do
Supabase configuradas e modo local global desativado. Nesse acesso, o cliente
Supabase não é criado e chamadas protegidas são bloqueadas, preservando a
sessão da conta real para o retorno. Os perfis permitem explorar os recursos
locais disponíveis; não realizam pagamentos ou outras integrações externas.

## Autenticação real obrigatória

Formulários de login/cadastro nunca geram perfis locais, mesmo com modo local
ativo. Sem Supabase configurado, falham explicitamente. E-mail desconhecido ou
senha errada não iniciam sessão; isso também vale para a conta Admin. Estados
antigos do navegador não restauram identidades reais ou administrativas.
Apenas os três atalhos temporários podem restaurar sua própria identidade local.

O formato do e-mail é validado no formulário e no serviço: exige domínio
completo (Gmail, Hotmail, Outlook, outros provedores ou domínio próprio).
Isso não comprova a existência da caixa postal. A confirmação do endereço
continua obrigatória no Supabase antes do primeiro login de novas contas.
Não foram criadas contas reais durante os testes.

## Formulário

Sem botão Google. O seletor de perfis aparece só no cadastro; o link de entrada
usa “Cadastre-se”. Ambos os formulários têm botão de ver/ocultar senha. Login e cadastro compartilham um diálogo limitado à altura
da viewport dinâmica, com scroll interno contido. O fundo fica fixo enquanto
o diálogo está aberto; a posição e os estilos anteriores são restaurados ao
fechar. O botão de fechar permanece fora da área rolável.

## Conexão

- Chamadas Supabase são adiadas para fora do callback de alteração de sessão,
  evitando travamento ao restaurar autenticação.
- Falha de rede/5xx na sincronização SQL pode consultar o próprio perfil com
  RLS. 401/403 não são ignorados e privilégios não vêm de metadados do cliente.
- O catálogo pode usar a leitura Supabase com RLS se a API SQL falhar. Uma
  resposta vazia válida continua vazia, sem importar registros locais.
- Na verificação remota, Auth, REST e banco estavam saudáveis. Como visitante,
  a consulta retornou 14 ofertas e 26 anúncios. Não foi necessário alterar
  políticas, credenciais nem criar usuários no banco.
- Publicação requer as variáveis públicas de Supabase corretas. Rotas que
  usam SQL também precisam de DATABASE_URL no servidor. Chaves privilegiadas
  não devem usar prefixo NEXT_PUBLIC_. O login na produção não foi testado
  de ponta a ponta nesta alteração.

## Validação

83 testes unitários, checagem de tipos e build aprovados; lint sem erros.
18 verificações das rotas de API aprovadas. Teste de navegador em viewport
móvel confirmou scroll interno em login/cadastro, bloqueio/restauração do fundo,
ausência do Google e isolamento dos três perfis com catálogo e comunidade.
