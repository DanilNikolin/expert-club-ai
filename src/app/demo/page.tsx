'use client';

import React, { useState, useEffect } from 'react';
import { type DebateMessage, type Expert } from '@/types';
import ChatWindow from '@/components/discussion/ChatWindow';
import Header from '@/components/Header';

const demoExperts: Expert[] = [
  {
    id: 'demo-expert-1',
    name: 'Аналитик Андрей',
    model: 'gemini-pro',
    baseArchetype: 'Analyst',
    archetypeMix: { analyst: 80, synthesizer: 10, resonator: 10 },
    specializations: { 'Product & Technologies': 70, 'Strategy & Market': 30, 'Generalist': 0, 'Finance & Resources': 0, 'Marketing & Audience': 0, 'Ethics & Society': 0, 'Law & Risks': 0 },
    customContext: 'Опытный аналитик стартапов с критическим мышлением.',
    character: { constructiveness: 7, conformism: 3, conviction: 8, opennessToData: 6, hasHumor: false, isContradictionHunter: true, temperature: 0.7 },
    userId: 'demo-user-1',
    createdAt: { seconds: 0, nanoseconds: 0 },
    updatedAt: { seconds: 0, nanoseconds: 0 },
  },
  {
    id: 'demo-expert-2',
    name: 'Стратег Светлана',
    model: 'gpt-4',
    baseArchetype: 'Synthesizer',
    archetypeMix: { analyst: 10, synthesizer: 80, resonator: 10 },
    specializations: { 'Strategy & Market': 80, 'Finance & Resources': 20, 'Generalist': 0, 'Product & Technologies': 0, 'Marketing & Audience': 0, 'Ethics & Society': 0, 'Law & Risks': 0 },
    customContext: 'Визионер с опытом работы в крупных корпорациях.',
    character: { constructiveness: 9, conformism: 6, conviction: 7, opennessToData: 8, hasHumor: true, isContradictionHunter: false, temperature: 0.7 },
    userId: 'demo-user-1',
    createdAt: { seconds: 0, nanoseconds: 0 },
    updatedAt: { seconds: 0, nanoseconds: 0 },
  },
];

const demoDebateMessages: { type: 'expert_start' | 'thought_chunk' | 'chunk' | 'expert_end', content?: string, name?: string, fullMessage?: DebateMessage }[] = [
  { type: 'expert_start', name: 'Аналитик Андрей' },
  { type: 'thought_chunk', content: '[THOUGHTS]\nДумаю о преимуществах и недостатках идеи, ищу узкие места.\n[THOUGHT_END]'},
  { type: 'chunk', content: 'Приветствую, коллеги! Идея, безусловно, интригует. Однако, мне видится одно потенциальное узкое место – масштабируемость. Как мы планируем обрабатывать экспоненциальный рост пользователей без потери качества обслуживания? Андрей.'},
  { type: 'expert_end', fullMessage: { role: 'assistant', name: 'Аналитик Андрей', content: 'Приветствую, коллеги! Идея, безусловно, интригует. Однако, мне видится одно потенциальное узкое место – масштабируемость. Как мы планируем обрабатывать экспоненциальный рост пользователей без потери качества обслуживания? Андрей.' }},

  { type: 'expert_start', name: 'Стратег Светлана' },
  { type: 'thought_chunk', content: '[THOUGHTS]\nАнализирую стратегический потенциал, формулирую ответ с учетом масштабируемости.\n[THOUGHT_END]'},
  { type: 'chunk', content: 'Андрей, отличный вопрос! Наша стратегия предусматривает модульную архитектуру, позволяющую горизонтальное масштабирование. Фокус на MVP и быстрых итерациях позволит адаптироваться к росту. Более того, первоначальное позиционирование на нишевом рынке снизит пиковую нагрузку на старте. Светлана.'},
  { type: 'expert_end', fullMessage: { role: 'assistant', name: 'Стратег Светлана', content: 'Андрей, отличный вопрос! Наша стратегия предусматривает модульную архитектуру, позволяющую горизонтальное масштабирование. Фокус на MVP и быстрых итерациях позволит адаптироваться к росту. Более того, первоначальное позиционирование на нишевом рынке снизит пиковую нагрузку на старте. Светлана.' }},

  { type: 'expert_start', name: 'Аналитик Андрей' },
  { type: 'thought_chunk', content: '[THOUGHTS]\nПринимаю во внимание модульную архитектуру, но ищу конкретику по ресурсам.\n[THOUGHT_END]'},
  { type: 'chunk', content: 'Светлана, модульность – это здорово. Но давайте опустимся на землю. Какие конкретно ресурсы, инфраструктура, и бюджет заложены под это «горизонтальное масштабирование»? Есть ли уже готовые кейсы или технологии, которые можно применить? Андрей.'},
  { type: 'expert_end', fullMessage: { role: 'assistant', name: 'Аналитик Андрей', content: 'Светлана, модульность – это здорово. Но давайте опустимся на землю. Какие конкретно ресурсы, инфраструктура, и бюджет заложены под это «горизонтальное масштабирование»? Есть ли уже готовые кейсы или технологии, которые можно применить? Андрей.' }},
];

export default function DemoPage() {
  const [displayMessages, setDisplayMessages] = useState<DebateMessage[]>([]);
  const [currentThoughts, setCurrentThoughts] = useState<Record<string, string>>({});
  const [expertStates, setExpertStates] = useState<Record<string, 'typing' | 'done' | 'idle'>>({});

  useEffect(() => {
    let messageIndex = 0;
    let currentExpertName: string | null = null;
    let currentFullMessage: DebateMessage | null = null;
    const interval = setInterval(() => {
      if (messageIndex < demoDebateMessages.length) {
        const event = demoDebateMessages[messageIndex];
        switch (event.type) {
          case 'expert_start':
            currentExpertName = event.name!;
            if (currentExpertName) {
              setCurrentThoughts(prev => ({ ...prev, [currentExpertName]: '' }));
              setExpertStates(prev => ({ ...prev, [currentExpertName]: 'typing' }));
            }
            break;
          case 'thought_chunk':
            if (currentExpertName) {
              setCurrentThoughts(prev => ({ ...prev, [currentExpertName]: (prev[currentExpertName] || '') + event.content! }));
            }
            break;
          case 'chunk':
            if (currentExpertName) {
              // This is a simplified way to show the final message building up
              // In a real scenario, this would be streamed character by character
              // For demo, we just add the content to a temporary message
              currentFullMessage = {
                role: 'assistant',
                name: currentExpertName,
                content: (currentFullMessage?.content || '') + event.content!,
              };
            }
            break;
          case 'expert_end':
            if (currentFullMessage && currentExpertName) {
              setDisplayMessages(prev => [...prev, currentFullMessage!]);
              setCurrentThoughts(prev => ({ ...prev, [currentExpertName]: '' })); // Clear thoughts after response
              setExpertStates(prev => ({ ...prev, [currentExpertName]: 'done' }));
              currentFullMessage = null;
              currentExpertName = null;
            }
            break;
        }
        messageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1000); // Adjust speed of demo

    return () => clearInterval(interval);
  }, []);

  // To make ChatWindow reusable, we might need to pass expertStates and currentThoughts to it,
  // or adapt ChatWindow to read this state directly.
  // For this demo, let's assume ChatWindow can take `expertStates` and `thoughts` as props.

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex flex-col flex-1 p-4 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Демонстрация дебатов AI-экспертов</h1>
          <p className="mb-4 text-gray-600">Это симуляция дебатов между двумя AI-экспертами, Аналитиком Андреем и Стратегом Светланой, на основе фейковых данных.</p>
          <div className="flex-1 overflow-y-auto">
            <ChatWindow 
              messages={displayMessages}
              teamInRun={demoExperts}
              expertStates={expertStates}
              currentThoughts={currentThoughts}
              collapsedThoughts={new Set()}
              onToggleThought={() => {}}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 