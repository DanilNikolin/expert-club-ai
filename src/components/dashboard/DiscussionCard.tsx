'use client';

import { useState } from 'react';
import Link from 'next/link';

type Discussion = {
  id: string;
  brief: string;
  createdAt: { seconds: number; nanoseconds: number };
  status: string;
};

type Props = {
  discussion: Discussion;
  onDelete: (id: string) => void;
};

export default function DiscussionCard({ discussion, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);

  // Красиво форматируем текст по абзацам (два \n)
  const paragraphs = discussion.brief
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <>
      <div
        className="relative flex flex-col h-full rounded-xl border border-bg-surface bg-bg-surface/80 p-6 shadow transition-shadow hover:shadow-2xl group cursor-pointer"
        onClick={() => setShowModal(true)}
        title="Кликни для полного брифа"
      >
        <div className="flex-grow">
          <p className="font-sans text-sm text-text-main group-hover:text-accent-primary transition-colors line-clamp-5 break-words">
            {discussion.brief}
          </p>
        </div>
        <div className="flex justify-between items-end mt-6 pt-4 border-t border-bg-main">
          <p className="text-xs text-text-secondary font-mono">
            {new Date(discussion.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(discussion.id);
            }}
            className="font-pixel text-xs text-accent-danger hover:text-accent-danger/80 transition"
          >
            Удалить
          </button>
        </div>
        {/* Кнопка в комнату — всегда снизу, компактнее */}
        <div className="flex justify-center mt-5">
          <Link
            href={`/discussion/${discussion.id}`}
            className="px-4 py-2 font-pixel text-base bg-accent-primary text-bg-main rounded-lg shadow-md hover:bg-accent-primary/90 transition tracking-wide"
            onClick={e => e.stopPropagation()}
          >
            В КОМНАТУ
          </Link>
        </div>
      </div>

      {/* Модалка с блюром и классическим overlay */}
      {showModal && (
        <ModalBlur
          onClose={() => setShowModal(false)}
          title="Полный бриф"
        >
          <div className="max-h-[60vh] overflow-y-auto font-sans text-text-main text-lg px-1 select-text leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-4 whitespace-pre-line">{p}</p>
            ))}
          </div>
        </ModalBlur>
      )}
    </>
  );
}

// --- Красивая модалка с блюром ---
function ModalBlur({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      {/* Чистый блюр-оверлей, никаких костылей */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 backdrop-blur-[6px] animate-fadein"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div
        className="fixed z-50 left-1/2 top-1/2 flex flex-col w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-accent-secondary bg-bg-main shadow-2xl p-8 animate-fadein"
        onClick={e => e.stopPropagation()}
        style={{
          maxHeight: '85vh',
          minWidth: '320px',
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <span className="font-pixel text-xl text-accent-secondary uppercase">{title}</span>
          <button
            onClick={onClose}
            className="ml-4 p-1 px-3 rounded font-pixel text-base text-accent-danger border-2 border-accent-danger hover:bg-accent-danger hover:text-bg-main transition"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="flex-grow">{children}</div>
      </div>
      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: scale(0.96);}
          to { opacity: 1; transform: scale(1);}
        }
        .animate-fadein {
          animation: fadein 0.22s cubic-bezier(.57,.13,.28,.99);
        }
      `}</style>
    </>
  );
}
