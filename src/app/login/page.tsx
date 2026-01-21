'use client';

import { useState } from 'react';
// NEW IMPORTS FROM FIREBASE:
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/firebase.config.js';
// NEW ROUTER IMPORT:
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added Link import
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // INITIALIZE ROUTER
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Successful login via email/password');
      router.push('/'); // ADDED REDIRECT
    } catch (err: unknown) { // Catch as unknown
      // Advanced error handling (like in signup)
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const firebaseError = err as { code: string; message: string }; // Cast to handle TS
        console.warn('Login error (expected):', firebaseError.code); // Change to warn so Next doesn't complain

        if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
          setError('Invalid email or password. Check your details or sign up.');
        } else {
          setError('Something went wrong. Try again later.');
        }
      } else {
        // In case something weird happened
        console.warn('Unknown login error:', err); // Also warn
        setError('An unknown error occurred.');
      }
    }
  };

  // NEW FUNCTION FOR GOOGLE LOGIN
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    try {
      await signInWithPopup(auth, provider);
      console.log('Successful login via Google');
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        console.error('Login error via Google:', err.message);
        setError('Failed to log in with Google.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] animate-fade-in-fast">
      <div className="w-full max-w-md p-8 pt-10 space-y-8 bg-bg-surface rounded-xl border border-border-main shadow-2xl relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-accent-primary/30 rounded-tl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-accent-primary/30 rounded-br-xl pointer-events-none" />

        <div className="text-center space-y-2">
          <h1 className="title-pixel text-accent-primary text-3xl">
            Club Login
          </h1>
          <p className="text-sm text-text-secondary font-sans">
            Enter the closed territory of experts
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-pixel uppercase tracking-wider text-text-secondary mb-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-bg-main border border-border-main rounded-lg text-text-main placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all font-sans"
              placeholder="agent@expert-club.ai"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-pixel uppercase tracking-wider text-text-secondary mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-bg-main border border-border-main rounded-lg text-text-main placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all font-sans"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-accent-danger/10 border border-accent-danger/30 rounded-lg">
              <p className="text-xs text-accent-danger font-sans text-center">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" variant="primary" size="default" className="w-full py-6 text-lg">
              Enter System
            </Button>
          </div>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border-main"></div>
          <span className="flex-shrink mx-4 text-xs font-pixel text-text-secondary uppercase">Or</span>
          <div className="flex-grow border-t border-border-main"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-bg-main border border-border-main rounded-lg text-text-secondary font-sans text-sm hover:text-text-main hover:border-accent-primary hover:bg-bg-elevated transition-all duration-300 group"
        >
          <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          Google Access
        </button>

        <p className="text-center text-xs text-text-secondary font-sans mt-8">
          Not initialized yet?{' '}
          <Link href="/signup" className="text-accent-primary hover:underline hover:text-accent-primary/80 transition-colors">
            Initialize (Sign Up)
          </Link>
        </p>
      </div>
    </div>
  );

}