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
      title="Level 3: Character"
      description="Configure behavioral traits and 'perks' that affect expert's debate style."
      isCollapsible={true}
      startOpen={false}
    >
      <div className="space-y-8">
        <TraitSlider name="constructiveness" label="Constructiveness" value={character.constructiveness} onChange={handleCharacterSliderChange} tooltipContent="Low: expert tends to criticize and destroy ideas. High: helps develop and improve proposals." />
        <TraitSlider name="conformism" label="Conformism" value={character.conformism} onChange={handleCharacterSliderChange} tooltipContent="Low: non-conformism, expert goes against accepted norms. High: follows rules and mainstream opinions." />
        <TraitSlider name="conviction" label="Conviction" value={character.conviction} onChange={handleCharacterSliderChange} tooltipContent="Determines how strongly the expert will defend their initial position, even if presented with new arguments." />
        <TraitSlider name="opennessToData" label="Openness to Data" value={character.opennessToData} onChange={handleCharacterSliderChange} tooltipContent="How ready the expert is to change their position or opinion based on new facts and arguments presented in the debate." />
      </div>

      <div className="mt-8 border-t border-border-main pt-8">
        <TraitSlider
          name="temperature"
          label="Creativity"
          value={character.temperature}
          onChange={handleCharacterSliderChange}
          min={0.1}
          max={2.0}
          step={0.1}
          tooltipContent="Low (0.1–0.4): maximum logic. Medium (0.5–0.8): balance and common sense. High (0.9+): more creativity, but increased risk of 'hallucinations'."
        />
      </div>

      <div className="mt-8 border-t border-border-main pt-8 space-y-4">
        <PerkToggle name="hasHumor" label="Humor" checked={character.hasHumor} onChange={handleCharacterCheckboxChange} tooltipContent="Allows expert to use sarcasm, irony and jokes in their replies." />
        <PerkToggle name="isContradictionHunter" label="Contradiction Hunter" checked={character.isContradictionHunter} onChange={handleCharacterCheckboxChange} tooltipContent="Expert will actively look for contradictions and logic holes in other participants' arguments." />
      </div>
    </ConfigSectionCard>
  );
}