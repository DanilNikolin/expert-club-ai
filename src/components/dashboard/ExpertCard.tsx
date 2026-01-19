// src/components/dashboard/ExpertCard.tsx
'use client';

import Link from 'next/link';
import { type Expert } from '@/types';
import { archetypeLabels, specializationLabels } from '@/app/experts/_components/expert-constructor.logic';
import { cn } from '@/lib/utils';

// --- ЦВЕТА (согласно нашей новой палитре) ---
const archetypeColors: Record<string, string> = {
  analyst: '#6E85B7',      // accent-ink
  synthesizer: '#8B5E83',  // accent-maroon
  resonator: '#5A8B73',    // accent-success
};

// --- КОМПОНЕНТЫ-ХЕЛПЕРЫ ---
const MindsetStackedBar = ({ mix }: { mix: Expert['archetypeMix'] }) => (
  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-bg-main ring-1 ring-inset ring-border-main">
    {Object.entries(mix).map(([type, value]) =>
      value > 0 && <div key={type} style={{ width: `${value}%`, backgroundColor: archetypeColors[type] }} />
    )}
  </div>
);

const StatBar = ({ value, max = 10 }: { value: number; max?: number }) => (
  <div className="h-1.5 w-full rounded-full bg-bg-main ring-1 ring-inset ring-border-main">
    <div className="h-full rounded-full bg-accent-secondary" style={{ width: `${(value / max) * 100}%` }} />
  </div>
);

// --- ОСНОВНОЙ КОМПОНЕНТ ---
type ExpertCardProps = {
  expert: Expert;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
};

export default function ExpertCard({ expert, isExpanded, onToggle, onDelete }: ExpertCardProps) {
  const allSpecializations = Object.entries(expert.specializations)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);
  const character = expert.character || {};

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-bg-surface shadow-lg w-[340px] transition-all duration-300 ease-in-out',
        isExpanded ? 'border-border-active' : 'border-border-main hover:bg-bg-elevated'
      )}
    >
      {/* === СВЁРНУТАЯ ЧАСТЬ ("ВИЗИТКА") === */}
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className='h-[56px] flex items-center'>
          <h3 className="font-pixel text-xl text-accent-primary break-words line-clamp-2">
            {expert.name}
          </h3>
        </div>
        <div className="mt-2 space-y-2">
          <MindsetStackedBar mix={expert.archetypeMix} />
          <div className="font-mono text-xs text-text-secondary flex justify-between flex-wrap gap-x-4">
            {Object.entries(expert.archetypeMix).filter(([, v]) => v > 0).map(([k, v]) => (
              <span key={k}>{archetypeLabels[k as keyof typeof archetypeLabels]}: {v}%</span>
            ))}
          </div>
        </div>
      </div>

      {/* === РАСКРЫВАЮЩАЯСЯ ЧАСТЬ ("ДОСЬЕ") === */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[500px]' : 'max-h-0',
          'flex flex-col'
        )}
      >
        <div className="flex-grow overflow-y-auto px-5 pt-4 pb-4 space-y-4 border-t border-border-main">

          {/* Specializations */}
          <div>
            <h4 className="font-pixel text-sm uppercase text-text-secondary">Specializations</h4>
            <div className='font-mono text-sm text-text-main space-y-1 pt-1'>
              {allSpecializations.length > 0
                ? allSpecializations.map(([spec, value]) => (
                  <p key={spec} className="truncate">
                    - {specializationLabels[spec as keyof typeof specializationLabels]}: <span className="text-accent-primary">{value}%</span>
                  </p>
                ))
                : <p className="text-text-secondary">- Not set</p>
              }
            </div>
          </div>

          {/* Character */}
          {expert.character && (
            <div>
              <h4 className="font-pixel text-sm uppercase text-text-secondary">Character</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-sans text-xs text-text-secondary pt-1">
                <div><p>Constructiveness</p><StatBar value={character.constructiveness ?? 5} /></div>
                <div><p>Conformism</p><StatBar value={character.conformism ?? 5} /></div>
                <div><p>Conviction</p><StatBar value={character.conviction ?? 5} /></div>
                <div><p>Openness</p><StatBar value={character.opennessToData ?? 5} /></div>
              </div>
            </div>
          )}

          {/* Perks */}
          {(character.hasHumor || character.isContradictionHunter) && (
            <div className='flex flex-wrap gap-2'>
              {character.hasHumor && <span className='text-xs font-bold uppercase bg-accent-success/20 text-accent-success px-2 py-1 rounded'>HUMOR</span>}
              {character.isContradictionHunter && <span className='text-xs font-bold uppercase bg-accent-secondary/20 text-accent-secondary px-2 py-1 rounded'>CONTRADICTION HUNTER</span>}
            </div>
          )}

          {/* Custom Context */}
          {expert.customContext && (
            <div className="space-y-1">
              <h4 className="font-pixel text-sm uppercase text-text-secondary">Custom Context</h4>
              <p className="font-sans text-xs italic text-text-secondary border-l-2 border-accent-secondary pl-2 whitespace-pre-wrap break-words">
                &quot;{expert.customContext}&quot;
              </p>
            </div>
          )}
        </div>

        {/* 2. Это футер, он теперь прижат к низу */}
        <div className="flex-shrink-0 flex gap-3 justify-end border-t border-border-main px-5 py-3 bg-bg-main/50 rounded-b-xl">
          <Link href={`/experts/${expert.id}`}>
            <button className="px-3 py-1 rounded font-pixel text-xs bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-main transition">
              Edit
            </button>
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(expert.id); }}
            className="px-3 py-1 rounded font-pixel text-xs bg-accent-danger/20 text-accent-danger hover:bg-accent-danger/30 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}