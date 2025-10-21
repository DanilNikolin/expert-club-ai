// src/components/discussion/DebateControls.tsx
'use client';

import { type Run } from '@/types';
import { Button } from '@/components/ui/Button';
import { Scale } from 'lucide-react';

type DebateControlsProps = {
  stage: 'setup' | 'debating' | 'paused' | 'judging' | 'finished';
  currentRound: number;
  rounds: number;
  userIntervention: string;
  setUserIntervention: (value: string) => void;
  onContinue: () => void;
  onGetVerdict: () => void;
  activeRun: Run | null;
  liveRunId: string | null;
};

export default function DebateControls({
  stage,
  currentRound,
  rounds,
  userIntervention,
  setUserIntervention,
  onContinue,
  onGetVerdict,
  activeRun,
  liveRunId, // <-- ПРИНЯЛИ
}: DebateControlsProps) {

  // --- ГЛАВНЫЙ ЗАМОК "READ-ONLY" ---
  // Если мы смотрим не на "живой" прогон, не показываем НИКАКИХ кнопок.
  if (!activeRun || activeRun.id !== liveRunId) {
    
    // Но если мы смотрим на *старый* прогон И у него *нет* отчета,
    // надо хотя бы сообщить, что он "Архивный"
    if (activeRun && !activeRun.report) {
         return (
            <div className="mt-6 pt-6 border-t border-bg-surface text-center">
              <h3 className="title-pixel text-text-secondary mb-3">АРХИВНЫЙ ПРОГОН (READ-ONLY)</h3>
            </div>
         );
    }
    return null; // Для завершенных с отчетом - ничего не показываем
  }

  // --- Контролы на паузе ---
  if (stage === 'paused' && currentRound < rounds) {
    return (
      <div className="mt-6 pt-6 border-t border-bg-surface">
        <h3 className="title-pixel text-accent-secondary text-center mb-3">Раунд {currentRound} завершен. Ваш ход.</h3>
        <textarea
          value={userIntervention}
          onChange={e => setUserIntervention(e.target.value)}
          placeholder="Ваша реплика (необязательно)..."
          className="w-full p-3 bg-bg-main border border-bg-surface rounded-md text-text-main resize-none focus:ring-1 focus:ring-accent-secondary mb-3"
          rows={3}
        />
        <Button onClick={onContinue} size="sm" className="w-full">
          Продолжить (Раунд {currentRound + 1})
        </Button>
      </div>
    );
  }

  // --- Кнопка вызова Судьи ---
  if ((stage === 'paused' || stage === 'finished' || stage === 'judging') && currentRound >= rounds && !activeRun?.report) {
    return (
      <div className="mt-6 pt-6 border-t border-bg-surface text-center">
        <h3 className="title-pixel text-amber-400 mb-3">Все раунды завершены!</h3>
        <Button
          onClick={onGetVerdict}
          disabled={stage === 'judging'}
          isLoading={stage === 'judging'}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 focus:ring-amber-500"
        >
          <Scale className="mr-2 h-4 w-4"/>
          {stage === 'judging' ? 'Судья выносит вердикт...' : 'Получить вердикт Судьи'}
        </Button>
      </div>
    );
  }

  // --- Финальный отчет ---
  if (stage === 'finished' && activeRun?.report) {
    return (
        <div className="mt-6 pt-6 border-t border-bg-surface text-center">
          <h3 className="title-pixel text-accent-success mb-3">Дебаты Завершены</h3>
          <p className="text-sm text-text-secondary">Финальный вердикт находится в окне чата.</p>
      </div>
    );
  }

  return null; // В остальных случаях ничего не показываем
}