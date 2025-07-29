// src/components/ui/Button.tsx
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Базовые стили для всех кнопок
  'inline-flex items-center justify-center gap-2 rounded-md font-pixel text-base uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        // Главная, "костюмная" кнопка: 'Призрачная', с толстой рамкой.
        primary:
          'bg-transparent border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-text-on-accent focus-visible:ring-accent-primary',

        // Для ключевых действий, "пиджак": залита спокойным цветом.
        action:
          'bg-accent-secondary text-text-main hover:bg-accent-secondary/90 focus-visible:ring-accent-secondary',

        // Второстепенная: тёмная, для "тихих" действий.
        secondary:
          'bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-main focus-visible:ring-accent-secondary',

        // "Опасная" кнопка: не кричащая, а строгая.
        destructive:
          'bg-transparent border border-accent-danger/50 text-accent-danger hover:bg-accent-danger/10 hover:border-accent-danger/80 focus-visible:ring-accent-danger',
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = ({
  className,
  variant,
  size,
  isLoading,
  children,
  ...props
}: ButtonProps) => {
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