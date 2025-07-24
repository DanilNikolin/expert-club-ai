// src/components/ui/Button.tsx
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // --- Базовые стили для всех кнопок ---
  'inline-flex items-center justify-center rounded-md font-pixel text-base uppercase tracking-wider transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-main disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        // --- Основная кнопка ---
        primary: 'bg-accent-primary text-bg-main hover:opacity-90 focus:ring-accent-primary disabled:bg-bg-surface disabled:text-text-secondary',
        // --- Второстепенная (прозрачная) кнопка ---
        secondary: 'border border-bg-surface bg-transparent text-text-secondary hover:border-accent-primary hover:text-accent-primary focus:ring-accent-primary',
        destructive: 'border border-bg-surface bg-transparent text-text-secondary hover:border-accent-danger hover:text-accent-danger focus:ring-accent-danger',
      },
      size: {
        default: 'px-8 py-4',
        sm: 'px-4 py-2 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = ({ className, variant, size, isLoading, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
          <span>Загрузка...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};