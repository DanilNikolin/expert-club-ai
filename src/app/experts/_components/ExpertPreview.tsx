'use client';

import { type ExpertFormData, archetypeLabels, specializationLabels } from './expert-constructor.logic';

// --- Цвета для наших типов мышления ---
const archetypeColors = {
  analyst: '#22d3ee',
  synthesizer: '#e879f9',
  resonator: '#a3e635',
};

// --- Компоненты-визуализаторы, специфичные для этого превью ---
const MindsetStackedBar = ({ mix }) => (
  <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-main ring-1 ring-inset ring-bg-surface">
    {Object.entries(mix).map(([type, value]) => (
      <div key={type} style={{ width: `${value}%`, backgroundColor: archetypeColors[type] }} />
    ))}
  </div>
);

const StatBar = ({ value, max = 10 }) => (
    <div className="h-2 w-full rounded-full bg-bg-main ring-1 ring-inset ring-bg-surface">
        <div className="h-full rounded-full bg-accent-primary transition-all duration-300" style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
);

export default function ExpertPreview({ formData }: Props) {
  if (!formData.name.trim()) {
    return (
        <div className="rounded-lg border-2 border-dashed border-bg-surface p-6 text-center">
            <p className="font-sans text-sm text-text-secondary">Начните вводить данные, чтобы увидеть превью эксперта...</p>
        </div>
    );
  }

  const topSpecializations = Object.entries(formData.specializations)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6 rounded-lg border border-bg-surface bg-bg-surface/50 p-6 shadow-lg">
      {/* --- ЗАГОЛОВОК --- */}
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-text-secondary">Паспорт Эксперта</p>
        <h3 className="title-pixel text-accent-primary">{formData.name}</h3>
      </div>
      
      {/* --- УРОВЕНЬ 1: ТИП МЫШЛЕНИЯ --- */}
      <div className="space-y-2">
        <h4 className="font-pixel text-base uppercase text-text-main">Тип Мышления</h4>
        <MindsetStackedBar mix={formData.archetypeMix} />
        <div className="flex justify-between pt-1 font-mono text-xs text-text-secondary">
          {Object.entries(formData.archetypeMix).filter(([,v])=>v>0).map(([k,v])=>(
            <span key={k}>{archetypeLabels[k]}: {v}%</span>
          ))}
        </div>
      </div>

      {/* --- УРОВЕНЬ 2: СПЕЦИАЛИЗАЦИЯ --- */}
      <div className="space-y-2">
        <h4 className="font-pixel text-base uppercase text-text-main">Топ Специализации</h4>
        {/* ИСПРАВЛЕНО: увеличен шрифт и контраст */}
        <div className='font-mono text-sm text-text-main space-y-1 pt-1'>
            {topSpecializations.length > 0 ? topSpecializations.map(([spec, value]) => (
                <p key={spec}><span className="text-text-secondary">-</span> {specializationLabels[spec]}: <span className="text-accent-primary">{value}%</span></p>
            )) : <p className="text-text-secondary">- Не заданы</p>}
        </div>
      </div>

      {/* --- УРОВЕНЬ 3: ХАРАКТЕР --- */}
      <div className="space-y-4">
        <h4 className="font-pixel text-base uppercase text-text-main">Характер</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-sans text-sm text-text-secondary">
            <div>
                <p>Конструктивность</p>
                <StatBar value={formData.character.constructiveness} />
            </div>
            <div>
                <p>Нонконформизм</p>
                <StatBar value={formData.character.nonconformism} />
            </div>
            <div>
                <p>Убежденность</p>
                <StatBar value={formData.character.conviction} />
            </div>
             <div>
                <p>Открытость</p>
                <StatBar value={formData.character.openness} />
            </div>
        </div>
        <div className='flex flex-wrap gap-2 pt-2'>
            {/* ИСПРАВЛЕНО: перки стали заметнее */}
            {formData.character.hasHumor && <span className='text-xs font-bold uppercase bg-accent-success/20 text-accent-success px-2 py-1 rounded'>ЮМОР</span>}
            {formData.character.isContradictionHunter && <span className='text-xs font-bold uppercase bg-accent-secondary/20 text-accent-secondary px-2 py-1 rounded'>ОХОТНИК ЗА НЕСТЫКОВКАМИ</span>}
        </div>
      </div>

       {/* --- КАСТОМНЫЙ КОНТЕКСТ --- */}
       {formData.customContext && (
         <div className="space-y-2 border-t border-bg-surface pt-4">
            <h4 className="font-pixel text-base uppercase text-text-main">Кастомный Контекст</h4>
            <p className="font-sans text-sm italic text-text-secondary border-l-2 border-accent-primary pl-3">
                "{formData.customContext}"
            </p>
         </div>
       )}
    </div>
  );
}