'use client';
import { IS_QUICK_ACCESS, QUICK_ACCESS_ENABLED, type TemporaryProfile } from '@/lib/quick-access';
import { ADMIN_LOGIN_EMAIL } from '@/lib/admin-account';
import { useDialogScrollLock } from '@/hooks/useDialogScrollLock';

import React, { useEffect, useState } from 'react';
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
    resumeAdminSession,
  } = useCoreMotiom();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  useDialogScrollLock(isAuthModalOpen);
  useEffect(() => {
    if (!isAuthModalOpen || new URLSearchParams(window.location.search).get('login') !== 'admin') return;
    let cancelled = false;
    setLoading(true);
    void resumeAdminSession().then(resumed => {
      if (!cancelled && !resumed) { setEmail(ADMIN_LOGIN_EMAIL); setPassword(''); setAuthModalMode('login'); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthModalOpen, resumeAdminSession, setAuthModalMode]);

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = async (type: 'admin' | TemporaryProfile) => {
    setErrorMsg('');
    setInfoMsg('');
    if (type !== 'admin') { window.location.assign(`/?acesso-rapido=${type}`); return; }
    if (IS_QUICK_ACCESS) { window.location.assign('/?login=admin'); return; }
    setLoading(true);
    const resumed = await resumeAdminSession();
    setLoading(false);
    if (resumed) return;
    setEmail(ADMIN_LOGIN_EMAIL);
    setPassword('');
    setAuthModalMode('login');
    setInfoMsg('Entre uma vez na conta Admin. Este navegador reutilizará sua sessão válida nos próximos acessos.');
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overscroll-none bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* Header decoration */}
        <div className="h-1 shrink-0 bg-gradient-to-r from-red-800 via-red-600 to-red-500"></div>

        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          aria-label="Fechar formulário"
          className="absolute top-4 right-4 z-10 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div data-auth-scroll className="p-6 sm:p-8 min-h-0 overflow-y-auto overscroll-contain">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-950/50">
              CM
            </div>
            <div>
              <h3 id="auth-title" className="text-lg font-black text-white">
                {authModalMode === 'login' && 'Acessar CoreMotion'}
                {authModalMode === 'register' && 'Criar Conta'}
                {authModalMode === 'forgot' && 'Recuperar Senha'}
                {authModalMode === 'switch' && 'Selecionar Perfil'}
              </h3>
              <p className="text-xs text-zinc-400">
                {authModalMode === 'login' && 'Entre para gerenciar pedidos, compras e vendas.'}
                {authModalMode === 'register' && 'Junte-se à plataforma esportiva de alta performance.'}
                {authModalMode === 'forgot' && 'Enviaremos instruções de redefinição para seu e-mail.'}
                {authModalMode === 'switch' && 'Selecione uma conta para testar o sistema instantaneamente.'}
              </p>
            </div>
          </div>

          {QUICK_ACCESS_ENABLED && <section className="mb-6 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80">
            <h4 className="text-xs font-bold flex items-center gap-2 mb-2"><SlidersHorizontal className="w-4 h-4 text-red-500" />Acesso rápido</h4>
            <p className="text-xs text-zinc-400 mb-3">Admin usa sua conta real e sessão salva. Os outros perfis estão prontos para explorar, com dados separados apenas neste navegador.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['admin', 'athlete', 'coach', 'casual'] as const).map(type => <button key={type} type="button" disabled={loading} onClick={() => handleQuickLogin(type)} className="p-3 rounded-xl border border-zinc-700 hover:border-red-500 text-xs font-bold disabled:opacity-50">{{admin:'Admin', athlete:'Atleta', coach:'Treinador', casual:'Casual'}[type]}</button>)}
            </div>
          </section>}

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
