// D:\expert-club-ai\expert-club-ai\src\app\layout.tsx
import type { Metadata } from 'next';
import { Inter, Press_Start_2P, JetBrains_Mono } from 'next/font/google'; // 1. Added JetBrains_Mono
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

// 2. Initialize JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'AI Expert Club',
  description: 'Build your AI Expert Team',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. Changed language and added new font variable
    <html lang="en" className={`${inter.variable} ${pressStart.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans"> {/* 4. Removed extra font-sans, it will be in globals.css */}
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}