// D:\expert-club-ai\expert-club-ai\src\app\layout.tsx
import type { Metadata } from 'next';
import { Inter, Press_Start_2P, JetBrains_Mono } from 'next/font/google'; // 1. Добавили JetBrains_Mono
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

// 2. Инициализировали JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Клуб Экспертов AI',
  description: 'Создай свою команду AI-экспертов',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. Сменили язык и добавили новую переменную шрифта
    <html lang="ru" className={`${inter.variable} ${pressStart.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans"> {/* 4. Убрали лишний font-sans отсюда, он будет в globals.css */}
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}