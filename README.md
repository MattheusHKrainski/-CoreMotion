# CoreMotion

**Marketplace e comunidade esportiva em um só lugar.**

O **CoreMotion** é um projeto de Trabalho de Conclusão de Curso (TCC) desenvolvido para reunir produtos esportivos, anúncios de equipamentos entre atletas e uma comunidade de pessoas ligadas ao esporte. O objetivo é facilitar a descoberta de produtos por modalidade e aproximar atletas, treinadores e consumidores.

> **Importante:** o checkout da CoreShop é **100% simulado**. Pix, cartões e boleto não movimentam dinheiro. O QR de demonstração é escaneável como texto, mas **não é um código Pix bancário pagável**.

## Sumário

- [Proposta e funcionalidades](#proposta-e-funcionalidades)
- [Como funciona a compra](#como-funciona-a-compra)
- [Perfis e permissões](#perfis-e-permissões)
- [Tecnologias e arquitetura](#tecnologias-e-arquitetura)
- [Banco de dados](#banco-de-dados)
- [Testes e validação](#testes-e-validação)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Equipe](#equipe)
- [Estado e limitações](#estado-e-limitações)
- [Links](#links)

## Proposta e funcionalidades

### CoreShop — catálogo esportivo

- Descoberta por modalidade, marcas e clubes; pesquisa e filtros.
- Produtos com imagens, descrição, preço, opções de tamanho/cor quando disponíveis e indicação de estoque ou esgotamento.
- Favoritos, carrinho, revisão da compra e histórico de pedidos demonstrativos.
- Página inicial com campanha, carrosséis, destaques e notícias de lançamentos reais. **Um produto divulgado como lançamento não significa que esteja disponível à venda.**
- Catálogo de clubes de futebol, vôlei e basquete, conforme os dados disponíveis.

### Equipamentos de atletas — C2C

Usuários podem anunciar equipamentos usados ou novos sem uso, com informações sobre modalidade, preço e conservação. A negociação ocorre por **contato direto com o anunciante**, não pelo checkout demonstrativo da CoreShop. O carrinho de anúncios de atletas está acessível em `/compras` para consulta e contato.

### Comunidade esportiva

Feed de publicações, interações, comentários, curtidas, denúncias e recursos de perfis esportivos. A intenção é aproximar atletas, treinadores e outros participantes além do processo de compra.

### Gestão e moderação

Recursos para usuários, supervisores e administradores, incluindo gerenciamento e moderação de contas, anúncios e publicações, observadas as permissões de cada perfil.

**Nota sobre a evolução:** o projeto deixou de ter como proposta principal o encaminhamento do comprador para ofertas externas. Algumas tabelas e componentes ainda conservam nomes históricos, como `external_offers`, por compatibilidade com o catálogo existente. Isso não representa o modelo comercial pretendido.

## Como funciona a compra

O fluxo de demonstração da **CoreShop** é: **carrinho → endereço → revisão e CPF → escolha do pagamento → confirmação → Meus pedidos**.

- **Pix:** QR Code e referência demonstrativos, sem chave bancária e sem pagamento real.
- **Cartão de crédito e débito:** formulário visual realista, mas com **dados fictícios**, sem processamento financeiro.
- **Boleto:** referência ilustrativa, que não representa cobrança bancária.
- **CPF:** o formulário exige um número com dígitos verificadores válidos antes de permitir a confirmação; isso não equivale a identificação fiscal externa ou antifraude.
- **Confirmação:** a RPC autenticada `confirm_demo_order` valida o carrinho e os preços a partir do catálogo, usa uma chave idempotente para evitar duplicidade da mesma tentativa e registra o pedido demonstrativo em `core_sale_orders`.
- **Histórico:** o usuário acompanha os registros na área `/pedidos`, conforme suas permissões.

**Não existe integração com banco, adquirente, gateway de pagamento, transportadora nem liquidação real de valores.** Não use dados de cartões verdadeiros nas demonstrações.

## Perfis e permissões

| Perfil | O que pode fazer |
|---|---|
| Visitante | Navegar pelo conteúdo público e explorar produtos. |
| Usuário / atleta | Gerenciar perfil, interagir com a comunidade, usar a CoreShop e anunciar equipamentos quando autenticado. |
| Anunciante | Gerenciar seus próprios anúncios conforme as regras de acesso. |
| Supervisor | Exercer funções autorizadas de acompanhamento e moderação. |
| Administrador | Gerenciar funcionalidades e permissões administrativas da plataforma. |

A aplicação usa autenticação do Supabase e políticas de **Row Level Security (RLS)** para proteger operações no banco. O acesso exato depende do papel, do recurso e das regras implementadas.

### Acesso rápido

Login e cadastro oferecem a opção de salvar uma conta real autenticada para acesso rápido no navegador, desmarcada por padrão. Não há usuários de teste automáticos nessa função. Evite utilizar a opção em dispositivos compartilhados. Detalhes em [Acesso rápido de contas](docs/auth/acesso-rapido-contas-salvas.md).

## Tecnologias e arquitetura

| Camada | Tecnologias | Finalidade |
|---|---|---|
| Front-end | Next.js 15, React 19, TypeScript, Tailwind CSS 4 | Páginas, componentes, navegação e interface responsiva. |
| Back-end | Node.js, rotas de API Next.js | Regras e operações no servidor. |
| Dados | Supabase e PostgreSQL | Persistência, funções SQL e políticas RLS. |
| Autenticação | Supabase Auth | Login, sessão e autorização. |
| Validação | Zod e validações no código e no banco | Conferência dos dados de entrada. |
| Qualidade | ESLint, TypeScript e testes automatizados | Análise estática e testes. |
| Colaboração | Git, GitHub e GitHub Actions | Versionamento, pull requests e CI. |
| Deploy | Vercel | Preview e hospedagem da aplicação web. |

A interface React/Next.js conversa com as rotas e serviços da aplicação, que consultam ou alteram o banco PostgreSQL através de operações autorizadas. Funções críticas de pedidos são executadas no Supabase. Variáveis de ambiente privadas e segredos nunca devem ser adicionados ao repositório.

## Banco de dados

O esquema PostgreSQL registra perfis, papéis, produtos e anúncios, opções de produto, imagens, carrinhos, pedidos demonstrativos, publicações, interações, denúncias e ações administrativas. As mudanças estruturais são versionadas em [supabase/migrations](supabase/migrations/).

Leia também a [documentação do banco](database/README.md) e a [auditoria técnica de pré-lançamento](docs/validacao/auditoria-v1-20261123.md). Alguns arquivos de documentação antigos explicam etapas anteriores do projeto e podem não refletir o fluxo comercial atual.

## Testes e validação

Os comandos abaixo permitem executar as verificações automatizadas do repositório:

```bash
npm run lint
npm run type-check
npm run test:unit
npm run test:db
npm run build
```

Os resultados variam conforme as dependências e o ambiente. A auditoria de 23/11/2026 registrou **300 testes unitários, 77 testes de banco e CI aprovados**, além de **16 avisos de lint sem erros bloqueantes** naquele commit. **Isso não significa homologação completa:** o fluxo autenticado em navegador, a experiência em dispositivos diferentes e as permissões avançadas precisam ser validados antes de afirmar ausência de falhas.

## Estrutura do repositório

```text
app/                  Páginas e rotas da aplicação
components/           Componentes da interface e comércio
lib/                  Regras auxiliares, tipos e estado
services/             Integrações e acesso aos dados
fixtures/             Conteúdos de referência e dados iniciais
supabase/migrations/  Migrações SQL e políticas
database/             Testes e documentação do banco
tests/                Testes automatizados
docs/                 Documentação do TCC e auditorias
.github/workflows/    Integração contínua
```

## Equipe

Projeto desenvolvido por **cinco integrantes**, organizados com práticas de Scrum. As responsabilidades se complementam.

| Integrante | Área principal |
|---|---|
| Marcus | Organização de tarefas, liderança e Scrum Master. |
| André | Identidade visual, design e experiência do usuário. |
| Alfeu | Banco de dados, Supabase e integridade das informações. |
| Mattheus Krainski | Funcionalidades, back-end, carrinho e pedidos. |
| Bruno | Recursos de comunidade, perfis e interações em colaboração com a equipe. |

## Estado e limitações

O CoreMotion é um **protótipo acadêmico funcional**, não uma operação comercial com pagamentos reais. A monetização por comissões e parcerias é parte da **proposta de negócio futura**, e exigiria validação de fornecedores, pagamentos, logística, documentação e operação.

O histórico de commits e deploys pode ser conferido no GitHub e na Vercel. Um build bem-sucedido **não comprova que todos os fluxos foram testados de ponta a ponta**. A versão estável `v1.0.0` só deve ser marcada como concluída após os critérios de homologação definidos em [auditoria de pré-lançamento](docs/validacao/auditoria-v1-20261123.md).

## Links

- **Aplicação:** https://core-motion-siyz.vercel.app
- **Repositório:** https://github.com/MattheusHKrainski/-CoreMotion
- **Banco e migrações:** [supabase/migrations](supabase/migrations/)
- **Expansão do catálogo:** [Relatório de 22/11/2026](docs/catalogo/expansao-400-reais-e-ligas-2026-11-22.md)
- **Auditoria de segurança e estabilidade:** [Relatório de 23/11/2026](docs/validacao/auditoria-v1-20261123.md)

---

**CoreMotion — Encontre. Movimente-se. Evolua.**
