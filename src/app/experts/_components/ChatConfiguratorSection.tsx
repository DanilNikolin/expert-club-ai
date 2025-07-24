'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Bot, SendHorizonal, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  chatMessages: Message[];
  isChatLoading: boolean;
  chatInput: string;
  setChatInput: (value: string) => void;
  handleChatSubmit: (e: React.FormEvent) => void;
  needsConfirmation: boolean;
  handleConfirmGeneration: () => void;
  handleCancelGeneration: () => void;
  chatError: string;
};

const ChatMessage = ({ msg }: { msg: Message }) => {
    const isUser = msg.role === 'user';
    return (
        <div className={cn('flex items-start gap-3', isUser && 'justify-end')}>
            {!isUser && <Bot className="h-5 w-5 flex-shrink-0 text-accent-primary mt-1" />}
            <div className={cn(
                'max-w-xs rounded-lg p-3 font-sans text-sm md:max-w-sm',
                isUser ? 'rounded-br-none bg-bg-main ring-1 ring-bg-surface' : 'rounded-bl-none bg-bg-surface'
            )}>
                {msg.content}
            </div>
            {isUser && <User className="h-5 w-5 flex-shrink-0 text-text-secondary mt-1" />}
        </div>
    );
};

export default function ChatConfiguratorSection({
  chatMessages,
  isChatLoading,
  chatInput,
  setChatInput,
  handleChatSubmit,
  needsConfirmation,
  handleConfirmGeneration,
  handleCancelGeneration,
  chatError,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // --- Функция-обертка для отправки по Enter ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Создаем фейковый FormEvent, так как у родителя он типизирован
      handleChatSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex h-[28rem] flex-col">
      <div className="flex-grow space-y-4 overflow-y-auto p-1 pr-3">
        {chatMessages.length === 0 && !isChatLoading && (
          <p className="flex h-full items-center justify-center text-center font-sans text-sm text-text-secondary">
            Начните диалог, чтобы создать эксперта...
          </p>
        )}
        {chatMessages.map((msg, index) => <ChatMessage key={index} msg={msg} />)}
        {isChatLoading && (
            <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 flex-shrink-0 text-accent-primary mt-1" />
                <div className="rounded-lg rounded-bl-none bg-bg-surface p-3 font-sans text-sm text-text-secondary italic">
                    Ассистент печатает...
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex-shrink-0 border-t border-bg-surface pt-4">
        {chatError && (
            <div className="mb-2 flex items-center gap-2 text-sm text-accent-danger">
                <AlertTriangle size={16} /> <span>{chatError}</span>
            </div>
        )}
        {needsConfirmation ? (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleConfirmGeneration} disabled={isChatLoading} isLoading={isChatLoading} size="sm">
              Создавай!
            </Button>
            <Button onClick={handleCancelGeneration} disabled={isChatLoading} variant="destructive" size="sm">
              Отмена
            </Button>
          </div>
        ) : (
          // ИЗМЕНЕНИЕ: Заменили <form> на <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Опиши эксперта..."
              disabled={isChatLoading}
              onKeyDown={handleKeyDown} // ИЗМЕНЕНИЕ: Вернули обработчик Enter
              className={cn(
                'w-full flex-grow rounded-md p-2 font-sans text-text-main placeholder:text-text-secondary/50',
                // ИЗМЕНЕНИЕ: Сделали фон темнее, как ты просил
                'bg-black/20 ring-1 ring-inset ring-bg-surface transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-accent-primary',
                'disabled:opacity-50'
              )}
            />
            <Button
              type="button" // ИЗМЕНЕНИЕ: Явно указываем тип, чтобы избежать сабмита формы
              onClick={handleChatSubmit} // ИЗМЕНЕНИЕ: Вернули onClick
              disabled={isChatLoading || !chatInput.trim()}
              size="sm"
              className="px-3"
            >
              <SendHorizonal size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}