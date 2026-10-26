'use client';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { QUICK_ACCESS_ENABLED } from '@/lib/quick-access';

import React, { useEffect, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { ACCOUNT_TYPES, type AccountType } from '@/lib/sports';
import BrandMark from '@/components/shared/BrandMark';
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
    authAccountType: accountType,
    setAuthAccountType: setAccountType,
    prefillAuthEmail,
    setPrefillAuthEmail,
    enterPlatform,
    loginWithEmail,
    signUpWithEmail,
    loginAsMasterAdmin,
    switchRole,
    openWelcomePage,
  } = useCoreMotiom();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    if (isAuthModalOpen && prefillAuthEmail) {
      setEmail(prefillAuthEmail);
      setPrefillAuthEmail('');
    }
  }, [isAuthModalOpen, prefillAuthEmail, setPrefillAuthEmail]);

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = async (type: 'admin' | AccountType) => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    if (isSupabaseConfigured) {
      window.location.assign(`/?acesso-rapido=${type}`);
      return;
    }
    try {
      if (type === 'admin') {
        loginAsMasterAdmin();
        enterPlatform('home');
        setAuthModalOpen(false);
      } else {
        switchRole('user', type);
        enterPlatform('home');
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
          enterPlatform('home');
          setAuthModalOpen(false);
        }
      } else if (authModalMode === 'register') {
        if (!name.trim()) {
          setErrorMsg('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password, name, accountType);
        if (!res.success) {
          setErrorMsg(res.error || 'Erro ao cadastrar. Tente novamente.');
        } else {
          enterPlatform('home');
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
            <BrandMark className="w-10 h-10" />
            <div>
              <h3 className="text-lg font-black text-white">
                {authModalMode === 'login' && 'Acessar CoreMotion'}
                {authModalMode === 'register' && 'Criar Conta de Atleta'}
                {authModalMode === 'forgot' && 'Recuperar Senha'}
                {authModalMode === 'switch' && 'Selecionar Perfil'}
              </h3>
              <p className="text-xs text-zinc-400">
                {authModalMode === 'login' && 'Entre para gerenciar pedidos, compras e vendas.'}
                {authModalMode === 'register' && 'Junte-se à plataforma esportiva de alta performance.'}
                {authModalMode === 'forgot' && 'Enviaremos instruções de redefinição para seu e-mail.'}
                {authModalMode === 'switch' && 'Selecione uma conta para acessar a plataforma instantaneamente.'}
              </p>
            </div>
          </div>

          {QUICK_ACCESS_ENABLED && (
          <div className="mb-6 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300 mb-2.5 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
                Acesso Rápido Imediato (1 Clique):
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">Acesso temporário com dados locais. Não altera contas nem registros reais.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {(['admin', 'athlete', 'coach', 'casual'] as const).map(type => <button key={type} disabled={loading} type="button" onClick={() => handleQuickLogin(type)} className="rounded-xl border border-zinc-800 bg-zinc-950 hover:border-red-600 p-3 font-bold text-white">{type === 'admin' ? '👑 Admin' : ACCOUNT_TYPES[type].label}</button>)}
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

          {authModalMode !== 'forgot' && <div className="mb-5 space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase">{authModalMode === 'register' ? 'Escolha seu perfil' : 'Novo por aqui? Crie seu perfil'}</p>
            <div className="grid grid-cols-3 gap-2">{(Object.keys(ACCOUNT_TYPES) as AccountType[]).map(type => <button key={type} type="button" onClick={() => { setAccountType(type); setAuthModalMode('register'); }} className={`p-3 rounded-xl border text-xs font-bold ${accountType === type && authModalMode === 'register' ? 'bg-red-950 border-red-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>{ACCOUNT_TYPES[type].label}</button>)}</div>
            {authModalMode === 'register' && <p className="text-xs text-zinc-400 leading-relaxed">{ACCOUNT_TYPES[accountType].description}</p>}
            <button type="button" className="text-xs text-red-400 underline" onClick={() => { setAuthModalOpen(false); openWelcomePage(); setTimeout(() => document.getElementById('perfis')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Clique aqui para saber mais sobre os perfis</button>
          </div>}

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
