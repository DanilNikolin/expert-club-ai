// src/app/experts/_components/SpecializationSection.tsx
'use client';

import ConfigSectionCard from './ConfigSectionCard';
import {
  type SpecializationMix,
  type ValidationErrors,
  specializationLabels,
} from './expert-constructor.logic';
import { cn } from '@/lib/utils';
import React from 'react';
import Tooltip from '@/components/ui/Tooltip'; // Импортируем твой Tooltip!

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
      description="Это призма знаний и опыта, через которую 'мыслит' эксперт. Распределите 100% его экспертизы по областям." // Обновленный description
      actions={actions}
      isCollapsible={true}
      startOpen={false}
    >
      {/* Новый блок с визуализатором */}
      <div className='mb-8'>
        <div className='flex justify-between items-baseline mb-2'>
          <h3 className='flex items-center font-pixel text-base text-text-main uppercase'> {/* Добавил flex items-center */}
            Распределение экспертизы
            <Tooltip content="Сумма всех специализаций должна быть строго равна 100%. Чем больше областей выбрано, тем шире, но менее глубока будет экспертиза." />
          </h3>
          <p className={cn(
            'font-mono text-lg',
            totalValue === 100 ? 'text-accent-primary' : 'text-accent-danger'
          )}>
            {totalValue}% / 100%
          </p>
        </div>
        <ExpertiseStackedBar specializations={specializations} />
        {totalValue !== 100 && <p className='text-xs text-amber-500 mt-2 text-right'>Сумма должна быть равна 100%</p>}
      </div>

      <div className="space-y-6">
        {Object.entries(specializations).map(([spec, value]) => (
          <div key={spec}>
            <div className="flex items-center justify-between text-sm"> {/* Добавил flex items-center */}
              <label className="flex items-center font-bold text-text-main">
                {specializationLabels[spec as keyof typeof specializationLabels]}
                <Tooltip 
                  content={
                    spec === 'Product & Technologies' ? 'Экспертиза в разработке продуктов, технологиях, инновациях и управлении проектами.' :
                    spec === 'Finance & Resources' ? 'Экспертиза в финансах, бюджетировании, инвестициях, оценке рисков и управлении ресурсами.' :
                    spec === 'Marketing & Audience' ? 'Экспертиза в маркетинге, брендинге, привлечении аудитории, продажах и коммуникациях.' :
                    spec === 'Strategy & Market' ? 'Экспертиза в стратегическом планировании, анализе рынка, конкуренции и поиске новых возможностей.' :
                    spec === 'Ethics & Society' ? 'Экспертиза в этических вопросах, социальной ответственности, влиянии на общество и культуру.' :
                    spec === 'Law & Risks' ? 'Экспертиза в юридических аспектах, законодательстве, нормативных актах и минимизации рисков.' :
                    'Широкий спектр общих знаний без глубокой специализации. Полезен для комплексных вопросов.'
                  }
                />
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
        <label htmlFor="customContext" className="flex items-center block font-pixel text-base text-text-main uppercase mb-2"> {/* Добавил flex items-center */}
          Кастомный Контекст
          <Tooltip content="Добавьте уникальный опыт, 'шрамы' или специфические знания, которых нет в стандартных специализациях. Максимум 500 символов." />
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
          <span className="text-text-secondary">Максимум 500 символов</span> {/* Этот текст оставляем, он про лимит */}
          <span className={customContext.length > 450 ? 'text-amber-500' : 'text-text-secondary'}>
            {customContext.length}/500
          </span>
        </div>
        {validationErrors.customContext && <p className="mt-1 text-sm text-red-500 font-sans">{validationErrors.customContext}</p>}
      </div>
    </ConfigSectionCard>
  );
}