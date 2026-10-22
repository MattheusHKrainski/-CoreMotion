# Roteiro da apresentação: CoreMotiom

**Formato exigido pelo curso**: a apresentação deve ser feita **somente** no Google Slides ou no PowerPoint Online. Este arquivo é o roteiro para a equipe criar os slides nessa plataforma. Não substitui a apresentação.

**Link da apresentação**: _a inserir no README (seção *Links do projeto*) e na resposta final._

---

## Slide 1: Capa

- Título: **CoreMotiom**: marketplace esportivo com ofertas B2C demonstrativas e venda entre atletas
- Curso, disciplina, professor, data
- Equipe: nomes em ordem numérica (ver slide 2)

## Slide 2: Daily Scrum (foto e papel de cada integrante)

Cada integrante aparece com **foto**, **nome** e **papel no Scrum e no projeto**. Inclua a foto diretamente no slide, no Google Slides ou no PowerPoint Online.

| Nº | Foto | Integrante | Papel no Scrum | Função no projeto |
|---|---|---|---|---|
| 1 | _inserir_ | _nome_ | _Scrum Master, Product Owner ou Developer_ | _ex.: banco de dados e segurança_ |
| 2 | _inserir_ | _nome_ | _..._ | _..._ |
| 3 | _inserir_ | _nome_ | _..._ | _..._ |
| 4 | _inserir_ | _nome_ | _..._ | _..._ |
| 5 | _inserir_ | _nome_ | _..._ | _..._ |

## Slide 3: Problema e justificativa

- A experiência atual combina uma vitrine B2C demonstrativa de ofertas externas com anúncios C2C entre atletas.
- Ofertas, lojas, preços, descontos e endereços são fictícios nesta etapa; não há scraping nem fonte real conectada. Perfis de loja de usuários e revisão de CNPJ foram retirados da aplicação.

## Slide 4: Objetivos

- **Geral**: desenvolver e disponibilizar um marketplace esportivo com hierarquia de papéis.
- **Específicos**: vitrine B2C simulada, anúncios C2C, checkout e envio demonstrativos, comunidade com moderação, painel de gestão e controle de acesso no banco.

## Slide 5: Metodologia (Scrum)

- Papéis, eventos (Sprint Planning, Daily Scrum, Sprint Review e Retrospectiva) e artefatos (Product Backlog e Incremento).
- _Inserir: número de sprints, datas e principais entregas de cada sprint._

## Slide 6: Requisitos e casos de uso

- Atores da versão atual: Visitante, Atleta, Anunciante C2C (papel `seller` legado), Supervisor e Administrador.
- O diagrama de casos de uso em `docs/diagramas/caso-de-uso.png` documenta o escopo original do TCC e ainda contém perfis de loja/revisão; não deve ser apresentado como descrição da implementação atual.

## Slide 7: Hierarquia de papéis

- **Administrador** > **Supervisor**. Atleta e Anunciante C2C têm as mesmas permissões de anúncio C2C; `seller` é mantido apenas por compatibilidade.
- Supervisor modera anúncios C2C e comunidade e gerencia pedidos demonstrativos; não publica anúncios, não altera papéis nem exclui contas. Não há fluxo de loja ou revisão de CNPJ.
- Administrador tem todas as capacidades, exceto sobre contas-mestre.
- Matriz completa no README (seção *Papéis e permissões*).

## Slide 8: Arquitetura

- Frontend e API: Next.js 15 (App Router), React 19 e TypeScript.
- Autenticação: Supabase Auth (JWT).
- Banco: PostgreSQL com Row Level Security, triggers e privilégios mínimos.
- Regras de permissão aplicadas no servidor (rotas de API) e no banco (RLS).

## Slide 9: Segurança: achados e correções

- Linha de base de 2026-10-08 (esquema inicial): **29 de 47** cenários de autorização reprovados.
- Principais correções: escalonamento de papel, leitura anônima de perfis, pedido marcado como pago pelo cliente e `TRUNCATE` por usuários autenticados.
- Versão atual: **62 de 62** cenários aprovados, incluindo bloqueio de novos anúncios B2C, preservação/ocultação de dados legados e checkout C2C-only.
- Rotas protegidas atuais da API: **14 de 14** verificações de 401 (sem token e com token forjado).
- Credencial que estava no código foi removida; a senha do banco deve ser redefinida no Supabase antes da publicação.

## Slide 10: Demonstração (roteiro)

1. Abrir a vitrine B2C; mostrar o aviso de dados fictícios e usar **Ver oferta** sem abrir um site externo.
2. Navegar pelos anúncios C2C, filtrar por modalidade e percorrer o checkout demonstrativo com PIX e frete simulado; abrir *Perfil › Meus pedidos*.
3. Denunciar uma publicação na comunidade.
4. Entrar como supervisor; marcar o pagamento apenas como simulado e remover a publicação denunciada em *Moderação da Comunidade*.
5. Mostrar que, como supervisor, o campo de papel aparece desabilitado na aba de usuários.
6. Entrar como administrador; alterar o papel de uma conta; mostrar que as contas-mestre aparecem com selo de equipe, sem campo de papel.

## Slide 11: Testes e validação

- Verificação de tipos, lint e build aprovados.
- Testes unitários: 12 de 12; autorização do banco: 62 de 62.
- Teste de fumaça de API: 14 de 14.
- CI no GitHub Actions a cada *pull request*.

## Slide 12: Limitações e trabalhos futuros

- B2C sem fontes reais: conectar fontes e links reais somente numa etapa futura, com autorização e testes.
- Pagamentos e frete simulados: integrar gateway e transportadora somente em uma versão futura, após configuração e testes reais.
- Testes ponta a ponta de interface (Playwright).
- Treinadores com dados estáticos: migrar para tabela no banco.

## Slide 13: Links do projeto

- Código-fonte completo: https://github.com/MattheusHKrainski/-CoreMotion
- Documentação do aplicativo (README e banco): _link do README no repositório_
- Documento do TCC (ABNT): _link para `docs/tcc/TCC-CoreMotiom-ABNT.docx` no repositório_
- Scripts de banco de dados: _link para `supabase/migrations/`_
- Sistema publicado (somente GitHub): _a definir_

## Slide 14: Agradecimentos e perguntas

- Agradecimento ao professor orientador.
- Espaço para perguntas.
