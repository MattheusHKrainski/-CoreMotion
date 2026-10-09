'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { X, Database, Check, Copy, ShieldCheck, Server, Key } from 'lucide-react';

/** Modelo de ambiente SEM credenciais reais. Cada integrante preenche o seu arquivo .env.local. */
const ENV_TEMPLATE = `# Servidor (rotas de API e scripts) — URI "Session pooler" do painel Supabase
DATABASE_URL=postgresql://<usuario>:<senha>@<host-do-pooler>:5432/postgres

# Navegador e servidor — chaves públicas do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
`;

const MIGRATION_ORDER = [
  'supabase/migrations/20250101000000_coremotiom_initial_schema.sql',
  'supabase/migrations/20261008000000_roles_hierarchy_and_security.sql',
];

export default function SupabaseConfigModal() {
  const { isSupabaseConfigOpen, setSupabaseConfigOpen, isSupabaseLive, addToast } = useCoreMotiom();
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isSupabaseConfigOpen) return null;

  const copyEnvTemplate = () => {
    navigator.clipboard?.writeText(ENV_TEMPLATE);
    setCopiedEnv(true);
    addToast('Modelo copiado', 'Preencha o arquivo .env.local com os dados do seu projeto.', 'success');
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const connected = isSupabaseConfigured && isSupabaseLive;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Configuração do Banco (Supabase)</h2>
              <p className="text-xs text-zinc-400">Status: {connected ? 'conectado' : isSupabaseConfigured ? 'configurado, aguardando sincronização' : 'modo demonstração (sem banco)'}</p>
            </div>
          </div>
          <button onClick={() => setSupabaseConfigOpen(false)} className="p-2 text-zinc-400 hover:text-white" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Key className="w-4 h-4 text-red-400" /> 1. Variáveis de ambiente</h3>
          <p className="text-xs text-zinc-400">Crie o arquivo <code className="text-zinc-200">.env.local</code> na raiz do projeto. Nunca publique senhas ou a chave <code>service_role</code>.</p>
          <pre className="text-[11px] leading-relaxed bg-black/60 border border-zinc-800 rounded-xl p-3 overflow-x-auto text-zinc-300">{ENV_TEMPLATE}</pre>
          <button onClick={copyEnvTemplate} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white">
            {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedEnv ? 'Copiado' : 'Copiar modelo'}
          </button>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Server className="w-4 h-4 text-red-400" /> 2. Estrutura do banco</h3>
          <p className="text-xs text-zinc-400">Execute os scripts abaixo, nesta ordem, no SQL Editor do Supabase (ou via <code className="text-zinc-200">psql</code>):</p>
          <ol className="list-decimal pl-5 text-xs text-zinc-300 space-y-1">
            {MIGRATION_ORDER.map((file) => (
              <li key={file}><code>{file}</code></li>
            ))}
          </ol>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-red-400" /> 3. Papéis</h3>
          <p className="text-xs text-zinc-400">
            Os papéis (Administrador, Supervisor, Lojista, Atleta) são gravados em <code className="text-zinc-200">public.profiles.role</code>. A conta-mestre é promovida a administrador automaticamente ao se cadastrar.
          </p>
        </section>
      </div>
    </div>
  );
}
