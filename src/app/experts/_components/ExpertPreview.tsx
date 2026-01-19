// src/app/experts/_components/ExpertPreview.tsx
'use client';

import { type ExpertFormData, archetypeLabels, specializationLabels } from './expert-constructor.logic';

// Новая, согласованная палитра для превью
const archetypeColors: Record<string, string> = {
  analyst: '#6E85B7',      // accent-ink
  synthesizer: '#8B5E83',  // accent-maroon
  resonator: '#5A8B73',    // accent-success
};

const MindsetStackedBar = ({ mix }: { mix: ExpertFormData['archetypeMix'] }) => (
  <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-main ring-1 ring-inset ring-border-main">
    {Object.entries(mix).map(([type, value]) => (
      value > 0 && <div key={type} style={{ width: `${value}%`, backgroundColor: archetypeColors[type] }} />
    ))}
  </div>
);

const StatBar = ({ value, max = 10 }: { value: number, max?: number }) => (
  <div className="h-2 w-full rounded-full bg-bg-main ring-1 ring-inset ring-border-main">
    <div className="h-full rounded-full bg-accent-secondary transition-all duration-300" style={{ width: `${(value / max) * 100}%` }}></div>
  </div>
);

export default function ExpertPreview({ formData }: { formData: ExpertFormData }) {
  if (!formData.name.trim()) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border-main p-6 text-center h-full flex items-center justify-center min-h-[400px]">
        <p className="font-sans text-sm text-text-secondary">Start configuring expert to see preview...</p>
      </div>
    );
  }

  const topSpecializations = Object.entries(formData.specializations)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6 rounded-lg border border-border-main bg-bg-surface p-6 shadow-lg h-full">
      {/* --- ЗАГОЛОВОК --- */}
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-text-secondary">Expert Passport</p>
        <h3 className="title-pixel text-accent-primary">{formData.name}</h3>
      </div>

      {/* --- ТИП МЫШЛЕНИЯ --- */}
      <div className="space-y-2">
        <h4 className="font-pixel text-base uppercase text-text-main">Mindset Type</h4>
        <MindsetStackedBar mix={formData.archetypeMix} />
        <div className="flex justify-between pt-1 font-mono text-xs text-text-secondary flex-wrap gap-x-4">
          {Object.entries(formData.archetypeMix).filter(([, v]) => v > 0).map(([k, v]) => (
            <span key={k}>{archetypeLabels[k as keyof typeof archetypeLabels]}: {v}%</span>
          ))}
        </div>
      </div>

      {/* --- СПЕЦИАЛИЗАЦИЯ --- */}
      <div className="space-y-2">
        <h4 className="font-pixel text-base uppercase text-text-main">Top Specializations</h4>
        <div className='font-mono text-sm text-text-main space-y-1 pt-1'>
          {topSpecializations.length > 0 ? topSpecializations.map(([spec, value]) => (
            <p key={spec}><span className="text-text-secondary">-</span> {specializationLabels[spec as keyof typeof specializationLabels]}: <span className="text-accent-primary">{value}%</span></p>
          )) : <p className="text-text-secondary">- Not set</p>}
        </div>
      </div>

      {/* --- ХАРАКТЕР --- */}
      <div className="space-y-4">
        <h4 className="font-pixel text-base uppercase text-text-main">Character</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-sans text-sm text-text-secondary">
          <div><p>Constructiveness</p><StatBar value={formData.character.constructiveness} /></div>
          <div><p>Conformism</p><StatBar value={formData.character.conformism} /></div>
          <div><p>Conviction</p><StatBar value={formData.character.conviction} /></div>
          <div><p>Openness to Data</p><StatBar value={formData.character.opennessToData} /></div>
          <div className="col-span-2"><p>Creativity (t°)</p><StatBar value={formData.character.temperature} max={2.0} /></div>
        </div>
        <div className='flex flex-wrap gap-2 pt-2'>
          {formData.character.hasHumor && <span className='text-xs font-bold uppercase bg-accent-success/20 text-accent-success px-2 py-1 rounded'>HUMOR</span>}
          {formData.character.isContradictionHunter && <span className='text-xs font-bold uppercase bg-accent-secondary/20 text-accent-secondary px-2 py-1 rounded'>CONTRADICTION HUNTER</span>}
        </div>
      </div>

      {/* --- КАСТОМНЫЙ КОНТЕКСТ --- */}
      {formData.customContext && (
        <div className="space-y-2 border-t border-border-main pt-4">
          <h4 className="font-pixel text-base uppercase text-text-main">Custom Context</h4>
          <p className="font-sans text-sm italic text-text-secondary border-l-2 border-accent-secondary pl-3">
            &quot;{formData.customContext}&quot;
          </p>
        </div>
      )}
    </div>
  );
}