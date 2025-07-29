// src/app/experts/_components/CharacterSection.tsx
'use client';

import React from 'react';
import ConfigSectionCard from './ConfigSectionCard';
import type { Character } from './expert-constructor.logic';
import Tooltip from '@/components/ui/Tooltip';


type Props = {
  character: Character;
  handleCharacterSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCharacterCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type TraitSliderProps = {
  name: keyof Character;
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltipContent: string;
};

const TraitSlider: React.FC<TraitSliderProps> = ({
  name,
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  tooltipContent,
}) => (
  <div className="flex flex-col">
    <div className="flex justify-between items-baseline">
      <label htmlFor={name} className="flex items-center font-pixel uppercase text-text-main text-base">
        {label}
        <Tooltip content={tooltipContent} />
      </label>
      <span className="font-mono text-accent-secondary text-lg">{value}</span>
    </div>
    <input
      id={name}
      name={name}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value ?? min}
      onChange={onChange}
      className="slider-primary mt-2 w-full"
    />
  </div>
);

type PerkToggleProps = {
  name: keyof Character;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltipContent: string;
};

const PerkToggle: React.FC<PerkToggleProps> = ({ name, label, checked, onChange, tooltipContent }) => (
  <label
    htmlFor={name}
    className="flex cursor-pointer items-center justify-between rounded-md bg-bg-main p-4 transition-colors hover:bg-bg-surface ring-1 ring-border-main"
  >
    <span className="flex items-center font-pixel uppercase text-text-main">
      {label}
      <Tooltip initialPosition={name === 'isContradictionHunter' ? 'top-left' : 'top'} content={tooltipContent} />
    </span>
    <div className="relative flex-shrink-0">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <div className="h-6 w-11 rounded-sm bg-bg-surface ring-1 ring-inset ring-border-main transition-colors peer-checked:bg-accent-success" />
      <div className="dot absolute left-1 top-1 h-4 w-4 rounded-none bg-text-secondary transition-all duration-300 peer-checked:translate-x-full peer-checked:bg-bg-main" />
    </div>
  </label>
);


export default function CharacterSection({
  character,
  handleCharacterSliderChange,
  handleCharacterCheckboxChange,
}: Props) {
  return (
    <ConfigSectionCard
      title="Уровень 3: Характер"
      description="Настройте поведенческие черты и 'перки', которые влияют на стиль дискуссии эксперта."
      isCollapsible={true}
      startOpen={false}
    >
      <div className="space-y-8">
        <TraitSlider name="constructiveness" label="Конструктивность" value={character.constructiveness} onChange={handleCharacterSliderChange} tooltipContent="Низкие значения: эксперт стремится критиковать и разрушать идеи. Высокие: помогает развивать и улучшать предложения." />
        <TraitSlider name="conformism" label="Конформизм" value={character.conformism} onChange={handleCharacterSliderChange} tooltipContent="Низкие значения: нонконформизм, эксперт идёт против общепринятых норм. Высокие: следует правилам и мейнстримным мнениям." />
        <TraitSlider name="conviction" label="Убежденность" value={character.conviction} onChange={handleCharacterSliderChange} tooltipContent="Определяет, насколько сильно эксперт будет отстаивать свою первоначальную позицию, даже если ему предоставляют новые аргументы." />
        <TraitSlider name="opennessToData" label="Открытость к данным" value={character.opennessToData} onChange={handleCharacterSliderChange} tooltipContent="Насколько эксперт готов менять свою позицию или мнение на основе новых фактов и аргументов, представленных в дискуссии." />
      </div>

      <div className="mt-8 border-t border-border-main pt-8">
        <TraitSlider
          name="temperature"
          label="Креативность"
          value={character.temperature}
          onChange={handleCharacterSliderChange}
          min={0.1}
          max={2.0}
          step={0.1}
          tooltipContent="Низкие (0.1–0.4): максимум логики. Средние (0.5–0.8): баланс и здравый смысл. Высокие (0.9+): больше креативности, но растёт риск 'галлюцинаций'."
        />
      </div>

      <div className="mt-8 border-t border-border-main pt-8 space-y-4">
        <PerkToggle name="hasHumor" label="Юмор" checked={character.hasHumor} onChange={handleCharacterCheckboxChange} tooltipContent="Разрешает эксперту использовать сарказм, иронию и шутки в своих репликах." />
        <PerkToggle name="isContradictionHunter" label="Охотник за нестыковками" checked={character.isContradictionHunter} onChange={handleCharacterCheckboxChange} tooltipContent="Эксперт будет активно искать противоречия и логические дыры в аргументах других участников." />
      </div>
    </ConfigSectionCard>
  );
}