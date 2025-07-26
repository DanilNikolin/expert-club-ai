// src/components/discussion/ChatWindow.tsx
'use client';

import { type DebateMessage } from '@/types';
import { LegacyRef } from 'react';
import { Bot, BrainCircuit, User, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChatWindowProps = {
  messages: DebateMessage[];
  chatEndRef: LegacyRef<HTMLDivElement> | undefined;
  teamInRun: { id: string; name: string }[];
};

const expertTextColors = [
  'text-accent-primary',
  'text-accent-secondary',
  'text-accent-success',
  'text-amber-400',
  'text-rose-400',
  'text-teal-400',
];

export default function ChatWindow({ messages, chatEndRef, teamInRun }: ChatWindowProps) {
  const expertColorMap = new Map<string, string>();
  teamInRun.forEach((member, index) => {
    expertColorMap.set(member.name, expertTextColors[index % expertTextColors.length]);
  });

  return (
    <div className="flex-grow overflow-y-auto space-y-6 pr-4">
      {messages.length > 0 ? messages.map((m, i) => {
        const isUser = m.role === 'user';
        const isJudge = m.name === 'Судья';
        
        if (isJudge) {
          return (
            <div key={i} className="my-8 rounded-lg border-2 border-amber-400/50 bg-amber-900/20 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Scale className="h-6 w-6 text-amber-400" />
                <h3 className="title-pixel text-amber-400 text-xl">Вердикт Судьи</h3>
              </div>
              {/* ИСПРАВЛЕНИЕ ЗДЕСЬ */}
              <div className="prose prose-invert prose-sm max-w-none font-sans text-text-main whitespace-pre-wrap"
                   dangerouslySetInnerHTML={{ __html: (m.content as string).replace(/### (.*?)\\\\n/g, "<h3 class='font-pixel text-lg text-amber-400 mt-4 mb-2'>$1</h3>") }}
              />
            </div>
          )
        }

        return (
          <div key={i} className={cn('flex items-start gap-4', isUser && 'justify-end')}>
            {!isUser && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
                <Bot className={`h-5 w-5 ${expertColorMap.get(m.name || '') || 'text-text-secondary'}`} />
              </div>
            )}

            <div className={cn(
              'max-w-xl rounded-lg px-4 py-3 font-sans text-base',
              isUser ? 'bg-accent-primary/20 text-text-main' : 'bg-bg-main text-text-secondary'
            )}>
              <p className={`font-pixel text-sm mb-1 ${isUser ? 'text-accent-primary' : expertColorMap.get(m.name || '')}`}>
                {m.name || (isUser ? 'Ты' : 'Эксперт')}
                {m.isStreaming && <span className="animate-pulse">...</span>}
              </p>
              <p className="text-text-main whitespace-pre-wrap">{m.content as string}</p>
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
  );
}