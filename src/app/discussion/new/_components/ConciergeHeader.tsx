// src/app/discussion/new/_components/ConciergeHeader.tsx
'use client';

type Props = {
  onStartBrief: () => void;
  isSubmitting: boolean;
  isChatEmpty: boolean;
  isLoading: boolean;
};

export default function ConciergeHeader({ onStartBrief, isSubmitting, isChatEmpty, isLoading }: Props) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-3xl font-bold">Диалог с Консьержем</h1>
        <p className="text-gray-500">Расскажите о своей идее, чтобы подготовить бриф для экспертов.</p>
      </div>
      <button
        onClick={onStartBrief}
        disabled={isChatEmpty || isLoading || isSubmitting}
        className="px-6 py-3 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Формируем бриф...' : 'Передать Экспертам'}
      </button>
    </div>
  );
}