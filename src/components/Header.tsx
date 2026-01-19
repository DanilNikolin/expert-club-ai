// src/components/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/firebase.config.js';
import { signOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { UserCircle, LogOut, Home } from 'lucide-react';

// Extracting profile menu to a separate component for cleanliness
const ProfileMenu = ({ user, onLogout }: { user: User; onLogout: () => void; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        <UserCircle size={28} className="text-text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg border border-border-main bg-bg-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-fast">
          <div className="p-4">
            <p className="font-sans text-sm text-text-secondary truncate">Logged in as:</p>
            <p className="font-sans font-medium text-text-main truncate">{user.email}</p>
          </div>
          <div className="border-t border-border-main py-1">
            <Link
              href="/"
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 font-pixel text-sm uppercase text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-main"
            >
              <Home size={16} />
              <span>Home Page</span>
            </Link>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 font-pixel text-sm uppercase text-accent-danger transition-colors hover:bg-accent-danger/10"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const logoHref = user ? '/dashboard' : '/';

  return (
    <>
      <header className="bg-bg-main/80 border-b border-bg-surface sticky top-0 z-50 backdrop-blur-sm">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">

          {/* LOGO */}
          <Link href={logoHref} className="title-pixel text-accent-primary hover:text-accent-primary/80 transition-colors">
            AI Expert Club
          </Link>

          {/* RIGHT SIDE: NAVIGATION AND PROFILE */}
          <div className="flex items-center space-x-4">
            {user ? (
              // --- If user is logged in ---
              <ProfileMenu user={user} onLogout={handleLogout} />
            ) : (
              // --- If user is NOT logged in ---
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      {/* Style for drop-down menu animation */}
      <style jsx global>{`
        @keyframes fadeInFastAnimation {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-fast {
          animation: fadeInFastAnimation 0.15s ease-out forwards;
        }
      `}</style>
    </>
  );
}