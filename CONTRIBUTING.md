# GOVERNANÇA E GUIA DE ENGENHARIA — PROJETO COREMOTIOM

Este documento estabelece os padrões técnicos, regras de ramificação (Git Flow), qualidade de código e arquitetura para a equipe de 5 desenvolvedores do CoreMotiom.

---

## 1. Stack Tecnológica
- **Framework**: Next.js 15 (App Router, Server Components e rotas de API em `app/api/`)
- **Linguagem**: TypeScript em modo estrito (`strict: true`, sem `any` injustificado)
- **Design System**: Tailwind CSS v4 + shadcn/ui (Radix UI primitives em `components/ui/`)
- **Backend-as-a-Service**: Supabase (PostgreSQL 15+, Auth, RLS)
- **Validação**: utilitários de entrada no servidor (`lib/api-utils.ts`); os esquemas Zod em `lib/schemas/` ainda não são usados pelas rotas
- **Formulários**: os formulários atuais usam estado do React (React Hook Form não é usado nesta base);
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`); a hospedagem do sistema publicado está em definição (ver README, seção Publicação)

---

## 2. Git Flow Pragmático (Equipe de 5 Pessoas)

### Branch `main` Protegida
- A branch `main` representa o ambiente de produção estável.
- **Commits diretos na `main` são estritamente proibidos.**
- Todo merge para a `main` exige:
  1. Pull Request (PR) aberto.
  2. Pelo menos 1 revisão e aprovação (code review) de outro membro da equipe.
  3. Sucesso completo na pipeline do GitHub Actions (`npm run ci`).

### Padrão de Nomenclatura de Branches
Crie sua branch a partir da `main` atualizada seguindo a convenção:
- `feature/nome-da-funcionalidade` (Ex.: `feature/auth-supabase`, `feature/pix-checkout`)
- `fix/descricao-do-bug` (Ex.: `fix/checkout-total-calculation`)
- `refactor/area-modificada` (Ex.: `refactor/products-services`)

### Ciclo de Desenvolvimento
```bash
# 1. Atualizar a main
git checkout main
git pull origin main

# 2. Criar branch de trabalho
git checkout -b feature/minha-feature

# 3. Desenvolver e validar localmente
npm run lint
npm run type-check
npm run build

# 4. Commit e push
git commit -m "feat(auth): valida o e-mail no login"
git push origin feature/minha-feature
```

---

## 3. Banco de Dados e Migrações (Supabase Governance)

1. **Alterações Estruturais**:
   - Proibido alterar schemas em produção diretamente via dashboard sem migração.
   - Todas as migrações devem ser versionadas em:
     `supabase/migrations/<timestamp>_<nome_da_migracao>.sql`
2. **Tipagem Automática (End-to-End Type Safety)**:
   - Os tipos do Supabase estão em `types/supabase.ts`.
   - Para regenerar a tipagem após uma migração:
     ```bash
     npm run types:supabase
     ```
3. **Row Level Security (RLS)**:
   - Toda nova tabela DEVE ter RLS ativado: `ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;`.
   - Visitantes: apenas leitura de dados públicos.
   - Usuários autenticados: acesso restrito aos seus próprios dados (`auth.uid() = user_id`).
   - Contas-mestre (lista em `lib/permissions.ts` e na função `is_master_email`): acesso de administrador, via função protegida `is_admin()`.

---

## 4. Estrutura de Diretórios de Componentes

```text
components/
├── ui/           # Primitivas shadcn/ui (Button, Dialog, Badge, Input, Card, Tabs, Form, etc.)
├── auth/         # Telas e modais de login, cadastro, recuperação de conta
├── marketplace/  # Cards de produtos, filtros técnicos, vitrine esportiva
├── stores/       # Painel do lojista, verificação com CNPJ, catálogo oficial
├── admin/        # Auditoria administrativa, moderação e métricas
└── shared/       # Header, Footer, EmptyStates, Skeletons
```
