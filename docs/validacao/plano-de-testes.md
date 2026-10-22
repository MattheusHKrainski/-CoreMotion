# Plano de testes — CoreMotiom

Atualizado em 2026-10-20. Este plano descreve o escopo atual, o que é verificado automaticamente e o que ainda exige validação manual. Os resultados automatizados estão em [`resultados-testes-banco.txt`](resultados-testes-banco.txt) e [`smoke-api.txt`](smoke-api.txt).

## 1. Escopo atual

- **B2C**: vitrine composta por fixtures fictícias. Lojas, URLs, preços e descontos não vêm de fontes reais; a ação **Ver oferta** é apenas uma simulação e não abre um site externo.
- **C2C**: anúncios entre atletas seguem no catálogo interno, na moderação e no checkout demonstrativo.
- **Legado de lojas/B2C**: tabelas, colunas e registros são preservados, mas o REST não expõe perfis de loja nem produtos B2C antigos; novas publicações e pedidos B2C são recusados.
- **Fora do escopo automatizado**: validação visual ponta a ponta no navegador, conexão a um projeto Supabase real, scraping/fontes de oferta reais e pagamentos/envios reais.

## 2. Casos automatizados

| ID | Área / requisito | Procedimento | Evidência / resultado esperado |
|---|---|---|---|
| CT01 | Tipos e lint | `npm run type-check`; `npm run lint` | Sem erros TypeScript ou ESLint; avisos de imagens são não bloqueantes. |
| CT02 | Build | `npm run build` | Build de produção termina com sucesso. |
| CT03 | Autorização de banco | `npm run test:db` | 62 cenários em PGlite: RLS, papéis, produtos, pedidos, comunidade, migração de retirada de B2C e acesso REST a lojas legadas. |
| CT04 | API exige sessão | Servidor em execução; `BASE_URL=... bash scripts/smoke-api.sh` | Todas as rotas de escrita/listagem protegidas retornam 401 sem token e com token forjado. |
| CT05 | Anúncios legados | Cenários em `database/tests/rls.test.mjs` | Linha B2C pré-existente continua armazenada, mas não é lida/editada/removida via REST; inserção B2C nova é recusada. |
| CT06 | Checkout C2C | Testes unitários e de banco | Cálculo demonstrativo preservado; pedido com item C2C permitido, item B2C legado recusado. |
| CT07 | Ofertas e schema de publicação | `npm run test:unit` | 12/12 testes unitários; ofertas marcadas como fictícias usam domínios reservados `.example.test`; schema assume C2C e rejeita `product_type=b2c`. |

## 3. Validação manual pendente

Estes testes dependem da interface e, para os cenários de banco real, de um projeto Supabase configurado. Não são evidência de integração externa.

| Fluxo | Passos principais | Resultado esperado | Status |
|---|---|---|---|
| Vitrine B2C fictícia | Abrir a vitrine, conferir o aviso de demonstração e usar **Ver oferta** | Modal identifica loja/endereço/preço como fictícios; nenhum site externo é aberto. | Pendente |
| Anúncios C2C | Entrar como atleta, publicar e moderar um anúncio C2C | Fluxo C2C normal, com autoria e moderação corretas. | Pendente |
| Checkout C2C | Adicionar C2C ao carrinho; percorrer PIX/cartão/boleto e opções de envio | Pedido demonstrativo; nenhum pagamento, transporte ou entrega real é declarado. | Pendente |
| Papéis e comunidade | Denunciar publicação; como supervisor moderar; como admin alterar papel | Permissões aplicadas; conta-mestre protegida. | Pendente |
| Migração num projeto externo | Aplicar as quatro migrações em ambiente de teste e conferir privilégios e gatilhos | Lojas e anúncios B2C antigos permanecem no banco, mas não são expostos por REST nem aceitos no checkout. | Pendente |

Não há mais fluxo manual de criação de loja, diretório de lojas, revisão de CNPJ ou publicação de anúncios B2C por usuário.

## 4. Como reproduzir

```bash
npm install
npm run type-check
npm run lint
npm run test:unit
npm run test:db
npm run build
npm run start &
BASE_URL=http://localhost:3000 bash scripts/smoke-api.sh
```

A suíte de banco usa PGlite (PostgreSQL em WebAssembly), executa as quatro migrações em banco temporário e não conecta nem altera um projeto Supabase externo. Confira [`resultados-testes-banco.txt`](resultados-testes-banco.txt) para a saída mais recente.

## 5. Limitações

- A vitrine B2C não implementa scraping, consulta de URL, integração de preços ou redirecionamento real. As fixtures serão substituídas/conectadas posteriormente.
- Checkout, pagamento, frete e entrega são demonstrativos. Nenhum pagamento ou envio real ocorre.
- Não há testes automatizados de interface (ponta a ponta).
- PGlite pode diferir de uma instância Supabase hospedada; a migração deve ser aplicada em ambiente controlado e validada antes da publicação.
