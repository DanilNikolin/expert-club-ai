'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
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
import MiniExpertCard from '@/components/dashboard/MiniExpertCard';
import MiniDiscussionCard from '@/components/dashboard/MiniDiscussionCard';
import { UserPlus, MessagesSquare, Users, MessageCircle } from 'lucide-react';
// ИСПРАВЛЕНИЕ: Импортируем полный тип Expert, а не только Character
import { type Expert } from '@/types';

/* ---------- TYPES ---------- */
// ИСПРАВЛЕНИЕ: УДАЛИЛИ ОТСЮДА ЛОКАЛЬНЫЙ, НЕПОЛНЫЙ ТИП 'Expert'

type Discussion = {
  id: string;
  brief: string;
  createdAt: { seconds: number; nanoseconds: number };
  status: string;
};

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
        variant="primary"
        size="default"
        className="w-full h-full py-6 text-lg bg-accent-success hover:opacity-90 focus:ring-accent-success"
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

  const cardsRef = useRef<HTMLDivElement | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

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

  const scrollByStep = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: 'left' | 'right',
    amount = 400
  ) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const scrollToCard = (id: string, zone: 'experts' | 'discussions') => {
    setTimeout(() => {
      const el = document.getElementById(`${zone}-card-${id}`);
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 100);
  };

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

      <div className="flex-1 flex flex-col gap-2">
        <h2 className={`text-2xl font-pixel ${mode === 'experts' ? 'text-accent-primary' : 'text-accent-secondary'} uppercase tracking-wider text-center mb-4`}>
          {mode === 'experts' ? 'Ваши Эксперты' : 'Ваши Дискуссии'}
        </h2>

        <div className="relative bg-bg-surface/40 border-2 border-bg-surface rounded-xl p-4">
          <button type="button" onClick={() => scrollByStep(cardsRef, 'left')} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-10 p-2 bg-bg-main/60 hover:bg-bg-main rounded-full text-xl shadow-lg">
            ‹
          </button>
          <button type="button" onClick={() => scrollByStep(cardsRef, 'right')} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-10 p-2 bg-bg-main/60 hover:bg-bg-main rounded-full text-xl shadow-lg">
            ›
          </button>
          
          <div ref={cardsRef} className="flex gap-8 overflow-x-auto scroll-smooth pb-4 scrollbar-thin scrollbar-thumb-accent-primary/60 min-h-[540px] max-h-[560px] items-center">
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
                experts.map(ex => (
                  <div key={ex.id} id={`experts-card-${ex.id}`} className="transform transition-all duration-50 ease-in-out saturate-50 brightness-75 hover:saturate-100 hover:brightness-100 scale-95 hover:scale-100">
                    <ExpertCard expert={ex} onDelete={handleDeleteExpert} />
                  </div>
                ))
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
                  <div key={di.id} id={`discussions-card-${di.id}`} className="min-w-[400px] max-w-[400px] h-[520px]">
                    <DiscussionCard discussion={di} onDelete={handleDeleteDiscussion} onBriefUpdated={handleBriefUpdate} />
                  </div>
                ))
              )
            )}
          </div>
          
          <div className="w-full flex justify-center mt-4">
            <button
              type="button"
              onClick={() => setMode(mode === 'experts' ? 'discussions' : 'experts')}
              className="flex items-center gap-2 px-8 py-3 bg-bg-main rounded-xl border-2 border-bg-surface shadow-lg font-pixel text-base uppercase text-accent-primary hover:text-accent-secondary hover:border-accent-secondary transition"
            >
              <span className="text-2xl">⇅</span>
              <span>{mode === 'experts' ? 'К Дискуссиям' : 'К Экспертам'}</span>
            </button>
          </div>
        </div>
        
        <div ref={thumbsRef} className="flex gap-4 overflow-x-auto px-2 scrollbar-thin scrollbar-thumb-bg-main/30 py-2 scroll-smooth">
          {mode === 'experts'
            ? discussions.map(d => <MiniDiscussionCard key={d.id} brief={d.brief} onClick={() => { setMode('discussions'); scrollToCard(d.id, 'discussions'); }}/>)
            : experts.map(e => <MiniExpertCard key={e.id} name={e.name} onClick={() => { setMode('experts'); scrollToCard(e.id, 'experts'); }}/>)}
        </div>
      </div>
    </div>
  );
}