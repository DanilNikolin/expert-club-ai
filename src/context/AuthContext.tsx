'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase.config.js';

// Создаем тип для нашего контекста
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// Создаем сам контекст
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Создаем "Провайдер" - компонент, который будет "раздавать" состояние
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Эта функция - слушатель. Firebase сам вызовет ее, когда пользователь войдет или выйдет
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Отписываемся от слушателя при размонтировании компонента
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Создаем кастомный хук для удобного доступа к контексту
export const useAuth = () => useContext(AuthContext);