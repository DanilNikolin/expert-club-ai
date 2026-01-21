// src/components/landing/CtaRow.tsx
'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  isAuthed: boolean;
};

export function CtaRow({ isAuthed }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {isAuthed ? (
        <>
          <Link href="/dashboard" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 rounded-lg">
            <Button size="default" className="w-full px-8 py-4 text-lg">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/experts/create" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary/60 rounded-lg">
            <Button variant="secondary" size="default" className="w-full px-8 py-4 text-lg">
              + New Expert
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link href="/signup" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 rounded-lg">
            <Button size="default" className="w-full px-8 py-4 text-lg">
              <Play className="w-5 h-5 mr-2" />
              Try for free
            </Button>
          </Link>
          <Link href="/login" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary/60 rounded-lg">
            <Button variant="secondary" size="default" className="w-full px-8 py-4 text-lg">
              Log in
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}