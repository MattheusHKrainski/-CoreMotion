# Conta administrativa real e acesso rápido

Em 03/11/2026, foi identificada uma conta **já existente e confirmada pelo Google** para o e-mail solicitado `mattheus.h.krainski@gmail.com`. Não foi criada uma conta duplicada.

No projeto conectado CoreMotion:
- A conta recebeu `role = admin` e foi incluída na função `is_master_email`, mantendo as demais contas-mestre.
- Foi configurado acesso por senha do CoreMotion, além da identidade Google existente. A senha Google não foi consultada nem modificada.
- A senha inicial foi gerada pelo banco com bytes aleatórios e armazenada como hash bcrypt. A senha em texto não está neste documento, no aplicativo, no repositório ou na migração; foi entregue somente ao solicitante.
- Cadastro por e-mail continua habilitado e exige confirmação de endereço para novas contas.
- A URL principal e os redirecionamentos de confirmação/recuperação foram ajustados para `https://core-motion-siyz.vercel.app`.

## Atalhos

O botão **Admin** do acesso rápido retoma a mesma conta real se o navegador já tiver uma sessão válida. O usuário é validado pelo Supabase Auth (`getUser`) e o perfil confiável precisa corresponder à identidade, ao e-mail Admin e ao papel administrativo, sem suspensão. Sem sessão válida, abre o formulário com e-mail preenchido e senha vazia. Não contém senha embutida nem concede acesso a visitantes. Links antigos `?acesso-rapido=admin` redirecionam para `?login=admin`, sem criar uma sessão administrativa local.

Atleta, Treinador e Casual continuam com sessões temporárias isoladas. Nenhum desses perfis foi inserido no Supabase.

## Cadastro e login

O formulário não exibe botão Google nem o texto de criação automática de perfil. A identidade Google preexistente da conta é preservada.

A sessão é persistida no navegador e renovada pelo Supabase. Fechar e reabrir o site não exige outra senha enquanto essa sessão puder ser validada/renovada. Sair da conta, limpar os dados do navegador ou perder a sessão exige novo login. Em dispositivos compartilhados, use **Sair** ao terminar. O atalho não grava senhas nem usa um perfil temporário como administrador real.

O login usa Supabase Auth. Em falha da API SQL por erro de rede/servidor, a leitura do perfil pode usar o próprio Supabase com RLS; os papéis vêm do registro confiável em `profiles`, não de metadados controlados pelo cliente. Respostas 401/403 não acionam esse caminho. Contas suspensas são recusadas.

A recuperação agora chama `resetPasswordForEmail` de verdade e encaminha para `/auth/reset-password`, onde é possível definir a nova senha. A página exige sessão válida, não cria um token e encerra a sessão após a troca. Use o fluxo **Esqueci minha senha** para substituir a senha inicial.

## Publicação e validação

As alterações de permissões/credencial e URLs já foram aplicadas ao Supabase. A mudança dos botões e a nova tela de redefinição precisam de publicação do código. O site publicado deve ter `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e, para rotas administrativas SQL, a configuração de banco do servidor. Nenhuma chave privilegiada deve usar prefixo `NEXT_PUBLIC_`.

O estado da conta (admin, e-mail confirmado, senha configurada, identidades Google/e-mail) foi conferido no banco. Isso não equivale a um teste de login de ponta a ponta no site publicado.
