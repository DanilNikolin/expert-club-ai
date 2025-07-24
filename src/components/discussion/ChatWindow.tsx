// src/components/discussion/ChatWindow.tsx
'use client';

import { type DebateMessage } from '@/types';
import { LegacyRef } from 'react';

type ChatWindowProps = {
  messages: DebateMessage[];
  chatEndRef: LegacyRef<HTMLDivElement> | undefined;
};

export default function ChatWindow({ messages, chatEndRef }: ChatWindowProps) {
  return (
    <div className="flex-grow overflow-y-auto space-y-4">
      {messages.length > 0 ? messages.map((m, i) => (
        <div
          key={i}
          className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}
        >
          <p className="text-sm font-bold text-gray-600">
            {m.name || (m.role === 'user' ? 'Ты' : 'Эксперт')}
            {m.isStreaming && <span className="animate-pulse">...</span>}
          </p>
          <p>{m.content as string}</p>
        </div>
      )) : (
        <p className="text-center text-gray-500">Выберите команду и нажмите «Начать Дебаты».</p>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}