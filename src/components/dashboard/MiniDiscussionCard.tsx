type Props = { brief: string; active?: boolean; onClick?: () => void };

export default function MiniDiscussionCard({ brief, active, onClick }: Props) {
  let firstLine = brief.split('\n')[0].trim();
  if (firstLine.length > 42) {
    firstLine = firstLine.slice(0, 42) + '…';
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-lg font-pixel text-sm whitespace-nowrap transition
        ${active
          ? 'bg-accent-secondary text-bg-main ring-2 ring-accent-secondary scale-105'
          : 'bg-bg-surface/80 text-text-main hover:bg-accent-secondary/20'}
      `}
      title={firstLine}
    >
      {firstLine}
    </button>
  );
}
