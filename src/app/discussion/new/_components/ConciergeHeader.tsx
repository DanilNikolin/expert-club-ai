// src/app/discussion/new/_components/ConciergeHeader.tsx
'use client';
import { Button } from '@/components/ui/Button';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type Props = {
  onStartBrief: () => void;
  isSubmitting: boolean;
  isChatEmpty: boolean;
  isLoading: boolean;
};

export default function ConciergeHeader({ onStartBrief, isSubmitting, isChatEmpty, isLoading }: Props) {
  const [hasBecomeActive, setHasBecomeActive] = useState(false);

  useEffect(() => {
    if (!isChatEmpty && !hasBecomeActive) {
      setHasBecomeActive(true);
    }
  }, [isChatEmpty, hasBecomeActive]);

  return (
    <>
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-bg-surface">
        <div>
          <div className="flex items-center gap-4">
            {/* КОММЕНТАРИЙ ДЛЯ ТЕБЯ, ДАНИЛ: 
              Вот тот самый заголовок. Сейчас 'text-2xl', можешь менять на 'text-3xl' и т.д., чтобы подобрать идеальный размер.
            */}
            <h1 className="font-pixel text-3xl text-accent-primary uppercase">Консьерж</h1>
            <span
              className={cn(
                'font-mono text-xs uppercase px-2 py-1 rounded-sm',
                isChatEmpty
                  ? 'bg-bg-elevated text-text-secondary'
                  : 'bg-accent-secondary/20 text-accent-secondary'
              )}
            >
              {isChatEmpty ? 'Ожидание ввода' : 'Сбор данных'}
            </span>
          </div>
          <p className="font-sans text-text-secondary mt-2 max-w-lg">
            {isChatEmpty
              ? 'Начните диалог, чтобы я помог вам сформулировать бриф для экспертов.'
              : 'Отлично! Уточняйте детали или формируйте бриф в любой момент.'}
          </p>
        </div>
        <Button
          onClick={onStartBrief}
          disabled={isChatEmpty || isLoading || isSubmitting}
          isLoading={isSubmitting}
          size="default"
          className={cn(
            'bg-accent-success hover:bg-accent-success/90 focus:ring-accent-success flex-shrink-0',
            hasBecomeActive && 'animate-pulse-glow'
          )}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Формируем...' : 'Сформировать Бриф'}
        </Button>
      </div>

      <style jsx global>{`
        @keyframes pulse-glow-animation {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(90, 139, 115, 0.4); /* accent-success */
          }
          50% {
            box-shadow: 0 0 0 8px rgba(90, 139, 115, 0);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow-animation 2s 3;
        }
      `}</style>
    </>
  );
}