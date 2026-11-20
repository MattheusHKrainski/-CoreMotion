import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'CoreMotion — CoreShop e comunidade esportiva',
  description: 'CoreShop, anúncios entre atletas, treinadores e comunidade esportiva. Vendas CoreMotion em preparação, com pagamentos desativados.',
  openGraph: {
    title: 'CoreMotion — CoreShop e comunidade esportiva',
    description: 'CoreShop, anúncios entre atletas, treinadores e comunidade esportiva. Vendas CoreMotion em preparação, com pagamentos desativados.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoreMotion — CoreShop e comunidade esportiva',
    description: 'CoreShop, anúncios entre atletas, treinadores e comunidade esportiva. Vendas CoreMotion em preparação, com pagamentos desativados.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth dark">
      <body className="min-h-screen bg-[#0B0C10] text-[#F8FAFC] antialiased selection:bg-red-600 selection:text-white" suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
