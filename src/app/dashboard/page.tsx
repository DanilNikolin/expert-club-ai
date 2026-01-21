// D:\expert-club-ai\expert-club-ai\src\app\dashboard\page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, type ElementType } from 'react';
import Link from 'next/link';
import { type Discussion, type Expert, type Brief } from '@/types';
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
import BriefCard from '@/components/dashboard/BriefCard';
import { UserPlus, MessagesSquare, Users, MessageCircle, Plus, X, BookOpen } from 'lucide-react';

/** локальный helper (если есть общий — замени на import { cn } from '@/lib/utils') */
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

/* ---------- UI HELPERS ---------- */

const ActionPanel = () => (
  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
    <Link href="/experts/create">
      <Button variant="primary" size="default" className="w-full h-full py-5 text-base">
        <UserPlus className="mr-3 h-5 w-5" />
        Create Expert
      </Button>
    </Link>
    <Link href="/discussion/new">
      <Button variant="action" size="default" className="w-full h-full py-5 text-base">
        <MessagesSquare className="mr-3 h-5 w-5" />
        New Discussion
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
  icon: ElementType;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}) => (
  <div className="flex flex-col items-center justify-center text-center w-full min-h-[260px] p-8 bg-bg-surface/30 rounded-lg border-2 border-dashed border-bg-surface">
    <Icon className="h-14 w-14 text-text-secondary/50 mb-3" />
    <h3 className="font-pixel text-xl md:text-2xl text-text-main mb-2">{title}</h3>
    <p className="max-w-sm text-text-secondary mb-5 text-sm md:text-base">{description}</p>
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

  const [isFabOpen, setIsFabOpen] = useState(false);

  // --- Fetch Data ---
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
    // Загружаем данные (Эксперты и Дискуссии)
    try {
      const [expertsSnap, discSnap] = await Promise.all([
        getDocs(expertsQuery),
        getDocs(discussionsQuery),
      ]);

      setExperts(expertsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Expert, 'id'>) })));
      setDiscussions(discSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Discussion, 'id'>) })));
    } catch (error) {
      console.error("Failed to load core data:", error);
    } finally {
      setIsLoadingExperts(false);
      setIsLoadingDiscussions(false);
    }
  }, [user]);

  // --- Toggles ---
  const handleToggleExpert = useCallback((expertId: string) => {
    setExpandedExperts(prev =>
      prev.includes(expertId) ? prev.filter(id => id !== expertId) : [...prev, expertId]
    );
  }, []);

  const handleToggleDiscussion = useCallback((discussionId: string) => {
    setExpandedDiscussions(prev =>
      prev.includes(discussionId) ? prev.filter(id => id !== discussionId) : [...prev, discussionId]
    );
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedExperts([]);
    setExpandedDiscussions([]);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (user) fetchData();
  }, [user, loading, router, fetchData]);

  // --- Actions ---
  const handleDeleteExpert = async (id: string) => {
    if (!window.confirm('Delete expert?')) return;
    await deleteDoc(firebaseDoc(db, `users/${user?.uid}/customExperts`, id));
    setExperts(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteDiscussion = async (id: string) => {
    if (!window.confirm('Delete discussion?')) return;
    await deleteDoc(firebaseDoc(db, 'discussions', id));
    setDiscussions(prev => prev.filter(d => d.id !== id));
  };

  const handleBriefUpdate = (discussionId: string, newBrief: string) => {
    setDiscussions(prev => prev.map(d => (d.id === discussionId ? { ...d, brief: newBrief } : d)));
  };

  if (loading || !user) {
    return <div className="text-center mt-20 text-text-secondary">Loading data...</div>;
  }

  // Helper to get title text
  const getTitle = () => {
    switch (mode) {
      case 'experts': return 'Your Experts';
      case 'discussions': return 'Your Discussions';
      default: return 'Dashboard';
    }
  };

  // Компактная шапка на мобиле, больше места карточкам
  return (
    <>
      <div className="container mx-auto p-4 relative min-h-[100dvh] pb-32 md:pb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-pixel text-accent-primary uppercase tracking-wide leading-tight">
            Command Center
          </h1>
          <p className="mt-1 md:mt-2 text-text-secondary uppercase font-pixel text-sm md:text-base tracking-wider">
            {getTitle()}
          </p>
        </div>

        <ActionPanel />

        {/* --- TABS SWITCHER (Desktop) --- */}
        <div className="hidden md:flex gap-4 mt-6 border-b border-border-main pb-1">
          <button
            onClick={() => setMode('experts')}
            className={cn(
              "px-4 py-2 font-pixel text-sm uppercase transition-colors relative",
              mode === 'experts' ? "text-text-main" : "text-text-secondary hover:text-text-main"
            )}
          >
            Experts
            {mode === 'experts' && <div className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-accent-primary" />}
          </button>
          <button
            onClick={() => setMode('discussions')}
            className={cn(
              "px-4 py-2 font-pixel text-sm uppercase transition-colors relative",
              mode === 'discussions' ? "text-text-main" : "text-text-secondary hover:text-text-main"
            )}
          >
            Discussions
            {mode === 'discussions' && <div className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-accent-primary" />}
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4 mt-3 md:mt-4">
          <div className="flex justify-between items-center">
            {/* Свернуть все */}
            {(expandedExperts.length > 0 || expandedDiscussions.length > 0) && (
              <button
                onClick={handleCollapseAll}
                className="font-pixel text-[11px] md:text-xs uppercase text-text-secondary transition-colors hover:text-text-main animate-fade-in-fast ml-auto"
              >
                [ Collapse all ]
              </button>
            )}
          </div>

          {/* Скролл-зона — больше высоты под карточки */}
          <div
            className="flex-grow bg-bg-main/30 rounded-xl p-4 overflow-y-auto"
            style={{ maxHeight: 'calc(100dvh - 260px)' }}
          >
            <div className="flex flex-wrap gap-6 justify-center">



              {/* === EXPERTS MODE === */}
              {mode === 'experts' && (
                isLoadingExperts ? (
                  <p className="text-text-secondary text-center w-full">Loading experts...</p>
                ) : experts.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="You have no experts yet"
                    description="Create your first AI expert to form a team for future debates."
                    buttonText="+ Create first expert"
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
              )}

              {/* === DISCUSSIONS MODE === */}
              {mode === 'discussions' && (
                isLoadingDiscussions ? (
                  <p className="text-text-secondary text-center w-full">Loading discussions...</p>
                ) : discussions.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="No discussions yet"
                    description="Formulate a task, assemble a team of created experts, and start the first debate."
                    buttonText="+ Start first discussion"
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
        </div>
      </div>

      {/* ---- НИЖНЯЯ ПАНЕЛЬ (Mobile) ---- */}
      <div className="md:hidden fixed left-0 right-0 bottom-4 z-50 px-4">
        <div className="flex items-center justify-between">
          {/* Mobile Mode Switcher - Циклический */}
          <button
            type="button"
            onClick={() => {
              if (mode === 'experts') setMode('discussions');
              else setMode('experts');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-bg-surface rounded-xl border border-border-main shadow-lg font-pixel text-xs uppercase text-text-secondary hover:text-text-main transition"
          >
            <span className="text-xl leading-none">⇅</span>
            <span>
              {mode === 'experts' ? 'To Discussions' : 'To Experts'}
            </span>
          </button>

          {/* FAB */}
          <div className="relative">
            {isFabOpen && (
              <div className="absolute bottom-16 right-0 flex flex-col gap-2 animate-fade-in-fast">

                <div className="flex items-center gap-3">
                  <span className="w-40 text-right bg-bg-surface text-text-main px-3 py-2 rounded-lg font-pixel text-xs shadow-lg border border-border-main">
                    Create Expert
                  </span>
                  <Link href="/experts/create">
                    <button className="w-12 h-12 rounded-full p-0 shadow-lg border border-border-main bg-bg-surface text-text-main flex items-center justify-center">
                      <UserPlus className="h-5 w-5" />
                    </button>
                  </Link>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsFabOpen(!isFabOpen)}
              className={cn(
                'w-16 h-16 rounded-full shadow-xl border border-border-main flex items-center justify-center',
                isFabOpen
                  ? 'bg-accent-danger'
                  : 'bg-accent-primary'
              )}
              style={{
                transition: 'transform 0.25s ease, background-color 0.25s ease',
                transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0)',
              }}
              aria-label="Быстрые действия"
            >
              {isFabOpen ? (
                <X className="h-8 w-8 text-bg-main" />
              ) : (
                <Plus className="h-8 w-8 text-bg-main" />
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInFastAnimation {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
          animation: fadeInFastAnimation 0.18s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #444; 
            border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #666; 
        }
      `}</style>
    </>
  );
}
