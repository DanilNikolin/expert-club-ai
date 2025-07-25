// src/components/discussion/Sidebar.tsx
'use client';

import Link from 'next/link';
import { type Expert } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, CircleDashed } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip'; // Импортируем твой Tooltip!

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

// --- Компонент для секций в сайдбаре ---
const SidebarSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="rounded-lg border border-bg-surface bg-bg-surface/50 p-4">
    <h3 className="title-pixel text-accent-primary mb-3">{title}</h3>
    {children}
  </div>
);

// --- Новый селектор экспертов ---
const ExpertSelector = ({ availableExperts, selectedExperts, setSelectedExperts, disabled }: any) => {
  const toggleExpert = (expert: Expert) => {
    if (disabled) return;
    setSelectedExperts((prev: Expert[]) =>
      prev.some(e => e.id === expert.id)
        ? prev.filter(e => e.id !== expert.id)
        : [...prev, expert]
    );
  };

  return (
    <div className="space-y-2">
      {!availableExperts.length ? (
        <div className="p-3 text-center bg-bg-main rounded-md">
          <p className="text-sm text-text-secondary">Сначала <Link href="/experts/create" className="text-accent-primary hover:underline">создайте эксперта</Link>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
          {availableExperts.map((ex: Expert) => {
            const isSelected = selectedExperts.some(e => e.id === ex.id);
            return (
              <div
                key={ex.id}
                onClick={() => toggleExpert(ex)}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-md border border-bg-surface transition-colors',
                  disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-bg-surface',
                  isSelected && 'bg-accent-primary/20 border-accent-primary'
                )}
              >
                {isSelected ? <CheckCircle className="h-4 w-4 text-accent-primary" /> : <CircleDashed className="h-4 w-4 text-text-secondary" />}
                <span className="font-sans font-medium text-text-main">{ex.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


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
  const isDebateInProgress = stage === 'debating' || stage === 'judging' || stage === 'paused';

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="mb-4 flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-accent-primary">
        <ArrowLeft size={16} />
        <span>Вернуться в Дашборд</span>
      </Link>
      
      <SidebarSection title="Ваш Бриф">
        <p className="font-sans text-sm text-text-secondary max-h-24 overflow-y-auto whitespace-pre-wrap">{brief}</p>
        {/* Типс для брифа */}
        <div className="mt-2 text-xs text-text-secondary flex items-center">
            Этот бриф был сформирован Консьержем. Он является отправной точкой для дебатов.
            <Tooltip content="Бриф – это краткое описание вашей идеи или проблемы. Консьерж-бот помог вам его сформировать. Это основной документ, с которым будут работать эксперты." />
        </div>
      </SidebarSection>
      
      <SidebarSection title="Цель Дебатов">
        <textarea
          value={debateGoal}
          onChange={(e) => setDebateGoal(e.target.value)}
          onBlur={handleUpdateGoal}
          placeholder="Опишите главную цель..."
          className="w-full p-2 bg-bg-main border border-bg-surface rounded-md text-text-main resize-none focus:ring-1 focus:ring-accent-primary"
          rows={2}
          disabled={isDebateInProgress}
        />
        {isSavingGoal && <p className="text-xs text-text-secondary animate-pulse mt-1">Сохраняем...</p>}
        {/* Типс для цели дебатов */}
        <div className="mt-2 text-xs text-text-secondary flex items-center">
            Сформулируйте, чего вы хотите достичь дискуссией. Например: "Найти слабые места бизнес-модели" или "Оценить риски проекта".
            <Tooltip content="Цель дебатов направляет экспертов и Судью. Чем точнее цель, тем релевантнее будут аргументы и финальный отчёт." />
        </div>
      </SidebarSection>

      <SidebarSection title="Настройки Прогона">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center">
                1. Выберите команду
                <Tooltip content="Выберите 2 или более экспертов из ваших созданных. Чем разнообразнее команда, тем глубже и многостороннее будет анализ." />
            </label>
            <ExpertSelector
              availableExperts={availableExperts}
              selectedExperts={selectedExperts}
              setSelectedExperts={setSelectedExperts}
              disabled={isDebateInProgress}
            />
          </div>
          <div>
            <label htmlFor="rounds" className="block text-sm font-medium text-text-secondary mb-2 flex items-center">
                2. Количество раундов
                <Tooltip content="Определяет продолжительность дебатов. Каждый раунд - это серия ответов от каждого эксперта. Больше раундов - глубже анализ, но и дольше ожидание." />
            </label>
            <select
              id="rounds"
              value={rounds}
              onChange={e => setRounds(Number(e.target.value))}
              className="select-primary"
              disabled={isDebateInProgress}
            >
              <option value={1}>1 Раунд</option>
              <option value={2}>2 Раунда</option>
              <option value={3}>3 Раунда</option>
              <option value={6}>6 Раундов</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="autopause" 
              checked={autoPause} 
              onChange={e => setAutoPause(e.target.checked)}
              disabled={isDebateInProgress}
              className="h-4 w-4 rounded bg-bg-main border-bg-surface text-accent-primary focus:ring-accent-primary"
            />
            <label htmlFor="autopause" className="text-sm font-medium text-text-main flex items-center">
              Автопауза после раунда
              <Tooltip content="Дебаты будут автоматически останавливаться после каждого раунда, давая вам возможность вмешаться или добавить свою реплику." />
            </label>
          </div>
          <button
            type="button"
            onClick={onStartDebate}
            disabled={!selectedExperts.length || isDebateInProgress}
            className="w-full py-3 font-pixel text-lg text-bg-main bg-accent-success rounded-lg hover:bg-accent-success/90 disabled:bg-bg-main disabled:text-text-secondary disabled:cursor-not-allowed transition-colors"
          >
            {isDebateInProgress ? 'Дебаты Идут' : 'Начать Новые Дебаты'}
          </button>
        </div>
      </SidebarSection>
    </div>
  );
}