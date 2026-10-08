// ============================================================================
// CORE MOTIOM — FATIA AUTH: Supabase como único backend de autenticação
// Sem fallback local: sem credenciais no .env, o login retorna um erro claro.
// ============================================================================

'use client';

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';
import { getSupabase } from '../supabase';
import { readPersistedState } from './persistence';
import { ActiveView, AuthResult, AuthSlice, Toast } from './types';

const SUPABASE_NOT_CONFIGURED =
  'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.';

interface UseAuthDeps {
  addToast: (title: string, message: string, type?: Toast['type']) => void;
  setActiveView: (view: ActiveView) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot' | 'switch' | 'reset') => void;
}

// Converte o usuário do Supabase no perfil da aplicação
function mapSupabaseUser(u: User): UserProfile {
  return {
    id: u.id,
    email: u.email || '',
    name: u.user_metadata?.name || u.email?.split('@')[0] || 'Atleta CoreMotiom',
    avatar_url: u.user_metadata?.avatar_url,
    role: (u.user_metadata?.role as UserRole) || 'user',
    created_at: u.created_at,
  };
}

// Traduz mensagens técnicas do GoTrue para português
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já está cadastrado.';
  if (m.includes('password should be at least') || m.includes('password is too short') || m.includes('requires a valid password')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (m.includes('new password should be different')) return 'A nova senha deve ser diferente da atual.';
  if (m.includes('invalid format') || m.includes('invalid email') || m.includes('unable to validate email')) return 'E-mail inválido.';
  if (m.includes('user not found')) return 'E-mail não encontrado.';
  if (m.includes('rate limit') || m.includes('too many request')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (m.includes('database error saving new user')) return 'Erro ao criar a conta. Tente novamente em instantes.';
  if (m.includes('signups not allowed') || m.includes('sign up is disabled')) return 'Cadastros temporariamente desativados.';
  if (m.includes('unsupported provider')) return 'Este provedor de login não está habilitado no Supabase.';
  if (m.includes('fetch') || m.includes('network')) return 'Falha de conexão com o servidor. Verifique sua internet.';
  return message;
}

// `setUser` é usado internamente pelo provider (promoção de loja) e não
// faz parte do contrato público do contexto.
export type AuthSliceInternal = AuthSlice & {
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
};

/* ===========================================================
   FATIA DE AUTENTICAÇÃO (SUPABASE)
=========================================================== */

export function useAuth(
  { addToast, setActiveView, setAuthModalOpen, setAuthModalMode }: UseAuthDeps
): AuthSliceInternal {
  const [user, setUser] = useState<UserProfile | null>(
    () => (readPersistedState()?.user as UserProfile | null) ?? null
  );
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // Sessão Supabase: restaura no load e sincroniza login/logout/recuperação
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      setIsSupabaseLive(true);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }
      if (event === 'PASSWORD_RECOVERY') {
        setAuthModalMode('reset');
        setAuthModalOpen(true);
      }
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
    });
    return () => subscription.unsubscribe();
  }, [setAuthModalOpen, setAuthModalMode]);

  // Papéis derivados
  const role: UserRole = user?.role || 'visitor';
  const isVisitor = !user || role === 'visitor';
  const isAuthenticated = Boolean(user && role !== 'visitor');

  /* ===========================================================
     LOGIN COM E-MAIL
  =========================================================== */

  // Auth: Login com e-mail (Supabase)
  const loginWithEmail = async (email: string, pass: string): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { success: false, error: SUPABASE_NOT_CONFIGURED };

    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: translateAuthError(error.message) };
    if (!data.user) return { success: false, error: 'Falha na autenticação.' };

    const userProfile = mapSupabaseUser(data.user);
    setUser(userProfile);
    addToast('Login Concluído', `Bem-vindo de volta, ${userProfile.name}!`, 'success');
    setAuthModalOpen(false);
    return { success: true };
  };

  /* ===========================================================
     CADASTRO COM E-MAIL
  =========================================================== */

  // Auth: Cadastro (Supabase)
  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    desiredRole: UserRole = 'user'
  ): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { success: false, error: SUPABASE_NOT_CONFIGURED };

    const { data, error } = await sb.auth.signUp({
      email,
      password: pass,
      options: {
        data: { name, role: desiredRole },
      },
    });
    if (error) return { success: false, error: translateAuthError(error.message) };
    if (!data.user) return { success: false, error: 'Falha ao criar a conta.' };

    // Projeto exige confirmação de e-mail: ainda não existe sessão
    if (!data.session) {
      return {
        success: false,
        info: 'Conta criada! Enviamos um link de confirmação para o seu e-mail. Confirme o cadastro e faça login.',
      };
    }

    setUser(mapSupabaseUser(data.user));
    addToast('Conta Criada', 'Sua conta CoreMotiom foi criada com sucesso.', 'success');
    setAuthModalOpen(false);
    return { success: true };
  };

  /* ===========================================================
     LOGIN COM GOOGLE OAUTH
  =========================================================== */

  // Auth: Google OAuth (Supabase)
  const signInWithGoogle = async () => {
    const sb = getSupabase();
    if (!sb) {
      addToast('Supabase não configurado', SUPABASE_NOT_CONFIGURED, 'error');
      return;
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) {
      addToast('Erro no Google OAuth', translateAuthError(error.message), 'error');
    }
  };

  /* ===========================================================
     ENCERRAR SESSÃO (LOGOUT)
  =========================================================== */

  // Auth: Logout
  const logout = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
    setActiveView('home');
    addToast('Sessão Encerrada', 'Você saiu da sua conta com segurança.', 'info');
  };

  // Auth: Recuperação de senha (e-mail real via Supabase)
  const resetPassword = async (email: string): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { success: false, error: SUPABASE_NOT_CONFIGURED };
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    });
    if (error) return { success: false, error: translateAuthError(error.message) };
    return {
      success: true,
      info: 'E-mail de recuperação enviado! Verifique sua caixa de entrada e a pasta de spam.',
    };
  };

  // Auth: Definir nova senha (link de recuperação ou troca estando logado)
  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { success: false, error: SUPABASE_NOT_CONFIGURED };
    if (newPassword.length < 6) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
    }
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: translateAuthError(error.message) };
    addToast('Senha Atualizada', 'Sua nova senha foi salva com sucesso.', 'success');
    setAuthModalMode('login');
    setAuthModalOpen(false);
    return { success: true };
  };

  /* ===========================================================
     TROCAR PERFIL DEMO
  =========================================================== */

  // Troca de perfil demo (testes de fluxo Admin/Lojista/Atleta/Visitante)
  const switchRole = useCallback(
    (newRole: UserRole) => {
      if (newRole === 'visitor') {
        setUser(null);
        addToast('Modo Visitante', 'Você está navegando como visitante.', 'info');
        return;
      }

      const demoProfiles: Record<Exclude<UserRole, 'visitor'>, UserProfile> = {
        admin: {
          id: 'admin-001',
          email: 'admin@coremotiom.com',
          name: 'Administrador CoreMotiom',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
          role: 'admin',
          city: 'São Paulo',
          state: 'SP',
          sport_interests: ['Corrida', 'Triatlo', 'Ciclismo'],
          created_at: '2026-01-01T00:00:00Z',
        },
        seller: {
          id: 'seller-pro-1',
          email: 'contato@motiompro.com.br',
          name: 'Motiom Pro Lab (Lojista Oficial)',
          avatar_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&q=80',
          role: 'seller',
          store_id: 'store-1',
          city: 'São Paulo',
          state: 'SP',
          sport_interests: ['Alta Performance', 'Corrida'],
          created_at: '2026-01-10T08:00:00Z',
        },
        user: {
          id: 'user-c2c-1',
          email: 'carlos.ramos@atleta.com',
          name: 'Carlos Eduardo Ramos',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
          role: 'user',
          city: 'Campinas',
          state: 'SP',
          sport_interests: ['Maratona', 'Trail Running', 'Ciclismo'],
          created_at: '2026-03-01T10:00:00Z',
        },
      };

      setUser(demoProfiles[newRole]);
      addToast(
        'Perfil Atualizado',
        `Agora você está operando com permissões de ${newRole === 'admin' ? 'Administrador' : newRole === 'seller' ? 'Lojista' : 'Usuário Atleta'}.`,
        'success'
      );
    },
    [addToast]
  );

  /* ===========================================================
     ATUALIZAR PERFIL DO USUÁRIO
  =========================================================== */

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    addToast('Perfil Salvo', 'Suas informações foram atualizadas.', 'success');
  };

  return {
    user,
    role,
    isVisitor,
    isAuthenticated,
    isSupabaseLive,
    loginWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    resetPassword,
    updatePassword,
    switchRole,
    updateUserProfile,
    // Uso interno pelo provider (não faz parte do contrato público do contexto)
    setUser,
  };
}
