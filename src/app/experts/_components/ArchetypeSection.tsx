'use client';

import ConfigSectionCard from './ConfigSectionCard';
import { type ArchetypeMix, archetypeLabels } from './expert-constructor.logic';
import { cn } from '@/lib/utils';
import React from 'react';

type Props = {
  archetypeMix: ArchetypeMix;
  handleArchetypeMixChange: (type: keyof ArchetypeMix, value: number) => void;
  resetArchetypeMix: () => void;
};

// --- Объект, который связывает тип с CSS-классом цвета текста ---
const archetypeTextClasses = {
  analyst: 'text-accent-primary',
  synthesizer: 'text-accent-secondary',
  resonator: 'text-accent-success',
};

// --- Объект, который связывает тип с CSS-классом цвета фона (для бара) ---
const archetypeBgClasses = {
  analyst: 'bg-accent-primary',
  synthesizer: 'bg-accent-secondary',
  resonator: 'bg-accent-success',
};

// --- Объект, который связывает тип с CSS-классом для бегунка ползунка ---
const archetypeThumbClasses = {
  analyst: 'slider-thumb-primary',
  synthesizer: 'slider-thumb-secondary',
  resonator: 'slider-thumb-success',
};

// --- Визуализатор теперь тоже использует классы ---
const MindsetStackedBar = ({ mix }: { mix: ArchetypeMix }) => (
  <div className="flex h-3 w-full overflow-hidden rounded-full bg-bg-main ring-1 ring-inset ring-bg-surface">
    {Object.entries(mix).map(([type, value]) => {
      if (value === 0) return null;
      return (
        <div
          key={type}
          className={cn("h-full transition-all duration-300", archetypeBgClasses[type as keyof typeof archetypeBgClasses])}
          style={{ width: `${value}%` }}
        />
      );
    })}
  </div>
);

export default function ArchetypeSection({ archetypeMix, handleArchetypeMixChange, resetArchetypeMix }: Props) {
  const totalValue = Object.values(archetypeMix).reduce((sum, v) => sum + v, 0);

  const actions = (
    <button
      type="button"
      onClick={resetArchetypeMix}
      className="font-pixel text-xs uppercase text-text-secondary transition-colors hover:text-accent-primary"
    >
      Сброс
    </button>
  );

  return (
    <ConfigSectionCard
      title="Уровень 1: Тип Мышления"
      description="Как эксперт обрабатывает информацию? Распределите 100% между тремя типами."
      actions={actions}
      isCollapsible={true}
      startOpen={false}
    >
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="font-pixel text-base uppercase text-text-main">Распределение типов</h3>
          <p className={cn(
            'font-mono text-lg',
            totalValue === 100 ? 'text-accent-primary' : 'text-accent-danger'
          )}>
            {totalValue}% / 100%
          </p>
        </div>
        <MindsetStackedBar mix={archetypeMix} />
        {totalValue !== 100 && <p className='text-xs text-amber-500 mt-2 text-right'>Сумма должна быть равна 100%</p>}
      </div>

      <div className="space-y-6">
        {Object.entries(archetypeMix).map(([type, value]) => (
          <div key={type}>
            <div className="flex items-center justify-between">
              <label className={cn("font-pixel text-base uppercase", archetypeTextClasses[type as keyof typeof archetypeTextClasses])}>
                {archetypeLabels[type as keyof typeof archetypeLabels]}
              </label>
              <span className="font-mono text-lg text-text-main">{value}%</span>
            </div>
            <p className="font-sans text-xs text-text-secondary mt-1">
              {type === 'analyst' && 'Логика, факты, причинно-следственные связи'}
              {type === 'synthesizer' && 'Объединение идей, поиск паттернов, креативность'}
              {type === 'resonator' && 'Эмпатия, человеческий фактор, эмоции'}
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={value ?? 0}
              onChange={(e) => handleArchetypeMixChange(type as keyof ArchetypeMix, Number(e.target.value))}
              className={cn(
                  'slider-primary mt-2 w-full',
                  archetypeThumbClasses[type as keyof typeof archetypeThumbClasses]
              )}
            />
          </div>
        ))}
      </div>
    </ConfigSectionCard>
  );
}