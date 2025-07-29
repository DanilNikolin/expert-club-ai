// D:\expert-club-ai\expert-club-ai\src\app\dashboard\page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { type Discussion } from '@/types';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc as firebaseDoc,
} from 'firebase/firestore';
import { db } from '@/firebase.config.js';
import { Button } from '@/components/ui/Button';
import ExpertCard from '@/components/dashboard/ExpertCard';
import DiscussionCard from '@/components/dashboard/DiscussionCard';
import { UserPlus, MessagesSquare, Users, MessageCircle } from 'lucide-react';
import { type Expert } from '@/types';



/* ---------- UI HELPERS ---------- */

const ActionPanel = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
    <Link href="/experts/create">
      <Button variant="primary" size="default" className="w-full h-full py-6 text-lg">
        <UserPlus className="mr-3 h-6 w-6" />
        Создать Эксперта
      </Button>
    </Link>
    <Link href="/discussion/new">
      <Button
        variant="action"
        size="default"
        className="w-full h-full py-6 text-lg"
      >
        <MessagesSquare className="mr-3 h-6 w-6" />
        Новая Дискуссия
      </Button>
    </Link>
  </div>
);

const EmptyState = ({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonLink,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}) => (
  <div className="flex flex-col items-center justify-center text-center w-full min-h-[300px] p-10 bg-bg-surface/30 rounded-lg border-2 border-dashed border-bg-surface">
    <Icon className="h-16 w-16 text-text-secondary/50 mb-4" />
    <h3 className="font-pixel text-2xl text-text-main mb-2">{title}</h3>
    <p className="max-w-sm text-text-secondary mb-6">{description}</p>
    <Link href={buttonLink}>
      <Button variant="primary" size="default">{buttonText}</Button>
    </Link>
  </div>
);


/* ---------- PAGE ---------- */
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [experts, setExperts] = useState<Expert[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);
  const [mode, setMode] = useState<'experts' | 'discussions'>('experts');
  const [expandedExperts, setExpandedExperts] = useState<string[]>([]);
  const [expandedDiscussions, setExpandedDiscussions] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoadingExperts(true);
    setIsLoadingDiscussions(true);

    const expertsQuery = query(
      collection(db, `users/${user.uid}/customExperts`),
      orderBy('createdAt', 'desc')
    );
    const discussionsQuery = query(
      collection(db, 'discussions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const [expertsSnap, discSnap] = await Promise.all([
      getDocs(expertsQuery),
      getDocs(discussionsQuery),
    ]);

    setExperts(expertsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Expert, 'id'>) })));
    setIsLoadingExperts(false);

    setDiscussions(discSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Discussion, 'id'>) })));
    setIsLoadingDiscussions(false);
  }, [user]);

  const handleToggleExpert = useCallback((expertId: string) => {
    setExpandedExperts(prev =>
      prev.includes(expertId)
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    );
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedExperts([]);
  }, []);

  const handleToggleDiscussion = useCallback((discussionId: string) => {
    setExpandedDiscussions(prev =>
      prev.includes(discussionId)
        ? prev.filter(id => id !== discussionId)
        : [...prev, discussionId]
    );
  }, []);

  const handleCollapseAllDiscussions = useCallback(() => {
    setExpandedDiscussions([]);
}, []);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (user) fetchData();
  }, [user, loading, router, fetchData]);

  const handleDeleteExpert = async (id: string) => {
    if (!window.confirm('Удалить эксперта?')) return;
    await deleteDoc(firebaseDoc(db, `users/${user?.uid}/customExperts`, id));
    setExperts(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteDiscussion = async (id: string) => {
    if (!window.confirm('Удалить дискуссию?')) return;
    await deleteDoc(firebaseDoc(db, 'discussions', id));
    setDiscussions(prev => prev.filter(d => d.id !== id));
  };

  const handleBriefUpdate = (discussionId: string, newBrief: string) => {
    setDiscussions(prev => prev.map(d => d.id === discussionId ? { ...d, brief: newBrief } : d));
  };

  if (loading || !user) {
    return <div className="text-center mt-20 text-text-secondary">Загрузка данных...</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col min-h-[90vh]">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-pixel text-accent-primary uppercase tracking-wide">
          Командный Центр
        </h1>
      </div>

      <ActionPanel />

      <div className="flex-1 flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-pixel ${mode === 'experts' ? 'text-accent-primary' : 'text-accent-secondary'} uppercase tracking-wider`}>
            {mode === 'experts' ? 'Ваши Эксперты' : 'Ваши Дискуссии'}
          </h2>
          
          {/* Кнопка "Свернуть все" для Экспертов */}
          {mode === 'experts' && expandedExperts.length > 0 && (
            <button
              onClick={handleCollapseAll}
              className="font-pixel text-xs uppercase text-text-secondary transition-colors hover:text-text-main animate-fade-in-fast"
            >
              [ Свернуть все ]
            </button>
          )}

          {/* Кнопка "Свернуть все" для Дискуссий */}
          {mode === 'discussions' && expandedDiscussions.length > 0 && (
            <button
              onClick={handleCollapseAllDiscussions}
              className="font-pixel text-xs uppercase text-text-secondary transition-colors hover:text-text-main animate-fade-in-fast"
            >
              [ Свернуть все ]
            </button>
          )}
        </div>

        {/* АДАПТИВНЫЙ КОНТЕЙНЕР */}
        <div className="flex-grow bg-bg-main/30 rounded-xl p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
          {/* ИСПРАВЛЕНИЕ: Убрали ref={cardsRef} отсюда */}
          <div className="flex flex-wrap gap-6 justify-center">
            {mode === 'experts' ? (
              isLoadingExperts ? <p className="text-text-secondary text-center w-full">Загрузка экспертов…</p> :
                experts.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="У вас пока нет экспертов"
                    description="Создайте своего первого AI-эксперта, чтобы сформировать команду для будущих дебатов."
                    buttonText="+ Создать первого эксперта"
                    buttonLink="/experts/create"
                  />
                ) : (
                  (() => {
                    const sortedExperts = [...experts].sort((a, b) => {
                      const aIsExpanded = expandedExperts.includes(a.id);
                      const bIsExpanded = expandedExperts.includes(b.id);
                      if (aIsExpanded === bIsExpanded) return 0;
                      return aIsExpanded ? -1 : 1;
                    });

                    return sortedExperts.map(ex => (
                      <div key={ex.id} id={`experts-card-${ex.id}`}>
                        <ExpertCard
                          expert={ex}
                          isExpanded={expandedExperts.includes(ex.id)}
                          onToggle={() => handleToggleExpert(ex.id)}
                          onDelete={handleDeleteExpert}
                        />
                      </div>
                    ));
                  })()
                )
            ) : (
              isLoadingDiscussions ? <p className="text-text-secondary text-center w-full">Загрузка дискуссий…</p> :
                discussions.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="Пока нет ни одной дискуссии"
                    description="Сформулируйте задачу, соберите команду из созданных экспертов и запустите первые дебаты."
                    buttonText="+ Начать первую дискуссию"
                    buttonLink="/discussion/new"
                  />
                ) : (
                  discussions.map(di => (
                  <div key={di.id} id={`discussions-card-${di.id}`}>
                    <DiscussionCard
                      discussion={di}
                      onDelete={handleDeleteDiscussion}
                      onBriefUpdated={handleBriefUpdate}
                      isExpanded={expandedDiscussions.includes(di.id)}
                      onToggle={() => handleToggleDiscussion(di.id)}
                    />
                  </div>
                ))
                )
            )}
          </div>
        </div>

        {/* КНОПКА ПЕРЕКЛЮЧЕНИЯ ТЕПЕРЬ ВНЕ СКРОЛЛ-ЗОНЫ */}
        <div className="w-full flex justify-center flex-shrink-0">
          <button
            type="button"
            onClick={() => setMode(mode === 'experts' ? 'discussions' : 'experts')}
            className="flex items-center gap-2 px-8 py-3 bg-bg-surface rounded-xl border border-border-main shadow-lg font-pixel text-base uppercase text-text-secondary hover:text-text-main transition"
          >
            <span className="text-2xl">⇅</span>
            <span>{mode === 'experts' ? 'К Дискуссиям' : 'К Экспертам'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}