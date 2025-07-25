// src/app/experts/_components/ArchetypeSection.tsx
'use client';

import ConfigSectionCard from './ConfigSectionCard';
import { type ArchetypeMix, archetypeLabels } from './expert-constructor.logic';
import { cn } from '@/lib/utils';
import React from 'react';
import Tooltip from '@/components/ui/Tooltip'; // Импортируем твой Tooltip!


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
      description="Это 'операционная система' эксперта. Распределите 100% между тремя фундаментальными типами мышления, определяя, КАК он будет обрабатывать информацию." // Обновленный description
      actions={actions}
      isCollapsible={true}
      startOpen={false}
    >
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="flex items-center font-pixel text-base uppercase text-text-main"> {/* Добавил flex items-center */}
            Распределение типов
            <Tooltip content="Сумма всех типов мышления должна быть строго равна 100%. Это определяет основной способ обработки информации экспертом." />
          </h3>
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
              <label className={cn("flex items-center font-pixel text-base uppercase", archetypeTextClasses[type as keyof typeof archetypeTextClasses])}>
                {archetypeLabels[type as keyof typeof archetypeLabels]}
                <Tooltip 
                  content={
                    type === 'analyst' ? 'Фокус на логике, фактах, цифрах и причинно-следственных связях. Разбирает проблему на составные части.' :
                    type === 'synthesizer' ? 'Фокус на объединении идей, поиске паттернов, креативных подходах и создании нового целого из разрозненных частей.' :
                    'Фокус на человеческом факторе: эмоциях, ценностях, мотивации и восприятии. Учитывает социальный и психологический аспект.'
                  } 
                />
              </label>
              <span className="font-mono text-lg text-text-main">{value}%</span>
            </div>
            {/* Убрал старые p, так как их текст перенесён в Tooltip */}
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