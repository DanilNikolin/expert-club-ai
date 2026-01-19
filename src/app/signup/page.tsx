'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/firebase.config.js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User successfully created');
      router.push('/');
    } catch (err: unknown) { // FIX: Catch as 'unknown'
      console.error('Registration error:', err);
      // Check if error has 'code' property - Firebase feature
      if (typeof err === 'object' && err !== null && 'code' in err) {
        if ((err as { code: string }).code === 'auth/email-already-in-use') {
          setError('This email is already in use. Try logging in.');
        } else {
          setError('Failed to create account. Check your details.');
        }
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    try {
      await signInWithPopup(auth, provider);
      console.log('Successful login/registration via Google');
      router.push('/');
    } catch (err) { // FIX: Catch as 'unknown'
      console.error('Login error via Google:', err);
      if (err instanceof Error) {
        setError('Failed to log in with Google.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Sign Up to Club
        </h1>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex justify-center items-center px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9.1 3.7l6.8-6.8C35.4 2.6 30.1 0 24 0 14.9 0 7.3 5.4 3 13.4l8.4 6.5C13.2 13.2 18.2 9.5 24 9.5z"></path>
            <path fill="#34A853" d="M46.2 25.4c0-1.7-.2-3.4-.5-5H24v9.5h12.5c-.5 3.1-2.1 5.7-4.5 7.5l7.9 6.1c4.6-4.2 7.3-10.2 7.3-17.1z"></path>
            <path fill="#FBBC05" d="M11.4 28.4c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8L3 13.4C1.1 16.9 0 20.9 0 24.9c0 4 1.1 8 3 11.5l8.4-6.6z"></path>
            <path fill="#EA4335" d="M24 48c6.1 0 11.4-2 15.1-5.4l-7.9-6.1c-2.1 1.4-4.8 2.3-7.2 2.3-5.8 0-10.8-3.7-12.7-8.7L3 36.4C7.3 44.4 14.9 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-500">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password (min 6 chars)</label>
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          <div>
            <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Sign Up
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}