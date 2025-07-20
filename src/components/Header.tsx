'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/firebase.config.js';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          Клуб Экспертов AI
        </Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            // Если пользователь залогинен
            <>
              <Link href="/dashboard" className="hover:text-gray-300">
                Дашборд
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
              >
                Выйти
              </button>
            </>
          ) : (
            // Если пользователь НЕ залогинен
            <>
              <Link href="/login" className="hover:text-gray-300">
                Войти
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}