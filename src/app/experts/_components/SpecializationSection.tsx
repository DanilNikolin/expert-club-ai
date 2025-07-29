// src/app/experts/_components/SpecializationSection.tsx
'use client';

import ConfigSectionCard from './ConfigSectionCard';
import { type SpecializationMix, type ValidationErrors, specializationLabels } from './expert-constructor.logic';
import { cn } from '@/lib/utils';
import React from 'react';
import Tooltip from '@/components/ui/Tooltip';

type Props = {
  specializations: SpecializationMix;
  customContext: string;
  validationErrors: ValidationErrors;
  handleSpecializationMixChange: (spec: keyof SpecializationMix, value: number) => void;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  resetSpecializationMix: () => void;
};

// ОБНОВЛЕНИЕ: Убрали радугу, используем акцентные цвета из палитры
const specColorClasses: (keyof SpecializationMix)[] = [
  'Product & Technologies', 'Marketing & Audience', 'Finance & Resources',
  'Strategy & Market', 'Law & Risks', 'Ethics & Society', 'Generalist'
];
const colorCycle = ['bg-accent-ink', 'bg-accent-maroon', 'bg-accent-success', 'bg-accent-warning', 'bg-accent-danger', 'bg-purple-400', 'bg-gray-500'];


const ExpertiseStackedBar = ({ specializations }: { specializations: SpecializationMix }) => (
  <div className="flex h-3 w-full rounded-full bg-bg-main ring-1 ring-inset ring-border-main overflow-hidden">
    {specColorClasses.map((spec, index) => {
      const value = specializations[spec];
      if (!value || value === 0) return null;
      return (
        <div
          key={spec}
          className={`h-full transition-all duration-300 ${colorCycle[index]}`}
          style={{ width: `${value}%` }}
        />
      );
    })}
  </div>
);


export default function SpecializationSection({
  specializations, customContext, validationErrors,
  handleSpecializationMixChange, handleChange, resetSpecializationMix,
}: Props) {
  const totalValue = Object.values(specializations).reduce((sum, v) => sum + v, 0);
  const actions = (
    <button
      type="button"
      onClick={resetSpecializationMix}
      className="font-pixel text-xs uppercase text-text-secondary transition-colors hover:text-text-main"
    >
      Сброс
    </button>
  );

  return (
    <ConfigSectionCard
      title="Уровень 2: Контекст"
      description="Распределите 100% его экспертизы, определяя, О ЧЕМ он будет думать."
      actions={actions}
      isCollapsible={true}
      startOpen={false}
    >
      <div className='mb-8'>
        <div className='flex justify-between items-baseline mb-2'>
          <h3 className='flex items-center font-pixel text-base text-text-main uppercase'>
            Распределение экспертизы
            <Tooltip content="Сумма всех специализаций должна быть строго равна 100%." />
          </h3>
          <p className={cn(
            'font-mono text-lg',
            totalValue === 100 ? 'text-accent-secondary' : 'text-accent-danger'
          )}>
            {totalValue}% / 100%
          </p>
        </div>
        <ExpertiseStackedBar specializations={specializations} />
        {totalValue !== 100 && <p className='text-xs text-accent-warning mt-2 text-right'>Сумма должна быть равна 100%</p>}
      </div>

      <div className="space-y-6">
        {Object.entries(specializations).map(([spec, value]) => (
          <div key={spec}>
            <div className="flex items-center justify-between text-sm">
              <label className="font-pixel uppercase text-text-main">
                {specializationLabels[spec as keyof typeof specializationLabels]}
              </label>
              <span className="font-mono text-text-main">{value}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value ?? 0}
              onChange={(e) => handleSpecializationMixChange(spec as keyof SpecializationMix, Number(e.target.value))}
              className="slider-primary mt-2 w-full"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border-main pt-8">
        <label htmlFor="customContext" className="flex items-center block font-pixel text-base text-text-main uppercase mb-2">
          Кастомный Контекст
          <Tooltip content="Добавьте уникальный опыт, 'шрамы' или специфические знания. Максимум 500 символов." />
        </label>
        <textarea
          id="customContext"
          name="customContext"
          value={customContext}
          onChange={handleChange}
          rows={4}
          placeholder="«Ты — арт-директор, переживший коммерческий провал...»"
          className={cn(
            'w-full resize-none rounded-md p-3 font-sans text-text-main placeholder:text-text-muted',
            'bg-bg-main ring-1 ring-inset ring-border-main transition-all duration-150',
            'focus:outline-none focus:ring-1 focus:ring-border-active',
            validationErrors.customContext && 'ring-accent-danger focus:ring-accent-danger'
          )}
        />
        <div className="mt-1 flex justify-between text-xs font-mono">
          <span className='text-accent-danger'>{validationErrors.customContext ? validationErrors.customContext : ''}</span>
          <span className={customContext.length > 450 ? 'text-accent-warning' : 'text-text-secondary'}>
            {customContext.length}/500
          </span>
        </div>
      </div>
    </ConfigSectionCard>
  );
}