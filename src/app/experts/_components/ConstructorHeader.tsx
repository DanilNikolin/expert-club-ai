// src/app/experts/_components/ConstructorHeader.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, LoaderCircle } from 'lucide-react';

type Props = {
  isCreateMode: boolean;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  completionProgress: number;
};

// Компонент для индикатора прогресса. Теперь он использует "чернильный" цвет.
const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2 w-full rounded-full bg-bg-main ring-1 ring-inset ring-border-main">
    <div
      className="h-full rounded-full bg-accent-secondary transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

export default function ConstructorHeader({ isCreateMode, isAutoSaving, lastSaved, completionProgress }: Props) {
  return (
    <div className="space-y-6">
      {/* Верхняя часть: Название и ссылка "Назад" */}
      <div>
        <Link
          href="/dashboard"
          className="mb-3 flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-text-main"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="page-title-pixel text-accent-primary">
          {isCreateMode ? 'Expert Constructor' : 'Expert Editor'}
        </h1>
      </div>

      {/* Нижняя часть: Статусы */}
      <div className="space-y-3">
        {/* Статус автосохранения */}
        <div className="flex items-center justify-between font-sans text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            {isAutoSaving ? (
              <LoaderCircle size={14} className="animate-spin text-accent-secondary" />
            ) : (
              <CheckCircle size={14} className={lastSaved ? 'text-accent-success' : 'text-text-muted'} />
            )}
            <span>
              {isAutoSaving
                ? 'Saving...'
                : lastSaved
                  ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'All changes are saved automatically'
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