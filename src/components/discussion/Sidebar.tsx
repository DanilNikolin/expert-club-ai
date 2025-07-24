// src/components/discussion/Sidebar.tsx
'use client';

import Link from 'next/link';
import { type Expert } from './ExpertSelector'; // Мы создадим этот файл в следующем шаге

type SidebarProps = {
  brief: string;
  debateGoal: string;
  setDebateGoal: (goal: string) => void;
  handleUpdateGoal: () => void;
  isSavingGoal: boolean;
  stage: 'setup' | 'debating' | 'paused' | 'judging' | 'finished';
  availableExperts: Expert[];
  selectedExperts: Expert[];
  setSelectedExperts: React.Dispatch<React.SetStateAction<Expert[]>>;
  rounds: number;
  setRounds: (rounds: number) => void;
  autoPause: boolean;
  setAutoPause: (pause: boolean) => void;
  onStartDebate: () => void;
};

// Временный компонент-заглушка, пока мы не создали ExpertSelector
const ExpertSelector = ({ availableExperts, selectedExperts, setSelectedExperts }: any) => (
    <div className="space-y-2 mb-4">
    {!availableExperts.length ? (
        <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800">
            Нет экспертов. <Link href="/experts/create" className="text-blue-600">Создайте первого!</Link>
        </div>
    ) : (
        <div className="grid grid-cols-1 gap-2">
            {availableExperts.map((ex: Expert) => (
                <div
                    key={ex.id}
                    onClick={() =>
                        setSelectedExperts((prev: Expert[]) =>
                            prev.some(e => e.id === ex.id) ? prev.filter(e => e.id !== ex.id) : [...prev, ex]
                        )
                    }
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedExperts.some(e => e.id === ex.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <h3 className="font-bold">{ex.name}</h3>
                </div>
            ))}
        </div>
    )}
    </div>
);


export default function Sidebar({
  brief,
  debateGoal,
  setDebateGoal,
  handleUpdateGoal,
  isSavingGoal,
  stage,
  availableExperts,
  selectedExperts,
  setSelectedExperts,
  rounds,
  setRounds,
  autoPause,
  setAutoPause,
  onStartDebate,
}: SidebarProps) {
  const isDebateInProgress = stage === 'debating' || stage === 'judging';

  return (
    <aside className="col-span-4">
      <div className="sticky top-10 space-y-6">
        <Link href="/dashboard" className="text-blue-500 hover:underline mb-4 block">
          &larr; Вернуться в Дашборд
        </Link>

        {/* BRIEF */}
        <div>
          <h2 className="text-xl font-bold mb-2">Ваш Бриф</h2>
          <p className="p-4 bg-gray-50 rounded-lg border text-gray-700 whitespace-pre-wrap">{brief}</p>
        </div>

        {/* DEBATE GOAL */}
        <div>
          <h2 className="text-xl font-bold mb-2">Цель Дебатов</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {['КРИТИЧЕСКИЙ АНАЛИЗ', 'ПОИСК РЕШЕНИЙ', 'СТРАТЕГИЧЕСКОЕ ПЛАНИРОВАНИЕ', 'МОЗГОВОЙ ШТУРМ'].map(goal => (
              <button
                key={goal}
                onClick={() => setDebateGoal(goal)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  debateGoal === goal
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                disabled={isDebateInProgress}
              >
                {goal.charAt(0).toUpperCase() + goal.slice(1).toLowerCase().replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <textarea
            value={debateGoal}
            onChange={(e) => setDebateGoal(e.target.value)}
            onBlur={handleUpdateGoal}
            placeholder="Выберите шаблон или напишите свою цель..."
            className="w-full p-2 border border-gray-300 rounded-lg text-black resize-none"
            rows={3}
            disabled={isDebateInProgress}
          />
           <p className="text-xs text-gray-500 mt-1 italic">
             💡 **Совет:** Чем точнее ваш запрос, тем полезнее будет результат.
           </p>
          {isSavingGoal && <p className="text-sm text-gray-500 italic animate-pulse mt-1">Сохраняем цель...</p>}
        </div>

        {/* TEAM SETUP */}
        <div>
          <h2 className="text-xl font-bold mb-2">1. Выберите команду</h2>
            <ExpertSelector 
                availableExperts={availableExperts}
                selectedExperts={selectedExperts}
                setSelectedExperts={setSelectedExperts}
            />
        </div>
        
        {/* ROUNDS SETUP */}
        <div>
          <h2 className="text-xl font-bold mb-2">2. Настройки Дебатов</h2>
          <select
            value={rounds}
            onChange={e => setRounds(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg mb-4 text-black"
          >
            <option value={1}>1 Раунд</option>
            <option value={2}>2 Раунда</option>
            <option value={3}>3 Раунда</option>
            <option value={6}>6 Раунда</option>
          </select>
          <div className="flex items-center space-x-2 mb-4">
            <input type="checkbox" id="autopause" checked={autoPause} onChange={e => setAutoPause(e.target.checked)} />
            <label htmlFor="autopause" className="text-sm font-medium">
              Автопауза после раунда
            </label>
          </div>
          <button
            type="button"
            onClick={onStartDebate}
            disabled={!selectedExperts.length || isDebateInProgress}
            className="w-full py-3 font-bold text-lg text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {isDebateInProgress ? 'Дебаты идут...' : 'Начать Новые Дебаты'}
          </button>
        </div>
      </div>
    </aside>
  );
}