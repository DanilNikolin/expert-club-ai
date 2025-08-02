// D:\expert-club-ai\expert-club-ai\src\components\discussion\ChatWindow.tsx
'use client';

import { type DebateMessage } from '@/types';
import { LegacyRef } from 'react';
import { Bot, BrainCircuit, User, Scale, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Expert } from '@/types';

// Компонент для отображения мыслей
const ThoughtBubble = ({ text, isCollapsed, onToggle }: { text: string; isCollapsed: boolean; onToggle: () => void; }) => {
    if (!text || !text.trim()) return null;
    return (
        <div className="relative max-w-xl animate-fade-in-fast">
            <div className={cn(
                "rounded-lg bg-bg-main/50 border border-dashed border-bg-surface overflow-hidden",
                !isCollapsed && "rounded-b-none border-b-0"
            )}>
                <button
                    onClick={onToggle}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-xs text-text-secondary/80 hover:bg-bg-surface/50 transition-colors"
                >
                    <div className="flex items-center gap-2 font-mono uppercase">
                        <BrainCircuit size={14} />
                        <span>Процесс мышления...</span>
                    </div>
                    <ChevronDown size={16} className={cn("transition-transform duration-300", isCollapsed && "-rotate-90")} />
                </button>
                <div className={cn(
                    'grid transition-all duration-300 ease-in-out',
                    isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                )}>
                    <div className="overflow-hidden">
                        <div className="px-4 pb-3 pt-1">
                            <pre className="whitespace-pre-wrap break-words font-sans text-sm italic text-text-secondary">
                                {text}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

type ChatWindowProps = {
  messages: DebateMessage[];
  chatEndRef?: LegacyRef<HTMLDivElement> | undefined;
  teamInRun: Expert[];
  currentThoughts: Record<string, string>;
  collapsedThoughts: Set<number>;
  onToggleThought: (index: number) => void;
  expertStates: Record<string, 'typing' | 'done' | 'idle'>;
};

const expertTextColors = [
    'text-accent-primary', 'text-accent-secondary', 'text-accent-success',
    'text-amber-400', 'text-rose-400', 'text-teal-400',
];

export default function ChatWindow({ messages, chatEndRef, teamInRun, currentThoughts, collapsedThoughts, onToggleThought, expertStates }: ChatWindowProps) {
  const expertColorMap = new Map<string, string>();
  teamInRun.forEach((member, index) => {
    expertColorMap.set(member.name, expertTextColors[index % expertTextColors.length]);
  });

  return (
    <>
      <div className="flex-grow overflow-y-auto space-y-10 pr-4">
        {messages.length > 0 ? messages.map((m, i) => {
          const isUser = m.role === 'user';
          const isJudge = m.name === 'Судья';

          if (isJudge) {
            return (
              <div key={i} className="my-8 rounded-lg border-2 border-amber-400 bg-bg-surface p-6 shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="h-8 w-8 text-amber-400" />
                  <h3 className="title-pixel text-amber-400 text-2xl">Вердикт Судьи</h3>
                </div>
        
                <div
                  className="prose prose-invert prose-base max-w-none font-sans text-text-main whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: (m.content as string).replace(/### (.*?)\n/g, "<h3 class='font-pixel text-lg text-amber-400 mt-6 mb-2'>$1</h3>") }}
                />
            
              </div>
            )
          }

          const thoughts = (!isUser && currentThoughts[m.name || '']) || '';
          const isThoughtCollapsed = collapsedThoughts.has(i);
          const hasThoughts = thoughts.trim() !== '';
          const expertStatus = expertStates[m.name || ''] || 'idle';

          return (
            <div key={i} className={cn('flex items-start gap-4', isUser && 'justify-end')}>
              {!isUser && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
                  <Bot className={`h-5 w-5 ${expertColorMap.get(m.name || '') || 'text-text-secondary'}`} />
                </div>
              )}

              <div className={cn("flex flex-col", isUser ? 'items-end' : 'items-start')}>
                <ThoughtBubble
                    text={thoughts}
                    isCollapsed={isThoughtCollapsed}
                    onToggle={() => onToggleThought(i)}
                />

                <div className={cn(
                  'max-w-xl rounded-lg px-4 py-3 font-sans text-base',
                  isUser ? 'bg-accent-primary/20' : 'bg-bg-main',
                  hasThoughts && !isThoughtCollapsed && (isUser ? '!rounded-tr-none' : '!rounded-tl-none')
                )}>
                  <p className={`font-pixel text-sm mb-2 ${isUser ? 'text-accent-primary' : expertColorMap.get(m.name || '')}`}>
                    {m.name || (isUser ? 'Ты' : 'Эксперт')}
                    {expertStatus === 'typing' && <span className="animate-pulse">...</span>}
                  </p>
                  <p className="text-text-main whitespace-pre-wrap text-base leading-relaxed">{m.content as string}</p>
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
                  <User className="h-5 w-5 text-text-secondary" />
                </div>
              )}
            </div>
          )
        }) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <BrainCircuit className="h-16 w-16 text-bg-surface" />
            <p className="mt-4 font-pixel text-xl text-text-secondary">КОМНАТА ДЕБАТОВ</p>
            <p className="mt-1 text-sm text-text-secondary/70">Выберите команду и нажмите &quot;Начать Новые Дебаты&quot;.</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <style jsx global>{`
        @keyframes fadeInFastAnimation {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
          animation: fadeInFastAnimation 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}