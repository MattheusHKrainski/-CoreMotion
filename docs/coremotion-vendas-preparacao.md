# CoreMotion: vendas próprias em preparação

## Escopo implementado

- Produtos de fornecedor agora abrem em `/produto/core/[id]`, com vendedor CoreMotion e fornecedor de origem identificado. Não há redirecionamento de compra para o site do fornecedor.
- Anúncios de atletas abrem em `/produto/athlete/[id]`, com fotos disponíveis, descrição, conservação, favorito e contato do anunciante. Não passam pela venda CoreMotion.
- `/compras`: carrinho próprio, quantidades, variantes, endereço, revisão e **salvar preparação**. Carrinhos separados por usuário; itens do visitante são transferidos para sua conta ao entrar. Não contém dados de cartão ou Pix.
- `/pedidos`: histórico de preparações, subtotal de referência, observações e cancelamento. Equipe vê pedidos conforme RLS, registra análise e gerencia situação comercial dos fornecedores. As ações ficam auditadas.
- Equipe: calculadora de preço em centavos, acréscimo sobre custo e despesa fixa, com confirmação antes de publicar o preço de varejo no catálogo existente. Custos privados inseridos na calculadora não são publicados nem persistidos.
- Comunidade: layout responsivo de três colunas, descoberta por assunto, busca e ordenação recente/curtidas. Mantém publicação, imagens, seguir, comentários, curtidas e denúncias existentes. Contagens são das publicações carregadas, não membros/visitantes fictícios. No celular o feed é central, sem laterais comprimidas.

## Persistência e limites de segurança

Migrações **já aplicadas** no projeto `erpwfjdycdlygxwkdakv`:

1. `20261106050000_core_commerce_preparation.sql`
2. `20261106051000_core_commerce_variant_validation.sql`

Não reaplicar no mesmo banco. Novos ambientes devem executar as migrações na sequência de dependências do projeto. Nenhuma tabela/política do C2C foi modificada.

`core_sale_orders` armazena snapshots imutáveis do preço de varejo, fornecedor, variante, quantidade e endereço. `prepare_core_sale` valida a conta, os itens ativos, endereço e variantes; ignora preços enviados pelo cliente e calcula a partir do catálogo no banco. Usa chave idempotente e lock transacional; há limite de 20 preparações por conta/hora. Repetir a mesma requisição não cria outro registro. O navegador não tem INSERT/UPDATE/DELETE direto nos pedidos.

`review_core_sale` permite análise e observações pela equipe não suspensa e cancelamento pelo proprietário. Não permite status pago/enviado/entregue, nem reabertura de preparação cancelada. `core_sale_events` registra ações reais. Acesso aos pedidos e eventos: proprietário ou equipe verificada pelo banco; nunca por e-mail ou papel informado pelo navegador. Endereços não são gravados no localStorage e nenhum pedido é enviado ao fornecedor.

O checkout conserva o carrinho ao salvar. Se o preço mudar entre revisão e gravação, o snapshot do servidor prevalece e pode ser consultado no acompanhamento; como não há cobrança nem total final confirmado, a preparação não constitui aceite de uma compra paga. A confirmação comercial deverá revalidar preços antes de qualquer futura cobrança.

## Bloqueios deliberados

- `payment_status` só aceita `disabled` no banco.
- Frete e total final são `NULL`, nunca zero como frete grátis fictício.
- Estados atuais: preparation/reviewing/cancelled. Não há estoque reservado, preço ou prazo final garantido, transação financeira, Pix, boleto, cartão, parcelamento, nota fiscal, reembolso ou envio automático.
- `/api/commerce/payment` retorna HTTP 503 com `PAYMENTS_DISABLED` independentemente dos campos enviados.
- `/api/commerce/shipping` retorna HTTP 503, sem cotações. O botão de consulta explica a ausência de configuração, não inventa valores.
- `lib/commerce-adapters.ts` contém contratos para gateway, assinatura de webhook, frete, disponibilidade, encaminhamento e rastreamento. São **interfaces de integração**, não provedores operacionais. Não há SDK conectado ou credenciais configuradas.
- O nome de uma loja no catálogo indica origem do produto, **não acordo comercial ou integração homologada**. O status comercial começa não confirmado. Marcar um acordo aprovado no painel não ativa pagamento, logística ou integração.
- Cupons do site de origem não são aplicados às vendas CoreMotion.

## Etapas obrigatórias para operação financeira

1. Definir vendedor legal, política comercial, atendimento, direitos de arrependimento/devolução, tributação e emissão fiscal; revisar LGPD, retenção e acesso a endereços.
2. Formalizar autorização comercial com fornecedores; cadastrar SKU e variantes reais, custos verificados, estoque, responsabilidade de envio e tratamento de indisponibilidade. Preparar sincronização e monitoramento.
3. Implementar o adaptador logístico com cotações reais por fornecedor/pacote, validade, prazos e validação no servidor. Somar fretes por pacote somente após cotação válida. Integrar rastreamento real.
4. Implementar gateway com credenciais exclusivamente no servidor, checkout hospedado/tokenização, assinatura de webhooks, deduplicação de eventos, conciliação, prevenção a fraude e testes de estorno. Não coletar cartão cru no app.
5. Fazer migrações explícitas para máquina de estados financeira e logística, intent de pagamento, eventos de gateway e pacotes de fornecedor. Os bloqueios do banco não podem ser removidos por uma flag no navegador.
6. Revalidar preço, disponibilidade/variante, endereço e frete antes de criar cobrança. Encaminhar ao fornecedor apenas após confirmação de pagamento autenticada pelo servidor e regras aprovadas. Usar outbox/idempotência e fila com retentativas.
7. Homologar ponta a ponta em sandbox, testar concorrência, RLS, fraude, falhas de fornecedor, observabilidade e recuperação antes de ativar em produção.

## Validação desta entrega

- Teste transacional no Supabase: preços calculados no servidor (mesmo recebendo preço adulterado), chave idempotente, rejeição de quantidade/endereço inválidos, leitura/cancelamento entre contas bloqueados, análise de equipe inacessível ao cliente, cancelamento pelo dono, auditoria e pagamentos bloqueados. **Rollback ao final, sem pedidos de teste persistidos.**
- Unitários: `npm run test:unit` (inclui `tests/unit/commerce.test.ts`).
- Navegador: `node --import tsx tests/browser/core-commerce.mjs` e `MOBILE=1 ...`, contra servidor de testes na porta 3001 com backend simulado; não constituem teste de gateway/fornecedor real. Cobrem páginas de produto CoreMotion e atleta, variante, transferência de carrinho visitante, autenticação, endereço/revisão, frete indisponível, pagamento bloqueado, gravação/consulta de preparação e busca/ordenação na comunidade.
- Dependências opcionais de navegador em `.cache/session-ui`, fora do pacote da aplicação. Diretórios de compilação de desenvolvimento podem ser separados por `COREMOTION_DEV_DIST_DIR`, permitindo testar sem sobrescrever o preview.
