'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-black text-2xl mb-4 border border-red-500/30">
        !
      </div>
      <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
      <p className="text-zinc-400 text-sm max-w-md mb-6">
        Ocorreu um erro inesperado. Tente recarregar a página.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-full transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
