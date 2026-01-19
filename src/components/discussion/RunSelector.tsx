// src/components/discussion/RunSelector.tsx
'use client';

import { useState } from 'react';
import { type Run } from '@/types';
import { Trash2, Archive, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type RunSelectorProps = {
  runs: Run[];
  activeRun: Run | null;
  setActiveRun: (run: Run | null) => void;
  onDeleteRun: (runId: string) => void;
  stage: 'setup' | 'debating' | 'paused' | 'judging' | 'finished';
};

export default function RunSelector({ runs, activeRun, setActiveRun, onDeleteRun, stage }: RunSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (runs.length === 0 || stage === 'debating' || stage === 'judging') {
    return <div className="mb-6 border-b border-bg-surface"></div>;
  }

  return (
    <div className="mb-6 border-b border-bg-surface pb-6 animate-fade-in-fast">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full justify-between items-center group"
      >
        <h3 className="flex items-center gap-2 font-pixel text-sm uppercase text-text-secondary group-hover:text-text-main transition-colors">
          <Archive size={16} />
          Run Archive
        </h3>
        <ChevronDown
          size={20}
          className={cn("text-text-secondary transition-transform duration-300", isExpanded && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out mt-3',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {runs.map((run, i) => {
              const isActive = activeRun?.id === run.id;
              return (
                <div key={run.id} className="group relative">
                  <button
                    onClick={() => setActiveRun(run)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all duration-150',
                      isActive
                        ? 'bg-bg-elevated border-accent-secondary shadow-inner'
                        : 'bg-bg-surface border-border-main hover:border-text-secondary/50'
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-mono text-xs text-text-secondary">
                        Run №{runs.length - i}
                      </p>
                      <p className="font-mono text-xs text-text-muted">
                        {new Date(run.createdAt.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-sans text-sm text-text-main mt-1 truncate">
                      {run.team?.map(t => t.name).join(', ') ?? 'Team undefined'}
                    </p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRun(run.id);
                    }}
                    className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 text-text-muted rounded-md opacity-0 group-hover:opacity-100 hover:text-accent-danger hover:bg-accent-danger/10 transition-all duration-150"
                    title="Delete this run"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}