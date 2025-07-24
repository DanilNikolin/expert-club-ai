'use client';

import ConfigSectionCard from './ConfigSectionCard';
import {
  type SpecializationMix,
  type ValidationErrors,
  specializationLabels,
} from './expert-constructor.logic';
import { cn } from '@/lib/utils'; // Предполагаем, что у тебя есть или будет такой хелпер для классов
import React from 'react'; // Добавил импорт React

type Props = {
  specializations: SpecializationMix;
  customContext: string;
  validationErrors: ValidationErrors;
  handleSpecializationMixChange: (spec: keyof SpecializationMix, value: number) => void;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  resetSpecializationMix: () => void;
};

// --- Цвета для наших специализаций. Можешь потом вынести в отдельный файл ---
const specColors = {
  product: 'bg-cyan-500',
  finance: 'bg-green-500',
  marketing: 'bg-purple-500',
  strategy: 'bg-amber-500',
  ethics: 'bg-pink-500',
  legal: 'bg-red-500',
  general: 'bg-gray-500',
};

// --- Визуализатор распределения экспертизы ---
const ExpertiseStackedBar = ({ specializations }: { specializations: SpecializationMix }) => (
  <div className="flex h-3 w-full rounded-full bg-bg-main ring-1 ring-inset ring-bg-surface overflow-hidden">
    {Object.entries(specializations).map(([spec, value]) => {
      if (value === 0) return null;
      return (
        <div
          key={spec}
          className={`h-full transition-all duration-300 ${specColors[spec as keyof typeof specColors]}`}
          style={{ width: `${value}%` }}
        />
      );
    })}
  </div>
);


export default function SpecializationSection({
  specializations,
  customContext,
  validationErrors,
  handleSpecializationMixChange,
  handleChange,
  resetSpecializationMix,
}: Props) {

  const totalValue = Object.values(specializations).reduce((sum, v) => sum + v, 0);

  // Вынес кнопку сброса в отдельную переменную, чтобы передать её в actions пропс ConfigSectionCard
  const actions = (
    <button
      type="button"
      onClick={resetSpecializationMix}
      className="font-pixel text-xs uppercase text-text-secondary transition-colors hover:text-accent-primary"
    >
      Сброс
    </button>
  );

  return (
    <ConfigSectionCard
      title="Уровень 2: Контекст"
      description="Распределите 100% экспертизы и добавьте уникальные знания."
      actions={actions} // Передаем кнопку сброса сюда
      isCollapsible={true} // Делаем компонент сворачиваемым
      startOpen={false} // Можешь поставить false, если хочешь, чтобы по умолчанию был свернут
    >
      {/* Новый блок с визуализатором */}
      <div className='mb-8'>
        <div className='flex justify-between items-baseline mb-2'>
          <h3 className='font-pixel text-base text-text-main uppercase'>Распределение экспертизы</h3>
          <p className={`font-mono text-lg ${totalValue > 100 ? 'text-red-500' : 'text-accent-primary'}`}>
            {totalValue}% / 100%
          </p>
        </div>
        <ExpertiseStackedBar specializations={specializations} />
      </div>

      <div className="space-y-6">
        {Object.entries(specializations).map(([spec, value]) => (
          <div key={spec}>
            <div className="flex items-center justify-between text-sm">
              <label className="font-bold text-text-main">
                {specializationLabels[spec as keyof typeof specializationLabels]}
              </label>
              <span className="font-mono text-text-main">{value}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value ?? 0}
              onChange={(e) =>
                handleSpecializationMixChange(spec as keyof SpecializationMix, Number(e.target.value))
              }
              className="slider-primary mt-2 w-full"
            />
          </div>
        ))}
      </div>

      {/* Блок для кастомного контекста */}
      <div className="mt-8 border-t border-bg-surface pt-8">
        <label htmlFor="customContext" className="block font-pixel text-base text-text-main uppercase mb-2">
          Кастомный Контекст
        </label>
        <textarea
          id="customContext"
          name="customContext"
          value={customContext}
          onChange={handleChange}
          rows={4}
          placeholder="«Ты — арт-директор, переживший коммерческий провал, но получивший культовое признание»"
          className={cn(
            'w-full resize-none rounded-md p-3 font-sans text-text-main placeholder:text-text-secondary/50',
            'bg-bg-main ring-1 ring-inset ring-bg-surface transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary',
            validationErrors.customContext && 'ring-red-500 focus:ring-red-500'
          )}
        />
        <div className="mt-1 flex justify-between text-xs font-mono">
          <span className="text-text-secondary">Максимум 500 символов</span>
          <span className={customContext.length > 450 ? 'text-amber-500' : 'text-text-secondary'}>
            {customContext.length}/500
          </span>
        </div>
        {validationErrors.customContext && <p className="mt-1 text-sm text-red-500 font-sans">{validationErrors.customContext}</p>}
      </div>
    </ConfigSectionCard>
  );
}