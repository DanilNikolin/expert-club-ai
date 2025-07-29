// src/components/landing/FeatureCard.tsx
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardBase } from './CardBase';
import { tone, type Tone } from './card.logic';

type Props = {
  icon: LucideIcon;
  title: string;
  color: Tone;
  text: string;
};

export function FeatureCard({ icon: Icon, title, color, text }: Props) {
  const c = tone[color];
  return (
    <CardBase color={color} className="p-8 text-center">
      <Icon className={cn('w-16 h-16 mx-auto mb-4', c.text)} />
      <h3 className={cn('text-xl font-pixel uppercase mb-3', c.text)}>{title}</h3>
      <p className="text-text-secondary">{text}</p>
    </CardBase>
  );
}