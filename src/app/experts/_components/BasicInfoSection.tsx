// D:\expert-club-ai\expert-club-ai\src\app\experts\_components\BasicInfoSection.tsx
'use client';

import React, { useState } from 'react';
import ConfigSectionCard from './ConfigSectionCard';
import { type ExpertFormData, type ValidationErrors } from './expert-constructor.logic';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip'; // Импортируем наш УЛУЧШЕННЫЙ компонент Tooltip

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
      startOpen={false}
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
              'w-full rounded-md p-3 font-sans text-text-main placeholder:text-text-secondary/50',
              'bg-bg-main ring-1 ring-inset ring-bg-surface transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary',
              validationErrors.name && 'ring-accent-danger focus:ring-accent-danger'
            )}
          />
          <div className="mt-1 flex justify-between text-xs font-mono">
            <span className='text-accent-danger'>{validationErrors.name ? validationErrors.name : ''}</span>
            <span className={formData.name.length > 90 ? 'text-amber-500' : 'text-text-secondary'}>
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
            {/* Вот, блядь, что ты просил! Все остальные модели закомментированы */}
            <optgroup label="OpenAI (Июль 2025)">
              {/* <option value="gpt-4o">GPT-4o</option> */}
              {/* <option value="gpt-4.1">GPT-4.1</option> */}
              <option value="gpt-4.1-mini">GPT-4.1-Mini</option>
               <option value="gpt-4.1-nano">GPT-4.1-Nano</option> 
            </optgroup>
            {/* <optgroup label="DeepSeek">
              <option value="deepseek-chat">Deepseek Chat</option>
            </optgroup>
            <optgroup label="Research Models">
              <option value="o3">o3 (Anthropic)</option>
            </optgroup> */}
          </select>
        </div>
      </div>
    </ConfigSectionCard>
  );
}