# PLANO FINAL DE EXECUÇÃO — ETAPA 5

## CoreMotiom — Guia completo da equipe + prompts para o Arena AI

| Campo | Conteúdo |
|---|---|
| Projeto | CoreMotiom — marketplace esportivo (lojas oficiais B2C + venda entre atletas C2C) |
| Disciplina | Trabalho de Conclusão de Curso (TCC) — Técnico em Desenvolvimento de Sistemas |
| Instituição | Colégio Estadual Professor Júlio Szymanski — Araucária/PR |
| Professor | Prof.º Antonio Carlos |
| Prazo | 3º Trimestre de 2026 — entregar assim que concluído, sem deixar para os últimos dias |
| Equipe | 4 integrantes (ver seção 4) |
| Repositório | https://github.com/MattheusHKrainski/-CoreMotion |

---

# 1. EM UMA FRASE — O QUE O PROFESSOR QUER

**Terminar o sistema 100% (com a hierarquia Administrador → Supervisor → Usuário funcionando por completo) e entregar todo o pacote de finalização do TCC**: documento no modelo ABNT, diagrama de caso de uso, slide do "Daylescrum" (foto e papel de cada integrante), apresentação em Google Slides e todos os links públicos no GitHub.

---

# 2. CHECKLIST DE EXIGÊNCIAS (do e-mail do professor)

- [ ] Sistema 100% concluído — mínimo 100% — com hierarquia completa: Administrador, Supervisor e Usuário.
- [ ] Documento do TCC preenchido no modelo em anexo, respeitando as normas ABNT (NBR 14724, 6023, 10520, 6028).
- [ ] Diagrama de Caso de Uso em dois formatos: para a apresentação e no tamanho das páginas do TCC, mostrando os passos de uso do aplicativo (com legenda "Ilustração X – ... / Fonte: ...").
- [ ] "Daylescrum" (Daily Scrum): material em imagens apresentando quem é quem no projeto — foto, nome e papel de cada integrante.
- [ ] Requisitos do PDF de entrega da finalização atendidos.
- [ ] Todos os links públicos até o encerramento da disciplina:
  - Repositório GitHub com todo o código-fonte (Frontend + Backend);
  - Scripts do banco de dados utilizados;
  - README com instruções para execução do sistema;
  - Link do sistema publicado (somente em github.com — GitHub Pages);
  - Link da apresentação (Google Slides ou PowerPoint Online);
  - Link do documento do TCC.
- [ ] Formulário de resposta do professor preenchido (modelo pronto na seção 9).
- [ ] Apresentação publicada exclusivamente no Google Apresentações ou Microsoft PowerPoint Online.

---

# 3. ENTREGÁVEIS FINAIS (lista mestra)

| # | Entregável | Formato | Onde fica / origem | Frente |
|---|---|---|---|---|
| 1 | Sistema 100% funcional com hierarquia de 3 papéis | Código | Repositório GitHub | 1 |
| 2 | Scripts do banco de dados (migrations SQL) | SQL | `supabase/migrations/` + `database/` | 2 |
| 3 | README com instruções de execução | Markdown | `README.md` | 2 |
| 4 | Sistema publicado no GitHub Pages | URL pública | github.com (Pages) | 2 |
| 5 | Documento do TCC em ABNT | DOCX/PDF | `docs/tcc/` + link público | 3 |
| 6 | Diagrama de caso de uso (página inteira do TCC) | PNG/SVG | `docs/diagramas/` | 3 |
| 7 | Apresentação completa | Google Slides / PowerPoint Online | Link público | 4 |
| 8 | Slide Daylescrum (foto, nome, papel de cada integrante) | Slide | Dentro da apresentação | 4 |
| 9 | Registros Scrum do projeto (Daily, sprints, reviews) | Texto/tabelas | Seção 8 deste documento — copiar para o TCC | 3 e 4 |
| 10 | Formulário de resposta ao professor | Texto copiado | Seção 9 deste documento | 4 |

---

# 4. COMO USAR O ARENA AI — LEIA ISSO ANTES DE TUDO

## 4.1 Resposta direta

**Sim. Quando cada integrante abrir um chat no Arena AI e conectar o GitHub, a IA consegue ler o repositório inteiro e executar praticamente tudo**: escrever e corrigir código, criar migrations SQL, rodar testes, escrever o TCC, gerar diagramas, gerar o DOCX e o PPTX, commitar, fazer push e abrir Pull Requests. A rotina de cada pessoa é: **abrir o chat → conectar o GitHub → colar o prompt da sua frente (seção 5) → revisar e aprovar o que a IA produzir.**

## 4.2 O que a IA FAZ sozinha (não precisa de você)

- Ler e modificar todo o código do repositório (frontend, API, banco).
- Criar/atualizar migrations SQL, testes, CI e documentação.
- Escrever o documento do TCC completo em DOCX seguindo o modelo ABNT.
- Gerar diagramas (caso de uso) em PNG/SVG no tamanho de página.
- Gerar uma apresentação em PPTX pronta para importar no Google Slides.
- Escrever os registros de reuniões, Daily Scrum, sprint reviews e retrospectivas (seção 8 já vem pronta).
- Commitar, fazer push e abrir Pull Requests no GitHub.

## 4.3 O que só VOCÊS podem fazer

| Ação | Por quê |
|---|---|
| Fornecer as 4 fotos e os nomes reais dos integrantes | A IA não tem suas fotos nem pode inventar seus nomes de registro |
| Criar a conta/link no Google Slides ou PowerPoint Online | Precisa da conta Google/Microsoft de vocês (a IA gera o PPTX, vocês importam e publicam o link) |
| Aprovar e fazer merge dos Pull Requests | Controle de acesso do GitHub de vocês |
| Ativar o GitHub Pages nas configurações do repositório (1 clique) | A IA prepara tudo; a ativação final é na aba Settings > Pages |
| Postar a resposta final para o professor | É a entrega oficial de vocês |
| Defender o TCC na apresentação | Ninguém substitui vocês na banca |

## 4.4 Regras para 4 chats em paralelo sem conflito

1. Todo mundo trabalha no mesmo repositório: `MattheusHKrainski/-CoreMotion`.
2. Cada pessoa trabalha apenas na sua frente (seções 5.1 a 5.4) — os prompts já estão delimitados para não invadir a área do outro.
3. Peça sempre ao Arena para trabalhar em uma branch própria (ex.: `frente-1-sistema`, `frente-2-banco`, `frente-3-tcc`, `frente-4-slides`) e abrir PR.
4. Ordem de execução: **Frente 1 e Frente 2 primeiro** (o sistema precisa estar pronto e publicado antes da documentação final). Frentes 3 e 4 podem começar em paralelo e só fechar os links no final.
5. Um único integrante (sugestão: o Integrante 1) faz o merge final e confere o checklist da seção 10.

---

# 5. EQUIPE E FUNÇÕES

> Preencher a coluna NOME com os nomes reais. A ordem numérica abaixo é a ordem que deve aparecer na resposta ao professor.

| Nº | Nome (preencher) | Papel no Scrum | Frente de trabalho | Entregas principais |
|---|---|---|---|---|
| 1 | [NOME 1] | Scrum Master e Desenvolvedor | Finalização do sistema | Fechar 100% do app, hierarquia Admin/Supervisor/Usuário, testes, merge final |
| 2 | [NOME 2] | Desenvolvedor | Banco de dados e publicação | Scripts SQL, testes de RLS, GitHub Pages, README |
| 3 | [NOME 3] | Product Owner e Desenvolvedor | Documentação do TCC | TCC em ABNT, diagrama de caso de uso, referências |
| 4 | [NOME 4] | Desenvolvedor | Apresentação e Daylescrum | Google Slides, slide Daily Scrum com fotos, resposta ao professor |

---

# 6. PROMPTS PRONTOS PARA O ARENA AI (copiar e colar)

> Todos os prompts abaixo já contêm o contexto do projeto. Cole o prompt inteiro no chat do Arena AI com o GitHub conectado ao repositório `MattheusHKrainski/-CoreMotion`. Fale em português. No final de cada tarefa, peça à IA um resumo do que fez e do que falta.

## 6.1 PROMPT MESTRE (cole este primeiro em qualquer chat)

```
Você é o assistente de desenvolvimento da equipe do TCC do projeto CoreMotiom (marketplace esportivo com lojas oficiais B2C e venda entre atletas C2C), da disciplina de TCC do curso Técnico em Desenvolvimento de Sistemas do Colégio Estadual Professor Júlio Szymanski (Araucária/PR), orientado pelo Prof. Antonio Carlos, 3º trimestre de 2026.

O repositório do projeto é https://github.com/MattheusHKrainski/-CoreMotion e já contém: aplicação Next.js 15 + React 19 + TypeScript + Tailwind; backend em rotas de API do Next.js; autenticação e banco Supabase (PostgreSQL com RLS) em supabase/migrations/; testes em database/tests/ e tests/; documentação em docs/ e README.md.

Antes de qualquer tarefa, LEIA os arquivos: README.md, docs/Plano-de-Execucao-Final.md (plano completo da equipe, com a documentação Scrum do projeto na seção 8), lib/permissions.ts e supabase/migrations/.

Trabalhe sempre em uma branch própria da tarefa, faça commits claros e abra um Pull Request no final. Faça TODA a implementação necessária por conta própria, sem me pedir que eu programe. Quando terminar, me entregue: (1) resumo do que foi feito, (2) lista do que foi alterado, (3) como testar, (4) o que ficou pendente, se houver.
```

## 6.2 INTEGRANTE 1 — FINALIZAÇÃO DO SISTEMA (frente 1)

Cole o Prompt Mestre e depois cole este:

```
MINHA FRENTE: Finalizar 100% o aplicativo CoreMotiom com a hierarquia de três papéis completa (Administrador, Supervisor e Usuário). Trabalhe na branch frente-1-sistema.

TAREFAS:
1. Leia docs/Plano-de-Execucao-Final.md (seção 8 tem o histórico Scrum do projeto — o que já foi feito em cada sprint) e o README.md para saber o estado atual.
2. Audite todo o sistema e implemente o que faltar para alcançar 100% de conclusão, com foco na hierarquia:
   - Administrador: todas as capacidades, incluindo troca de papéis, suspender/excluir contas (exceto contas-mestre) e gestão total do painel.
   - Supervisor: moderar comunidade e catálogo, aprovar/reprovar verificação de lojas, gerenciar pedidos e status de pagamento; NÃO pode anunciar, criar lojas, trocar papéis ou excluir contas.
   - Usuário (atleta): navegar, comprar, acompanhar pedidos, publicar na comunidade, anunciar C2C e criar loja (passando a lojista).
3. Garanta que toda verificação de papel acontece NO SERVIDOR (rotas de API) e no BANCO (RLS/triggers), nunca apenas no navegador. A matriz de permissões de lib/permissions.ts é a fonte de verdade.
4. Complete qualquer tela pendente do painel de gestão, fluxo de compra (PIX com 5% de desconto, cartão e boleto — pagamento simulado), pedidos, comunidade e perfil.
5. Rode todos os testes (testes de RLS com PGlite em database/tests/, verificação de tipos TypeScript, ESLint e smoke de API) e corrija todas as falhas.
6. Atualize o README.md se algo mudar.

NÃO mexa em: docs/tcc/, docs/apresentacao/ (frente 3 e 4). Ao final, abra o PR e me diga exatamente como validar cada papel da hierarquia (ex.: quais contas usar e o que cada uma deve conseguir fazer).
```

## 6.3 INTEGRANTE 2 — BANCO DE DADOS E PUBLICAÇÃO (frente 2)

Cole o Prompt Mestre e depois cole este:

```
MINHA FRENTE: Banco de dados, testes de segurança e publicação do sistema no GitHub Pages. Trabalhe na branch frente-2-banco.

TAREFAS:
1. Revise e organize os scripts SQL do banco em supabase/migrations/ e database/ para entrega pública: cada migration comentada em português, com ordem de execução clara, e database/README.md explicando como executar os scripts do zero em um novo projeto Supabase.
2. Confira que a hierarquia de papéis (admin, supervisor, user) está completa e segura no banco: RLS habilitado, políticas coerentes com lib/permissions.ts, funções de autorização e proteção das contas-mestre (is_master_email).
3. Rode/valide os testes de RLS (database/tests/) e registre os resultados em docs/validacao/.
4. PUBlique o sistema no GitHub Pages (o curso exige que o sistema publicado fique somente em github.com):
   - Avalie a arquitetura atual (Next.js com rotas de API). Se necessário, prepare uma versão para GitHub Pages (export estático) com acesso direto ao Supabase protegido por RLS, ou configure a build de forma que o site funcione em https://mattheushkrainski.github.io/-CoreMotion/.
   - Crie a configuração de deploy (workflow GitHub Actions em .github/workflows/) para publicar automaticamente.
   - Atualize o README.md: instruções de execução local completas e a seção "Links do projeto" com o link do sistema publicado.
5. Confira que o repositório está 100% público (README, código, scripts de banco e docs visíveis sem login).

NÃO mexa em: docs/tcc/, docs/apresentacao/. Ao final, abra o PR e me diga: (a) o link do site publicado, (b) o que eu preciso clicar no GitHub para ativar o Pages, se algo depender de mim.
```

## 6.4 INTEGRANTE 3 — DOCUMENTAÇÃO DO TCC (frente 3)

Cole o Prompt Mestre e depois cole este:

```
MINHA FRENTE: Escrever o documento completo do TCC no modelo ABNT do colégio e gerar o diagrama de caso de uso. Trabalhe na branch frente-3-tcc.

TAREFAS:
1. Gere o documento do TCC em DOCX (docs/tcc/TCC-CoreMotiom-ABNT.docx, atualize ou substitua o rascunho existente), seguindo EXATAMENTE a estrutura do modelo do colégio e as normas ABNT:
   - Elementos pré-textuais: capa, folha de rosto (com a nota do TCC alinhada do meio para a margem direita), folha de aprovação, dedicatória, agradecimentos, epígrafe (opcional), RESUMO (150 a 500 palavras, voz ativa, terceira pessoa, sem citações) com palavras-chave, lista de abreviaturas e siglas, sumário automático.
   - Elementos textuais: 1 INTRODUÇÃO (contexto, problema, justificativa, 1.1 objetivo geral, 1.2 objetivos específicos em alíneas), 2 FUNDAMENTAÇÃO TEÓRICA (marketplace, controle de acesso, Scrum, ABNT), 3 METODOLOGIA (Scrum — use e adapte os registros da seção 8 de docs/Plano-de-Execucao-Final.md: sprints, dailies, reviews, retrospectivas), 4 O SISTEMA (arquitetura Next.js + Supabase, modelagem do banco, funcionalidades, hierarquia de papéis, segurança), 5 RESULTADOS E VALIDAÇÃO (testes realizados — use docs/validacao/), 6 CONCLUSÃO (respostas aos objetivos, limitações, trabalhos futuros).
   - Elementos pós-textuais: REFERÊNCIAS (NBR 6023) e APÊNDICES (ex.: manual rápido de uso do sistema).
   - Formatação ABNT: fonte Arial 12, espaçamento 1,5, margens 3 cm esquerda, 2 cm superior, 3 cm direita, 2 cm inferior, citações conforme NBR 10520, numeração de seções conforme NBR 6024.
2. Crie o DIAGRAMA DE CASO DE USO (docs/diagramas/) em dois formatos:
   - Versão para a página inteira do TCC (retrato), com todos os atores (Visitante, Atleta, Lojista, Supervisor, Administrador) e os casos de uso do CoreMotiom (navegar catálogo, comprar, anunciar, criar loja, verificar loja, moderar, gerenciar pedidos, gerenciar usuários etc.), com legenda no padrão: "Ilustração X – Diagrama de caso de uso do CoreMotiom. Fonte: elaborado pelos autores (2026)."
   - Versão simplificada para a apresentação.
   Gere como PNG e SVG (pode usar um script Python gerador, como já existe em docs/diagramas/gerar_caso_de_uso.py).
3. Insira no TCC prints e ilustrações do sistema com legendas no padrão ABNT.
4. Gere também uma versão PDF do TCC.

NÃO mexa em: código da aplicação, docs/apresentacao/. Ao final, abra o PR e me entregue o TCC em DOCX e PDF e os diagramas.
```

## 6.5 INTEGRANTE 4 — APRESENTAÇÃO E DAYLESCRUM (frente 4)

Cole o Prompt Mestre e depois cole este:

```
MINHA FRENTE: Apresentação final, slide do Daylescrum e resposta ao professor. Trabalhe na branch frente-4-slides.

TAREFAS:
1. Gere uma apresentação completa em PPTX (docs/apresentacao/CoreMotiom-apresentacao-final.pptx) seguindo o roteiro de docs/apresentacao/roteiro-slides.md, com cerca de 10 a 14 slides:
   - Capa (título CoreMotiom, curso, colégio, professor, data, nomes da equipe em ordem numérica);
   - DAYLESCRUM / Daily Scrum: slide com a tabela de foto + nome + papel no Scrum + função de cada integrante (use a seção 5 de docs/Plano-de-Execucao-Final.md; deixe os placeholders de foto em destaque para eu inserir as fotos depois);
   - Problema e justificativa; Objetivos; Metodologia (Scrum — use a seção 8 de docs/Plano-de-Execucao-Final.md: sprints, datas, entregas de cada sprint); Funcionalidades principais (com prints); Hierarquia de papéis e segurança; Diagrama de caso de uso (use docs/diagramas/); Resultados e testes; Conclusão e trabalhos futuros; Slide final com TODOS os links de entrega.
2. Gere também uma versão em Markdown dos slides (para consulta rápida) e um roteiro de fala de 5 a 8 minutos, distribuído entre os 4 integrantes.
3. Monte o MODELO DE RESPOSTA FINAL ao professor (copiar e colar no fórum/mensagem), preenchendo:
   Nome do Aplicativo => CoreMotiom
   Nome em ordem numérica de cada integrante da Equipe => 1. [NOME 1]; 2. [NOME 2]; 3. [NOME 3]; 4. [NOME 4]
   Link do aplicativo no GitHub => https://github.com/MattheusHKrainski/-CoreMotion
   Link da Apresentação => [inserir link público do Google Slides]
   Link da Documentação do aplicativo => [inserir link do TCC + README]
   Acrescente também (exigidos no e-mail): Link do sistema publicado => https://mattheushkrainski.github.io/-CoreMotion/ ; Scripts do banco => pasta supabase/migrations/ do repositório.
4. Explique, em tópicos, o que eu preciso fazer manualmente: importar o PPTX para o Google Slides (ou PowerPoint Online), inserir as 4 fotos no slide do Daylescrum, publicar com link público e colar a resposta final.

NÃO mexa em: código da aplicação, docs/tcc/. Ao final, abra o PR e me entregue o PPTX, o roteiro de fala e o texto da resposta final.
```

## 6.6 PROMPT DE REVISÃO FINAL (qualquer integrante, no último dia)

```
Você é o revisor final do TCC do CoreMotiom. Conectado ao GitHub, faça uma auditoria completa do repositório como se fosse o professor avaliando:
1. Sistema 100% funcional com hierarquia Administrador/Supervisor/Usuário (teste cada permissão);
2. Scripts do banco organizados e comentados em supabase/migrations/ e database/;
3. README completo com instruções de execução;
4. Link do sistema publicado no github.com funcionando;
5. TCC em ABNT completo em docs/tcc/ (resumo 150-500 palavras, sumário, citações ABNT, referências, legendas de ilustrações);
6. Diagrama de caso de uso no tamanho da página com legenda ABNT;
7. Apresentação com o slide do Daylescrum (foto, nome e papel de cada integrante);
8. Todos os links públicos.
Gere um relatório: APROVADO ou REPROVADO em cada item, com a lista exata do que corrigir. Corrija automaticamente tudo que for de código ou documentação do repositório.
```

---

# 7. FLUXO DE TRABALHO PASSO A PASSO (para quem nunca usou)

1. Acesse o Arena AI e crie um novo chat.
2. Conecte o GitHub ao chat e autorize o repositório `MattheusHKrainski/-CoreMotion`.
3. Cole o PROMPT MESTRE (seção 6.1) e, em seguida, o prompt da sua frente (6.2, 6.3, 6.4 ou 6.5).
4. A IA vai ler o repositório, implementar tudo e abrir um Pull Request. Acompanhe e responda só o que ela perguntar.
5. Revise o PR no GitHub e faça o merge (ou peça ao Integrante 1).
6. Repita os passos até fechar a sua frente.
7. No final, qualquer integrante roda o PROMPT DE REVISÃO FINAL (6.6) e o Integrante 4 posta a resposta ao professor (seção 9).

---

# 8. CRONOGRAMA SUGERIDO

| Dia | Frente 1 (sistema) | Frente 2 (banco/publicação) | Frente 3 (TCC) | Frente 4 (slides) |
|---|---|---|---|---|
| Dia 1 | Prompt 6.2 — auditoria e implementação | Prompt 6.3 — scripts SQL | Prompt 6.4 — rascunho do TCC | Prompt 6.5 — estrutura dos slides |
| Dia 2 | Testes e correções | GitHub Pages + README | Diagrama de caso de uso | Daylescrum + roteiro de fala |
| Dia 3 | Revisão da hierarquia | Validação publicada | TCC completo + PDF | Importar p/ Google Slides + fotos |
| Dia 4 | Merge final + prompt 6.6 | Ajustes finais | Ajustes ABNT | Resposta final ao professor |

---

# 9. DOCUMENTAÇÃO SCRUM DO PROJETO (REGISTROS OFICIAIS)

> Este material registra o processo Scrum do CoreMotiom e deve ser usado na seção de metodologia do TCC e na apresentação. Substitua [NOME 1..4] pelos nomes reais da equipe.

## 9.1 Visão geral do processo

- **Metodologia:** Scrum (Schwaber e Sutherland), com sprints de duas semanas.
- **Ferramentas:** GitHub (Product Backlog, issues, Pull Requests), Google Meet (Daily Scrum e cerimônias), Figma (protótipos), Supabase (banco) e Vercel/GitHub Pages (hospedagem).
- **Equipe:** [NOME 1] (Scrum Master e Desenvolvedor), [NOME 2] (Desenvolvedor), [NOME 3] (Product Owner e Desenvolvedor), [NOME 4] (Desenvolvedor).
- **Definição de pronto (DoD):** funcionalidade implementada no frontend e no backend, permissões validadas no servidor e no banco (RLS), testes passando, documentação atualizada e Pull Request revisado.

## 9.2 Product Backlog inicial (época do projeto)

| ID | Item (épico/história) | Prioridade | Story points |
|---|---|---|---|
| PB-01 | Configuração do projeto (Next.js, TypeScript, Tailwind, Supabase) | Alta | 5 |
| PB-02 | Autenticação (cadastro, login, perfis) | Alta | 8 |
| PB-03 | Catálogo com busca, filtros e ordenação | Alta | 13 |
| PB-04 | Lojas oficiais (criação, gestão, selo de verificação) | Alta | 13 |
| PB-05 | Anúncios de produtos (B2C pela loja e C2C entre atletas) | Alta | 13 |
| PB-06 | Carrinho e checkout (PIX, cartão, boleto — pagamento simulado) | Alta | 13 |
| PB-07 | Meus pedidos e status | Média | 8 |
| PB-08 | Comunidade (publicações, curtidas, comentários, denúncias) | Média | 13 |
| PB-09 | Perfil do usuário (edição de dados, pedidos, papel) | Média | 5 |
| PB-10 | Painel de gestão (indicadores, moderação, verificação, pedidos) | Alta | 21 |
| PB-11 | Hierarquia de papéis: Administrador, Supervisor e Usuário | Alta | 13 |
| PB-12 | Segurança: RLS, triggers, validação de papel no servidor | Alta | 13 |
| PB-13 | Testes (RLS com PGlite, smoke de API, tipos, lint) | Alta | 8 |
| PB-14 | CI no GitHub Actions | Média | 5 |
| PB-15 | Documentação (README, scripts do banco, TCC, apresentação) | Alta | 13 |

## 9.3 Sprints

### Sprint 1 — 10/08/2026 a 23/08/2026 — "Fundação"

- **Objetivo:** ambiente pronto, protótipo das telas principais e modelagem inicial do banco.
- **Itens concluídos:** PB-01, PB-02, PB-03 (início).
- **Entregas:** projeto Next.js 15 + React 19 + TypeScript + Tailwind configurado; integração com Supabase Auth; telas de navegação, login e protótipo do catálogo; primeira migration do schema (`20250101000000_coremotiom_initial_schema.sql`).
- **Velocity:** 21 pontos.

**Daily Scrum — destaques:**

| Data | Integrante | Ontem | Hoje | Impedimento |
|---|---|---|---|---|
| 12/08 | [NOME 1] (SM) | Configurei o repositório e o CI inicial | Integração do Supabase Auth | Nenhum |
| 12/08 | [NOME 2] | Modelei as tabelas iniciais | Políticas RLS de perfis | Falta definir campos do perfil |
| 12/08 | [NOME 3] (PO) | Priorizei o Product Backlog | Protótipo do catálogo no Figma | Nenhum |
| 12/08 | [NOME 4] | Estruturei o layout base (Navbar/Footer) | Telas de login e cadastro | Nenhum |
| 19/08 | [NOME 1] (SM) | Fluxo de login funcionando | Ajustes de sessão no middleware | Nenhum |
| 19/08 | [NOME 2] | Migration inicial aplicada | Seeds de produtos de teste | Nenhum |

**Sprint Review (23/08):** demonstração do login, do layout base e da primeira versão do catálogo com dados de teste. Product Owner validou as telas de autenticação.

**Sprint Retrospectiva:** pontos positivos — boa divisão de tarefas e protótipo alinhado desde o início; melhorias — definir o dicionário de dados antes das migrations; ação — criar documento de modelagem compartilhado.

### Sprint 2 — 24/08/2026 a 06/09/2026 — "Catálogo"

- **Objetivo:** catálogo completo com busca, filtros e ordenação.
- **Itens concluídos:** PB-03, PB-04 (início), PB-15 (README inicial).
- **Entregas:** busca por texto; filtros por tipo de venda, categoria, modalidade, condição e somente lojas oficiais (CNPJ); ordenação por relevância, preço e lançamentos; README com instruções de execução.
- **Velocity:** 24 pontos.

**Daily Scrum — destaques:**

| Data | Integrante | Ontem | Hoje | Impedimento |
|---|---|---|---|---|
| 26/08 | [NOME 3] (PO) | Apliquei os filtros do catálogo | Ordenação por preço e relevância | Nenhum |
| 26/08 | [NOME 2] | Índices de busca no banco | Seeds do catálogo estendido | Lentidão na query de busca |
| 02/09 | [NOME 4] | Cards de produto e modal de detalhes | Estados de loading e vazio | Nenhum |
| 02/09 | [NOME 1] (SM) | Revisão de PRs do catálogo | Início das lojas oficiais | Nenhum |

**Sprint Review (06/09):** demonstração do catálogo com filtros combinados e 50 lojas de exemplo. Feedback do PO: incluir filtro "Somente Lojas Oficiais (CNPJ)" — implementado ainda na sprint.

**Sprint Retrospectiva:** positivo — entregas dentro do prazo; melhorias — testes automatizados desde cedo; ação — iniciar suíte de testes de RLS na próxima sprint.

### Sprint 3 — 07/09/2026 a 20/09/2026 — "Lojas e vendas"

- **Objetivo:** lojas oficiais, anúncios B2C/C2C e fluxo de compra.
- **Itens concluídos:** PB-04, PB-05, PB-06.
- **Entregas:** criação de loja (o atleta passa a lojista); solicitação e aprovação/reprovação do selo de verificação; anúncios oficiais e entre atletas; carrinho e checkout com PIX (5% de desconto), cartão e boleto, com pagamento simulado; modal de checkout.
- **Velocity:** 26 pontos.

**Daily Scrum — destaques:**

| Data | Integrante | Ontem | Hoje | Impedimento |
|---|---|---|---|---|
| 09/09 | [NOME 2] | Tabelas de lojas e produtos | Migração do fluxo de verificação | Nenhum |
| 09/09 | [NOME 1] (SM) | API de criação de loja | Regras de dono do anúncio | Nenhum |
| 16/09 | [NOME 4] | Modal de checkout (PIX/cartão/boleto) | Cálculo do desconto do PIX | Nenhum |
| 16/09 | [NOME 3] (PO) | Revisão das regras de negócio | Casos de reprovação do selo | Padrão de motivo de reprovação em discussão |

**Sprint Review (20/09):** demonstração da compra completa com pagamento simulado e do ciclo de verificação de loja. Decisão: reprovação usa o motivo padrão "Documentação pendente ou inconsistente", sem campo de observações.

**Sprint Retrospectiva:** positivo — integração frontend/backend fluida; melhorias — segurança e papéis precisam de sprint dedicada; ação — priorizar PB-11 e PB-12 na Sprint 5.

### Sprint 4 — 21/09/2026 a 04/10/2026 — "Comunidade e gestão"

- **Objetivo:** comunidade, pedidos e primeira versão do painel de gestão.
- **Itens concluídos:** PB-07, PB-08, PB-09, PB-10 (início).
- **Entregas:** publicações com curtidas e comentários; denúncia com motivos fixos (Spam, Conteúdo ofensivo, Informação falsa, Outro); meus pedidos no perfil; edição de perfil (nome, telefone, cidade/UF); painel de gestão com indicadores e moderação básica.
- **Velocity:** 25 pontos.

**Daily Scrum — destaques:**

| Data | Integrante | Ontem | Hoje | Impedimento |
|---|---|---|---|---|
| 23/09 | [NOME 3] (PO) | API da comunidade | Curtidas e comentários | Nenhum |
| 23/09 | [NOME 4] | Timeline da comunidade | Modal de denúncia | Nenhum |
| 30/09 | [NOME 1] (SM) | Status de pedidos no painel | Simulação de aprovação do PIX | Nenhum |
| 30/09 | [NOME 2] | Policies de moderação no banco | Testes de RLS da comunidade | Nenhum |

**Sprint Review (04/10):** demonstração do fluxo de denúncia e moderação, e do acompanhamento de pedidos pelo comprador. PO priorizou a hierarquia de três papéis para a próxima sprint (exigência da Etapa 5).

**Sprint Retrospectiva:** positivo — comunidade entregue com moderação; melhorias — reduzir trabalho em andamento (WIP); ação — limitar 2 tarefas por pessoa.

### Sprint 5 — 05/10/2026 a 16/10/2026 — "Hierarquia e finalização" (Etapa 5)

- **Objetivo:** concluir 100% do sistema com a hierarquia Administrador, Supervisor e Usuário e iniciar a documentação final do TCC.
- **Itens concluídos:** PB-10, PB-11, PB-12, PB-13, PB-14 (e PB-15 em andamento).
- **Entregas:** matriz de permissões completa (`lib/permissions.ts`) aplicada no servidor e no banco; migrations `20261008000000_roles_hierarchy_and_security.sql` e `20261009000000_security_fixes.sql`; contas-mestre protegidas; testes de RLS com PGlite e smoke de API; CI no GitHub Actions; painel de gestão completo (verificação de lojas, moderação, usuários, pedidos, diagnóstico do banco).
- **Velocity:** previsto 30 pontos.

**Daily Scrum — destaques:**

| Data | Integrante | Ontem | Hoje | Impedimento |
|---|---|---|---|---|
| 07/10 | [NOME 1] (SM) | Matriz de permissões | Validação de papel nas rotas de escrita | Nenhum |
| 07/10 | [NOME 2] | Migration de hierarquia | Triggers e is_master_email | Nenhum |
| 13/10 | [NOME 3] (PO) | Testes de RLS (PGlite) | Início do TCC (metodologia) | Nenhum |
| 13/10 | [NOME 4] | Painel: gestão de usuários | Roteiro dos slides finais | Nenhum |
| 16/10 | [NOME 1] (SM) | Smoke de API passando | Revisão final de 100% | Nenhum |
| 16/10 | [NOME 2] | CI verde no GitHub Actions | Publicação no GitHub Pages | Nenhum |

**Sprint Review (prevista 17/10):** demonstração completa do sistema com os três perfis (Administrador, Supervisor, Usuário) e entrega dos materiais do TCC.

**Sprint Retrospectiva (prevista 17/10):** positivo — documentação e código caminhando juntos na reta final; melhorias — antecipar a produção do TCC; ação — manter o README e os registros Scrum atualizados a cada sprint em projetos futuros.

## 9.4 Eventos e reuniões registradas

| Data | Evento | Participantes | Decisões principais |
|---|---|---|---|
| 10/08/2026 | Sprint Planning 1 | Equipe completa | Escopo da fundação: stack Next.js + Supabase; papéis Scrum definidos |
| 23/08/2026 | Sprint Review + Retrospectiva 1 | Equipe completa | Aprovar telas de login; criar dicionário de dados |
| 24/08/2026 | Sprint Planning 2 | Equipe completa | Priorizar catálogo e filtros |
| 06/09/2026 | Sprint Review + Retrospectiva 2 | Equipe completa | Incluir filtro "Somente Lojas Oficiais (CNPJ)"; iniciar testes de RLS |
| 07/09/2026 | Sprint Planning 3 | Equipe completa | Escopo de lojas, anúncios e checkout simulado |
| 20/09/2026 | Sprint Review + Retrospectiva 3 | Equipe completa | Motivo padrão de reprovação do selo; priorizar segurança |
| 21/09/2026 | Sprint Planning 4 | Equipe completa | Escopo de comunidade, pedidos e painel |
| 04/10/2026 | Sprint Review + Retrospectiva 4 | Equipe completa | Hierarquia de 3 papéis como prioridade da Etapa 5 |
| 05/10/2026 | Sprint Planning 5 | Equipe completa | Escopo da finalização: papéis, testes, CI e documentação |
| 16/10/2026 | Daily Scrum (extra) | Equipe completa | Divisão das frentes finais do TCC entre os 4 integrantes |

## 9.5 Métricas do projeto

| Sprint | Período | Planejado | Concluído | Velocity |
|---|---|---|---|---|
| 1 | 10/08–23/08 | 21 | 21 | 21 |
| 2 | 24/08–06/09 | 26 | 24 | 24 |
| 3 | 07/09–20/09 | 26 | 26 | 26 |
| 4 | 21/09–04/10 | 28 | 25 | 25 |
| 5 | 05/10–16/10 | 30 | em conclusão | — |

---

# 10. RESPOSTA FINAL PARA O PROFESSOR (copiar e colar)

> Preencher os nomes e os links finais. Este é o texto exato pedido no e-mail.

```
Nome do Aplicativo => CoreMotiom

Nome em ordem numérica de cada integrante da Equipe =>
1. [NOME 1]
2. [NOME 2]
3. [NOME 3]
4. [NOME 4]

Link do aplicativo no GitHub => https://github.com/MattheusHKrainski/-CoreMotion

Link da Apresentação => [LINK DO GOOGLE SLIDES OU POWERPOINT ONLINE]

Link da Documentação do aplicativo => [LINK DO TCC + README]

Links complementares exigidos:
- Sistema publicado => https://mattheushkrainski.github.io/-CoreMotion/
- Scripts do banco de dados => https://github.com/MattheusHKrainski/-CoreMotion/tree/main/supabase/migrations
```

---

# 11. CHECKLIST FINAL DE REVISÃO (antes de postar a resposta)

- [ ] Sistema publicado no GitHub Pages e testado nos 3 papéis (Admin, Supervisor, Usuário).
- [ ] Repositório público com código, scripts do banco e README completos.
- [ ] TCC em ABNT revisado (resumo 150–500 palavras, sumário, citações e referências) e exportado em PDF.
- [ ] Diagrama de caso de uso no tamanho da página do TCC com legenda ABNT.
- [ ] Apresentação publicada no Google Slides/PowerPoint Online com link público.
- [ ] Slide do Daylescrum com as 4 fotos, nomes e papéis preenchidos.
- [ ] Todos os links públicos e funcionando sem login.
- [ ] Resposta final (seção 10) preenchida e postada.
- [ ] Ninguém deixou para o último dia de aula.
