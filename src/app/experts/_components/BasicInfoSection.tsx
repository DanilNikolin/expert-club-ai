// src/app/experts/_components/BasicInfoSection.tsx
'use client';

import React from 'react';
import ConfigSectionCard from './ConfigSectionCard';
import { type ExpertFormData, type ValidationErrors } from './expert-constructor.logic';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';

type Props = {
  formData: ExpertFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  validationErrors: ValidationErrors;
};

export default function BasicInfoSection({ formData, handleChange, validationErrors }: Props) {
  return (
    <ConfigSectionCard
      title="Уровень 0: Идентификация"
      description="Имя эксперта и базовая модель AI, на которой он будет работать."
      isCollapsible={true}
      startOpen={true} // Пусть этот блок будет открыт по умолчанию
    >
      <div className="space-y-6">
        {/* Поле для имени эксперта */}
        <div>
          <label htmlFor="name" className="flex items-center font-pixel text-base uppercase text-text-main mb-2">
            Имя Эксперта *
            <Tooltip content="Максимум 100 символов. Выберите имя, отражающее суть эксперта, например: «Скептик-Финансист» или «Креативный Шторм»." />
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Например: Скептик-Финансист"
            className={cn(
              'w-full rounded-md p-3 font-sans text-text-main placeholder:text-text-muted',
              'bg-bg-main ring-1 ring-inset ring-border-main transition-all duration-150',
              'focus:outline-none focus:ring-1 focus:ring-border-active',
              validationErrors.name && 'ring-accent-danger focus:ring-accent-danger'
            )}
          />
          <div className="mt-1 flex justify-between text-xs font-mono">
            <span className='text-accent-danger'>{validationErrors.name ? validationErrors.name : ''}</span>
            <span className={formData.name.length > 90 ? 'text-accent-warning' : 'text-text-secondary'}>
              {formData.name.length}/100
            </span>
          </div>
        </div>

        {/* Селектор для выбора модели */}
        <div>
          <label htmlFor="model" className="flex items-center font-pixel text-base uppercase text-text-main mb-2">
            Базовая Модель AI
            <Tooltip content="Выбор базовой модели влияет на 'интеллект', скорость и стоимость генерации ответов эксперта." />
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="select-primary"
          >
            <optgroup label="Google (Июль 2025)">
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Баланс/Мощь)</option>
            </optgroup>
            <optgroup label="OpenAI (Стриминг)">
              <option value="gpt-4.1-mini">GPT-4.1 Mini (Стрим)</option>
            </optgroup>
            <optgroup label="Другие">
              <option value="deepseek-chat">DeepSeek Chat (Глубина)</option>
            </optgroup>
          </select>
        </div>
      </div>
    </ConfigSectionCard>
  );
}