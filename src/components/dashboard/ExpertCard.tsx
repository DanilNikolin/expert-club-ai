'use client';

import Link from 'next/link';
import { type Expert } from '@/types'; // ИСПРАВЛЕНИЕ: Импортируем полный тип

// --- Цвета для архетипов ---
const archetypeColors: Record<string, string> = {
  analyst: 'bg-accent-primary',
  synthesizer: 'bg-accent-secondary',
  resonator: 'bg-accent-success',
};

const archetypeLabels: Record<string, string> = {
  analyst: 'Аналитик',
  synthesizer: 'Синтезатор',
  resonator: 'Резонатор',
};

const specializationLabels: Record<string, string> = {
  'Product & Technologies': 'Продукт & Технологии',
  'Finance & Resources': 'Финансы & Ресурсы',
  'Marketing & Audience': 'Маркетинг & Аудитория',
  'Strategy & Market': 'Стратегия & Рынок',
  'Ethics & Society': 'Этика & Социум',
  'Law & Risks': 'Право & Риски',
  'Generalist': 'Широкий Профиль',
};

const MindsetStackedBar = ({ mix }: {mix: Expert['archetypeMix']}) => (
  <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-main ring-1 ring-inset ring-bg-surface">
    {Object.entries(mix).map(([type, value]) =>
      value > 0 && (
        <div
          key={type}
          className={`${archetypeColors[type]} h-full`}
          style={{ width: `${value}%` }}
        />
      )
    )}
  </div>
);

const StatBar = ({ value, max = 10 }: {value: number, max?: number}) => (
  <div className="h-2 w-full rounded-full bg-bg-main ring-1 ring-inset ring-bg-surface">
    <div
      className="h-full rounded-full bg-accent-primary transition-all duration-300"
      style={{ width: `${(value / max) * 100}%` }}
    ></div>
  </div>
);

type ExpertCardProps = {
  expert: Expert;
  onDelete: (id: string) => void;
};

export default function ExpertCard({ expert, onDelete }: ExpertCardProps) {
  const specializations = Object.entries(expert.specializations)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);

  const character = expert.character || {};

  return (
    <div
      className="flex flex-col rounded-xl border border-bg-surface bg-bg-surface/80 shadow-lg mx-auto
      min-w-[320px] max-w-[400px] h-[520px] md:h-[520px] relative"
    >
      <div className="flex flex-col flex-grow px-6 pt-6 pb-4 overflow-y-auto">
        <div>
          <p className="font-sans text-xs uppercase tracking-widest text-text-secondary">Паспорт эксперта</p>
          <h3 className="font-pixel text-2xl text-accent-primary mt-1 break-words">{expert.name}</h3>
        </div>

        <div className="space-y-2 mt-5">
          <h4 className="font-pixel text-base uppercase text-text-main">Тип мышления</h4>
          <MindsetStackedBar mix={expert.archetypeMix} />
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs text-text-secondary">
            {Object.entries(expert.archetypeMix)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => (
                <span key={k}>
                  {archetypeLabels[k]}: {v}%
                </span>
              ))}
          </div>
        </div>

        <div className="space-y-2 mt-5">
          <h4 className="font-pixel text-base uppercase text-text-main">Специализации</h4>
          <div className="font-mono text-sm text-text-main space-y-1 pt-1 max-h-[96px] overflow-y-auto pr-1">
            {specializations.length > 0
              ? specializations.map(([spec, value]) => (
                  <p key={spec} className="break-words">
                    <span className="text-text-secondary">-</span>{' '}
                    {specializationLabels[spec]}:{' '}
                    <span className="text-accent-primary">{value}%</span>
                  </p>
                ))
              : <p className="text-text-secondary">- Не заданы</p>
            }
          </div>
        </div>

        {expert.character && (
          <div className="space-y-4 mt-5">
            <h4 className="font-pixel text-base uppercase text-text-main">Характер</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-sans text-sm text-text-secondary">
              <div>
                <p>Конструктивность</p>
                <StatBar value={character.constructiveness ?? 5} />
              </div>
              <div>
                <p>Конформизм</p>
                <StatBar value={character.conformism ?? 5} />
              </div>
              <div>
                <p>Убежденность</p>
                <StatBar value={character.conviction ?? 5} />
              </div>
              <div>
                <p>Открытость к данным</p>
                <StatBar value={character.opennessToData ?? 5} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {character.hasHumor && (
                <span className="text-xs font-bold uppercase bg-accent-success/20 text-accent-success px-2 py-1 rounded">
                  ЮМОР
                </span>
              )}
              {character.isContradictionHunter && (
                <span className="text-xs font-bold uppercase bg-accent-secondary/20 text-accent-secondary px-2 py-1 rounded">
                  ОХОТНИК ЗА НЕСТЫКОВКАМИ
                </span>
              )}
            </div>
          </div>
        )}

        {expert.customContext && (
          <div className="space-y-2 border-t border-bg-surface pt-4 mt-6">
            <h4 className="font-pixel text-base uppercase text-text-main">Кастомный контекст</h4>
            <div className="max-h-[80px] overflow-y-auto pr-1">
              {/* ИСПРАВЛЕНИЕ ЗДЕСЬ */}
              <p className="font-sans text-sm italic text-text-secondary border-l-2 border-accent-primary pl-3 break-words">
                &quot;{expert.customContext}&quot;
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-between border-t border-bg-surface px-6 py-4 bg-bg-surface/95 rounded-b-xl">
        <Link
          href={`/experts/${expert.id}`}
          className="px-4 py-2 rounded font-pixel text-xs bg-accent-primary text-bg-main hover:bg-accent-primary/90 transition"
        >
          Редактировать
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(expert.id);
          }}
          className="px-4 py-2 rounded font-pixel text-xs bg-accent-danger text-bg-main hover:bg-accent-danger/80 transition"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}