import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center font-black text-white text-2xl mb-4 shadow-lg shadow-red-950/60">
        404
      </div>
      <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
      <p className="text-zinc-400 text-sm max-w-md mb-6">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-full transition-colors"
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}
