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

  // Следим, когда чат перестает быть пустым, чтобы один раз показать анимацию
  useEffect(() => {
    if (!isChatEmpty && !hasBecomeActive) {
      setHasBecomeActive(true);
    }
  }, [isChatEmpty, hasBecomeActive]);

  return (
    <>
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-bg-surface">
        <div>
          <h1 className="page-title-pixel text-accent-primary">Консьерж</h1>
          {/* ИЗМЕНЕНИЕ: Динамический подзаголовок */}
          {isChatEmpty ? (
            <p className="font-sans text-text-secondary mt-2">
              Начните с описания вашей идеи, чтобы активировать создание брифа.
            </p>
          ) : (
            <p className="font-sans text-text-secondary mt-2">
              Отлично! Уточняйте детали или <strong className="text-text-main">формируйте бриф в любой момент.</strong>
            </p>
          )}
        </div>
        <Button
          onClick={onStartBrief}
          disabled={isChatEmpty || isLoading || isSubmitting}
          isLoading={isSubmitting}
          // ИЗМЕНЕНИЕ: Кнопка стала больше
          size="default" 
          className={cn(
            'bg-accent-success hover:bg-accent-success/90 focus:ring-accent-success',
            // ИЗМЕНЕНИЕ: Анимация "маяка" при первой активации
            hasBecomeActive && 'animate-pulse-glow'
          )}
        >
          <FileText className="mr-2 h-4 w-4"/>
          {isSubmitting ? 'Формируем...' : 'Сформировать Бриф'}
        </Button>
      </div>
      
      {/* Стили для нашей новой анимации */}
      <style jsx global>{`
        @keyframes pulse-glow-animation {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(134, 239, 172, 0.4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(134, 239, 172, 0);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow-animation 1.5s 3; /* Анимация проиграется 3 раза */
        }
      `}</style>
    </>
  );
}