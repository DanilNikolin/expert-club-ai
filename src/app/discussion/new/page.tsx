// src/app/discussion/new/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Импортируем наши новые компоненты
import ConciergeHeader from './_components/ConciergeHeader';
import ChatWindow from './_components/ChatWindow';
import ChatInputForm from './_components/ChatInputForm';

type Message = {
  author: 'You' | 'Concierge';
  text: string;
};

export default function NewDiscussionPage() {
  // Вся логика и стейты остаются здесь, в "умном" компоненте
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingBrief, setIsSubmittingBrief] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    const newUserMessage: Message = { author: 'You', text: currentMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const conciergeResponse: Message = { author: 'Concierge', text: data.questions };
      setMessages(prev => [...prev, conciergeResponse]);

    } catch (error) {
      console.error("Failed to fetch concierge questions:", error);
      const errorResponse: Message = { author: 'Concierge', text: "Извините, у меня возникла проблема. Попробуйте еще раз." };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrief = async () => {
    setIsSubmittingBrief(true);
    try {
      const response = await fetch('/api/summarizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userId: user?.uid }),
      });
      if (!response.ok) throw new Error('Failed to create brief');

      const data = await response.json();
      router.push(`/discussion/${data.discussionId}`);

    } catch (error) {
      console.error("Failed to create brief:", error);
      alert("Не удалось создать бриф. Попробуйте еще раз.");
    } finally {
      setIsSubmittingBrief(false);
    }
  };

  // Рендер теперь — это чистая сборка из компонентов
  return (
    <div className="container mx-auto mt-10 p-4 flex flex-col h-[85vh]">
      <ConciergeHeader
        onStartBrief={handleCreateBrief}
        isSubmitting={isSubmittingBrief}
        isChatEmpty={messages.length === 0}
        isLoading={isLoading}
      />
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        chatEndRef={chatEndRef}
      />
      <ChatInputForm
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}