// src/app/experts/_components/SuggestedTeam.tsx
'use client';

import { useState } from 'react';
import { type ExpertSuggestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  suggestions: ExpertSuggestion[];
  onConfirm: (selectedNames: string[]) => void;
};

export default function SuggestedTeam({ suggestions, onConfirm }: Props) {
  // Изначально все предложенные эксперты выбраны
  const [selected, setSelected] = useState<string[]>(suggestions.map(s => s.name));

  const handleToggle = (name: string) => {
    setSelected(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      onConfirm(selected);
    }
  };

  return (
    <div className="animate-fade-in-fast my-4 rounded-lg border-2 border-accent-primary/50 bg-bg-surface p-4">
      <h3 className="font-pixel text-base uppercase text-accent-primary mb-3">Suggested Team:</h3>
      <div className="space-y-2">
        {suggestions.map(expert => {
          const isSelected = selected.includes(expert.name);
          return (
            <div
              key={expert.name}
              onClick={() => handleToggle(expert.name)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors',
                isSelected ? 'bg-accent-primary/20' : 'hover:bg-bg-main/50'
              )}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded border border-bg-main">
                {isSelected && <Check className="h-4 w-4 text-accent-primary" />}
              </div>
              <span className="font-sans font-medium text-text-main">{expert.name}</span>
            </div>
          );
        })}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={selected.length === 0}
        className="mt-4 w-full"
        size="sm"
      >
        Create selected ({selected.length})
      </Button>
      <style jsx global>{`
        @keyframes fadeInFastAnimation {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
          animation: fadeInFastAnimation 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}