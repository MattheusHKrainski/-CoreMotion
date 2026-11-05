# Diagnóstico do bloqueio de cadastro — 05/11/2026

## Verificações reais (somente leitura)

- Cadastro habilitado (`disable_signup=false`).
- Autenticação por e-mail habilitada (`external_email_enabled=true`).
- Confirmação obrigatória (`mailer_autoconfirm=false`).
- Sem SMTP próprio: host, porta, usuário e remetente não configurados.
- Limite de envio configurado: 2 e-mails por hora, compartilhado pelos fluxos que enviam e-mail.
- Trigger de criação de perfil presente e habilitada. Sua presença não comprova sozinha sucesso de todos os cadastros.
- A consulta agregada de contas não encontrou usuários com confirmação pendente no momento da verificação. Isso não comprova sucesso de uma tentativa individual.
- Os logs de auditoria de autenticação no Postgres estão desativados. Não foi feito teste de envio nem cadastro de conta de teste no projeto real.

O código `over_email_send_rate_limit` é devolvido pelo provedor. Mudar o texto da interface não remove a restrição. Além disso, o serviço SMTP padrão restringe destinatários à equipe do projeto; aguardar a janela de limite não habilita envio ao público em geral.

Fonte oficial consultada:
https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-smtp.mdx

## Correção necessária na infraestrutura

1. Escolher um provedor SMTP e configurar/verificar o remetente conforme as regras dele.
2. Em Supabase → Authentication → Email → SMTP Settings, configurar host, porta, usuário, senha e remetente. Inserir credenciais exclusivamente no painel seguro, nunca no chat ou no Git.
3. Manter confirmação de e-mail habilitada.
4. Em Authentication → Rate Limits, ajustar envio de e-mails à capacidade do provedor e volume esperado.
5. Validar com um endereço externo autorizado pelo responsável: cadastro, recebimento, link de confirmação, perfil persistido e login com senha correta; senha incorreta deve continuar recusada.
6. Validar também recuperação de senha e link de acesso administrativo, que dependem do mesmo serviço de envio.

Nenhuma configuração de autenticação foi alterada nesta investigação. O cadastro público segue dependente da configuração SMTP; não declarar o incidente resolvido antes da validação de ponta a ponta.
