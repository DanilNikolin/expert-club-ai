// src/components/dashboard/DiscussionCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Убрали импорт Button и Pencil, так как они больше не нужны
// import { Button } from '@/components/ui/Button';
// import { Pencil } from 'lucide-react';

// --- ТИПЫ (чтобы не ругался TypeScript) ---
type Discussion = {
  id: string;
  brief: string;
  createdAt: { seconds: number; nanoseconds: number };
  status: string;
};

type Props = {
  discussion: Discussion;
  onDelete: (id: string) => void;
  onBriefUpdated: (id: string, newBrief: string) => void;
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function DiscussionCard({ discussion, onDelete, onBriefUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBrief, setEditedBrief] =useState(discussion.brief);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setEditedBrief(discussion.brief);
  }, [discussion.brief]);

  const handleSaveBrief = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/discussion/${discussion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: editedBrief }),
      });
      onBriefUpdated(discussion.id, editedBrief);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update brief:", error);
      alert("Ошибка сохранения брифа!");
    }
  };

  const paragraphs = discussion.brief.split(/\\n{2,}/).map(p => p.trim()).filter(Boolean);

  return (
    <>
      <div
        className="flex flex-col h-full rounded-xl border border-bg-surface bg-bg-surface/80 p-6 shadow transition-shadow hover:shadow-2xl"
        onClick={() => !isEditing && setShowModal(true)}
      >
        <div className="flex-grow">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedBrief}
                onChange={(e) => setEditedBrief(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full p-2 h-40 bg-bg-main border border-bg-surface rounded-md text-text-main resize-y focus:ring-1 focus:ring-accent-primary"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveBrief} className="w-full px-3 py-1 text-xs font-pixel bg-accent-success text-bg-main rounded hover:opacity-90">Сохранить</button>
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditedBrief(discussion.brief); }} className="w-full px-3 py-1 text-xs font-pixel bg-bg-surface text-text-secondary rounded hover:opacity-90">Отмена</button>
              </div>
            </div>
          ) : (
            // ИЗМЕНЕНИЕ: Убрали кнопку-иконку и div-обертку
            <p className="font-sans text-base text-text-main hover:text-accent-primary transition-colors break-words cursor-pointer">
              {discussion.brief}
            </p>
          )}
        </div>

        {/* --- ФУТЕР КАРТОЧКИ --- */}
        <div className="flex justify-between items-end mt-6 pt-4 border-t border-bg-main">
          <p className="text-xs text-text-secondary font-mono">
            {new Date(discussion.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
          {/* ИЗМЕНЕНИЕ: Добавили новую кнопку "Редактировать" и обернули обе кнопки в div */}
          <div className="flex items-center gap-4">
            <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="font-pixel text-xs text-accent-primary hover:text-accent-primary/80 transition"
              >
                Редактировать
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(discussion.id); }}
              className="font-pixel text-xs text-accent-danger hover:text-accent-danger/80 transition"
            >
              Удалить
            </button>
          </div>
        </div>
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

      {showModal && (
        <ModalBlur onClose={() => setShowModal(false)} title="Полный бриф">
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

// --- Компонент модального окна (остается без изменений) ---
function ModalBlur({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 backdrop-blur-[6px] animate-fadein"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div
        className="fixed z-50 left-1/2 top-1/2 flex flex-col w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-accent-secondary bg-bg-main shadow-2xl p-8 animate-fadein"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '85vh', minWidth: '320px' }}
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
        <div className="flex-grow overflow-y-auto">{children}</div>
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