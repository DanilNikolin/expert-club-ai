'use client';

type Props = { name: string; active?: boolean; onClick?: () => void };

export default function MiniExpertCard({ name, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-lg font-pixel text-sm whitespace-nowrap transition
        ${active
          ? 'bg-accent-primary text-bg-main ring-2 ring-accent-primary scale-105'
          : 'bg-bg-surface/80 text-text-main hover:bg-accent-primary/20'}
      `}
      title={name}
    >
      {name}
    </button>
  );
}
