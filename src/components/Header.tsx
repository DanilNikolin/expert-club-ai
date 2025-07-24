// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/firebase.config.js';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button'; // Импортируем нашу кастомную кнопку
import { UserCircle } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login'); // После выхода кидаем на страницу логина
  };

  // Определяем, куда будет вести ссылка-логотип
  const logoHref = user ? '/dashboard' : '/';

  return (
    <header className="bg-bg-main border-b border-bg-surface sticky top-0 z-50">
      <nav className="container mx-auto flex h-20 items-center justify-between px-4">
        
        {/* ЛОГОТИП */}
        <Link href={logoHref} className="title-pixel text-amber-400 hover:text-amber-400/80 transition-colors">
          Клуб Экспертов AI
        </Link>
        
        {/* ПРАВАЯ ЧАСТЬ: НАВИГАЦИЯ И ПРОФИЛЬ */}
        <div className="flex items-center space-x-4">
          {user ? (
            // --- Если пользователь залогинен ---
            <>
              <div className="flex items-center gap-2 font-sans text-sm text-text-secondary">
                <UserCircle size={16} />
                <span>{user.email}</span>
              </div>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                Выйти
              </Button>
            </>
          ) : (
            // --- Если пользователь НЕ залогинен ---
            <>
              <Link href="/login">
                 <Button variant="secondary" size="sm">
                    Войти
                 </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                    Регистрация
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}