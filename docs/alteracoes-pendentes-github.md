# Decisões incluídas no envio ao GitHub

> **Atualização:** o acesso rápido agora contém somente contas reais salvas por consentimento neste navegador. Os atalhos temporários descritos historicamente abaixo foram removidos, inclusive sua ativação por URL. A conta Admin também precisa ser salva explicitamente para aparecer no seletor. Consulte o [fluxo atual de contas salvas](auth/acesso-rapido-contas-salvas.md), incluindo a diferença entre sair de uma conta lembrada e revogar sua sessão. As referências abaixo a atalhos fixos, perfis temporários e comportamento anterior de logout não descrevem mais a interface atual.


Envio autorizado pelo usuário. Este documento registra o escopo e a decisão mais recente sobre o acesso administrativo.

- Decisão atual: o atalho Admin usa a conta oficial, retomando apenas uma sessão válida e o perfil administrativo verificado no servidor. Sem sessão válida, abre o login normal com o e-mail preenchido. Não cria um Admin local nem inclui credenciais no código. Os demais perfis rápidos permanecem temporários e isolados.
- O controle “Trocar conta” foi movido do cartão da barra lateral para os dados pessoais do gerenciamento do perfil.
- Inscrições em seletivas e treinos que aguardam resposta têm “Cancelar inscrição”, com confirmação. O cancelamento persiste no Supabase para contas reais ou no namespace isolado para perfis temporários, remove o envio da lista e permite nova inscrição enquanto o prazo estiver aberto.
- Respostas já registradas não são canceladas por esse botão. Alterações concorrentes ou falhas de persistência não removem a inscrição da tela como se o cancelamento tivesse sido salvo.

Não incluir senhas, tokens, arquivos `.env.local`, dependências ou artefatos de build no envio.

- Ao abrir “Trocar conta” e fechar no X, a identidade, a sessão e a tela atual são preservadas. Apenas visitantes abrem a autenticação sobre a página pública.
