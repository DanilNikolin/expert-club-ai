'use client';

import { useState } from 'react';
import { type Brief } from '@/types';
import { cn } from '@/lib/utils';
import { Copy, Check, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
    brief: Brief;
    onDelete: (id: string) => void;
    onStartDebate: (brief: Brief) => void;
    isExpanded: boolean;
    onToggle: () => void;
};

export default function BriefCard({ brief, onDelete, onStartDebate, isExpanded, onToggle }: Props) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(brief.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div
            className={cn(
                'flex flex-col rounded-xl border bg-bg-surface shadow-lg w-[340px] transition-all duration-300 ease-in-out group',
                isExpanded ? 'border-accent-primary' : 'border-border-main hover:border-accent-primary/50'
            )}
        >
            {/* === HEADER / PREVIEW === */}
            <div className="p-5 cursor-pointer" onClick={onToggle}>
                <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-2 py-1 rounded bg-bg-main text-[10px] font-pixel uppercase tracking-wider text-text-secondary border border-border-main">
                        {brief.goal}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(brief.id); }}
                        className="text-text-secondary hover:text-accent-danger transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete brief"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className={cn('min-h-[80px]', isExpanded && 'hidden')}>
                    <p className="font-sans text-base text-text-main break-words line-clamp-3 leading-relaxed">
                        {brief.content}
                    </p>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-bg-main">
                    <p className="text-xs text-text-secondary font-mono">
                        {brief.createdAt?.seconds
                            ? new Date(brief.createdAt.seconds * 1000).toLocaleDateString()
                            : 'Just now'}
                    </p>
                    <span className='font-pixel text-xs uppercase text-text-secondary group-hover:text-accent-primary transition-colors'>
                        {isExpanded ? '[ Collapse ]' : '[ Details ]'}
                    </span>
                </div>
            </div>

            {/* === EXPANDED CONTENT === */}
            <div
                className={cn(
                    'transition-all duration-500 ease-in-out overflow-hidden bg-bg-main/30',
                    isExpanded ? 'max-h-[600px] border-t border-border-main' : 'max-h-0'
                )}
            >
                <div className="p-5 space-y-4">

                    {/* Full Brief Text */}
                    <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-pixel text-[11px] uppercase text-text-secondary">Brief Content</h4>
                            <button onClick={handleCopy} className="flex items-center gap-1.5 font-pixel text-[10px] text-accent-primary hover:text-accent-primary/80 transition">
                                {isCopied ? <Check size={12} className="text-accent-success" /> : <Copy size={12} />}
                                {isCopied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <p className="font-sans text-[15px] text-text-secondary whitespace-pre-wrap leading-relaxed select-text">
                                {brief.content}
                            </p>
                        </div>
                    </div>

                    {/* Justification */}
                    {brief.goalJustification && (
                        <div className="p-3 bg-bg-elevated rounded-lg border border-border-main/50">
                            <h4 className="font-pixel text-[10px] uppercase text-text-secondary mb-1">Why this goal?</h4>
                            <p className="text-xs text-text-secondary italic">&quot;{brief.goalJustification}&quot;</p>
                        </div>
                    )}

                    {/* Actions */}
                    <Button
                        onClick={(e) => { e.stopPropagation(); onStartDebate(brief); }}
                        variant="action"
                        size="default"
                        className='w-full text-base py-4 shadow-lg'
                    >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Start Debate
                    </Button>
                </div>
            </div>
        </div>
    );
}
