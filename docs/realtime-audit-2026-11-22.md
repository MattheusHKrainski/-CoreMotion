# Auditoria de sincronização em tempo real — CoreMotion — 22/11/2026

## Estado do serviço

- O projeto Supabase CoreMotion usa a publicação PostgreSQL supabase_realtime, com slots de replicação lógica ativos.
- Antes desta intervenção, a publicação incluía 7 tabelas e o cliente global ouvia products, external_offers e community_posts. As outras telas consultavam o banco apenas no carregamento ou a cada 15–30 segundos.
- Foram adicionadas **12 tabelas** de fluxos colaborativos e particulares, mais realtime_invalidations para alterações de catálogo/postagens que deixam de ser visíveis pela RLS após exclusão ou desativação: **20 tabelas publicadas ao todo**.
- Segurança: RLS permanece habilitada; nenhuma tabela privada recebe REPLICA IDENTITY FULL, nem tokens service_role são expostos. A tabela de invalidação publica somente topic, revision e changed_at; visitantes/usuários comuns não podem escrever nela.

## Telas sincronizadas

| Área | Tabelas observadas | Comportamento |
| --- | --- | --- |
| Feed da comunidade | community_posts, realtime_invalidations | novas postagens, edição, exclusão, curtidas e comentários |
| Catálogo C2C | products, realtime_invalidations | inclusão, status, edição e exclusão |
| Ofertas CoreShop | external_offers, realtime_invalidations | preços, disponibilidade e listagem |
| Notícias e treinadores | news, coaches | lê dados atuais do banco em vez de listas estáticas |
| Perfil e pedidos da sessão | profiles, orders | atualiza dados da própria conta |
| Curtidas e seguindo | community_likes, community_follows | sincronização entre sessões |
| Área esportiva | sports_records | seletivas, candidaturas, respostas, talentos e perfis |
| Treinadores e atividades | coach_activities | aulas, grupos e associações |
| Administração | profiles, products, external_offers, community_posts, sports_records, moderation_reports, account_notifications, orders, core_sale_orders, moderation_audit | cada aba acompanha suas fontes |
| Notificações | account_notifications, moderation_reports | avisos e respostas |
| Suporte | support_tickets | tickets e respostas |
| Pedidos comerciais | core_sale_orders, core_sale_events, core_supplier_settings | preparações, eventos e fornecedores |

## Tratamento de conexão

- A confirmação SUBSCRIBED e a reconexão provocam nova leitura para recuperar alterações perdidas na conexão.
- Eventos apenas invalidam a tela, que consulta os dados originais; RLS continua definindo as linhas visíveis.
- Observadores são removidos ao sair da página ou trocar de sessão.
- Foco, retorno de rede, visibilidade e consultas periódicas servem de recuperação se a conexão for interrompida.
- Leituras do feed usam proteção contra respostas antigas e os IDs evitam postagens duplicadas na chegada simultânea do evento e do retorno de gravação.

## Verificações

- Publicação verificada com 20 tabelas.
- Consulta pública de coach_activities sob role anon aprovada; antes retornava permission denied for function is_banned_user.
- Incremento de revision validado com uma atualização transacional revertida: não houve alteração permanente de ofertas.
- Triggers de curtidas e comentários atualizam community_posts, logo a mudança é observável no feed.
- Testes de regressão: tests/unit/realtime-integration.test.ts.

## Limites da verificação

Verificações SQL, de assinatura no código e de CI validam banco e implementação. Recebimento efetivo de WebSocket em dois navegadores reais depende de teste adicional no deploy com duas sessões e rede real; não é correto declarar esse teste como realizado sem acesso ao ambiente publicado. Realtime é quase imediato, sujeito a conectividade e limites da plataforma.
