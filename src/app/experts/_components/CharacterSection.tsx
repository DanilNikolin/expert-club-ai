'use client';

import ConfigSectionCard from './ConfigSectionCard';
import type { ExpertCharacter } from './expert-constructor.logic';

type Props = {
  character: ExpertCharacter;
  handleCharacterSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCharacterCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TraitSlider = ({ name, label, value, onChange, min = 1, max = 10, step = 1 }) => (
  <div className="flex flex-col">
    <div className="flex justify-between items-baseline">
      <label htmlFor={name} className="font-pixel uppercase text-text-main text-base">
        {label}
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

const PerkToggle = ({ name, label, description, checked, onChange }) => (
   <label htmlFor={name} className="flex cursor-pointer items-center justify-between rounded-md bg-bg-main p-4 transition-colors hover:bg-bg-surface ring-1 ring-bg-surface">
     <div>
        <span className="font-pixel uppercase text-text-main">{label}</span>
        <p className="text-xs text-text-secondary font-sans">{description}</p>
     </div>
     <div className="relative">
        <input type="checkbox" id={name} name={name} checked={checked ?? false} onChange={onChange} className="peer sr-only" />
        <div className="h-6 w-11 rounded-sm bg-bg-surface ring-1 ring-inset ring-gray-700 transition-colors peer-checked:bg-accent-success"></div>
        <div className="dot absolute left-1 top-1 h-4 w-4 rounded-none bg-text-secondary transition-all duration-300 peer-checked:translate-x-full peer-checked:bg-bg-main"></div>
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
      description="Настройте поведенческие черты и уникальные перки вашего эксперта."
      isCollapsible={true}
      startOpen={false}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
        <TraitSlider name="constructiveness" label="Конструктивность" value={character.constructiveness} onChange={handleCharacterSliderChange} />
        {/* ИСПРАВЛЕНО: nonconformism -> conformism */}
        <TraitSlider name="conformism" label="Конформизм" value={character.conformism} onChange={handleCharacterSliderChange} />
        <TraitSlider name="conviction" label="Убежденность" value={character.conviction} onChange={handleCharacterSliderChange} />
        {/* ИСПРАВЛЕНО: openness -> opennessToData */}
        <TraitSlider name="opennessToData" label="Открытость к данным" value={character.opennessToData} onChange={handleCharacterSliderChange} />
      </div>

      <div className="mt-8 border-t border-bg-surface pt-8">
         <TraitSlider name="temperature" label="Креативность" value={character.temperature} onChange={handleCharacterSliderChange} min={0.1} max={2.0} step={0.1} />
      </div>

      <div className="mt-8 border-t border-bg-surface pt-8 space-y-4">
         <PerkToggle name="hasHumor" label="Юмор" description="Разрешить сарказм, иронию и шутки." checked={character.hasHumor} onChange={handleCharacterCheckboxChange} />
         <PerkToggle name="isContradictionHunter" label="Охотник за нестыковками" description="Активно ищет противоречия в словах других." checked={character.isContradictionHunter} onChange={handleCharacterCheckboxChange} />
      </div>
    </ConfigSectionCard>
  );
}