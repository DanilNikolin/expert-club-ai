// src/components/discussion/RunSelector.tsx
'use client';

import { type Run } from '@/types';

type RunSelectorProps = {
  runs: Run[];
  activeRun: Run | null;
  setActiveRun: (run: Run | null) => void;
  onDeleteRun: (runId: string) => void;
  stage: 'setup' | 'debating' | 'paused' | 'judging' | 'finished';
};

export default function RunSelector({ runs, activeRun, setActiveRun, onDeleteRun, stage }: RunSelectorProps) {
  if (runs.length === 0 || stage === 'debating' || stage === 'judging') {
    return null; // Не показываем ничего, если нет ранов или идет активный процесс
  }

  return (
    <div className="mb-4 border-b pb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Просмотр Прогонов:</label>
      <div className="flex items-center space-x-2">
        <select
          value={activeRun?.id || ''}
          onChange={e => setActiveRun(runs.find(r => r.id === e.target.value) || null)}
          className="flex-grow p-2 border border-gray-300 rounded-lg text-black"
        >
          {runs.map((run, i) => (
            <option key={run.id} value={run.id}>
              Прогон №{runs.length - i} ({new Date(run.createdAt.seconds * 1000).toLocaleString()}) –{' '}
              {run.team?.map(t => t.name).join(', ') ?? 'Команда не определена'}
            </option>
          ))}
        </select>
        {activeRun && (
          <button
            onClick={() => onDeleteRun(activeRun.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
            title="Удалить этот прогон"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}