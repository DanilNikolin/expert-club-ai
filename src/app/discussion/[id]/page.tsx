//D:\expert-club-ai\expert-club-ai\src\app\discussion\[id]\page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '@/firebase.config.js';
import { useAuth } from '@/context/AuthContext';
import { User } from 'firebase/auth';

import { type Expert, type Run, type DebateMessage } from '@/types';

import Sidebar from '@/components/discussion/Sidebar';
import RunSelector from '@/components/discussion/RunSelector';
import ChatWindow from '@/components/discussion/ChatWindow';
import DebateControls from '@/components/discussion/DebateControls';

type SseEventData = {
    type: 'expert_start' | 'chunk' | 'expert_end' | 'error' | 'thought_chunk';
    name?: string;
    content?: string;
    fullMessage?: DebateMessage;
    message?: string;
};

export default function DiscussionPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const discussionId = params.id as string;

    const [brief, setBrief] = useState('');
    const [debateGoal, setDebateGoal] = useState('КРИТИЧЕСКИЙ АНАЛИЗ');
    const [isSavingGoal, setIsSavingGoal] = useState(false);
    const [runs, setRuns] = useState<Run[]>([]);
    const [activeRun, setActiveRun] = useState<Run | null>(null);
    const [stage, setStage] = useState<'setup' | 'debating' | 'paused' | 'judging' | 'finished'>('setup');
    const [availableCustomExperts, setAvailableCustomExperts] = useState<Expert[]>([]);
    const [selectedExperts, setSelectedExperts] = useState<Expert[]>([]);
    const [rounds, setRounds] = useState(2);
    const [currentRound, setCurrentRound] = useState(0);
    const [messages, setMessages] = useState<DebateMessage[]>([]);
    const [liveRunId, setLiveRunId] = useState<string | null>(null);
    const [userIntervention, setUserIntervention] = useState('');
    const [autoPause, setAutoPause] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 🔥 НОВЫЙ СТЕЙТ ДЛЯ ХРАНЕНИЯ МЫСЛЕЙ В РЕАЛЬНОМ ВРЕМЕНИ
    const [currentThoughts, setCurrentThoughts] = useState<Record<number, string>>({});
    const [collapsedThoughts, setCollapsedThoughts] = useState<Set<number>>(new Set());

    const toggleThoughtVisibility = (messageIndex: number) => {
        setCollapsedThoughts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageIndex)) {
                newSet.delete(messageIndex);
            } else {
                newSet.add(messageIndex);
            }
            return newSet;
        });
    };
    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    const fetchData = useCallback(async (currentUser: User) => {
        if (!discussionId) return;
        setIsLoading(true);
        const discussionDocRef = doc(db, 'discussions', discussionId);
        const discussionSnap = await getDoc(discussionDocRef);

        if (!discussionSnap.exists()) {
            router.push('/discussion/new');
            return;
        }
        const discussionData = discussionSnap.data();
        setBrief(discussionData.brief);
        setDebateGoal(discussionData.goal || 'КРИТИЧЕСКИЙ АНАЛИЗ');

        const exSnap = await getDocs(query(collection(db, `users/${currentUser.uid}/customExperts`), orderBy('createdAt', 'desc')));
        setAvailableCustomExperts(exSnap.docs.map(x => ({ id: x.id, ...x.data() } as Expert)));

        const runsSnap = await getDocs(query(collection(db, 'discussions', discussionId, 'runs'), orderBy('createdAt', 'desc')));
        const fetchedRuns = runsSnap.docs.map(x => ({ id: x.id, ...x.data() } as Run));

        // 1. Мы ВСЕГДА устанавливаем список "прогонов" для Архива
        setRuns(fetchedRuns);

        // 2. И мы ВСЕГДА принудительно сбрасываем состояние в 'setup' при загрузке страницы.
        // Пользователь сам решит, начать новый "ран" или выбрать старый из списка.
        setActiveRun(null);
        setLiveRunId(null);

        setIsLoading(false);
    }, [discussionId, router]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchData(user);
        }
    }, [user, authLoading, router, fetchData]);

    useEffect(() => {
        if (!activeRun) {
            // Если смотреть не на что - чистим всё
            setMessages([]);
            setStage('setup');
            return;
        }

        // 1. Всегда показываем "Replay" того, что выбрали
        const transcriptWithReport = [...activeRun.transcript];
        if (activeRun.report) {
            transcriptWithReport.push({ role: 'assistant', name: 'Judge', content: activeRun.report });
        }



        setMessages(transcriptWithReport);

        // 2. Решаем, какой сейчас "режим"
        if (activeRun.report) {
            setStage('finished');
        } else if (activeRun.id === liveRunId) {
            setStage('paused');
        } else {
            setStage('finished');
        }

    }, [activeRun, liveRunId]);

    const handleUpdateGoal = async () => {
        if (!debateGoal) return;
        setIsSavingGoal(true);
        try {
            await updateDoc(doc(db, 'discussions', discussionId), { goal: debateGoal });
        } catch (error) {
            console.error("Failed to update goal:", error);
            alert("Error saving goal");
        } finally {
            setIsSavingGoal(false);
        }
    };

    const handleBriefUpdate = (newBrief: string) => {
        setBrief(newBrief);
    };

    const handleDeleteRun = async (runIdToDelete: string) => {
        if (!window.confirm('This action will FULLY and PERMANENTLY delete the run. Continue?')) return;
        setIsLoading(true);
        try {
            await deleteDoc(doc(db, 'discussions', discussionId, 'runs', runIdToDelete));
            const remainingRuns = runs.filter(run => run.id !== runIdToDelete);
            setRuns(remainingRuns);
            if (remainingRuns.length > 0) {
                setActiveRun(remainingRuns[0]);
            } else {
                setActiveRun(null);
                setMessages([]);
            }
        } catch (error) {
            console.error("Error deleting run:", error);
            alert("Failed to delete run.");
        } finally {
            setIsLoading(false);
        }
    };

    const parseSSE = (line: string): SseEventData | null => {
        if (!line.startsWith('data:')) return null;
        try { return JSON.parse(line.replace(/^data:\s?/, '')); } catch { return null; }
    };

    const handleRunRound = async (runToProcess: Run, opts?: { newHistory?: DebateMessage[] }) => {
        if (!runToProcess) {
            alert("Critical error: run not passed to function.");
            setStage('setup');
            return;
        }

        const history = opts?.newHistory ?? messages;
        setStage('debating');
        setUserIntervention('');

        try {
            const response = await fetch('/api/debate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discussionId,
                    runId: runToProcess.id,
                    brief,
                    goal: debateGoal,
                    selectedExperts: runToProcess.team.map(t => availableCustomExperts.find(ex => ex.id === t.id)).filter(Boolean) as Expert[],
                    history,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Server error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let currentAssistantMessageIndex = -1;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    const parsed = parseSSE(line);
                    if (!parsed) continue;

                    if (parsed.type === 'expert_start' && parsed.name) {
                        setMessages(prev => {
                            currentAssistantMessageIndex = prev.length;
                            setCurrentThoughts(prevThoughts => ({ ...prevThoughts, [currentAssistantMessageIndex]: '' }));
                            return [...prev, { role: 'assistant', name: parsed.name, content: '', isStreaming: true }];
                        });
                    } else if (parsed.type === 'thought_chunk' && parsed.content) {
                        setCurrentThoughts(prev => ({ ...prev, [currentAssistantMessageIndex]: (prev[currentAssistantMessageIndex] || '') + parsed.content }));
                    } else if (parsed.type === 'chunk' && parsed.content) {
                        setMessages(currentMessages => {
                            if (currentAssistantMessageIndex === -1) return currentMessages;

                            // Вместо мутации используем .map() для создания нового массива с новым объектом
                            return currentMessages.map((msg, index) => {
                                if (index === currentAssistantMessageIndex) {
                                    // Нашли нужный объект? Возвращаем его ПОЛНУЮ КОПИЮ с обновленным контентом.
                                    return { ...msg, content: (msg.content || '') + (parsed.content || '') };
                                }
                                // Остальные объекты возвращаем как есть.
                                return msg;
                            });
                        });
                    } else if (parsed.type === 'expert_end' && parsed.fullMessage) {
                        setMessages(currentMessages => { // Сразу применяем фикс из пункта 1
                            const newMessages = [...currentMessages];
                            const existingMessage = newMessages[currentAssistantMessageIndex];
                            // Проверяем, что и fullMessage прилетел, и в нашем массиве есть что обновлять
                            if (parsed.fullMessage && existingMessage) {
                                newMessages[currentAssistantMessageIndex] = {
                                    ...existingMessage,
                                    // Явно берём только нужные поля и приводим content к строке
                                    role: parsed.fullMessage.role,
                                    content: String(parsed.fullMessage.content || ''),
                                    name: parsed.fullMessage.name,
                                    isStreaming: false,
                                } as DebateMessage; // <-- ВОТ ОН, ФИКС
                            }
                            return newMessages;
                        });
                        // И БОЛЬШЕ НИХУЯ НЕ ДЕЛАЕМ. Мысли остаются в стейте currentThoughts.
                    }
                }
            }

            setCurrentRound(prev => {
                const newRound = prev + 1;
                if (autoPause || newRound >= rounds) {
                    setStage('paused');
                } else {
                    // Рекурсивный вызов для следующего раунда, если нет паузы
                    setMessages(prevMessages => {
                        handleRunRound(runToProcess, { newHistory: prevMessages });
                        return prevMessages;
                    });
                }
                return newRound;
            });

        } catch (error) {
            console.error("ERROR INSIDE handleRunRound:", error);
            alert(`An error occurred during debate. Check console (F12). \n\nError: ${error}`);
            setStage('setup');
        }
    };

    const onContinueDebate = () => {
        if (!activeRun) {
            alert("Cannot continue, no active run selected.");
            return;
        }

        const historyForNextRound = [...messages];

        if (userIntervention.trim()) {
            const userMsg: DebateMessage = {
                role: 'user',
                content: userIntervention.trim(),
                name: 'You'
            };
            historyForNextRound.push(userMsg);

            setMessages(historyForNextRound);
            setUserIntervention('');
        }

        handleRunRound(activeRun, { newHistory: historyForNextRound });
    };

    const handleGetVerdict = async () => {
        if (!activeRun) {
            alert("No active run for verdict.");
            return;
        }

        setStage('judging');
        setMessages(prev => [...prev, { role: 'assistant', name: 'Judge', content: '', isStreaming: true }]);

        try {
            const response = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    runId: activeRun.id,
                    discussionId,
                    brief,
                    debateHistory: messages, // <-- Отправляем историю ДО вердикта
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Judge API Error: ${response.status} ${errorText}`);
            }
            if (!response.body) throw new Error("Judge stream body is empty.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let report = '';
            let judgeMessageIndex = -1;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    const parsed = parseSSE(line);
                    if (!parsed) continue;

                    if (parsed.type === 'chunk' && parsed.content) {
                        report += parsed.content;
                        setMessages(currentMessages => {
                            const newMessages = [...currentMessages];
                            if (judgeMessageIndex === -1) {
                                judgeMessageIndex = newMessages.length - 1;
                            }
                            // Это .map() — правильный способ обновить state в React
                            return currentMessages.map((msg, index) => {
                                if (index === judgeMessageIndex) {
                                    return { ...msg, content: report };
                                }
                                return msg;
                            });
                        });
                    }
                }
            }

            // --- ВОТ ОН, ФИКС СОХРАНЕНИЯ ---
            // Раз уж мы на клиенте и у нас есть права, сохраняем сами.
            // activeRun.id 100% существует, раз мы дошли до Судьи.
            const runDocRef = doc(db, 'discussions', discussionId, 'runs', activeRun!.id);
            await updateDoc(runDocRef, {
                report: report.trim(), // Сохраняем свежий отчет
                transcript: messages   // Сохраняем ИСТОРИЮ, которая была ДО вызова судьи
            });
            // --- КОНЕЦ ФИКСА ---

            setMessages(currentMessages => {
                const newMessages = [...currentMessages];
                if (judgeMessageIndex === -1) { // На случай, если Судья не сказал ни слова
                    judgeMessageIndex = newMessages.length - 1;
                }

                if (newMessages[judgeMessageIndex]) {
                    newMessages[judgeMessageIndex].isStreaming = false;
                    newMessages[judgeMessageIndex].content = report.trim();
                }
                return newMessages;
            });

            // Обновляем и локальный activeRun, чтобы не пришлось перезагружать
            setActiveRun(prev => prev ? { ...prev, report: report.trim(), transcript: messages } : null);
            setStage('finished');

        } catch (error) {
            console.error("Judge Error:", error);
            alert(`Failed to get verdict: ${error}`);
            setStage('paused'); // Rollback to 'paused' if Judge fails
            // Remove streaming Judge message
            setMessages(prev => prev.filter(m => m.name !== 'Judge' || !m.isStreaming));
        }
    };

    const handleStartNewDebate = async () => {
        if (!selectedExperts.length) {
            alert('Select expert team');
            return;
        }

        setIsLoading(true);
        try {
            const runData = {
                team: selectedExperts.map(ex => ({ id: ex.id, name: ex.name })),
                createdAt: serverTimestamp(),
                transcript: [],
                report: '',
            };

            const runRef = await addDoc(collection(db, 'discussions', discussionId, 'runs'), runData);

            const newRun: Run = {
                id: runRef.id,
                team: runData.team,
                transcript: runData.transcript,
                report: runData.report,
                createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
            };

            setRuns(prev => [newRun, ...prev]);
            setActiveRun(newRun);
            setLiveRunId(newRun.id);
            setMessages([]);
            setCurrentRound(0);
            setStage('debating');

            handleRunRound(newRun, { newHistory: [] });

        } catch (error) {
            console.error("!!! ERROR CREATING RUN !!!", error);
            alert('Failed to create new run. Check console (F12)');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading || !user) {
        return <div className="text-center mt-20 font-pixel text-accent-primary animate-pulse">Loading workspace...</div>;
    }

    return (
        <div className="container mx-auto mt-6 lg:mt-10 p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-4 col-span-12">
                <div className="sticky top-6">
                    <Sidebar
                        discussionId={discussionId}
                        onBriefUpdated={handleBriefUpdate}
                        brief={brief}
                        debateGoal={debateGoal}
                        setDebateGoal={setDebateGoal}
                        handleUpdateGoal={handleUpdateGoal}
                        isSavingGoal={isSavingGoal}
                        stage={stage}
                        availableExperts={availableCustomExperts}
                        selectedExperts={selectedExperts}
                        setSelectedExperts={setSelectedExperts}
                        rounds={rounds}
                        setRounds={setRounds}
                        autoPause={autoPause}
                        setAutoPause={setAutoPause}
                        onStartDebate={handleStartNewDebate}
                    />
                </div>
            </aside>

            <main className="lg:col-span-8 col-span-12 bg-bg-surface/50 border border-bg-surface rounded-lg shadow-inner min-h-[85vh] flex flex-col p-6">
                <RunSelector
                    runs={runs}
                    activeRun={activeRun}
                    setActiveRun={setActiveRun}
                    onDeleteRun={handleDeleteRun}
                    stage={stage}
                />
                <ChatWindow
                    messages={messages}
                    chatEndRef={chatEndRef}
                    teamInRun={activeRun?.team || []}
                    currentThoughts={currentThoughts}
                    collapsedThoughts={collapsedThoughts} // <-- Добавили
                    onToggleThought={toggleThoughtVisibility} // <-- Добавили
                />
                <DebateControls
                    stage={stage}
                    currentRound={currentRound}
                    rounds={rounds}
                    userIntervention={userIntervention}
                    setUserIntervention={setUserIntervention}
                    onContinue={onContinueDebate}
                    onGetVerdict={handleGetVerdict}
                    activeRun={activeRun}
                    liveRunId={liveRunId}
                />
            </main>
        </div>
    );
}