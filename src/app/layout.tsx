import type { Metadata } from 'next';
import { Inter, Press_Start_2P } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

const pressStart = Press_Start_2P({
  subsets: ['cyrillic', 'latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-pixel',
});

export const metadata: Metadata = {
  title: 'Клуб Экспертов Идеи',
  description: 'Создай свою команду AI-экспертов',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${pressStart.variable} font-sans`}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}