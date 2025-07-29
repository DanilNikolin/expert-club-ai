// src/components/landing/FixedCtaBar.tsx
'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  isAuthed: boolean;
};

export function FixedCtaBar({ isAuthed }: Props) {
  if (isAuthed) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="mx-4 mb-4 rounded-2xl border border-accent-primary/20 bg-bg-surface/80 backdrop-blur px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="text-sm text-text-secondary">
            <span className="text-text-main font-medium">Готов?</span> Первая сессия — бесплатно.
          </div>
          <Link href="/signup" className="ml-auto">
            <Button size="sm" className="px-4">
              Начать
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}