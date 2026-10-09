'use client';
import { isSupabaseConfigured } from '@/services/supabaseClient';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    loginAsMasterAdmin,
    switchRole,
  } = useCoreMotiom();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setInfoMsg('');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao iniciar login com Google.';
      setErrorMsg(message);
    }
  };

  const handleQuickLogin = async (type: 'admin' | 'seller' | 'user') => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      if (type === 'admin') {
        loginAsMasterAdmin();
        setAuthModalOpen(false);
      } else if (type === 'seller') {
        switchRole('seller');
        setAuthModalOpen(false);
      } else {
        switchRole('user');
        setAuthModalOpen(false);
      }
    } catch {
      setErrorMsg('Falha ao conectar com perfil selecionado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await loginWithEmail(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        } else {
          setAuthModalOpen(false);
        }
      } else if (authModalMode === 'register') {
        if (!name.trim()) {
          setErrorMsg('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password, name);
        if (!res.success) {
          setErrorMsg(res.error || 'Erro ao cadastrar. Tente novamente.');
        } else {
          setAuthModalOpen(false);
        }
      } else if (authModalMode === 'forgot') {
        setInfoMsg('Instruções de recuperação de senha preparadas para o seu e-mail.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na autenticação.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* Header decoration */}
        <div className="h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-500"></div>

        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-950/50">
              CM
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {authModalMode === 'login' && 'Acessar CoreMotiom'}
                {authModalMode === 'register' && 'Criar Conta de Atleta'}
                {authModalMode === 'forgot' && 'Recuperar Senha'}
                {authModalMode === 'switch' && 'Perfis de Demonstração'}
              </h3>
              <p className="text-xs text-zinc-400">
                {authModalMode === 'login' && 'Entre para gerenciar pedidos, compras e vendas.'}
                {authModalMode === 'register' && 'Junte-se à plataforma esportiva de alta performance.'}
                {authModalMode === 'forgot' && 'Enviaremos instruções de redefinição para seu e-mail.'}
                {authModalMode === 'switch' && 'Selecione uma conta para testar o sistema instantaneamente.'}
              </p>
            </div>
          </div>

          {/* Acesso rápido: somente em modo demonstração (sem banco conectado) */}
          {!isSupabaseConfigured && (
          <div className="mb-6 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300 mb-2.5 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
                Acesso Rápido Imediato (1 Clique):
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-xl bg-red-600/15 hover:bg-red-600/30 text-red-300 hover:text-white font-semibold transition-all border border-red-500/30 text-center flex flex-col items-center gap-0.5 group"
                title="Entrar imediatamente como Mattheus (Super Admin)"
              >
                <span className="text-[11px] font-bold text-red-400 group-hover:text-white">👑 Super Admin</span>
                <span className="text-[9px] text-zinc-400 truncate max-w-full">Mattheus</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('seller')}
                className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold transition-all border border-zinc-800 text-center flex flex-col items-center gap-0.5"
                title="Entrar imediatamente como Lojista Oficial"
              >
                <span className="text-[11px] font-bold text-amber-400">🛍️ Lojista Pro</span>
                <span className="text-[9px] text-zinc-400">Motiom Lab</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold transition-all border border-zinc-800 text-center flex flex-col items-center gap-0.5"
                title="Entrar imediatamente como Atleta"
              >
                <span className="text-[11px] font-bold text-emerald-400">🏃 Atleta</span>
                <span className="text-[9px] text-zinc-400">Carlos Ramos</span>
              </button>
            </div>
          </div>
          )}

          {/* Error Message if any */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Message if any */}
          {infoMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          {authModalMode !== 'forgot' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-2.5 px-4 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Continuar com Google</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full"></div>
                <span className="bg-zinc-950 px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  ou com e-mail
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Matheus Silveira"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {authModalMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-zinc-400">
                    Senha
                  </label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('forgot')}
                      className="text-[11px] text-red-400 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 mt-2 hover:scale-[1.01] active:scale-95"
            >
              {loading ? (
                <span>Processando autenticação...</span>
              ) : (
                <>
                  <span>
                    {authModalMode === 'login' && 'Entrar na Plataforma'}
                    {authModalMode === 'register' && 'Concluir Cadastro'}
                    {authModalMode === 'forgot' && 'Enviar E-mail de Recuperação'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
            {authModalMode === 'login' ? (
              <p>
                Não possui conta?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('register'); setErrorMsg(''); }}
                  className="text-red-400 font-bold hover:underline"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('login'); setErrorMsg(''); }}
                  className="text-red-400 font-bold hover:underline"
                >
                  Fazer login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
