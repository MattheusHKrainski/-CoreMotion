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
    addToast('Schema Copiado', 'Script SQL copiado com sucesso.', 'success');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const copyEnvTemplate = () => {
    const envText = `DATABASE_URL=postgresql://postgres:processadorryzen5600gt@db.erpwfjdycdlygxwkdakv.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://erpwfjdycdlygxwkdakv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycHdmamR5Y2RseWd4d2tkYWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDc5MDYsImV4cCI6MjEwMzA4MzkwNn0.iX2IpAtEkmEeFGLmtnnzcznSpXXhw1k_UoUqgeWcEmU`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    addToast('Variáveis Copiadas', 'Template de variáveis copiado para a área de transferência.', 'success');
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/15 text-red-500 border border-red-500/30 flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Conexão Supabase Backend
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isSupabaseConfigured
                    ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {isSupabaseConfigured ? (isSupabaseLive ? 'Online & Conectado' : 'Configurado') : 'Modo Local'}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Instruções de banco de dados, RLS e autenticação Supabase.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSupabaseConfigOpen(false)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          
          {/* Status info box */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <Server className="w-4 h-4 text-red-400" />
              Status da Integração
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              O banco de dados PostgreSQL no Supabase já possui todas as tabelas (users, stores, products, listings, orders, bookings, communities) criadas e ativas. O CoreMotiom realiza sincronização via <code className="text-red-400 font-mono">supabase_id</code> e executa queries seguras.
            </p>
          </div>

          {/* Environment Variables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-red-400" />
                Variáveis de Ambiente Supabase
              </h4>
              <button
                onClick={copyEnvTemplate}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:underline font-semibold"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar .env</span>
              </button>
            </div>
            <pre className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-300 font-mono text-[11px] overflow-x-auto">
{`DATABASE_URL=postgresql://postgres:processadorryzen5600gt@db.erpwfjdycdlygxwkdakv.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://erpwfjdycdlygxwkdakv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycHdmamR5Y2RseWd4d2tkYWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDc5MDYsImV4cCI6MjEwMzA4MzkwNn0.iX2IpAtEkmEeFGLmtnnzcznSpXXhw1k_UoUqgeWcEmU`}
            </pre>
          </div>

          {/* Direct link to Supabase */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-600/10 border border-red-500/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span className="text-zinc-300 font-medium">Console Supabase Oficial</span>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-red-400 font-bold hover:underline"
            >
              <span>Abrir Painel Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-900/60">
          <button
            onClick={() => setSupabaseConfigOpen(false)}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-full transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
