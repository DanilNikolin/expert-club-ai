// src/app/experts/_components/CharacterSection.tsx
'use client';

import React from 'react';
import ConfigSectionCard from './ConfigSectionCard';
import type { ExpertCharacter } from './expert-constructor.logic';
import Tooltip from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

type Props = {
  character: ExpertCharacter;
  handleCharacterSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCharacterCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type TraitSliderProps = {
  name: string;
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
};

const TraitSlider: React.FC<TraitSliderProps> = ({
  name,
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
}) => (
  <div className="flex flex-col">
    <div className="flex justify-between items-baseline">
      <label htmlFor={name} className="flex items-center font-pixel uppercase text-text-main text-base">
        {label}
        <Tooltip
          content={
            name === 'constructiveness'
              ? 'Низкие значения: эксперт стремится критиковать и разрушать идеи. Высокие: помогает развивать и улучшать предложения.'
              : name === 'conformism'
              ? 'Низкие значения: нонконформизм, эксперт идёт против общепринятых норм. Высокие: следует правилам и мейнстримным мнениям.'
              : name === 'conviction'
              ? 'Определяет, насколько сильно эксперт будет отстаивать свою первоначальную позицию, даже если ему предоставляют новые аргументы.'
              : name === 'opennessToData'
              ? 'Насколько эксперт готов менять свою позицию или мнение на основе новых фактов и аргументов, представленных в дискуссии.'
              : name === 'temperature'
              ? 'Низкие значения (0–0.3): максимум логики и предсказуемости. Средние (0.5–0.7): баланс между здравым смыслом и вариативностью. Высокие (0.8–1.0): больше креативности и неожиданных идей, но растёт риск галлюцинаций. Больше 1.0: начинается белка — бот может нести ахинею и уходить в фантазии. При 2.0 — AI превращается в генератор сюрреализма, стабильность исчезает.'
              : ''

          }
        />
      </label>
      <span className="font-mono text-accent-primary text-lg">{value ?? min}</span>
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
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const PerkToggle: React.FC<PerkToggleProps> = ({ name, label, checked, onChange }) => (
  <label
    htmlFor={name}
    className="flex cursor-pointer items-center justify-between rounded-md bg-bg-main px-3 py-4 transition-colors hover:bg-bg-surface ring-1 ring-bg-surface"
  >
    <div className="flex-grow">
      <span className="flex items-center font-pixel uppercase text-text-main">
        {label}
        <Tooltip
          initialPosition={name === 'isContradictionHunter' ? 'top-left' : 'top'}
          content={
            name === 'hasHumor'
              ? 'Разрешает эксперту использовать сарказм, иронию и шутки в своих репликах. Может добавить остроты в дискуссию.'
              : 'Эксперт будет активно искать противоречия, логические дыры и несостыковки в аргументах других участников, включая пользователя.'
          }
        />
      </span>
    </div>
    <div className="relative flex-shrink-0">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <div className="h-6 w-11 rounded-sm bg-bg-main ring-1 ring-inset ring-gray-700 transition-colors peer-checked:bg-accent-success" />
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
      description="Настройте поведенческие черты и уникальные 'перки', которые влияют на стиль дискуссии эксперта."
      isCollapsible={true}
      startOpen={false}
    >
      <div className="space-y-8">
        <TraitSlider
          name="constructiveness"
          label="Конструктивность"
          value={character.constructiveness}
          onChange={handleCharacterSliderChange}
        />
        <TraitSlider
          name="conformism"
          label="Конформизм"
          value={character.conformism}
          onChange={handleCharacterSliderChange}
        />
        <TraitSlider
          name="conviction"
          label="Убежденность"
          value={character.conviction}
          onChange={handleCharacterSliderChange}
        />
        <TraitSlider
          name="opennessToData"
          label="Открытость к данным"
          value={character.opennessToData}
          onChange={handleCharacterSliderChange}
        />
      </div>

      <div className="mt-8 border-t border-bg-surface pt-8">
        <TraitSlider
          name="temperature"
          label="Креативность"
          value={character.temperature}
          onChange={handleCharacterSliderChange}
          min={0.1}
          max={2.0}
          step={0.1}
        />
      </div>

      <div className="mt-8 border-t border-bg-surface pt-8 space-y-4">
        <PerkToggle
          name="hasHumor"
          label="Юмор"
          checked={character.hasHumor}
          onChange={handleCharacterCheckboxChange}
        />
        <PerkToggle
          name="isContradictionHunter"
          label="Охотник за нестыковками"
          checked={character.isContradictionHunter}
          onChange={handleCharacterCheckboxChange}
        />
      </div>
    </ConfigSectionCard>
  );
}
