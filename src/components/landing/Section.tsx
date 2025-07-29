// src/components/landing/Section.tsx
import { cn } from '@/lib/utils';

type Props = {
  id?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({ id, children, className }: Props) {
  return (
    <section id={id} className={cn('relative container mx-auto px-4 py-16', className)}>
      {children}
    </section>
  );
}