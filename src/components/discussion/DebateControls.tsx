// src/components/discussion/DebateControls.tsx
'use client';

import { type Run } from '@/types';

type DebateControlsProps = {
  stage: 'setup' | 'debating' | 'paused' | 'judging' | 'finished';
  currentRound: number;
  rounds: number;
  userIntervention: string;
  setUserIntervention: (value: string) => void;
  onContinue: () => void;
  onGetVerdict: () => void;
  activeRun: Run | null;
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
}: DebateControlsProps) {

  // Контролы на паузе
  if (stage === 'paused' && currentRound < rounds) {
    return (
      <div className="mt-6 p-4 border-t">
        <h3 className="font-semibold mb-2">Раунд {currentRound} завершен. Хотите вмешаться?</h3>
        <textarea
          value={userIntervention}
          onChange={e => setUserIntervention(e.target.value)}
          placeholder="Ваша реплика..."
          className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-black"
        />
        <button
          onClick={onContinue}
          className="w-full py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Продолжить (Раунд {currentRound + 1})
        </button>
      </div>
    );
  }

  // Кнопка вердикта
  if (stage === 'paused' && currentRound >= rounds) {
    return (
      <div className="mt-6 p-4 border-t text-center">
        <h3 className="font-semibold mb-2">Все раунды завершены!</h3>
        <button
          onClick={onGetVerdict}
          disabled={stage === 'judging'}
          className="py-2 px-6 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
        >
          {stage === 'judging' ? 'Анализ...' : 'Получить вердикт Судьи'}
        </button>
      </div>
    );
  }

  // Финальный отчет
  if (stage === 'finished' && activeRun?.report) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-6">
        <h3 className="text-2xl font-bold mb-4 text-green-800">Итоговый Отчет Судьи</h3>
        <div className="whitespace-pre-wrap text-gray-800">{activeRun.report}</div>
      </div>
    );
  }

  return null; // В остальных случаях ничего не показываем
}