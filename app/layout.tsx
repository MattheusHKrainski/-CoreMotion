import type { Metadata } from 'next';
import './globals.css';
import { CoreMotiomProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'CoreMotion — Marketplace & Plataforma Esportiva',
  description: 'Marketplace esportivo de alta performance: lojas oficiais verificadas, venda entre atletas e comunidade.',
  openGraph: {
    title: 'CoreMotion — Marketplace & Plataforma Esportiva',
    description: 'Marketplace esportivo de alta performance: lojas oficiais verificadas, venda entre atletas e comunidade.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoreMotion — Marketplace & Plataforma Esportiva',
    description: 'Marketplace esportivo de alta performance: lojas oficiais verificadas, venda entre atletas e comunidade.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth dark">
      <body className="min-h-screen bg-[#0B0C10] text-[#F8FAFC] antialiased selection:bg-red-600 selection:text-white" suppressHydrationWarning>
        <CoreMotiomProvider>
          {children}
        </CoreMotiomProvider>
      </body>
    </html>
  );
}
