// src/app/discussion/new/_components/ChatInputForm.tsx
'use client';
import { Button } from '@/components/ui/Button';
import { SendHorizonal } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  currentMessage: string;
  setCurrentMessage: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
};

export default function ChatInputForm({ currentMessage, setCurrentMessage, handleSendMessage, isLoading }: Props) {
  return (
    <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-bg-surface flex-shrink-0">
      <div className="flex gap-2">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Start by describing your idea..."
          disabled={isLoading}
          className={cn(
            'w-full flex-grow rounded-md p-3 font-sans text-lg text-text-main placeholder:text-text-secondary/50',
            'bg-bg-main ring-1 ring-inset ring-bg-surface transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary',
            'disabled:opacity-50'
          )}
        />
        <Button
          type="submit"
          disabled={isLoading || !currentMessage.trim()}
          size="default"
          className="px-5" // Делаем кнопку чуть пошире для солидности
        >
          <SendHorizonal size={20} />
        </Button>
      </div>
    </form>
  );
}