'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandMark from '@/components/shared/BrandMark';
import { getSupabaseClient } from '@/services/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb) {
      setError('Não foi possível conectar ao serviço de autenticação.');
      setChecking(false);
      return;
    }

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const hasRecoveryMarker =
      hash.get('type') === 'recovery' ||
      new URLSearchParams(window.location.search).has('code');
    let active = true;

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (active && event === 'PASSWORD_RECOVERY' && session) {
        setReady(true);
        setChecking(false);
      }
    });

    void sb.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError('Este link não é válido ou expirou. Solicite uma nova recuperação.');
      } else if (hasRecoveryMarker && data.session) {
        setReady(true);
      } else {
        setError('Este link não é válido ou expirou. Solicite uma nova recuperação.');
      }
      setChecking(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não são iguais.');
      return;
    }

    const sb = getSupabaseClient();
    if (!sb) {
      setError('Não foi possível conectar ao serviço de autenticação.');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await sb.auth.updateUser({ password });
      if (updateError) {
        setError('Não foi possível atualizar a senha. Solicite um novo link de recuperação.');
        return;
      }
      setMessage('Senha atualizada. Você já pode entrar na plataforma.');
      window.setTimeout(() => router.replace('/'), 1200);
    } catch {
      setError('Não foi possível conectar ao serviço de autenticação.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl">
        <BrandMark className="mx-auto mb-5 h-12 w-12" />
        <h1 className="text-center text-xl font-black">Criar nova senha</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Escolha uma senha nova para sua conta CoreMotion.
        </p>

        {checking ? (
          <p className="mt-8 text-center text-sm text-zinc-400">Validando o link...</p>
        ) : ready ? (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block text-xs font-semibold uppercase text-zinc-400">
              Nova senha
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
              />
            </label>
            <label className="block text-xs font-semibold uppercase text-zinc-400">
              Confirmar nova senha
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
              />
            </label>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        ) : (
          <div className="mt-7 space-y-4 text-center">
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <button
              type="button"
              onClick={() => router.replace('/')}
              className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-semibold hover:bg-zinc-700"
            >
              Voltar para o início
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
