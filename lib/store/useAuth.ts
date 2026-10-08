// ============================================================================
// CORE MOTIOM — FATIA AUTH: Supabase como único backend de autenticação
// Sem fallback local: sem credenciais no .env, o login retorna um erro claro.
// ============================================================================

'use client';

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { UserProfile, UserRole } from '../types';
import { getSupabase } from '../supabase';
import { readPersistedState } from './persistence';
import { ActiveView, AuthSlice, Toast } from './types';

const SUPABASE_NOT_CONFIGURED =
  'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.';

interface UseAuthDeps {
  addToast: (title: string, message: string, type?: Toast['type']) => void;
  setActiveView: (view: ActiveView) => void;
  setAuthModalOpen: (open: boolean) => void;
}

// `setUser` é usado internamente pelo provider (promoção de loja) e não
// faz parte do contrato público do contexto.
export type AuthSliceInternal = AuthSlice & {
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
};

export function useAuth({ addToast, setActiveView, setAuthModalOpen }: UseAuthDeps): AuthSliceInternal {
  const [user, setUser] = useState<UserProfile | null>(
    () => (readPersistedState()?.user as UserProfile | null) ?? null
  );
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // Restaura a sessão Supabase ao carregar a aplicação
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) return;
        setIsSupabaseLive(true);
        if (data.session?.user) {
          const u = data.session.user;
          setUser({
            id: u.id,
            email: u.email || '',
            name: u.user_metadata?.name || u.email?.split('@')[0] || 'Atleta CoreMotiom',
            avatar_url: u.user_metadata?.avatar_url,
            role: (u.user_metadata?.role as UserRole) || 'user',
            created_at: u.created_at,
          });
        }
      })
      .catch(() => {
        setIsSupabaseLive(false);
      });
  }, []);

  // Papéis derivados
  const role: UserRole = user?.role || 'visitor';
  const isVisitor = !user || role === 'visitor';
  const isAuthenticated = Boolean(user && role !== 'visitor');

  // Auth: Login com e-mail (Supabase)
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const sb = getSupabase();
    if (!sb) return { success: false, error: SUPABASE_NOT_CONFIGURED };

    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Falha na autenticação.' };

    const u = data.user;
    const userProfile: UserProfile = {
      id: u.id,
      email: u.email || email,
      name: u.user_metadata?.name || email.split('@')[0],
      avatar_url: u.user_metadata?.avatar_url,
      role: (u.user_metadata?.role as UserRole) || 'user',
      created_at: u.created_at,
    };
    setUser(userProfile);
    addToast('Login Concluído', `Bem-vindo de volta, ${userProfile.name}!`, 'success');
    setAuthModalOpen(false);
    return { success: true };
  };

  // Auth: Cadastro (Supabase)
  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    desiredRole: UserRole = 'user'
  ): Promise<{ success: boolean; error?: string }> => {
    const sb = getSupabase();
    if (!sb) return { success: false, error: SUPABASE_NOT_CONFIGURED };

    const { data, error } = await sb.auth.signUp({
      email,
      password: pass,
      options: {
        data: { name, role: desiredRole },
      },
    });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Falha ao criar a conta.' };

    const newUser: UserProfile = {
      id: data.user.id,
      email,
      name,
      role: desiredRole,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    addToast('Conta Criada', 'Sua conta CoreMotiom foi criada com sucesso.', 'success');
    setAuthModalOpen(false);
    return { success: true };
  };

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
      addToast('Erro no Google OAuth', error.message, 'error');
    }
  };

  // Auth: Logout
  const logout = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
    setActiveView('home');
    addToast('Sessão Encerrada', 'Você saiu da sua conta com segurança.', 'info');
  };

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
    switchRole,
    updateUserProfile,
    // Uso interno pelo provider (não faz parte do contrato público do contexto)
    setUser,
  };
}
