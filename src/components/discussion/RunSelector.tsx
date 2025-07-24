// src/components/discussion/RunSelector.tsx
'use client';

import { type Run } from '@/types';
import { Trash2 } from 'lucide-react';

type RunSelectorProps = {
  runs: Run[];
  activeRun: Run | null;
  setActiveRun: (run: Run | null) => void;
  onDeleteRun: (runId: string) => void;
  stage: 'setup' | 'debating' | 'paused' | 'judging' | 'finished';
};

export default function RunSelector({ runs, activeRun, setActiveRun, onDeleteRun, stage }: RunSelectorProps) {
  if (runs.length === 0 || stage === 'debating' || stage === 'judging') {
    return <div className="mb-6 border-b border-bg-surface"></div>;
  }

  return (
    <div className="mb-6 border-b border-bg-surface pb-6">
      <label htmlFor="run-selector" className="block text-sm font-medium text-text-secondary mb-1">
        Просмотр Прогонов:
      </label>
      <div className="flex items-center space-x-2">
        <select
          id="run-selector"
          value={activeRun?.id || ''}
          onChange={e => setActiveRun(runs.find(r => r.id === e.target.value) || null)}
          className="select-primary flex-grow"
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
            className="p-3 text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-md transition-colors"
            title="Удалить этот прогон"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}