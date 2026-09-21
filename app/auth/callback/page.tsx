'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/services/supabaseClient';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const sb = getSupabaseClient();
        if (!sb) {
          throw new Error('Supabase não inicializado.');
        }

        // Supabase client automatically parses hash tokens (access_token, refresh_token) or PKCE code
        const { data, error } = await sb.auth.getSession();

        if (error) {
          throw error;
        }

        if (data?.session) {
          setStatus('success');
          // Notify the main application window if this was opened in a popup
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'OAUTH_AUTH_SUCCESS',
                user: data.session.user,
              },
              '*'
            );
            setTimeout(() => {
              window.close();
            }, 800);
          } else {
            // If opened directly, redirect to home
            window.location.href = '/';
          }
        } else {
          // Retry briefly for slow hash parsing
          setTimeout(async () => {
            const retry = await sb.auth.getSession();
            if (retry.data?.session) {
              setStatus('success');
              if (window.opener) {
                window.opener.postMessage(
                  {
                    type: 'OAUTH_AUTH_SUCCESS',
                    user: retry.data.session.user,
                  },
                  '*'
                );
                window.close();
              } else {
                window.location.href = '/';
              }
            } else {
              setStatus('error');
              setErrorMessage('Sessão não detectada após o retorno da autenticação.');
            }
          }, 1000);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Falha na autenticação OAuth.';
        setStatus('error');
        setErrorMessage(msg);
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'OAUTH_AUTH_ERROR',
              error: msg,
            },
            '*'
          );
        }
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center font-black text-white text-lg mx-auto shadow-lg shadow-red-950/60">
          CM
        </div>

        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Autenticando com Google...</h2>
            <p className="text-xs text-zinc-400">
              Validando credenciais com o Supabase. Esta janela fechará automaticamente.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h2 className="text-lg font-bold text-emerald-400">Autenticado com Sucesso!</h2>
            <p className="text-xs text-zinc-400">
              Retornando ao CoreMotiom...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✕
            </div>
            <h2 className="text-lg font-bold text-red-400">Falha na Autenticação</h2>
            <p className="text-xs text-zinc-400">{errorMessage}</p>
            <button
              onClick={() => {
                if (window.opener) window.close();
                else window.location.href = '/';
              }}
              className="mt-4 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-full transition-colors"
            >
              Fechar Janela
            </button>
          </>
        )}
      </div>
    </div>
  );
}
