# Roteiro da apresentação: CoreMotiom

**Formato exigido pelo curso**: a apresentação deve ser feita **somente** no Google Slides ou no PowerPoint Online. Este arquivo é o roteiro para a equipe criar os slides nessa plataforma. Não substitui a apresentação.

**Link da apresentação**: _a inserir no README (seção *Links do projeto*) e na resposta final._

---

## Slide 1: Capa

- Título: **CoreMotiom**: marketplace esportivo com lojas oficiais e venda entre atletas
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

- Atletas e lojas de artigos esportivos precisam de um canal único para compra oficial e venda entre pessoas.
- Marketplaces exigem controle de acesso correto: quem pode anunciar, moderar, verificar lojas e alterar papéis.

## Slide 4: Objetivos

- **Geral**: desenvolver e disponibilizar um marketplace esportivo com hierarquia de papéis.
- **Específicos**: catálogo B2C e C2C, lojas com selo de verificação, compra com pagamento simulado, comunidade com moderação, painel de gestão e controle de acesso no banco.

## Slide 5: Metodologia (Scrum)

- Papéis, eventos (Sprint Planning, Daily Scrum, Sprint Review e Retrospectiva) e artefatos (Product Backlog e Incremento).
- _Inserir: número de sprints, datas e principais entregas de cada sprint._

## Slide 6: Requisitos e casos de uso

- Diagrama de casos de uso (`docs/diagramas/caso-de-uso.png`): 14 casos de uso, 5 atores.
- Atores de uso geral: Visitante, Atleta e Lojista. Atores de gestão: Supervisor e Administrador.

## Slide 7: Hierarquia de papéis

- **Administrador** > **Supervisor** > **Lojista** > **Atleta** > **Visitante**.
- Supervisor modera, gerencia pedidos e verifica lojas; não altera papéis nem exclui contas.
- Administrador tem todas as capacidades, exceto sobre contas-mestre.
- Matriz completa no README (seção *Papéis e permissões*).

## Slide 8: Arquitetura

- Frontend e API: Next.js 15 (App Router), React 19 e TypeScript.
- Autenticação: Supabase Auth (JWT).
- Banco: PostgreSQL com Row Level Security, triggers e privilégios mínimos.
- Regras de permissão aplicadas no servidor (rotas de API) e no banco (RLS).

## Slide 9: Segurança: achados e correções

- Linha de base (esquema inicial): **29 de 47** cenários de autorização reprovados.
- Principais falhas corrigidas: escalonamento de papel, leitura anônima de perfis, pedido marcado como pago pelo cliente, `TRUNCATE` por usuários autenticados.
- Esquema endurecido: **47 de 47** aprovados.
- Rotas de escrita da API: **22 de 22** verificações de 401 (sem token e com token forjado).
- Credencial que estava no código foi removida; a senha do banco deve ser redefinida no Supabase antes da publicação.

## Slide 10: Demonstração (roteiro)

1. Entrar como atleta; navegar no catálogo e filtrar por modalidade.
2. Comprar um produto com PIX; abrir *Perfil › Meus pedidos*.
3. Denunciar uma publicação na comunidade.
4. Entrar como supervisor; confirmar o pagamento do pedido e remover a publicação denunciada em *Moderação da Comunidade*.
5. Mostrar que, como supervisor, o campo de papel aparece desabilitado na aba de usuários.
6. Entrar como administrador; alterar o papel de uma conta; mostrar que as contas-mestre aparecem com selo de equipe, sem campo de papel.

## Slide 11: Testes e validação

- Verificação de tipos, lint e build aprovados.
- Testes de autorização do banco: 47 de 47.
- Teste de fumaça de API: 22 de 22.
- CI no GitHub Actions a cada *pull request*.

## Slide 12: Limitações e trabalhos futuros

- Pagamentos simulados: integrar gateway financeiro real.
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
