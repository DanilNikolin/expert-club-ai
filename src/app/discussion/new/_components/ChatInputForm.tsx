// src/app/discussion/new/_components/ChatInputForm.tsx
'use client';

type Props = {
  currentMessage: string;
  setCurrentMessage: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
};

export default function ChatInputForm({ currentMessage, setCurrentMessage, handleSendMessage, isLoading }: Props) {
  return (
    <form onSubmit={handleSendMessage} className="mt-4">
      <div className="flex">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Начните с описания вашей идеи..."
          className="flex-grow p-4 text-lg text-gray-900 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !currentMessage.trim()}
          className="px-6 py-3 font-medium text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Отправить
        </button>
      </div>
    </form>
  );
}