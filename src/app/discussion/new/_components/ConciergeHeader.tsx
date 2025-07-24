// src/app/discussion/new/_components/ConciergeHeader.tsx
'use client';
import { Button } from '@/components/ui/Button';
import { FileText } from 'lucide-react';

type Props = {
  onStartBrief: () => void;
  isSubmitting: boolean;
  isChatEmpty: boolean;
  isLoading: boolean;
};

export default function ConciergeHeader({ onStartBrief, isSubmitting, isChatEmpty, isLoading }: Props) {
  return (
    <div className="flex justify-between items-start mb-4 pb-4 border-b border-bg-surface">
      <div>
        <h1 className="page-title-pixel text-accent-primary">Консьерж</h1>
        <p className="font-sans text-text-secondary mt-2">Опишите вашу идею, чтобы мы подготовили бриф для экспертов</p>
      </div>
      <Button
        onClick={onStartBrief}
        disabled={isChatEmpty || isLoading || isSubmitting}
        isLoading={isSubmitting}
        size="sm"
        className="bg-accent-success hover:bg-accent-success/90 focus:ring-accent-success"
      >
        <FileText className="mr-2 h-4 w-4"/>
        {isSubmitting ? 'Формируем...' : 'Сформировать Бриф'}
      </Button>
    </div>
  );
}