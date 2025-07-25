'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc as firebaseDoc
} from 'firebase/firestore';
import { db } from '@/firebase.config.js';

import ExpertCard from '@/components/dashboard/ExpertCard';
import DiscussionCard from '@/components/dashboard/DiscussionCard';
import MiniExpertCard from '@/components/dashboard/MiniExpertCard';
import MiniDiscussionCard from '@/components/dashboard/MiniDiscussionCard';

/* ---------- TYPES ---------- */
type Expert = {
  id: string;
  name: string;
  archetypeMix: { analyst: number; synthesizer: number; resonator: number };
  specializations: {
    'Product & Technologies': number;
    'Finance & Resources': number;
    'Marketing & Audience': number;
    'Strategy & Market': number;
    'Ethics & Society': number;
    'Law & Risks': number;
    Generalist: number;
  };
  customContext: string;
};

type Discussion = {
  id: string;
  brief: string;
  createdAt: { seconds: number; nanoseconds: number };
  status: string;
};

/* ---------- PAGE ---------- */
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* ---------- STATE ---------- */
  const [experts, setExperts] = useState<Expert[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);
  const [mode, setMode] = useState<'experts' | 'discussions'>('experts');

  /* ---------- REFS для скролла ---------- */
  const cardsRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  /* ---------- HELPERS ---------- */
  const fetchData = async () => {
    if (!user) return;

    // --- Experts ---
    setIsLoadingExperts(true);
    const expertsSnap = await getDocs(
      query(
        collection(db, `users/${user.uid}/customExperts`),
        orderBy('createdAt', 'desc')
      )
    );
    setExperts(
      expertsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Expert, 'id'>) }))
    );
    setIsLoadingExperts(false);

    // --- Discussions ---
    setIsLoadingDiscussions(true);
    const discSnap = await getDocs(
      query(
        collection(db, 'discussions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
    );
    setDiscussions(
      discSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Discussion, 'id'>) }))
    );
    setIsLoadingDiscussions(false);
  };

 

  const scrollByStep = (
    ref: React.RefObject<HTMLDivElement>,
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

  /* ---------- SIDE EFFECTS ---------- */
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  /* ---------- ACTIONS ---------- */
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
    setDiscussions(prev => 
      prev.map(d => 
        d.id === discussionId ? { ...d, brief: newBrief } : d
      )
    );
  };

  /* ---------- RENDER ---------- */
  if (loading || !user)
    return <div className="text-center mt-20 text-text-secondary">Загрузка данных...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col min-h-[90vh]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-4xl font-pixel text-accent-primary uppercase tracking-wide">
            Ваш Дашборд
          </h1>
          <p className="mt-2 text-lg text-text-secondary font-sans">
            Управляйте вашими экспертами и дискуссиями
          </p>
        </div>

        <div className="flex space-x-6">
          <Link
            href="/experts/create"
            className="px-6 py-3 font-pixel text-base text-bg-main bg-accent-primary rounded-lg hover:bg-accent-primary/90 transition-colors shadow"
          >
            + Эксперт
          </Link>
          <Link
            href="/discussion/new"
            className="px-6 py-3 font-pixel text-base text-bg-main bg-accent-secondary rounded-lg hover:bg-accent-secondary/90 transition-colors shadow"
          >
            + Дискуссия
          </Link>
        </div>
      </div>

      {/* ---------- MAIN PANEL ---------- */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Заголовок */}
        <h2
          className={`text-2xl font-pixel ${
            mode === 'experts' ? 'text-accent-primary' : 'text-accent-secondary'
          } uppercase tracking-wider text-center mb-4`}
        >
          {mode === 'experts' ? 'Ваши Эксперты' : 'Ваши Дискуссии'}
        </h2>


        {/* ----- БЛОК КАРТОЧЕК + СТРЕЛКИ ----- */}
        <div className="relative bg-bg-surface/40 border-2 border-bg-surface rounded-xl p-4">
          {/* Стрелки */}
          {/* Левая стрелка */}
            <button
              type="button"
              onClick={() => scrollByStep(cardsRef, 'left')}
              className="absolute left-8 bottom-[20px] z-10 px-3 py-2 bg-bg-main/60 hover:bg-bg-main rounded-full font-pixel text-xl shadow-lg"
            >
              ←
            </button>
            {/* Правая стрелка */}
            <button
              type="button"
              onClick={() => scrollByStep(cardsRef, 'right')}
              className="absolute right-8 bottom-[20px] z-10 px-3 py-2 bg-bg-main/60 hover:bg-bg-main rounded-full font-pixel text-xl shadow-lg"
            >
              →
            </button>


          {/* КАРТОЧКИ */}
          <div
            ref={cardsRef}
            className="flex gap-8 overflow-x-auto scroll-smooth pb-4 scrollbar-thin scrollbar-thumb-accent-primary/60 min-h-[540px] max-h-[560px]"
          >
            {/* EXPERTS */}
            {mode === 'experts' ? (
              isLoadingExperts ? (
                <p className="text-text-secondary py-8 text-center w-full">Загрузка…</p>
              ) : experts.length === 0 ? (
                <div className="p-10 text-center bg-bg-surface/60 rounded-lg border-2 border-dashed border-bg-main min-w-[300px]">
                  <p className="text-text-secondary font-sans">Нет экспертов.</p>
                </div>
              ) : (
                experts.map(ex => (
                  <div 
                    id={`experts-card-${ex.id}`} 
                    key={ex.id}
                    // ↓↓↓ ВОТ ОНА, ВСЯ МАГИЯ ↓↓↓
                    className="transform transition-all duration-50 ease-in-out saturate-50 brightness-75 hover:saturate-100 hover:brightness-100 scale-95 hover:scale-100"
                  >
                    <ExpertCard
                      expert={ex}
                      onDelete={handleDeleteExpert}
                      cardWidthClass="min-w-[400px] max-w-[400px]"
                    />
                  </div>
                ))
              )
            ) : /* DISCUSSIONS */ isLoadingDiscussions ? (
              <p className="text-text-secondary py-8 text-center w-full">Загрузка…</p>
            ) : discussions.length === 0 ? (
              <div className="p-10 text-center bg-bg-surface/60 rounded-lg border-2 border-dashed border-bg-main min-w-[300px]">
                <p className="text-text-secondary font-sans">Нет дискуссий.</p>
              </div>
            ) : (
              discussions.map(di => (
                <div
                  id={`discussions-card-${di.id}`}
                  key={di.id}
                  className="min-w-[400px] max-w-[400px]"  // <<<<<<<<<<
                >
                  <DiscussionCard
                    discussion={di}
                    onDelete={handleDeleteDiscussion}
                    onBriefUpdated={handleBriefUpdate} // <--- ДОБАВЛЕНА ЭТА СТРОКА
                  />
                </div>
              ))

            )}
          </div>

          {/* --- КНОПКА-ПЕРЕКЛЮЧАТЕЛЬ --- */}
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

        {/* ---------- MINI-THUMBS ---------- */}
        <div
          ref={thumbsRef}
          onWheel={e => wheelToScrollX(e, thumbsRef)}
          className="flex gap-8 overflow-x-auto px-2 scrollbar-thin scrollbar-thumb-bg-main/30 py-2 scroll-smooth"
        >
          {mode === 'experts'
            ? discussions.map(d => (
                <MiniDiscussionCard
                  key={d.id}
                  brief={d.brief}
                  active={false}
                  onClick={() => {
                    setMode('discussions');
                    scrollToCard(d.id, 'discussions');
                  }}
                />
              ))
            : experts.map(e => (
                <MiniExpertCard
                  key={e.id}
                  name={e.name}
                  active={false}
                  onClick={() => {
                    setMode('experts');
                    scrollToCard(e.id, 'experts');
                  }}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
