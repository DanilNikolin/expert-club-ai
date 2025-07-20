'use client';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/firebase.config.js';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Этот хук защищает страницу
  useEffect(() => {
    // Если загрузка завершена и пользователя нет - редирект на логин
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Пользователь вышел');
      router.push('/'); // Редирект на главную после выхода
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  // Пока идет проверка пользователя, ничего не показываем
  if (loading || !user) {
    return <div>Загрузка...</div>;
  }

  // Если пользователь есть - показываем дашборд
  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold">Добро пожаловать в Дашборд!</h1>
      <p className="mt-4 text-lg">Вы вошли как: {user.email}</p>
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Выйти
      </button>
    </div>
  );
}