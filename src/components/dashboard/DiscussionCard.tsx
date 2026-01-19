// src/components/dashboard/DiscussionCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Discussion } from '@/types';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  discussion: Discussion;
  onDelete: (id: string) => void;
  onBriefUpdated: (id: string, newBrief: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
};

export default function DiscussionCard({ discussion, onDelete, onBriefUpdated, isExpanded, onToggle }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBrief, setEditedBrief] = useState(discussion.brief);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isExpanded) {
      setIsEditing(false);
    }
    setEditedBrief(discussion.brief);
  }, [discussion.brief, isExpanded]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(discussion.brief);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveBrief = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/discussion/${discussion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: editedBrief }),
      });
      onBriefUpdated(discussion.id, editedBrief);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update brief:", error);
      alert("Error saving brief!");
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-bg-surface shadow-lg w-[340px] transition-all duration-300 ease-in-out',
        isExpanded ? 'border-accent-secondary' : 'border-border-main hover:bg-bg-elevated'
      )}
    >
      {/* === СВЁРНУТАЯ ЧАСТЬ ("ОБЛОЖКА") === */}
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className={cn('min-h-[100px]', isExpanded && 'hidden')}>
          <p className="font-sans text-base text-text-main break-words line-clamp-4">
            {discussion.brief}
          </p>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-bg-main">
          <p className="text-xs text-text-secondary font-mono">
            {new Date(discussion.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
          <span className='font-pixel text-xs uppercase text-text-secondary'>
            {isExpanded ? '[ Collapse ]' : '[ Details ]'}
          </span>
        </div>
      </div>

      {/* === РАСКРЫВАЮЩАЯСЯ ЧАСТЬ ("ДОСЬЕ") === */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[500px]' : 'max-h-0'
        )}
      >
        <div className="px-5 pb-5 space-y-4 border-t border-border-main pt-4">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedBrief}
                onChange={(e) => setEditedBrief(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full p-3 h-48 bg-bg-main border border-border-main rounded-md text-text-main resize-y focus:ring-1 focus:ring-accent-secondary"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveBrief} size="sm" variant="primary" className="w-full border-accent-success text-accent-success hover:bg-accent-success hover:text-text-on-accent">Save</Button>
                <Button onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditedBrief(discussion.brief); }} size="sm" variant="secondary" className="w-full">Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-pixel text-base uppercase text-text-secondary">Full brief</h4>
                <button onClick={handleCopy} className="flex items-center gap-1.5 font-pixel text-xs text-accent-primary hover:text-accent-primary/80 transition">
                  {isCopied ? <Check size={14} className="text-accent-success" /> : <Copy size={14} />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto pr-2 bg-bg-main/50 p-4 rounded-lg border border-bg-surface">
                <p className="font-sans text-[15px] text-text-secondary whitespace-pre-wrap leading-relaxed">{discussion.brief}</p>
              </div>
            </div>
          )}
        </div>

        {/* Футер с кнопками */}
        <div className="flex flex-col gap-4 border-t border-border-main px-5 py-4 bg-bg-main/50 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <Button onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }} variant="secondary" size="sm" className="px-4">
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button onClick={(e) => { e.stopPropagation(); onDelete(discussion.id); }} variant="destructive" size="sm" className="px-4">
              Delete
            </Button>
          </div>
          <Link href={`/discussion/${discussion.id}`} className='w-full' onClick={e => e.stopPropagation()}>
            <Button variant="action" size="default" className='w-full text-base py-3'>
              Enter Room
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}