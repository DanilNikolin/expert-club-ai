// src/app/discussion/new/_components/ChatWindow.tsx
'use client';

import { LegacyRef } from 'react';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  author: 'You' | 'Concierge';
  text: string;
};

type Props = {
  messages: Message[];
  isLoading: boolean;
  chatEndRef: LegacyRef<HTMLDivElement> | undefined;
};

export default function ChatWindow({ messages, isLoading, chatEndRef }: Props) {
  return (
    <div className="flex-grow overflow-y-auto space-y-6 pr-4 py-4">
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Sparkles className="h-16 w-16 text-bg-surface" />
          <p className="mt-4 font-pixel text-xl text-text-secondary">ГОТОВ СЛУШАТЬ</p>
          <p className="mt-2 text-base text-text-secondary/80 max-w-md">
            Начните с общей идеи, а я задам уточняющие вопросы.
            <br />
            <span className="font-bold text-text-main">Когда решите, что данных достаточно — жмите зелёную кнопку наверху.</span>
          </p>
        </div>
      )}
      {messages.map((msg, index) => {
        const isUser = msg.author === 'You';
        return (
          <div key={index} className={cn('flex items-start gap-4', isUser && 'justify-end')}>
            {!isUser && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
                <Sparkles className="h-5 w-5 text-accent-secondary" />
              </div>
            )}
            <div className={cn(
              'max-w-xl rounded-lg px-4 py-3 font-sans text-base',
              isUser ? 'bg-accent-primary/20 text-text-main' : 'bg-bg-main text-text-secondary'
            )}>
              <p className={`font-pixel text-sm mb-1 ${isUser ? 'text-accent-primary' : 'text-accent-secondary'}`}>
                {msg.author}
              </p>
              <p className="text-text-main whitespace-pre-wrap">{msg.text}</p>
            </div>
            {isUser && (
               <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
                <User className="h-5 w-5 text-text-secondary" />
              </div>
            )}
          </div>
        )
      })}
      {isLoading && (
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
             <Sparkles className="h-5 w-5 text-accent-secondary animate-pulse" />
          </div>
          <div className="rounded-lg bg-bg-main px-4 py-3 font-sans text-sm text-text-secondary italic">
            Консьерж печатает...
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}