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
  className?: string; // <-- ДОБАВИЛИ ЭТУ СТРОКУ
};

export default function ConfigSectionCard({
  title,
  description,
  children,
  actions,
  isCollapsible = false,
  startOpen = true,
  className, // <-- ДОБАВИЛИ ЭТУ СТРОКУ
}: Props) {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    // И ПРИМЕНИЛИ ЕГО ЗДЕСЬ VVV
    <div className={cn("rounded-lg border border-bg-surface bg-bg-surface/50 shadow-lg", className)}>
      <div className="flex items-start justify-between p-6">
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

        {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
      </div>

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