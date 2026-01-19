// src/app/experts/_components/ChatConfiguratorSection.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Bot, SendHorizonal, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ConstructorChatMessage, type ExpertSuggestion } from '@/types'; // ИМПОРТИРУЕМ НОВЫЕ ТИПЫ
import SuggestedTeam from './SuggestedTeam'; // ИМПОРТИРУЕМ НАШ НОВЫЙ КОМПОНЕНТ

type Props = {
  chatMessages: ConstructorChatMessage[];
  isChatLoading: boolean;
  chatInput: string;
  setChatInput: (value: string) => void;
  handleChatSubmit: (e: React.FormEvent) => void;
  chatError: string;
  startCreationWizard: (suggestions: ExpertSuggestion[], selectedNames: string[]) => void;
  isCreateMode: boolean;
  expertName: string;
};

const ChatMessage = ({ msg }: { msg: ConstructorChatMessage }) => {
    const isUser = msg.role === 'user';
    return (
        <div className={cn('flex items-start gap-3', isUser && 'justify-end')}>
            {!isUser && <Bot className="h-5 w-5 flex-shrink-0 text-accent-primary mt-1" />}
            <div className={cn(
                'max-w-xs rounded-lg p-3 font-sans text-sm md:max-w-sm',
                isUser ? 'rounded-br-none bg-bg-main ring-1 ring-bg-surface' : 'rounded-bl-none bg-bg-surface'
            )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
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
  chatError,
  startCreationWizard,
  isCreateMode,
  expertName 
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit(e as unknown as React.FormEvent);
    }
  };
  
  const handleConfirmSuggestions = (selectedNames: string[]) => {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage && lastMessage.suggestions) {
          startCreationWizard(lastMessage.suggestions, selectedNames);
      }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-grow space-y-2 overflow-y-auto p-1 pr-3">
        {chatMessages.length === 0 && !isChatLoading && (
          <>
            {isCreateMode ? (
              <p className="flex h-full items-center justify-center text-center font-sans text-sm text-text-secondary">
                Начните диалог, чтобы создать или изменить эксперта...
              </p>
            ) : (
              // ВОТ ОН, НОВЫЙ БЛОК ДЛЯ РЕДАКТИРОВАНИЯ
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-text-secondary p-4 rounded-lg bg-bg-main/50 border border-dashed border-bg-surface">
                <Bot className="h-8 w-8 text-accent-primary mb-2" />
                <p className="font-pixel text-base text-text-main mb-1 truncate max-w-full px-4">
                  Редактор «{expertName || 'Твой Эксперт'}»
                </p>
                <p>Скажи мне, что поправить на <span className="text-accent-primary">естественном языке</span>.</p>
                <p className="text-xs text-text-muted mt-2">(Например: &ldquo;сделай его злее&rdquo; или &ldquo;добавь экспертизы в финансах&rdquo;)</p>
              </div>
            )}
          </>
        )}
        
        {chatMessages.map((msg, index) => (
            <div key={index}>
                {/* Показываем текстовую часть сообщения, только если она есть */}
                {msg.content && <ChatMessage msg={msg} />}
                {/* Показываем интерактивный блок ТОЛЬКО в режиме создания */}
                {msg.suggestions && msg.suggestions.length > 0 && isCreateMode && (
                    <SuggestedTeam 
                        suggestions={msg.suggestions} 
                        onConfirm={handleConfirmSuggestions}
                    />
                )}
            </div>
        ))}

        {isChatLoading && (
            <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 flex-shrink-0 text-accent-primary mt-1 animate-pulse" />
                <div className="rounded-lg rounded-bl-none bg-bg-surface p-3 font-sans text-sm text-text-secondary italic">
                    Ассистент думает...
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
        <div className="flex gap-2">
            <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Начните диалог..."
                disabled={isChatLoading}
                className={cn(
                    'w-full flex-grow rounded-md p-3 font-sans text-text-main placeholder:text-text-secondary/50',
                    'bg-black/20 ring-1 ring-inset ring-bg-surface transition-all duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-accent-primary',
                    'disabled:opacity-50',
                    'resize-none min-h-[44px]' // Увеличили высоту и паддинги
                )}
            />
            <Button
                type="button"
                onClick={handleChatSubmit}
                disabled={isChatLoading || !chatInput.trim()}
                size="sm"
                className="px-3"
            >
              <SendHorizonal size={16} />
            </Button>
          </div>
      </div>
    </div>
  );

}