// ============================================================================
// CORE MOTIOM — AUTENTICAÇÃO (Modal)
// Login, cadastro, recuperação de senha e perfis de demonstração.
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  SlidersHorizontal,
} from 'lucide-react';

/* ===========================================================
   MODAL DE AUTENTICAÇÃO
=========================================================== */

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    switchRole,
  } = useCoreMotiom();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [desiredRole, setDesiredRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');

  if (!isAuthModalOpen) return null;

  /* ===========================================================
     ENVIAR FORMULÁRIO DE LOGIN/CADASTRO
  =========================================================== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setNotice('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await loginWithEmail(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        }
      } else if (authModalMode === 'register') {
        if (!name.trim()) {
          setErrorMsg('Por favor, informe seu nome completo.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        const res = await signUpWithEmail(email, password, name, desiredRole);
        if (res.info) {
          // Confirmação de e-mail pendente: mostra aviso e volta ao login
          setNotice(res.info);
          setAuthModalMode('login');
        } else if (!res.success) {
          setErrorMsg(res.error || 'Erro ao cadastrar. Tente novamente.');
        }
      } else if (authModalMode === 'forgot') {
        const res = await resetPassword(email);
        if (res.success) {
          setNotice(res.info || 'E-mail de recuperação enviado. Verifique sua caixa de entrada.');
        } else {
          setErrorMsg(res.error || 'Não foi possível enviar o e-mail de recuperação.');
        }
      } else if (authModalMode === 'reset') {
        if (password.length < 6) {
          setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('As senhas não coincidem.');
          return;
        }
        const res = await updatePassword(password);
        if (!res.success) {
          setErrorMsg(res.error || 'Não foi possível salvar a nova senha.');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na autenticação.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12151C] text-white rounded-2xl border border-[#232836] shadow-2xl overflow-hidden">
        
        {/* Header decoration */}
        <div className="h-1.5 bg-gradient-to-r from-red-800 via-red-600 to-red-500"></div>

        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#9CA3AF] hover:text-white hover:bg-[#181D26] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              CM
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {authModalMode === 'login' && 'Acessar CoreMotiom'}
                {authModalMode === 'register' && 'Criar Conta'}
                {authModalMode === 'forgot' && 'Recuperar Senha'}
                {authModalMode === 'reset' && 'Definir Nova Senha'}
                {authModalMode === 'switch' && 'Perfis de Demonstração'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {authModalMode === 'login' && 'Entre para gerenciar pedidos, compras e vendas.'}
                {authModalMode === 'register' && 'Junte-se à plataforma esportiva de alta performance.'}
                {authModalMode === 'forgot' && 'Enviaremos instruções de redefinição para seu e-mail.'}
                {authModalMode === 'reset' && 'Escolha uma nova senha para sua conta.'}
                {authModalMode === 'switch' && 'Selecione uma conta para testar o sistema instantaneamente.'}
              </p>
            </div>
          </div>

          {/* Quick Demo Switcher Tabs */}
          {(authModalMode === 'login' || authModalMode === 'register') && (
            <div className="mb-6 p-3 rounded-xl bg-[#0E1017] border border-[#232836]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#94A3B8] mb-2 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
                Acesso Rápido por Papel:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                  setAuthModalOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#181D26] hover:bg-red-600 text-red-400 hover:text-white font-medium transition-colors border border-[#232836] text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('seller');
                  setAuthModalOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#181D26] hover:bg-red-600 text-white font-medium transition-colors border border-[#232836] text-center"
              >
                Lojista
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('user');
                  setAuthModalOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#181D26] hover:bg-red-600 text-white font-medium transition-colors border border-[#232836] text-center"
              >
                Atleta (C2C)
              </button>
            </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Notice (ex.: confirmação de e-mail enviada) */}
          {notice && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          {authModalMode !== 'forgot' && authModalMode !== 'reset' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0E1017] hover:bg-[#181D26] border border-[#232836] hover:border-[#323849] text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all"
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
                <div className="border-t border-[#232836] w-full"></div>
                <span className="bg-[#12151C] px-3 text-[11px] uppercase tracking-wider text-[#6B7280]">
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
                  <label className="block text-xs font-medium text-[#D1D5DB] mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#6B7280]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Matheus Silveira"
                      className="w-full pl-9 pr-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D1D5DB] mb-1">
                    Tipo de Conta
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDesiredRole('user')}
                      className={`p-2.5 rounded-lg border flex flex-col items-start gap-1 text-left transition-all ${
                        desiredRole === 'user'
                          ? 'border-red-500 bg-red-600/10 text-white'
                          : 'border-[#232836] bg-[#0E1017] text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-semibold text-white">Atleta C2C</span>
                      <span className="text-[10px] text-[#94A3B8]">Comprar e vender seminovos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDesiredRole('seller')}
                      className={`p-2.5 rounded-lg border flex flex-col items-start gap-1 text-left transition-all ${
                        desiredRole === 'seller'
                          ? 'border-red-500 bg-red-600/10 text-white'
                          : 'border-[#232836] bg-[#0E1017] text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-semibold text-white">Lojista / Marca (B2C)</span>
                      <span className="text-[10px] text-[#94A3B8]">Cadastrar loja e catálogo</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {authModalMode !== 'reset' && (
            <div>
              <label className="block text-xs font-medium text-[#D1D5DB] mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#6B7280]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>
            </div>
            )}

            {authModalMode !== 'forgot' && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[#D1D5DB]">
                      {authModalMode === 'reset' ? 'Nova Senha' : 'Senha'}
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
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-[#6B7280]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                {authModalMode === 'reset' && (
                  <div>
                    <label className="block text-xs font-medium text-[#D1D5DB] mb-1">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-[#6B7280]" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Processando autenticação...</span>
              ) : (
                <>
                  <span>
                    {authModalMode === 'login' && 'Entrar na Plataforma'}
                    {authModalMode === 'register' && 'Concluir Cadastro'}
                    {authModalMode === 'forgot' && 'Enviar E-mail de Recuperação'}
                    {authModalMode === 'reset' && 'Salvar Nova Senha'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher Footer */}
          <div className="mt-6 pt-4 border-t border-[#232836] text-center text-xs text-[#94A3B8]">
            {authModalMode === 'login' ? (
              <p>
                Não possui conta?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('register'); setErrorMsg(''); setNotice(''); }}
                  className="text-red-400 font-semibold hover:underline"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('login'); setErrorMsg(''); setNotice(''); }}
                  className="text-red-400 font-semibold hover:underline"
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

