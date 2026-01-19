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
    <>
      <div className="flex-grow overflow-y-auto space-y-6 pr-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="font-pixel text-2xl text-text-main uppercase">Dialogue with Concierge</h2>
            <p className="mt-2 text-base text-text-secondary/80 max-w-md">
              My goal is to help you turn your idea into a clear task for AI experts.
              Start a dialogue, and I will ask clarifying questions to reveal the essence.
            </p>
            <div className="mt-8 w-full max-w-lg rounded-r-lg border-l-4 border-accent-primary bg-bg-main/50 p-4 text-left">
              <h3 className="font-pixel text-base text-accent-primary">Important:</h3>
              <p className="mt-1 text-sm text-text-secondary">
                When you decide there is enough data — **click the green button above** to generate a brief and proceed to debates.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.author === 'You';
          return (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4 animate-fade-in-fast',
                isUser && 'justify-end'
              )}
            >
              {!isUser && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
                  <Sparkles className="h-5 w-5 text-accent-secondary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-xl rounded-lg px-4 py-3 font-sans',
                  isUser
                    ? 'bg-accent-primary/20'
                    : 'bg-bg-main'
                )}
              >
                <p
                  className={cn(
                    'font-pixel text-sm mb-1',
                    isUser ? 'text-accent-primary' : 'text-accent-secondary'
                  )}
                >
                  {msg.author}
                </p>
                <p className="text-text-main whitespace-pre-wrap text-lg leading-relaxed">{msg.text}</p>
              </div>
              {isUser && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
                  <User className="h-5 w-5 text-text-secondary" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-4 animate-fade-in-fast">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-main">
              <Sparkles className="h-5 w-5 text-accent-secondary animate-pulse" />
            </div>
            <div className="rounded-lg bg-bg-main px-4 py-3 font-sans text-sm text-text-secondary italic">
              Concierge is typing...
            </div>
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