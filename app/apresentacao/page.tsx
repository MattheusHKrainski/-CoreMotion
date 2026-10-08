'use client';

import React, { useCallback, useEffect, useState } from 'react';
import DyeWhorl from '@/components/ui/dye-whorl';

/* =========================================================================
   CoreMotiom — Apresentação Acadêmica (versão HTML navegável)
   Mesmo conteúdo do deck .pptx (docs/apresentacao/), tema claro corporativo.
   Navegação: ← → · Espaço · Home/End · botões · indicadores.
   ========================================================================= */

const INK = '#0F172A';
const BODY = '#334155';
const MUTED = '#64748B';
const RED = '#DC2626';
const CARD = '#F1F5F9';
const LINE = '#E2E8F0';
const RED_SOFT = '#FEF2F2';

const META = 'CoreMotiom — Apresentação Acadêmica de Projeto • Curitiba, outubro de 2026';

function Frame({
  kicker,
  title,
  n,
  total,
  children,
}: {
  kicker: string;
  title: string;
  n: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col bg-white px-6 md:px-16 pt-7 md:pt-10 pb-3">
      <div className="flex items-center gap-3">
        <span className="h-3.5 w-3.5 shrink-0" style={{ background: RED }} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: RED }}>
          {kicker}
        </span>
      </div>
      <h2 className="mt-2 text-2xl md:text-4xl font-extrabold tracking-tight" style={{ color: INK }}>
        {title}
      </h2>
      <div className="mt-3 h-[5px] w-24" style={{ background: RED }} />
      <div className="mt-5 md:mt-6 min-h-0 flex-1 overflow-hidden">{children}</div>
      <div className="flex items-center justify-between pt-3 text-[11px]" style={{ color: MUTED }}>
        <span>{META}</span>
        <span className="tabular-nums">
          {n} / {total}
        </span>
      </div>
    </div>
  );
}

function Bullets({ items, size = 'text-sm md:text-[15px]' }: { items: string[]; size?: string }) {
  return (
    <ul className="space-y-3 md:space-y-4">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[2px] shrink-0 font-bold" style={{ color: RED }}>
            ▪
          </span>
          <span className={`${size} leading-relaxed`} style={{ color: BODY }}>
            {it}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Card({
  title,
  lines,
  accent = true,
}: {
  title: string;
  lines: (string | React.ReactNode)[];
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4 md:p-5"
      style={{ background: CARD, borderColor: LINE }}
    >
      <div className="flex items-center gap-2.5">
        {accent && <span className="h-2.5 w-2.5 shrink-0" style={{ background: RED }} />}
        <h3 className="text-sm md:text-base font-bold" style={{ color: INK }}>
          {title}
        </h3>
      </div>
      <div className="mt-2 space-y-1">
        {lines.map((l, i) => (
          <p key={i} className="text-xs md:text-[13px] leading-snug" style={{ color: BODY }}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center rounded-xl border px-3 py-4 text-center"
      style={{ background: CARD, borderColor: LINE }}
    >
      <span className="h-2.5 w-2.5 mb-2" style={{ background: RED }} />
      <span className="text-2xl md:text-4xl font-black tabular-nums" style={{ color: RED }}>
        {n}
      </span>
      <span className="mt-1 text-[11px] md:text-xs" style={{ color: BODY }}>
        {label}
      </span>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[11px] md:text-xs" style={{ color: MUTED }}>
      {children}
    </p>
  );
}

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]" style={{ color: '#B91C1C', border: `1px solid ${LINE}` }}>
    {children}
  </code>
);

/* ------------------------------- conteúdo ------------------------------- */

function CoverSlide() {
  return (
    <DyeWhorl density={1} stir={1}>
      <div className="flex h-full w-full items-center px-6 md:px-20">
        <div className="max-w-2xl rounded-3xl border bg-white/80 p-7 md:p-10 shadow-2xl backdrop-blur-md" style={{ borderColor: LINE }}>
          <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em]" style={{ color: RED }}>
            Projeto Acadêmico • Engenharia de Software
          </span>
          <h1 className="mt-3 text-5xl md:text-7xl font-black tracking-tight" style={{ color: INK }}>
            CoreMotiom
          </h1>
          <p className="mt-2 text-lg md:text-2xl font-semibold" style={{ color: RED }}>
            Marketplace & Plataforma Esportiva de Alta Performance
          </p>
          <div className="mt-4 h-[5px] w-28" style={{ background: RED }} />
          <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: BODY }}>
            Lojas oficiais verificadas · venda C2C entre atletas · custódia financeira
            (escrow) · treinadores e comunidade
          </p>
          <p className="mt-6 text-xs md:text-sm" style={{ color: MUTED }}>
            Desenvolvimento: <strong style={{ color: INK }}>Mattheus</strong> · github.com/MattheusHKrainski
            <br />
            Curitiba — outubro de 2026
          </p>
          <p className="mt-3 text-[11px]" style={{ color: '#94A3B8' }}>
            Use ← → para navegar · arraste o fundo para interagir com a tinta
          </p>
        </div>
      </div>
    </DyeWhorl>
  );
}

function ProblemSlide() {
  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div>
        <Bullets
          items={[
            'Equipamentos de alta performance (tênis com placa de carbono, GPS, compressão) têm alto custo e forte mercado de revenda.',
            'A revenda entre atletas ocorre em canais genéricos: sem inspeção de desgaste, sem preço de referência e com risco de golpe.',
            'Lojas esportivas online convivem com falsificações e não possuem selo de verificação confiável no varejo generalista.',
            'Não havia plataforma vertical integrando marketplace, custódia financeira, treinadores e comunidade em um só produto.',
          ]}
        />
      </div>
      <div className="rounded-xl border p-4 md:p-5" style={{ background: RED_SOFT, borderColor: LINE }}>
        <h3 className="text-sm font-bold" style={{ color: INK }}>
          Evidências no código
        </h3>
        <div className="mt-3 space-y-3 text-xs md:text-[13px] leading-relaxed" style={{ color: BODY }}>
          <p>
            Tela “Vender C2C” bloqueia visitantes: “proteção anti-golpe” <Code>app/page.tsx</Code>
          </p>
          <p>
            Solicitação de selo oficial com CNPJ <Code>components/StoresView.tsx</Code>
          </p>
          <p>
            Status de pedido com escrow: <Code>escrow_locked</Code> <Code>types/supabase.ts</Code>
          </p>
        </div>
      </div>
    </div>
  );
}

function ObjectivesSlide() {
  return (
    <div className="flex h-full flex-col gap-5">
      <Card
        title="Objetivo geral"
        lines={[
          'Desenvolver uma plataforma web que integre um marketplace esportivo híbrido (B2C + C2C) com custódia financeira, lojas oficiais verificadas e serviços para atletas.',
        ]}
      />
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: RED }}>
          Objetivos específicos
        </span>
        <div className="mt-3">
          <Bullets
            items={[
              'Implementar verificação de lojas oficiais com CNPJ e selo “Verificado”.',
              'Proteger vendas C2C com pagamento retido em custódia (escrow) até a confirmação do pedido.',
              'Oferecer checkout com PIX (5% de desconto), cartão de crédito e boleto.',
              'Integrar comunidade esportiva, treinadores com CREF e notícias ao ecossistema.',
              'Garantir segurança de dados com Row Level Security (RLS) e perfis de acesso.',
              'Prover painel administrativo de auditoria, moderação e custódia.',
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function JustificationSlide() {
  return (
    <Bullets
      size="text-sm md:text-base"
      items={[
        'O crescimento da corrida de rua e dos esportes de performance no Brasil amplia o mercado de equipamentos novos e seminovos.',
        'Confiança é o principal entrave da revenda C2C: assimetria de informação sobre desgaste, autenticidade e preço justo.',
        'Supabase com RLS permite segurança em nível de banco de dados — prática de produção aplicada já no MVP acadêmico.',
        'O projeto consolida competências de engenharia: React/Next.js, TypeScript estrito, SQL, segurança e UX.',
        'Serve como base replicável: governança de Git, migrações versionadas e tipagem de ponta a ponta documentadas em CONTRIBUTING.md.',
      ]}
    />
  );
}

function MethodologySlide() {
  return (
    <Bullets
      items={[
        'Git Flow pragmático (equipe de 5): branch main protegida; merge apenas via Pull Request com revisão e verificação (CONTRIBUTING.md).',
        'TypeScript em modo estrito (strict: true), sem any injustificado; tipagem do banco gerada automaticamente (types/supabase.ts).',
        'Validação de ponta a ponta com schemas Zod + React Hook Form, centralizados em lib/schemas/.',
        'Banco de dados governado: migrações versionadas em supabase/migrations/ e RLS obrigatório em toda tabela nova.',
        'Camada de serviços isolada da UI (services/*.ts), permitindo trocar Supabase/fallback local sem reescrever telas.',
        'Pipeline de qualidade acionável localmente: npm run ci = lint + type-check + build.',
      ]}
    />
  );
}

function StackSlide() {
  return (
    <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-2">
      <Card
        title="Front-end"
        lines={[
          'Next.js 15 — App Router, Server Components e Server Actions',
          'React 19 · Tailwind CSS v4 · shadcn/ui (Radix UI)',
          'motion (animações) · lucide-react (ícones)',
        ]}
      />
      <Card
        title="Back-end / BaaS"
        lines={[
          'Supabase: PostgreSQL 15+, Auth, Storage e RLS',
          'Server Actions (app/actions/) e API Routes (app/api/)',
          'node-postgres (pg) em scripts de seed e migração',
        ]}
      />
      <Card
        title="Qualidade & validação"
        lines={[
          'TypeScript estrito · ESLint (eslint-config-next)',
          'Zod (schemas) · React Hook Form (+ @hookform/resolvers)',
          'type-check e build integrados no script ci',
        ]}
      />
      <Card
        title="Inteligência artificial"
        lines={[
          '@google/genai — API Gemini (dependência declarada)',
          'SmartScan: avaliação de desgaste e preço justo',
          '(componente prototipado, em fase de integração)',
        ]}
      />
    </div>
  );
}

function ArchitectureSlide() {
  const rows = [
    ['UI / Views', 'Marketplace · Lojas · Vender C2C · Coaches · Comunidade · Admin (components/)'],
    ['Estado global', 'CoreMotiomProvider (React Context): sessão, carrinho, toasts, modais — lib/store.tsx'],
    ['Integração', 'services/*.ts · Server Actions (app/actions/) · API Routes (app/api/)'],
    ['Dados', 'Supabase: Auth · PostgreSQL + RLS · Storage  |  fallback local (lib/initial-data.ts)'],
  ];
  return (
    <div className="relative flex h-full flex-col justify-center gap-1 pr-0 lg:pr-56">
      {rows.map(([t, b], i) => (
        <React.Fragment key={t}>
          <div
            className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 rounded-xl border px-5 py-3.5"
            style={{ background: i % 2 ? RED_SOFT : CARD, borderColor: LINE }}
          >
            <span className="w-40 shrink-0 text-sm font-bold" style={{ color: i === 3 ? RED : INK }}>
              {t}
            </span>
            <span className="text-xs md:text-[13px]" style={{ color: BODY }}>
              {b}
            </span>
          </div>
          {i < rows.length - 1 && (
            <div className="text-center text-xs font-bold" style={{ color: RED }}>
              ▼
            </div>
          )}
        </React.Fragment>
      ))}
      <div
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-48 flex-col items-center rounded-xl border-2 bg-white px-4 py-6 text-center"
        style={{ borderColor: RED }}
      >
        <span className="text-base font-black" style={{ color: RED }}>
          Gemini
        </span>
        <span className="text-base font-black" style={{ color: RED }}>
          API
        </span>
        <span className="mt-1 text-xs" style={{ color: MUTED }}>
          SmartScan (IA)
        </span>
      </div>
    </div>
  );
}

function DataSlide() {
  const tables = [
    ['profiles', 'papéis: admin · merchant · seller · user; sincronizada com auth.users'],
    ['stores', 'verificação: none → pending → verified / rejected; docs + CNPJ'],
    ['products', 'product_type: b2c | c2c · condição · estoque · status active/sold/suspended'],
    ['orders', 'escrow: pending_payment → escrow_locked → preparing → shipped → delivered'],
    ['community_posts', 'categorias: treino · equipamento · evento · dúvida · conquista'],
  ];
  const stats = [
    ['20', 'políticas de Row Level Security ativas'],
    ['8', 'índices para consultas de catálogo'],
    ['2', 'funções SQL: is_admin() e handle_new_user()'],
    ['314', 'linhas de migração versionada (supabase/migrations/)'],
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col justify-between gap-2.5">
          {tables.map(([t, b]) => (
            <div
              key={t}
              className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 rounded-xl border px-4 py-2.5"
              style={{ background: CARD, borderColor: LINE }}
            >
              <span className="w-36 shrink-0 font-mono text-xs md:text-[13px] font-bold" style={{ color: RED }}>
                {t}
              </span>
              <span className="text-[11px] md:text-xs" style={{ color: BODY }}>
                {b}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-2.5">
          {stats.map(([n, d]) => (
            <div
              key={d}
              className="flex items-center gap-4 rounded-xl border px-4 py-2.5"
              style={{ background: RED_SOFT, borderColor: LINE }}
            >
              <span className="w-14 text-center text-2xl md:text-3xl font-black tabular-nums" style={{ color: RED }}>
                {n}
              </span>
              <span className="text-[11px] md:text-xs" style={{ color: BODY }}>
                {d}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Note>
        <Code>is_admin()</Code>: função SECURITY DEFINER que protege o admin mestre; visitantes têm apenas leitura de dados públicos.
      </Note>
    </div>
  );
}

function FeaturesSlide() {
  const mods = [
    ['Início', 'Hero, destaques e vitrines curadas'],
    ['Marketplace', 'Filtros: tipo, categoria, esporte, condição, loja verificada'],
    ['Lojas Oficiais', 'Criação de loja e selo “Verificado” via CNPJ'],
    ['Vender C2C', 'Anúncio de seminovos com custódia anti-golpe'],
    ['Checkout', 'PIX (5% off) com QR Code, cartão e boleto; escrow'],
    ['Treinadores', 'Perfis com CREF, avaliação e valor/hora'],
    ['Comunidade', 'Posts, curtidas e comentários por categoria'],
    ['Painel Admin', 'Auditoria de lojas, pedidos e custódia (is_admin)'],
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        {mods.map(([t, b]) => (
          <div
            key={t}
            className="flex items-center gap-4 rounded-xl border px-4 py-2"
            style={{ background: CARD, borderColor: LINE }}
          >
            <span className="h-2.5 w-2.5 shrink-0" style={{ background: RED }} />
            <span className="w-32 shrink-0 text-sm font-bold" style={{ color: INK }}>
              {t}
            </span>
            <span className="text-[11px] md:text-xs" style={{ color: BODY }}>
              {b}
            </span>
          </div>
        ))}
      </div>
      <Note>
        <strong>Nota de transparência:</strong> o módulo SmartScan (IA) existe como componente prototipado{' '}
        <Code>SmartScanView.tsx</Code>, ainda não integrado à navegação.
      </Note>
    </div>
  );
}

function MetricsSlide() {
  const nums = [
    ['86', 'arquivos TypeScript (.ts/.tsx)'],
    ['16.641', 'linhas de código TypeScript'],
    ['7.769', 'linhas em componentes de UI'],
    ['1.973', 'linhas na camada de serviços'],
    ['54 / 38', 'lojas / produtos no seed de testes'],
    ['20', 'políticas RLS no schema'],
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {nums.map(([n, d]) => (
          <Stat key={d} n={n} label={d} />
        ))}
      </div>
      <Note>Medições diretas no repositório (wc -l / contagens de schema), outubro de 2026; seed em lib/initial-data.ts.</Note>
    </div>
  );
}

function ConclusionSlide() {
  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: RED }}>
          Trabalhos futuros
        </span>
        <div className="mt-3">
          <Bullets
            items={[
              'Integrar o SmartScan à navegação e conectar a inferência real da API Gemini.',
              'Conectar gateway de pagamento real — hoje o fluxo roda em sandbox com custódia simulada.',
              'Ativar CI com GitHub Actions (.github/workflows/) e testes end-to-end.',
              'Evoluir para experiência mobile (PWA/app) com notificações de pedido.',
            ]}
          />
        </div>
      </div>
      <Card
        title="Síntese"
        lines={[
          'O CoreMotiom entrega um ecossistema esportivo vertical em que confiança é recurso de produto: lojas verificadas via CNPJ, escrow na revenda C2C e Row Level Security em nível de banco — com governança de código documentada e pronta para evolução.',
        ]}
      />
    </div>
  );
}

/* --------------------------------- página -------------------------------- */

export default function ApresentacaoPage() {
  const [idx, setIdx] = useState(0);

  const total = 11;
  const go = useCallback(
    (n: number) => setIdx((i) => Math.max(0, Math.min(total - 1, n ?? i))),
    [total],
  );

  // tema claro para o DyeWhorl enquanto a apresentação está montada
  useEffect(() => {
    const el = document.documentElement;
    const had = el.classList.contains('dark');
    el.classList.remove('dark');
    return () => {
      if (had) el.classList.add('dark');
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setIdx((i) => Math.min(total - 1, i + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setIdx(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setIdx(total - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  const slides: React.ReactNode[] = [
    <CoverSlide key="s1" />,
    <Frame key="s2" kicker="Contextualização" title="O problema que o projeto resolve" n={2} total={total}>
      <ProblemSlide />
    </Frame>,
    <Frame key="s3" kicker="Objetivos" title="Objetivo geral e específicos" n={3} total={total}>
      <ObjectivesSlide />
    </Frame>,
    <Frame key="s4" kicker="Justificativa" title="Por que este projeto é relevante" n={4} total={total}>
      <JustificationSlide />
    </Frame>,
    <Frame key="s5" kicker="Metodologia" title="Processo de desenvolvimento e qualidade" n={5} total={total}>
      <MethodologySlide />
    </Frame>,
    <Frame key="s6" kicker="Fundamentação técnica" title="Stack tecnológica" n={6} total={total}>
      <StackSlide />
    </Frame>,
    <Frame key="s7" kicker="Arquitetura" title="Visão em camadas do sistema" n={7} total={total}>
      <ArchitectureSlide />
    </Frame>,
    <Frame key="s8" kicker="Banco de dados & segurança" title="Modelo relacional e RLS" n={8} total={total}>
      <DataSlide />
    </Frame>,
    <Frame key="s9" kicker="Resultados funcionais" title="Módulos implementados" n={9} total={total}>
      <FeaturesSlide />
    </Frame>,
    <Frame key="s10" kicker="Resultados quantitativos" title="Métricas do código e do banco" n={10} total={total}>
      <MetricsSlide />
    </Frame>,
    <Frame key="s11" kicker="Conclusão" title="Trabalhos futuros e síntese" n={11} total={total}>
      <ConclusionSlide />
    </Frame>,
  ];

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-white font-sans">
      <style>{`
        @keyframes deck-in { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
        .deck-in { animation: deck-in .45s cubic-bezier(.22,.8,.36,1); }
      `}</style>

      {/* barra de progresso */}
      <div
        className="absolute left-0 top-0 z-20 h-1 transition-all duration-300"
        style={{ width: `${((idx + 1) / total) * 100}%`, background: RED }}
      />

      {slides.map((s, i) => (
        <div key={i} className={i === idx ? 'deck-in h-full w-full' : 'hidden'}>
          {s}
        </div>
      ))}

      {/* indicadores */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para o slide ${i + 1}`}
            onClick={() => go(i)}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === idx ? 22 : 8,
              background: i === idx ? RED : '#CBD5E1',
            }}
          />
        ))}
      </div>

      {/* controles */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2">
        <button
          aria-label="Slide anterior"
          onClick={() => go(idx - 1)}
          disabled={idx === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-base font-bold shadow-md transition hover:scale-105 disabled:opacity-40"
          style={{ borderColor: LINE, color: INK }}
        >
          ‹
        </button>
        <button
          aria-label="Próximo slide"
          onClick={() => go(idx + 1)}
          disabled={idx === total - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-base font-bold shadow-md transition hover:scale-105 disabled:opacity-40"
          style={{ borderColor: LINE, color: INK }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
