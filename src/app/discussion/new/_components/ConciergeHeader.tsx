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
      <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-4 mb-2 md:mb-4 pb-2 md:pb-4 border-b border-bg-surface">
        <div>
          <div className="flex items-center gap-4">
            {/* КОММЕНТАРИЙ ДЛЯ ТЕБЯ, ДАНИЛ: 
              Вот тот самый заголовок. Сейчас 'text-2xl', можешь менять на 'text-3xl' и т.д., чтобы подобрать идеальный размер.
            */}
            <h1 className="font-pixel text-2xl md:text-3xl text-accent-primary uppercase">Консьерж</h1>
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
          {isChatEmpty && (
            <p className="font-sans text-text-secondary mt-1 md:mt-2 max-w-lg">
              Начните диалог, чтобы я помог вам сформулировать бриф для экспертов.
            </p>
          )}
        </div>
        <Button
            onClick={onStartBrief}
            disabled={isChatEmpty || isLoading || isSubmitting}
            isLoading={isSubmitting}
            size="default" // Оставляем для px-8 и text-base
            className={cn(
              'bg-accent-success hover:bg-accent-success/90 focus:ring-accent-success w-full md:w-auto flex-shrink-0',
              'py-2 md:py-4', // <-- ВОТ ФИКС: Уменьшаем паддинг на мобилке, возвращаем на десктопе.
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