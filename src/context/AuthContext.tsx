'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase.config.js';

// Create type for our context
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// Create the context itself
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Create "Provider" - component that will "provide" state
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function is a listener. Firebase will call it itself when user logs in or out
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Unsubscribe from listener when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create custom hook for convenient context access
export const useAuth = () => useContext(AuthContext);