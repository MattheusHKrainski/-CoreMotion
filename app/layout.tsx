import type { Metadata } from 'next';
import './globals.css';
import { CoreMotiomProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'CoreMotiom — Marketplace & Plataforma Esportiva',
  description: 'Plataforma e marketplace esportivo de alta performance com lojas oficiais verificadas, venda entre atletas (C2C), custódia financeira e serviços esportivos.',
  openGraph: {
    title: 'CoreMotiom — Marketplace & Plataforma Esportiva',
    description: 'Plataforma e marketplace esportivo de alta performance com lojas oficiais verificadas, venda entre atletas (C2C), custódia financeira e serviços esportivos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoreMotiom — Marketplace & Plataforma Esportiva',
    description: 'Plataforma e marketplace esportivo de alta performance com lojas oficiais verificadas, venda entre atletas (C2C), custódia financeira e serviços esportivos.',
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
