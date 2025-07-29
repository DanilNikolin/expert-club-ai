// src/app/experts/_components/ArchetypeSection.tsx
'use client';

import ConfigSectionCard from './ConfigSectionCard';
import { type ArchetypeMix, archetypeLabels } from './expert-constructor.logic';
import { cn } from '@/lib/utils';
import React from 'react';
import Tooltip from '@/components/ui/Tooltip';

type Props = {
  archetypeMix: ArchetypeMix;
  handleArchetypeMixChange: (type: keyof ArchetypeMix, value: number) => void;
  resetArchetypeMix: () => void;
};

// ОБНОВЛЕНИЕ: Новая палитра для архетипов
const archetypeClasses = {
  analyst: {
    text: 'text-accent-ink',
    bg: 'bg-accent-ink',
    thumb: 'slider-thumb-primary',
  },
  synthesizer: {
    text: 'text-accent-maroon',
    bg: 'bg-accent-maroon',
    thumb: 'slider-thumb-secondary',
  },
  resonator: {
    text: 'text-accent-success',
    bg: 'bg-accent-success',
    thumb: 'slider-thumb-success',
  },
};

const MindsetStackedBar = ({ mix }: { mix: ArchetypeMix }) => (
  <div className="flex h-3 w-full overflow-hidden rounded-full bg-bg-main ring-1 ring-inset ring-border-main">
    {Object.entries(mix).map(([type, value]) => {
      if (value === 0) return null;
      const key = type as keyof typeof archetypeClasses;
      return (
        <div
          key={type}
          className={cn("h-full transition-all duration-300", archetypeClasses[key].bg)}
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
      className="font-pixel text-xs uppercase text-text-secondary transition-colors hover:text-text-main"
    >
      Сброс
    </button>
  );

  return (
    <ConfigSectionCard
      title="Уровень 1: Тип Мышления"
      description="Распределите 100% 'мощности процессора' эксперта, определяя, КАК он будет обрабатывать информацию."
      actions={actions}
      isCollapsible={true}
      startOpen={false}
    >
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="flex items-center font-pixel text-base uppercase text-text-main">
            Распределение типов
            <Tooltip content="Сумма всех типов мышления должна быть строго равна 100%." />
          </h3>
          <p className={cn(
            'font-mono text-lg',
            totalValue === 100 ? 'text-accent-secondary' : 'text-accent-danger'
          )}>
            {totalValue}% / 100%
          </p>
        </div>
        <MindsetStackedBar mix={archetypeMix} />
        {totalValue !== 100 && <p className='text-xs text-accent-warning mt-2 text-right'>Сумма должна быть равна 100%</p>}
      </div>

      <div className="space-y-6">
        {Object.entries(archetypeMix).map(([type, value]) => {
          const key = type as keyof typeof archetypeClasses;
          return (
            <div key={type}>
              <div className="flex items-center justify-between">
                <label className={cn("flex items-center font-pixel text-base uppercase", archetypeClasses[key].text)}>
                  {archetypeLabels[key]}
                  <Tooltip
                    content={
                      type === 'analyst' ? 'Фокус на логике, фактах и цифрах. Разбирает проблему на части.' :
                      type === 'synthesizer' ? 'Фокус на поиске связей, креативе и создании нового из частей.' :
                      'Фокус на человеческом факторе, эмпатии и ценностях.'
                    }
                  />
                </label>
                <span className={cn("font-mono text-lg", archetypeClasses[key].text)}>{value}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value ?? 0}
                onChange={(e) => handleArchetypeMixChange(key, Number(e.target.value))}
                className={cn(
                  'slider-primary mt-2 w-full',
                  archetypeClasses[key].thumb
                )}
              />
            </div>
          )
        })}
      </div>
    </ConfigSectionCard>
  );
}