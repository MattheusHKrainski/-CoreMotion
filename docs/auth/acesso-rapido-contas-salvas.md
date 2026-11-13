# Acesso rápido com contas reais

O seletor de contas substitui os quatro perfis temporários. URLs antigas com `acesso-rapido` não autenticam ninguém e não desabilitam a conexão com o Supabase.

## Uso

- Login e cadastro oferecem **Salvar esta conta no acesso rápido**, desmarcado inicialmente. A opção é independente dos campos obrigatórios.
- Somente uma autenticação bem-sucedida com sessão e perfil reais permite salvar a conta. Cadastro que aguarda confirmação não cria um cartão: o usuário deve entrar depois da confirmação e escolher salvar.
- Os cartões ficam no mesmo bloco de acesso rápido e apresentam nome e tipo (Atleta, Treinador ou Casual), com identificação adicional de Administrador/Supervisor quando aplicável.
- O clique no cartão valida a sessão e consulta o perfil atual no Supabase. Papéis exibidos no armazenamento local não concedem permissões.
- O X abre uma confirmação. Cancelar não altera nada; confirmar remove apenas o cartão e suas credenciais salvas, não exclui a conta nem encerra a sessão conectada.
- Fechar o seletor preserva a conta e a tela atuais. Uma troca bem-sucedida limpa dados privados em memória antes de carregar os da nova identidade.

## Persistência e segurança

A lista pertence ao **navegador e à origem atuais**, com namespace por projeto Supabase. Ela persiste ao recarregar e fechar/reabrir o navegador, enquanto os dados locais e a sessão continuarem válidos. Não é uma lista pública no banco, não é compartilhada automaticamente com outros dispositivos e não migra perfis temporários anteriores.

Não são salvas senhas. O armazenamento local contém os tokens de sessão do Supabase, que são credenciais sensíveis e permitem entrar na conta. Por isso, a opção inclui o aviso de usar apenas um dispositivo de confiança: qualquer pessoa com acesso a esse navegador poderá selecionar uma conta salva. Não há criptografia local adicional nem promessa de autenticação perpétua. Limpar dados do navegador, revogar a sessão, excluir/suspender uma conta ou políticas de expiração do Supabase podem exigir novo login.

Tokens renovados são atualizados somente em cartões já existentes. Eventos de autenticação não criam novos cartões sem consentimento nem restauram um cartão removido. Sessão revogada/expirada fica sinalizada como **Entrar novamente**, sem substituir a conta atual durante a validação. Falha transitória de conexão não remove a conta salva.

Ao sair de uma conta explicitamente salva, o aplicativo descarta o contexto ativo do navegador, para de renovar a sessão nesse contexto e retorna à tela de login, mas preserva a sessão lembrada para entrada futura pelo cartão. Isso é diferente de revogar a sessão no servidor. Para impedir entrada futura pelo acesso rápido, é necessário remover o cartão. Para contas não salvas, o logout usa o encerramento da sessão corrente do Supabase (`scope: local`), sem revogar todas as sessões do titular em outros dispositivos.

Nenhuma tabela de senhas/tokens foi criada no Supabase; RLS e permissões existentes permanecem iguais. Dados de login jamais são gravados em `profiles` ou em listas públicas.

## Validação

- Testes unitários de cofre: múltiplas contas, deduplicação por UUID, reabertura, ausência de senha, rotação, remoção, invalidação, erro de armazenamento e rejeição de identidades incompatíveis.
- Testes de retomada com clientes isolados: usuário/perfil verificados, papel atual do servidor, suspensão/exclusão, revogação, falha de rede e remoção concorrente.
- Teste Chromium em `tests/browser/saved-accounts.mjs`: interface real e SDK Supabase real com respostas HTTP controladas, sem cadastrar usuários no projeto de produção. Cobre consentimento no login/cadastro, ausência de cartão sem consentimento, logout e retorno sem senha, duas contas, confirmação/cancelamento de remoção, sessão revogada mantendo a identidade anterior, persistência ao recarregar e ausência de senhas no armazenamento. Não equivale a um teste de autenticação ponta a ponta contra o serviço de produção.

Para reproduzir o teste de navegador, com o preview na porta 3000 e as variáveis públicas do Supabase configuradas:

```sh
npm install --prefix .cache/session-ui --no-audit --no-fund playwright-core @sparticuz/chromium
node tests/browser/saved-accounts.mjs
```

Dependências opcionais e binários desse teste ficam no cache, fora do Git. O teste intercepta as chamadas do navegador a domínios Supabase; não utiliza senha de usuário real nem chave de serviço.
