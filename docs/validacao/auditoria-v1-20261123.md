# CoreMotion — auditoria de pré-lançamento (23/11/2026)

## Escopo e evidências

- Repositório: MattheusHKrainski/-CoreMotion, branch audit/v1-stabilization-20261123.
- Ambiente de inspeção: sandbox isolado em Vercel, derivado do commit 325e84e7.
- Banco Supabase: projeto erpwfjdycdlygxwkdakv, 38 tabelas públicas com RLS habilitado e 100 migrações identificadas antes desta auditoria.
- GitHub Actions do commit de origem: execução 45144322072 concluída com sucesso.
- Validações locais iniciais: 299 testes unitários aprovados; testes de banco 77/77 e suites de autorização/moderação/mídia aprovadas; type-check e build aprovados; ESLint com 16 avisos e 0 erros.
- A auditoria identificou alertas de permissões em funções SECURITY DEFINER, falta de índices, políticas com auth.uid() recalculado e falhas anteriores de conexão PostgreSQL em deployments da Vercel.
- As rotas de produção /api/products e /api/offers responderam HTTP 200 durante a inspeção. Isso não substitui testes completos sob autenticação.

## Correções desta alteração

1. QR Code de demonstração gerado com QR padrão e decodificado por teste automatizado. Contém referência não pagável vinculada à chave de idempotência da tentativa.
2. Navegação da conta direcionada ao carrinho CoreShop e aos contatos C2C, removendo o modal legado com cobrança de atletas sem validação de preço no servidor.
3. Migração para índices ausentes, restrição de RPC de trigger, otimização RLS e bloqueio de gravações diretas não validadas no legado orders.
4. Preservação de dados demonstrativos, anúncios e registros existentes.

## Pré-condições para liberar v1.0.0

- CI verde no commit final; build de preview concluído com sucesso e navegação real verificada.
- Fluxos com conta de teste: login, catálogo, carrinho, cartão de teste, Pix de demonstração, débito, boleto, histórico e prevenção de duplicidade.
- Testes de permissões com usuários distintos e equipe; verificação de RLS sem exposição de dados.
- Comparação das migrações com Supabase e conferência dos avisos remanescentes.
- Confirmar deployment em produção do mesmo SHA e criar tag/release somente depois dessas validações.

## Limitações conhecidas

- Meios de pagamento e logística demonstrativos: não há gateway, Pix bancário, adquirente, escrow nem envio real.
- QR contém texto de demonstração, destinado a scanner de QR genérico, nunca a bancos.
- Funções SECURITY DEFINER para RPC autenticada precisam ser revisadas individualmente; revogação geral bloquearia pedidos, comunidade e moderação.
- Monitoramento por tempo limitado não garante ausência de erros futuros.
