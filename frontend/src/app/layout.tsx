import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'INEE 1.0',
  description: 'CRM & Gestion INEE Luxembourg',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${geist.className} min-h-full`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
