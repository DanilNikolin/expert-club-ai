'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Expert } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, CircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Pencil } from 'lucide-react';

type SidebarProps = {
  discussionId: string;
  brief: string;
  onBriefUpdated: (newBrief: string) => void;
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

const SidebarSection = ({ title, children, actions }: { title: string, children: React.ReactNode, actions?: React.ReactNode }) => (
  <div className="rounded-lg border border-bg-surface bg-bg-surface/50 p-4">
    <div className="flex justify-between items-center mb-3">
      <h3 className="title-pixel text-accent-primary">{title}</h3>
      {actions && <div>{actions}</div>}
    </div>
    {children}
  </div>
);

// ИСПРАВЛЕНИЕ ЗДЕСЬ: Убрали 'any', добавили четкие типы для пропсов
type ExpertSelectorProps = {
  availableExperts: Expert[];
  selectedExperts: Expert[];
  setSelectedExperts: React.Dispatch<React.SetStateAction<Expert[]>>;
  disabled: boolean;
};

const ExpertSelector = ({ availableExperts, selectedExperts, setSelectedExperts, disabled }: ExpertSelectorProps) => {
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
  discussionId,
  brief,
  onBriefUpdated,
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

  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [editedBrief, setEditedBrief] = useState(brief);

  useEffect(() => {
    setEditedBrief(brief);
  }, [brief]);

  const handleSaveBrief = async () => {
    try {
        await fetch(`/api/discussion/${discussionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brief: editedBrief }),
        });
        onBriefUpdated(editedBrief);
        setIsEditingBrief(false);
    } catch (error) {
        console.error("Failed to update brief:", error);
        alert("Ошибка сохранения брифа!");
    }
  };

  const isDebateInProgress = stage === 'debating' || stage === 'judging' || stage === 'paused';

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="mb-4 flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-accent-primary">
        <ArrowLeft size={16} />
        <span>Вернуться в Дашборд</span>
      </Link>
      
      <SidebarSection 
        title="Ваш Бриф"
        actions={!isEditingBrief && (
            <Button
                onClick={() => setIsEditingBrief(true)}
                variant="secondary"
                size="sm"
                className="px-2 py-1 h-auto"
                title="Редактировать бриф"
            >
                <Pencil className="h-4 w-4" />
            </Button>
        )}
      >
        {isEditingBrief ? (
            <div className="space-y-2">
                <textarea
                    value={editedBrief}
                    onChange={(e) => setEditedBrief(e.target.value)}
                    className="w-full p-2 h-32 bg-bg-main border border-bg-surface rounded-md text-text-main resize-y focus:ring-1 focus:ring-accent-primary"
                />
                <div className="flex gap-2">
                    <button onClick={handleSaveBrief} className="w-full px-3 py-1 text-xs font-pixel bg-accent-success text-bg-main rounded hover:opacity-90">Сохранить</button>
                    <button onClick={() => { setIsEditingBrief(false); setEditedBrief(brief); }} className="w-full px-3 py-1 text-xs font-pixel bg-bg-surface text-text-secondary rounded hover:opacity-90">Отмена</button>
                </div>
            </div>
        ) : (
            <p className="font-sans text-sm text-text-secondary max-h-24 overflow-y-auto whitespace-pre-wrap">{brief}</p>
        )}
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
      </SidebarSection>

      <SidebarSection title="Настройки Прогона">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center">
              1. Выберите команду
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