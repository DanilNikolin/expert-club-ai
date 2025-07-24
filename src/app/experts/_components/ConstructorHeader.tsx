'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, LoaderCircle } from 'lucide-react';

type Props = {
  isCreateMode: boolean;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  completionProgress: number;
};

// --- Компонент для индикатора прогресса с новым цветом ---
const ProgressBar = ({ value }: { value: number }) => (
    <div className="h-2 w-full rounded-full bg-bg-main ring-1 ring-inset ring-bg-surface">
        <div 
            // ИСПОЛЬЗУЕМ ЦВЕТ УСПЕХА!
            className="h-full rounded-full bg-accent-success transition-all duration-300" 
            style={{ width: `${value}%` }} 
        />
    </div>
);

export default function ConstructorHeader({ isCreateMode, isAutoSaving, lastSaved, completionProgress }: Props) {
  return (
    // Убрали карточку! Теперь это свободный блок.
    <div className="space-y-6">
      
      {/* Верхняя часть: Название и ссылка "Назад" */}
      <div>
        <Link
          href="/dashboard"
          className="mb-3 flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-accent-primary"
        >
          <ArrowLeft size={16} />
          <span>Вернуться в Дашборд</span>
        </Link>
        <h1 className="page-title-pixel text-accent-primary">
          {isCreateMode ? 'Новый Эксперт' : 'Редактор'}
        </h1>
      </div>

      {/* Нижняя часть: Статусы */}
      <div className="space-y-3">
        {/* Статус автосохранения */}
        <div className="flex items-center justify-between font-sans text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            {isAutoSaving ? (
              <LoaderCircle size={14} className="animate-spin text-accent-primary" />
            ) : (
              <CheckCircle size={14} className={lastSaved ? 'text-accent-success' : 'text-text-secondary/50'} />
            )}
            <span>
              {isAutoSaving 
                ? 'Сохранение...' 
                : lastSaved 
                  ? `Сохранено в ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                  : 'Готов к работе'
              }
            </span>
          </div>
        </div>

        {/* Индикатор прогресса */}
        <div className="flex items-center gap-3">
          <ProgressBar value={completionProgress} />
          <span className="font-mono text-sm font-bold text-text-main">{completionProgress}%</span>
        </div>
      </div>
    </div>
  );
}