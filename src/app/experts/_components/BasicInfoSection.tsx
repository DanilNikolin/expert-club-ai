// src/app/experts/_components/BasicInfoSection.tsx
'use client';

import React from 'react';
import ConfigSectionCard from './ConfigSectionCard';
import { type ExpertFormData, type ValidationErrors, MODEL_DISPLAY_NAMES } from './expert-constructor.logic';
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
      title="Level 0: Identification"
      description="Expert name and base AI model."
      isCollapsible={true}
      startOpen={true} // Пусть этот блок будет открыт по умолчанию
    >
      <div className="space-y-6">
        {/* Поле для имени эксперта */}
        <div>
          <label htmlFor="name" className="flex items-center font-pixel text-base uppercase text-text-main mb-2">
            Expert Name *
            <Tooltip content="Max 100 characters. Choose a name that reflects essence, e.g. 'Skeptic-Financier' or 'Creative Storm'." />
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Skeptic-Financier"
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
            Base AI Model
            <Tooltip content="Base model choice affects 'intelligence', speed and cost of generation." />
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="select-primary"
          >
            <option value="gpt-4.1-mini">{MODEL_DISPLAY_NAMES['gpt-4.1-mini']}</option>
            <option value="gpt-5-mini">{MODEL_DISPLAY_NAMES['gpt-5-mini']}</option>
            <option value="deepseek-chat">{MODEL_DISPLAY_NAMES['deepseek-chat']}</option>
          </select>
        </div>
      </div>
    </ConfigSectionCard>
  );
}