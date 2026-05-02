import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'WLexperience | Food Live Blog',
  description: 'Live blog dei pasti per Silvia e Nicolò, con resoconto alimentare e grafici motivazionali.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-200 selection:text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <Navbar />
          <main className="mt-8 flex-1">{children}</main>
          <footer className="mt-12 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
            Questa app è uno strumento personale di consapevolezza alimentare e non sostituisce il parere di un medico, dietista o nutrizionista.
          </footer>
        </div>
      </body>
    </html>
  );
}
