'use client';
import { MIN_PASSWORD_LENGTH } from '@/lib/signup-validation';
import { isValidEmailAddress, isAllowedSignupEmail, SIGNUP_EMAIL_HELP } from '@/lib/email-validation';
import { getSupabaseClient } from '@/services/supabaseClient';
import { QUICK_ACCESS_ENABLED } from '@/lib/quick-access';

import SavedAccounts from './SavedAccounts';
import { useDialogScrollLock } from '@/hooks/useDialogScrollLock';
import SportPicker from '@/components/shared/SportPicker';
import React, { useEffect, useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { ACCOUNT_TYPES, type AccountType } from '@/lib/sports';
import BrandMark from '@/components/shared/BrandMark';
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
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
    loginSavedAccount,
    loginWithEmail,
    signUpWithEmail,
    openWelcomePage,
  } = useCoreMotiom();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberAccount, setRememberAccount] = useState(false);
  useEffect(() => { setRememberAccount(false); }, [isAuthModalOpen, authModalMode]);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { setShowPassword(false); setPassword(''); }, [authModalMode, isAuthModalOpen]);
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [pendingSignupEmail, setPendingSignupEmail] = useState('');

  useEffect(() => {
    if (isAuthModalOpen && prefillAuthEmail) {
      setEmail(prefillAuthEmail);
      setPrefillAuthEmail('');
    }
  }, [isAuthModalOpen, prefillAuthEmail, setPrefillAuthEmail]);

  useDialogScrollLock(isAuthModalOpen);

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = async (id: string) => {
    if (loading) return;
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const result = await loginSavedAccount(id);
      if (!result.success) {
        setErrorMsg(result.error || 'Não foi possível entrar nesta conta.');
        if (result.requiresLogin) {
          setAuthModalMode('login');
          setEmail(result.email || '');
          setPassword('');
        }
      }
    } catch { setErrorMsg('Não foi possível acessar a conta. Tente novamente.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!isValidEmailAddress(email)) { setErrorMsg('Informe um e-mail completo e válido, como nome@gmail.com.'); return; }
    if (authModalMode === 'register' && pendingSignupEmail === email.trim().toLowerCase()) {
      setInfoMsg('Confira a mensagem de confirmação e a pasta de spam. Depois, faça login. Não é necessário cadastrar este endereço novamente.');
      return;
    }
    if (authModalMode === 'register' && !isAllowedSignupEmail(email)) { setErrorMsg(SIGNUP_EMAIL_HELP); return; }
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await loginWithEmail(email, password, rememberAccount);
        if (!res.success) {
          setErrorMsg(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        } else {
          setPassword('');
          enterPlatform('home');
          setAuthModalOpen(false);
        }
      } else if (authModalMode === 'register') {
        if (password.length < MIN_PASSWORD_LENGTH) { setErrorMsg('A senha deve ter no mínimo 6 caracteres.'); return; }
        if (!name.trim()) {
          setErrorMsg('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password, name, accountType, accountType === 'casual' ? undefined : sport.trim(), rememberAccount);
        if (res.confirmationRequired) {
          setPendingSignupEmail(email.trim().toLowerCase());
          setPassword('');
          setInfoMsg('Confira seu e-mail e a pasta de spam para confirmar o endereço. Depois, faça login. Para salvar no acesso rápido, marque a opção ao entrar após a confirmação.');
        } else if (!res.success) {
          setErrorMsg(res.error || 'Erro ao cadastrar. Tente novamente.');
        } else {
          setPassword('');
          enterPlatform('home');
          setAuthModalOpen(false);
        }
      } else if (authModalMode === 'forgot') {
        const client = getSupabaseClient();
        if (!client) throw new Error('Conecte o Supabase para recuperar sua senha.');
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/reset-password` });
        if (error) throw new Error(error.code === 'email_address_not_authorized' || error.code === 'over_email_send_rate_limit' ? 'Não foi possível enviar a recuperação. O serviço de e-mail precisa ser configurado ou atingiu o limite de envios. Entre em contato com o responsável pela plataforma.' : 'Não foi possível enviar a recuperação. Aguarde e tente novamente.');
        setInfoMsg('Se o endereço estiver cadastrado, você receberá um link para redefinir a senha.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na autenticação.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overscroll-none">
      <div role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
        
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

        <div data-auth-scroll className="min-h-0 overflow-y-auto overscroll-contain p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <BrandMark className="w-10 h-10" />
            <div>
              <h3 id="auth-dialog-title" className="text-lg font-black text-white">
                {authModalMode === 'login' && 'Acessar CoreMotion'}
                {authModalMode === 'register' && 'Criar Conta'}
                {authModalMode === 'forgot' && 'Recuperar Senha'}
                {authModalMode === 'switch' && 'Selecionar conta'}
              </h3>
              <p className="text-xs text-zinc-400">
                {authModalMode === 'login' && 'Entre para gerenciar pedidos, compras e vendas.'}
                {authModalMode === 'register' && 'Junte-se à plataforma esportiva de alta performance.'}
                {authModalMode === 'forgot' && 'Enviaremos instruções de redefinição para seu e-mail.'}
                {authModalMode === 'switch' && 'Selecione uma conta para acessar a plataforma instantaneamente.'}
              </p>
            </div>
          </div>

          {QUICK_ACCESS_ENABLED && <SavedAccounts busy={loading} onSelect={handleQuickLogin} />}

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

          {authModalMode === 'register' && <div className="mb-5 space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase">Escolha seu perfil</p>
            <div className="grid grid-cols-3 gap-2">{(Object.keys(ACCOUNT_TYPES) as AccountType[]).map(type => <button key={type} type="button" onClick={() => { setAccountType(type); setAuthModalMode('register'); }} className={`p-3 rounded-xl border text-xs font-bold ${accountType === type && authModalMode === 'register' ? 'bg-red-950 border-red-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>{ACCOUNT_TYPES[type].label}</button>)}</div>
            {authModalMode === 'register' && accountType !== 'casual' && <SportPicker value={sport} onChange={setSport} label="Sua modalidade principal" required />}
            {authModalMode === 'register' && <p className="text-xs text-zinc-400 leading-relaxed">{ACCOUNT_TYPES[accountType].description}</p>}
            <button type="button" className="text-xs text-red-400 underline" onClick={() => { setAuthModalOpen(false); openWelcomePage(); setTimeout(() => document.getElementById('perfis')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Clique aqui para saber mais sobre os perfis</button>
          </div>}

          {authModalMode !== 'switch' && <form onSubmit={handleSubmit} className="space-y-3.5">
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
                  placeholder="seu.email@gmail.com"
                  aria-describedby={authModalMode === 'register' ? 'signup-email-help' : undefined}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {authModalMode === 'register' && <p id="signup-email-help" className="text-xs text-zinc-400">{SIGNUP_EMAIL_HELP}</p>}

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
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={authModalMode === 'register' ? 'new-password' : 'current-password'}
                    minLength={authModalMode === 'register' ? MIN_PASSWORD_LENGTH : undefined}
                    aria-describedby={authModalMode === 'register' ? 'signup-password-help' : undefined}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 bg-zinc-900 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'} aria-pressed={showPassword} className="absolute right-3 top-2 p-1 text-zinc-400 hover:text-white focus-visible:outline focus-visible:outline-red-500 rounded">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authModalMode === 'register' && <p id="signup-password-help" className={`mt-2 text-xs ${password.length > 0 && password.length < MIN_PASSWORD_LENGTH ? 'text-red-400' : 'text-zinc-400'}`}>Mínimo de 6 caracteres.</p>}
              </div>
            )}

            {QUICK_ACCESS_ENABLED && (authModalMode === 'login' || authModalMode === 'register') && <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-300">
              <input type="checkbox" checked={rememberAccount} onChange={event => setRememberAccount(event.target.checked)} disabled={loading} className="mt-0.5 accent-red-600" />
              <span><strong className="block text-white">Salvar esta conta no acesso rápido</strong><span className="mt-1 block text-zinc-400">Use apenas em um dispositivo de confiança.</span></span>
            </label>}

            <button
              type="submit"
              disabled={loading || (authModalMode === 'register' && pendingSignupEmail === email.trim().toLowerCase())}
              className="w-full py-3 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 mt-2 hover:scale-[1.01] active:scale-95"
            >
              {loading ? (
                <span>Processando autenticação...</span>
              ) : (
                <>
                  <span>
                    {authModalMode === 'login' && 'Entrar na Plataforma'}
                    {authModalMode === 'register' && (pendingSignupEmail === email.trim().toLowerCase() ? 'Confira seu e-mail para continuar' : 'Concluir Cadastro')}
                    {authModalMode === 'forgot' && 'Enviar E-mail de Recuperação'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>}

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
                  Cadastre-se
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
