# Cadastro e recuperação para apresentação do TCC

## Alterações autorizadas em 05/11/2026

- No projeto Supabase, `mailer_autoconfirm=true`: novos cadastros não exigem mensagem de confirmação. Isso não comprova a propriedade do endereço.
- A autenticação por senha continua obrigatória para contas reais; mínimo de 6 caracteres, inclusive na redefinição.
- Novos cadastros aceitam somente `gmail.com`, `hotmail.com` e `outlook.com`. A validação está no cliente e em uma trigger BEFORE INSERT de `auth.users`. Login e recuperação de contas existentes não ganharam essa restrição.
- Decisão atual do responsável: o atalho Admin mantém a conta oficial. Reutiliza a sessão salva após validar identidade e perfil administrativo no Supabase. Sem sessão válida, solicita login. O endereço antigo `?acesso-rapido=admin` redireciona para o acesso oficial, sem criar administrador local. Atleta, Treinador e Casual permanecem temporários e isolados.
- “Trocar conta” fica dentro do gerenciamento do perfil, junto aos controles de dados pessoais, e não mais no cartão lateral. A troca não encerra a sessão real salva no navegador.
- O diagnóstico anterior em `diagnostico-cadastro.md` descreve a configuração antes desta autorização. Seu requisito de confirmação obrigatória foi substituído por esta decisão para o TCC.

## Esqueci minha senha: opção sem domínio próprio

A recuperação continua usando o link seguro do Supabase. Conhecer apenas o endereço de e-mail não permite trocar a senha. Sem SMTP próprio, o envio ainda fica sujeito às restrições do provedor padrão; desligar confirmação de cadastro NÃO remove essas restrições da recuperação.

Uma opção é SMTP de uma conta Gmail, quando a conta disponibilizar Senhas de app:

1. Na conta Google que enviará as mensagens, ativar a verificação em duas etapas.
2. Gerar uma senha específica de app nas configurações de segurança. Se a opção não estiver disponível, verificar as restrições da conta ou usar outro provedor SMTP.
3. No painel seguro do Supabase → Authentication → Email → SMTP Settings, configurar:
   - Host: `smtp.gmail.com`
   - Porta: `587` (STARTTLS)
   - Usuário: endereço Gmail completo do remetente
   - Senha: a senha de app, não a senha normal da conta
   - Remetente: o mesmo endereço Gmail
   - Nome do remetente: CoreMotion
4. Revisar os limites de envio no Supabase e respeitar os limites da conta Google.
5. Testar recuperação com uma conta controlada pelo responsável, abrir o link no mesmo navegador e salvar a nova senha. Confirmar que a senha anterior foi recusada e a nova foi aceita.

Não enviar senha de app pelo chat nem adicionar credenciais ao repositório. Essas credenciais são inseridas exclusivamente no painel do Supabase.

SMTP não foi configurado por esta alteração e nenhum e-mail de teste foi enviado. A recuperação por e-mail não deve ser anunciada como validada até concluir essa etapa.
