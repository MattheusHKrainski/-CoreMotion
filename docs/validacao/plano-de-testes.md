# Plano de testes — CoreMotiom

Situação em 2026-10-08. Este plano descreve o que é testado, como reproduzir cada teste e o que ainda depende de execução manual. Os resultados brutos estão em [`resultados-testes-banco.txt`](resultados-testes-banco.txt) e [`smoke-api.txt`](smoke-api.txt).

## 1. Escopo

- **Aplicativo (Next.js)**: tipos, lint, build de produção e sessão nas rotas de API.
- **Banco de dados (PostgreSQL/Supabase)**: papéis, RLS, triggers, privilégios e regras de negócio (lojas, anúncios, pedidos e comunidade).
- **Fora do escopo automatizado**: fluxo visual completo no navegador, pagamentos reais (que são simulados) e integração com um projeto Supabase de produção.

## 2. Casos de teste

| ID | Área / requisito | Procedimento (comando) | Resultado esperado | Evidência | Status |
|---|---|---|---|---|---|
| CT01 | Qualidade estática | `npm run type-check` e `npm run lint` | Nenhum erro de tipo; 0 erros de lint (23 avisos `no-img-element`, documentados) | Saída do terminal; job `aplicativo` do CI | Aprovado em 2026-10-08 |
| CT02 | Build de produção | `npm run build` | Compilação concluída; rotas `/api/*` dinâmicas | Saída do build; job `aplicativo` do CI | Aprovado em 2026-10-08 |
| CT03 | Autorização no banco (esquema endurecido) | `npm run test:db` | 47 de 47 cenários aprovados | [`resultados-testes-banco.txt`](resultados-testes-banco.txt), seção 1; job `banco-de-dados` do CI | Aprovado em 2026-10-08 |
| CT04 | Regressão: o esquema original deve falhar onde falhava | `cd database/tests && BASELINE=1 npm test` | 18 aprovados e 29 reprovados (falhas que motivaram a correção) | [`resultados-testes-banco.txt`](resultados-testes-banco.txt), seção 2 | Aprovado em 2026-10-08 (comportamento esperado) |
| CT05 | Sessão obrigatória nas escritas da API | Servidor de produção no ar; `BASE_URL=http://localhost:3000 bash scripts/smoke-api.sh` | 22 de 22: sem token e com token forjado, todas as escritas retornam 401 | [`smoke-api.txt`](smoke-api.txt); job `aplicativo` do CI | Aprovado em 2026-10-08 |
| CT06 | Hierarquia de papéis (Administrador, Supervisor, Usuário) | `npm run test:db` (cenários de papéis e contas-mestre) | Supervisor não altera papéis, não exclui perfis e não suspende administradores nem contas-mestre; administrador altera papéis e suspende atletas; contas-mestre mantêm o papel de administrador; atleta não se promove | `rls.test.mjs`: "Supervisor NÃO altera papéis", "Supervisor NÃO suspende conta-mestre/administrador", "Administrador altera papel de atleta para supervisor", "Conta-mestre mantém privilégio de administrador mesmo com papel gravado diferente", "Atleta não se promove a admin pelo próprio perfil" | Aprovado no banco; a interface usa as mesmas regras de `lib/permissions.ts` (verificado por leitura de código) |
| CT07 | Lojas e anúncios (B2C pela loja; C2C entre atletas) | `npm run test:db` | Atleta publica C2C e não publica B2C; anúncio com `seller_id` de outro é gravado em nome do autor; atleta não altera loja de terceiros; lojista cria loja sem se autoverificar | `rls.test.mjs`: "Atleta publica anúncio C2C", "Atleta NÃO publica anúncio B2C (somente lojista)", "Anúncio com seller_id de outro é gravado em nome do autor (trigger)", "Atleta não altera loja de terceiros (RLS)", "Lojista cria loja sem se autoverificar" | Aprovado no banco. **Pendente (manual)**: publicar anúncio B2C pelo seletor *Tipo de venda* com projeto Supabase real |
| CT08 | Selo de verificação de loja | `npm run test:db` | Lojista solicita verificação (pendente); não aprova a própria; supervisor aprova | `rls.test.mjs`: "Lojista solicita verificação (pending)", "Lojista NÃO aprova a própria verificação", "Supervisor aprova a verificação da loja" | Aprovado no banco. **Pendente (manual)**: reprovação pelo painel, que registra o motivo padrão |
| CT09 | Pedidos e pagamento simulado | `npm run test:db` | Cliente não cria pedido já pago nem marca o próprio pedido como pago; cancela só pedido não pago; supervisor confirma o pagamento simulado | `rls.test.mjs`: "Cliente não cria pedido já pago ou em custódia", "Cliente não marca o próprio pedido como pago nem altera o total", "Cliente cancela pedido ainda não pago", "Supervisor confirma pagamento do pedido" | Aprovado no banco. Pagamento real não é testado (não existe integração com gateway) |
| CT10 | Comunidade e moderação | `npm run test:db` | Atleta publica, curte e denuncia; não remove publicação alheia; supervisor remove publicação denunciada; conta suspensa não publica | `rls.test.mjs`: "Atleta publica na comunidade", "Atleta denuncia a publicação", "Atleta não remove publicação alheia", "Supervisor remove publicação denunciada", "Conta suspensa não consegue publicar na comunidade" | Aprovado no banco |

Além dos cenários acima, a suíte `rls.test.mjs` cobre a vitrine pública (visitante anônimo lê anúncios ativos e não lê perfis) e a proibição de `TRUNCATE` por usuários autenticados.

## 3. Testes manuais previstos

Estes testes dependem de um projeto Supabase configurado, com contas de teste para cada papel. Não foram executados no ambiente de desenvolvimento. Registre data, responsável e resultado ao executá-los.

| Fluxo | Passos principais | Resultado esperado | Status |
|---|---|---|---|
| Compra | Entrar como atleta; adicionar item; pagar com PIX, cartão e boleto | Pedido criado; PIX com desconto de 5%; pagamento aguardando aprovação simulada | Pendente |
| Loja e selo | Criar loja; solicitar verificação; supervisor aprova; depois, supervisor reprova outra loja | Selo aparece após aprovação; reprovação registra "Documentação pendente ou inconsistente" | Pendente |
| Anúncio B2C | Como lojista, abrir *Vender*; escolher *Loja oficial*; publicar | Anúncio com o nome da loja e o selo somente se a loja estiver verificada | Pendente |
| Moderação | Atleta denuncia publicação; supervisor remove; supervisor suspende anúncio | Publicação removida; anúncio some da vitrine | Pendente |
| Papéis | Administrador altera papel de atleta para supervisor; tenta excluir conta-mestre | Troca aplicada; exclusão de conta-mestre bloqueada | Pendente |
| Demonstração | Abrir o aplicativo sem variáveis do Supabase | Modo demonstração, com controles de simulação de papel na barra lateral | Pendente |

## 4. Como reproduzir

```bash
npm install
npm run type-check
npm run lint
npm run build
npm run test:db                        # esquema endurecido: 47 de 47
cd database/tests && BASELINE=1 npm test   # linha de base: 18 aprovados, 29 reprovados
cd ../..
npm run start &                        # ou: npx next start -p 3000 -H 0.0.0.0
BASE_URL=http://localhost:3000 bash scripts/smoke-api.sh   # 22 de 22
```

No CI, o workflow [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) executa CT01, CT02, CT03 e CT05 a cada *push* e *pull request* para `main`.

## 5. Limitações

- Não há testes automatizados de interface (ponta a ponta). Os fluxos da seção 3 são manuais.
- Os testes de banco usam PGlite (PostgreSQL em WebAssembly). Podem existir diferenças de comportamento em relação ao Supabase; por isso o esquema é aplicado de novo em um projeto real antes da entrega.
- O teste de fumaça não usa banco: prova que as escritas exigem sessão válida, não que as regras de negócio funcionam com dados reais.
- Nesta rodada, o servidor não se conectou a um projeto Supabase real. O caminho servidor → banco (`DATABASE_URL`) não foi exercitado de ponta a ponta.
- Pagamentos são simulados e não há integração com gateway financeiro.
