// src/components/landing/card.logic.ts
export type Tone = 'primary' | 'secondary' | 'success' | 'danger';

export const tone = {
  primary: {
    text: 'text-accent-primary',
    border: 'border-accent-primary/30',
    dot: 'bg-accent-primary/20',
  },
  secondary: {
    text: 'text-accent-secondary',
    border: 'border-accent-secondary/30',
    dot: 'bg-accent-secondary/20',
  },
  success: {
    text: 'text-accent-success',
    border: 'border-accent-success/30',
    dot: 'bg-accent-success/20',
  },
  danger: {
    text: 'text-accent-danger',
    border: 'border-accent-danger/30',
    dot: 'bg-accent-danger/20',
  },
} as const;