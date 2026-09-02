'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '@/lib/supabase';
import {
  X,
  Database,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  Code,
  Key,
} from 'lucide-react';

export default function SupabaseConfigModal() {
  const { isSupabaseConfigOpen, setSupabaseConfigOpen, isSupabaseLive, addToast } = useCoreMotiom();
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isSupabaseConfigOpen) return null;

  const copySchemaToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    addToast('Schema Copiado', 'Script SQL copiado. Cole no SQL Editor do Supabase.', 'success');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const copyEnvTemplate = () => {
    const envText = `DATABASE_URL=postgresql://postgres:processadorryzen5600gt@db.erpwfjdycdlygxwkdakv.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://erpwfjdycdlygxwkdakv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_uy8UzRCshqZJKFWPglav9Q_KoF38-sq`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    addToast('Variáveis Copiadas', 'Template de variáveis copiado para a área de transferência.', 'success');
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#12151C] text-white rounded-2xl border border-[#232836] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#232836] flex items-center justify-between bg-[#0E1017]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Conexão Supabase Backend
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  isSupabaseConfigured
                    ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {isSupabaseConfigured ? (isSupabaseLive ? 'Online & Conectado' : 'Configurado') : 'Modo Local'}
                </span>
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Instruções de banco de dados, RLS e autenticação Supabase.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSupabaseConfigOpen(false)}
            className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#181D26] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          
          {/* Status info box */}
          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#232836] space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Server className="w-4 h-4 text-red-400" />
              Status da Integração
            </h4>
            <p className="text-[#94A3B8] leading-relaxed">
              O CoreMotiom conecta-se diretamente ao Supabase para Auth, Database e Storage. Na ausência temporária de chaves, o mecanismo de estado local assume as operações garantindo que a aplicação permaneça 100% navegável.
            </p>
          </div>

          {/* Environment Variables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-red-400" />
                Variáveis de Ambiente Supabase
              </h4>
              <button
                onClick={copyEnvTemplate}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:underline"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar .env</span>
              </button>
            </div>
            <pre className="p-3 bg-[#08090D] border border-[#232836] rounded-lg text-[#E5E7EB] font-mono text-[11px] overflow-x-auto">
{`DATABASE_URL=postgresql://postgres:processadorryzen5600gt@db.erpwfjdycdlygxwkdakv.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://erpwfjdycdlygxwkdakv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_uy8UzRCshqZJKFWPglav9Q_KoF38-sq`}
            </pre>
          </div>

          {/* SQL Schema Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-red-400" />
                Script SQL de Produção (Tabelas + RLS Policies)
              </h4>
              <button
                onClick={copySchemaToClipboard}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copiado!' : 'Copiar SQL Completo'}</span>
              </button>
            </div>
            <div className="relative">
              <pre className="p-3 bg-[#08090D] border border-[#232836] rounded-lg text-[#94A3B8] font-mono text-[10px] max-h-48 overflow-y-auto">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>

          {/* Direct link to Supabase */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-600/10 border border-red-500/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span className="text-[#E5E7EB]">Pronto para gerenciar dados no Supabase?</span>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-red-400 font-semibold hover:underline"
            >
              <span>Abrir Console Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#232836] flex justify-end bg-[#0E1017]">
          <button
            onClick={() => setSupabaseConfigOpen(false)}
            className="px-4 py-2 bg-[#181D26] hover:bg-[#232836] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
