// D:\expert-club-ai\expert-club-ai\src\components\discussion\ChatWindow.tsx
'use client';

import { type DebateMessage } from '@/types';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import { Bot, BrainCircuit, User, Scale, ChevronDown, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            <span>Thinking process...</span>
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
  chatEndRef: LegacyRef<HTMLDivElement> | undefined;
  teamInRun: { id: string; name: string }[];
  currentThoughts: Record<number, string>;
  collapsedThoughts: Set<number>;
  onToggleThought: (index: number) => void;
};

const expertTextColors = [
  'text-accent-primary', 'text-accent-secondary', 'text-accent-success',
  'text-amber-400', 'text-rose-400', 'text-teal-400',
];

export default function ChatWindow({ messages, chatEndRef, teamInRun, currentThoughts, collapsedThoughts, onToggleThought }: ChatWindowProps) {
  const expertColorMap = new Map<string, string>();
  teamInRun.forEach((member, index) => {
    expertColorMap.set(member.name, expertTextColors[index % expertTextColors.length]);
  });

  // --- SMART AUTO-SCROLL LOGIC ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastMessageCount = useRef(messages.length);

  // Helper to check if we are at the bottom
  const checkIsAtBottom = () => {
    if (!scrollContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

    // Используем порог 50px только для отображения кнопки "Вниз"
    return Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatEndRef && 'current' in chatEndRef && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // 1. Handle Scroll Events - just for button visibility
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const atBottom = checkIsAtBottom();
    setShowScrollButton(!atBottom);
  };

  // 2. Effect: New messages added (length changed) -> Scroll once
  useEffect(() => {
    const isNewMessage = messages.length > lastMessageCount.current;
    if (isNewMessage) {
      scrollToBottom('smooth');
    }
    lastMessageCount.current = messages.length;
  }, [messages.length]);

  // REMOVED: Streaming auto-scroll effect. Manual control only.

  return (
    <>
      <div
        className="flex-grow overflow-y-auto space-y-10 pr-4 relative custom-scrollbar"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {messages.length > 0 ? messages.map((m, i) => {
          const isUser = m.role === 'user';
          const isJudge = m.name === 'Judge';

          if (isJudge) {
            return (
              <div key={i} className="my-8 rounded-lg border-2 border-amber-400 bg-bg-surface p-6 shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="h-8 w-8 text-amber-400" />
                  <h3 className="title-pixel text-amber-400 text-2xl">Judge&apos;s Verdict</h3>
                </div>

                <div
                  className="prose prose-invert prose-base max-w-none font-sans text-text-main whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: (m.content as string).replace(/### (.*?)\n/g, "<h3 class='font-pixel text-lg text-amber-400 mt-6 mb-2'>$1</h3>") }}
                />

              </div>
            )
          }

          const thoughts = (!isUser && currentThoughts[i]) || '';
          const isThoughtCollapsed = collapsedThoughts.has(i);
          const hasThoughts = thoughts.trim() !== '';

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
                    {m.name || (isUser ? 'You' : 'Expert')}
                    {m.isStreaming && <span className="animate-pulse">...</span>}
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
            <p className="mt-4 font-pixel text-xl text-text-secondary">DEBATE ROOM</p>
            <p className="mt-1 text-sm text-text-secondary/70">Select a team and click &quot;Start New Debate&quot;.</p>
          </div>
        )}
        <div ref={chatEndRef} />

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => {
              scrollToBottom('smooth');
            }}
            className="fixed bottom-32 right-10 md:right-[35%] z-50 p-2 rounded-full bg-accent-primary text-text-on-accent shadow-lg animate-fade-in-fast hover:bg-accent-primary/80 transition-colors"
          >
            <ArrowDown size={20} />
          </button>
        )}
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