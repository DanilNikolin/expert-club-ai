'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isCollapsible?: boolean;
  startOpen?: boolean;
};

export default function ConfigSectionCard({
  title,
  description,
  children,
  actions,
  isCollapsible = false,
  startOpen = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <div className="rounded-lg border border-bg-surface bg-bg-surface/50 shadow-lg">
      {/* --- ИСПРАВЛЕННЫЙ ЗАГОЛОВОК --- */}
      <div className="flex items-start justify-between p-6">
        {/* Кнопкой теперь является только левая часть с текстом */}
        <button
          type="button"
          disabled={!isCollapsible}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex flex-grow items-center text-left", 
            isCollapsible ? "cursor-pointer" : "cursor-default"
          )}
        >
          <div>
            <h2 className="title-pixel text-accent-primary">{title}</h2>
            <p className="mt-1 font-sans text-sm text-text-secondary">{description}</p>
          </div>
          {isCollapsible && (
            <ChevronDown
              className={cn(
                "ml-auto h-5 w-5 flex-shrink-0 text-text-secondary transition-transform duration-300",
                isOpen && "rotate-180"
              )}
            />
          )}
        </button>

        {/* Кнопки-действия ("Сброс") теперь находятся рядом, а не внутри */}
        {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
      </div>

      {/* Содержимое карточки */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-bg-surface">
            <div className='pt-6'>
                 {children}
            </div>
        </div>
      )}
    </div>
  );
}