// src/components/landing/SectionHeader.tsx
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function SectionHeader({ children, className }: Props) {
  return (
    <h2 className={cn('text-3xl font-pixel text-center text-accent-primary uppercase mb-12', className)}>
      {children}
    </h2>
  );
}