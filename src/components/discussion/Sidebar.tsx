// D:\expert-club-ai\expert-club-ai\src\components\discussion\Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Expert } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, CircleDashed, Pencil, ChevronDown, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// --- PROPS ---
type SidebarProps = {
  discussionId: string;
  brief: string;
  onBriefUpdated: (newBrief: string) => void;
  debateGoal: string;
  setDebateGoal: (goal: string) => void;
  handleUpdateGoal: () => void;
  isSavingGoal: boolean;
  stage: 'setup' | 'debating' | 'paused' | 'judging' | 'finished';
  availableExperts: Expert[];
  selectedExperts: Expert[];
  setSelectedExperts: React.Dispatch<React.SetStateAction<Expert[]>>;
  rounds: number;
  setRounds: (rounds: number) => void;
  autoPause: boolean;
  setAutoPause: (pause: boolean) => void;
  onStartDebate: () => void;
};

// --- HELPER COMPONENTS ---

const SidebarSection = ({
  title,
  children,
  isOpen,
  onToggle,
  isComplete,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isComplete: boolean;
}) => (
  <div className="rounded-lg border border-bg-surface bg-bg-surface/50 overflow-hidden transition-all duration-300">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full justify-between items-center p-4 hover:bg-bg-elevated/50"
    >
      <div className="flex items-center gap-3">
        {isComplete ? (
          <CheckCircle size={20} className="text-accent-success flex-shrink-0" />
        ) : (
          <CircleDashed size={20} className={cn("flex-shrink-0", isOpen ? "text-accent-primary" : "text-text-secondary")} />
        )}
        <h3 className={cn("title-pixel", isOpen ? "text-accent-primary" : "text-text-main")}>{title}</h3>
      </div>
      <ChevronDown
        size={20}
        className={cn("text-text-secondary transition-transform duration-300", isOpen && "rotate-180")}
      />
    </button>
    <div
      className={cn(
        'grid transition-all duration-300 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <div className="px-4 pb-4 border-t border-bg-surface">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  </div>
);

const ExpertSelector = ({ availableExperts, selectedExperts, setSelectedExperts, disabled }: {
  availableExperts: Expert[];
  selectedExperts: Expert[];
  setSelectedExperts: React.Dispatch<React.SetStateAction<Expert[]>>;
  disabled: boolean;
}) => {
  const toggleExpert = (expert: Expert) => {
    if (disabled) return;
    setSelectedExperts((prev) =>
      prev.some(e => e.id === expert.id)
        ? prev.filter(e => e.id !== expert.id)
        : [...prev, expert]
    );
  };

  return (
    <div className="space-y-2">
      {!availableExperts.length ? (
        <div className="p-3 text-center bg-bg-main rounded-md">
          <p className="text-sm text-text-secondary">First <Link href="/experts/create" className="text-accent-primary hover:underline">create an expert</Link>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
          {availableExperts.map((ex) => {
            const isSelected = selectedExperts.some(e => e.id === ex.id);
            return (
              <div
                key={ex.id}
                onClick={() => toggleExpert(ex)}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-md border transition-colors',
                  disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-bg-elevated',
                  isSelected ? 'bg-accent-secondary/20 border-accent-secondary' : 'border-bg-surface'
                )}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-current">
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <span className="font-sans font-medium text-text-main truncate">{ex.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- MAIN SIDEBAR COMPONENT ---
export default function Sidebar({
  discussionId, brief, onBriefUpdated, debateGoal, setDebateGoal, handleUpdateGoal, isSavingGoal,
  stage, availableExperts, selectedExperts, setSelectedExperts, rounds, setRounds, autoPause, setAutoPause, onStartDebate,
}: SidebarProps) {
  const [openSections, setOpenSections] = useState({ mission: true, team: true, rules: false });
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [editedBrief, setEditedBrief] = useState(brief);
  const router = useRouter();

  useEffect(() => { setEditedBrief(brief); }, [brief]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveBrief = async () => {
    try {
      await fetch(`/api/discussion/${discussionId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: editedBrief }),
      });
      onBriefUpdated(editedBrief);
      setIsEditingBrief(false);
    } catch (error) {
      console.error("Failed to update brief:", error);
      alert("Error saving brief!");
    }
  };

  const isDebateInProgress = stage === 'debating' || stage === 'judging' || stage === 'paused';
  const isMissionComplete = brief.trim() !== '' && debateGoal.trim() !== '';
  const isTeamComplete = selectedExperts.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">

        <Link href="/dashboard" className="mb-6 flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-accent-primary">
          <ArrowLeft size={16} />
          <span>To Dashboard</span>
        </Link>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto pr-2">
        <SidebarSection title="Theme and Goal" isOpen={openSections.mission} onToggle={() => toggleSection('mission')} isComplete={isMissionComplete}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-text-secondary">Your Brief</label>
                {!isEditingBrief && (
                  <Button onClick={() => setIsEditingBrief(true)} variant="secondary" size="sm" className="px-2 py-1 h-auto" title="Edit brief">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isEditingBrief ? (
                <div className="space-y-2">
                  <textarea value={editedBrief} onChange={(e) => setEditedBrief(e.target.value)} className="w-full p-2 h-48 bg-bg-main border border-border-main rounded-md text-text-main resize-y focus:ring-1 focus:ring-accent-primary" />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveBrief} size="sm" variant="primary" className="w-full border-accent-success text-accent-success hover:bg-accent-success hover:text-text-on-accent">Save</Button>
                    <Button onClick={() => { setIsEditingBrief(false); setEditedBrief(brief); }} size="sm" variant="secondary" className="w-full">Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="font-sans text-base text-text-secondary max-h-48 overflow-y-auto whitespace-pre-wrap pr-2">{brief}</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border-main">
              <label htmlFor="debateGoal" className="block text-sm font-medium text-text-secondary">Debate Goal</label>
              <p className="text-xs text-text-muted mb-2">You can write any goal</p>
              <textarea id="debateGoal" value={debateGoal} onChange={(e) => setDebateGoal(e.target.value)} onBlur={handleUpdateGoal} placeholder="Describe main goal..."
                className="w-full p-2 bg-bg-main border border-border-main rounded-md text-text-main resize-none focus:ring-1 focus:ring-accent-primary"
                rows={2} disabled={isDebateInProgress} />
              {isSavingGoal && <p className="text-xs text-text-secondary animate-pulse mt-1">Saving...</p>}
            </div>
          </div>
        </SidebarSection>

        <SidebarSection title="Expert Team" isOpen={openSections.team} onToggle={() => toggleSection('team')} isComplete={isTeamComplete}>
          <ExpertSelector availableExperts={availableExperts} selectedExperts={selectedExperts} setSelectedExperts={setSelectedExperts} disabled={isDebateInProgress} />

          {isTeamComplete && !isDebateInProgress && (
            <div className="mt-4 border-t border-border-main pt-4">
              <h4 className="font-pixel text-sm uppercase text-text-secondary mb-2">Final team:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedExperts.map(expert => (
                  <div key={expert.id} className="flex items-center gap-2 rounded-full bg-accent-secondary/20 pl-3 pr-2 py-1 text-sm text-accent-secondary font-medium">
                    <span>{expert.name}</span>
                    <button onClick={() => setSelectedExperts(prev => prev.filter(e => e.id !== expert.id))} className="rounded-full hover:bg-white/20">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === 'setup' && (
            <div className="mt-4 border-t border-border-main pt-4">
              <span className="block text-center text-xs text-text-secondary/80 mb-2">or</span>
              <Button onClick={() => router.push(`/experts/create?brief=${encodeURIComponent(brief)}`)} variant="secondary" size="sm" className="w-full">
                Create team for this brief
              </Button>
            </div>
          )}
        </SidebarSection>

        <SidebarSection title="Debate Rules" isOpen={openSections.rules} onToggle={() => toggleSection('rules')} isComplete={true}>
          <div className="space-y-4">
            <div>
              <label htmlFor="rounds" className="block text-sm font-medium text-text-secondary mb-2">Number of rounds</label>
              <select id="rounds" value={rounds} onChange={e => setRounds(Number(e.target.value))} className="select-primary" disabled={isDebateInProgress}>
                <option value={1}>1 Round</option>
                <option value={2}>2 Rounds</option>
                <option value={3}>3 Rounds</option>
                <option value={6}>6 Rounds</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="autopause" checked={autoPause} onChange={e => setAutoPause(e.target.checked)} disabled={isDebateInProgress}
                className="h-4 w-4 rounded bg-bg-main border-bg-surface text-accent-primary focus:ring-accent-primary" />
              <label htmlFor="autopause" className="text-sm font-medium text-text-main">Autopause after round</label>
            </div>
          </div>
        </SidebarSection>
      </div>

      <div className="mt-6 pt-6 border-t border-bg-surface flex-shrink-0">
        <Button
          type="button"
          onClick={onStartDebate}
          disabled={!isTeamComplete || isDebateInProgress}
          className="w-full py-3 text-lg"
          variant="action"
        >
          {isDebateInProgress ? 'Debate in progress...' : 'Start Debate'}
        </Button>
      </div>
    </div>
  );
}