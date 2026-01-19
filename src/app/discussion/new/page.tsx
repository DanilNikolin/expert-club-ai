// src/app/discussion/new/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import ConciergeHeader from './_components/ConciergeHeader';
import ChatWindow from './_components/ChatWindow';
import ChatInputForm from './_components/ChatInputForm';

type Message = {
  author: 'You' | 'Concierge';
  text: string;
};

export default function NewDiscussionPage() {
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

  /* --- NEW IMPORTS NEEDED (Auto-added by agent later if possible, but manual here for safety) --- */
  // Предполагается, что 'db' и firestore функции импортированы.
  // Если нет - добавь их в начало файла, агент. 

  const handleCreateBrief = async () => {
    setIsSubmittingBrief(true);
    try {
      // 1. Генерируем Бриф через AI (API)
      const response = await fetch('/api/summarizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userId: user?.uid }),
      });
      if (!response.ok) throw new Error('Failed to generate brief');

      const { brief, goal, goalJustification } = await response.json();

      if (!user) throw new Error("User not authenticated");

      // Динамический импорт для чистоты (или используй верхний импорт)
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/firebase.config.js');

      // 2. Сохраняем в Библиотеку Смыслов (client-side auth!)
      const briefDocRef = await addDoc(collection(db, `users/${user.uid}/briefs`), {
        content: brief,
        goal: goal,
        goalJustification: goalJustification,
        createdAt: serverTimestamp(),
        userId: user.uid,
      });

      // 3. Создаем Активную Дискуссию
      const discussDocRef = await addDoc(collection(db, 'discussions'), {
        brief: brief,
        goal: goal,
        goalJustification: goalJustification,
        createdAt: serverTimestamp(),
        userId: user.uid,
        status: 'brief_created',
        sourceBriefId: briefDocRef.id
      });

      router.push(`/discussion/${discussDocRef.id}`);

    } catch (error) {
      console.error("Failed to create brief process:", error);
      alert("Не удалось создать бриф. Проверьте консоль.");
    } finally {
      setIsSubmittingBrief(false);
    }
  };

  return (
    <div className="w-full p-0 md:p-4 md:mt-10 h-[calc(100vh-64px)] flex items-start md:items-center justify-center">
      <div className="flex flex-col h-full md:h-[85vh] w-full max-w-4xl bg-bg-surface/50 md:border border-bg-surface rounded-none md:rounded-lg shadow-inner p-4 md:p-6">
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
    </div>
  );
}