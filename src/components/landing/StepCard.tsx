// src/components/landing/StepCard.tsx
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardBase } from './CardBase';
import { tone, type Tone } from './card.logic';

// Стало
type Props = {
  step: number;
  icon: LucideIcon;
  title: string;
  color: Tone;
  description: string;
  
};

export function StepCard({ step, icon: Icon, title, color, description }: Props) { // <-- Убрали
  const c = tone[color];
  return (
    <CardBase color={color} className={"p-6 text-center relative overflow-hidden"}> {/* <-- Убрали cn() и className */}
      {/* Большой номер на фоне */}
      <div className="absolute -top-2 left-2 font-pixel text-[80px] text-bg-elevated/30 opacity-50 z-0">
        {step}
      </div>
      
      {/* Контент теперь поверх номера */}
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-4">
          <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', c.dot)}>
            <Icon className={cn('w-8 h-8', c.text)} aria-hidden="true" />
          </div>
        </div>
        <h3 className={cn('font-pixel uppercase mb-2', c.text)}>{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </CardBase>
  );
}