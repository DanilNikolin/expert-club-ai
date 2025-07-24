// src/app/discussion/new/_components/ChatWindow.tsx
'use client';

import { LegacyRef } from 'react';

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
    <div className="flex-grow overflow-y-auto p-6 bg-white rounded-lg shadow-inner space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-gray-400">Начните диалог, описав вашу идею ниже.</p>
      )}
      {messages.map((msg, index) => (
        <div key={index} className={`p-3 rounded-lg max-w-[80%] ${msg.author === 'You' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
          <p className="text-sm font-bold text-gray-600">{msg.author}</p>
          <p className="text-gray-900 whitespace-pre-wrap">{msg.text}</p>
        </div>
      ))}
      {isLoading && (
        <div className="p-3 rounded-lg bg-gray-100 max-w-[80%]">
          <p className="text-gray-500 italic">Консьерж печатает...</p>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}