// src/components/landing/CardBase.tsx
import { cn } from '@/lib/utils';
import { tone, type Tone } from './card.logic';

type Props = {
  children: React.ReactNode;
  color: Tone;
  className?: string;
};

export function CardBase({ children, color, className }: Props) {
  const c = tone[color];
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-bg-surface/40 backdrop-blur',
        c.border,
        className
      )}
    >
      {children}
    </div>
  );
}