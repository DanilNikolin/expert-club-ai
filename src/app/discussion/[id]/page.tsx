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

// ИСПРАВЛЕНИЕ #3: Создаем тип для данных из стрима
type SseEventData = {
    type: 'expert_start' | 'chunk' | 'expert_end' | 'error';
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
    const [userIntervention, setUserIntervention] = useState('');
    const [autoPause, setAutoPause] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    // ИСПРАВЛЕНИЕ #1: Удалили неиспользуемый стейт isLoadingCustomExperts
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    // ИСПРАВЛЕНИЕ #2: Оборачиваем fetchData в useCallback
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
        
        // ИСПРАВЛЕНИЕ #1: Удалили setIsLoadingCustomExperts(false)
        
        const runsSnap = await getDocs(query(collection(db, 'discussions', discussionId, 'runs'), orderBy('createdAt', 'desc')));
        const fetchedRuns = runsSnap.docs.map(x => ({ id: x.id, ...x.data() } as Run));
        setRuns(fetchedRuns);

        if (fetchedRuns.length) {
            setActiveRun(fetchedRuns[0]);
            setMessages(fetchedRuns[0].transcript);
            setStage(fetchedRuns[0].report ? 'finished' : 'setup');
        } else setStage('setup');
        setIsLoading(false);
    }, [discussionId, router]); // Зависимости useCallback

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchData(user);
        }
    // ИСПРАВЛЕНИЕ #2: Добавляем fetchData в массив зависимостей
    }, [user, authLoading, router, fetchData]);

    useEffect(() => {
        if (activeRun) {
            const transcriptWithReport = [...activeRun.transcript];
            if (activeRun.report) {
            transcriptWithReport.push({
                role: 'assistant',
                name: 'Судья',
                content: activeRun.report,
            });
            }
            setMessages(transcriptWithReport);
        }
    }, [activeRun]);

    const handleUpdateGoal = async () => {
        if (!debateGoal) return;
        setIsSavingGoal(true);
        try {
            await updateDoc(doc(db, 'discussions', discussionId), { goal: debateGoal });
        } catch (error) {
            console.error("Failed to update goal:", error);
            alert("Ошибка сохранения цели");
        } finally {
            setIsSavingGoal(false);
        }
    };

    const handleBriefUpdate = (newBrief: string) => {
        setBrief(newBrief);
    };

    const handleDeleteRun = async (runIdToDelete: string) => {
        if (!window.confirm('Это действие ПОЛНОСТЬЮ И БЕЗВОЗВРАТНО удалит прогон. Продолжить?')) return;
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
            console.error("Ошибка при удалении рана:", error);
            alert("Не удалось удалить прогон.");
        } finally {
            setIsLoading(false);
        }
    };

    // ИСПРАВЛЕНИЕ #3: Убрали 'any', используем SseEventData
    const parseSSE = (line: string): SseEventData | null => {
        if (!line.startsWith('data:')) return null;
        try { return JSON.parse(line.replace(/^data:\s?/, '')); } catch { return null; }
    };

    const handleRunRound = async (runToProcess: Run, opts?: { newHistory?: DebateMessage[] }) => {
        if (!runToProcess) {
            alert("Критическая ошибка: в функцию не передали прогон для обработки.");
            setStage('setup');
            return;
        }

        const history = opts?.newHistory ?? messages;
        const roundNumber = currentRound + 1; 
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
                    selectedExperts: runToProcess.team.map(t => availableCustomExperts.find(ex => ex.id === t.id)).filter(Boolean),
                    history,
                    round: roundNumber,
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}. Ответ: ${errorText}`);
            }
            if (!response.body) throw new Error("Стрим ответа пустой.");

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

                    if (parsed.type === 'expert_start') {
                        setMessages(prev => {
                            currentAssistantMessageIndex = prev.length;
                            return [...prev, { role: 'assistant', name: parsed.name, content: '', isStreaming: true }];
                        });
                    } else if (parsed.type === 'chunk' && parsed.content) {
                        setMessages(prev => {
                            if (currentAssistantMessageIndex === -1 || !prev[currentAssistantMessageIndex]) return prev;
                            const newMessages = [...prev];
                            newMessages[currentAssistantMessageIndex] = {
                                ...newMessages[currentAssistantMessageIndex],
                                content: (newMessages[currentAssistantMessageIndex].content || '') + (parsed.content || ''),
                            };
                            return newMessages;
                        });
                    }
                }
            }
            
            let finalTranscript: DebateMessage[] = [];
            setMessages(prev => {
                const newMessages = [...prev];
                if (currentAssistantMessageIndex !== -1 && newMessages[currentAssistantMessageIndex]) {
                    newMessages[currentAssistantMessageIndex].isStreaming = false;
                }
                finalTranscript = newMessages;
                return newMessages;
            });

            setCurrentRound(prevRound => {
                const newRound = prevRound + 1;
                if (autoPause || newRound >= rounds) {
                    setStage('paused');
                } else {
                    handleRunRound(runToProcess, { newHistory: finalTranscript });
                }
                return newRound;
            });

        } catch (error) {
            console.error("ОШИБКА ВНУТРИ handleRunRound:", error);
            alert(`Произошла ошибка во время дебатов. Смотри консоль (F12). \n\nТекст ошибки: ${error}`);
            setStage('setup');
        }
    };

    // ИСПРАВЛЕНИЕ #4: Переписываем функцию, чтобы не мутировать массив и использовать 'const'
    const onContinueDebate = () => {
        if (!activeRun) {
            alert("Невозможно продолжить, не выбран активный прогон.");
            return;
        }
    
        // Создаем новый массив на основе текущих сообщений
        const historyForNextRound = [...messages];
    
        // Если пользователь что-то ввел, добавляем его сообщение в НОВЫЙ массив
        if (userIntervention.trim()) {
            const userMsg: DebateMessage = {
                role: 'user',
                content: userIntervention.trim(),
                name: 'Ты'
            };
            historyForNextRound.push(userMsg); // .push() здесь безопасен, т.к. мы работаем с новой копией
            
            // Сразу обновляем UI и очищаем поле
            setMessages(historyForNextRound);
            setUserIntervention('');
        }
    
        // Запускаем следующий раунд с обновленной историей
        handleRunRound(activeRun, { newHistory: historyForNextRound });
    };

    const handleGetVerdict = async () => {
        if (!activeRun) {
            alert("Нет активного прогона для получения вердикта.");
            return;
        }

        setStage('judging');
        setMessages(prev => [...prev, { role: 'assistant', name: 'Судья', content: '', isStreaming: true }]);

        try {
            const response = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    runId: activeRun.id,
                    discussionId,
                    brief,
                    debateHistory: messages,
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
                        setMessages(prev => {
                            const newMessages = [...prev];
                            if (judgeMessageIndex === -1) {
                                judgeMessageIndex = newMessages.length - 1;
                            }
                            if (newMessages[judgeMessageIndex]) {
                                newMessages[judgeMessageIndex].content = report;
                            }
                            return newMessages;
                        });
                    }
                }
            }
            
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[judgeMessageIndex]) {
                    newMessages[judgeMessageIndex].isStreaming = false;
                    newMessages[judgeMessageIndex].content = report;
                }
                return newMessages;
            });

            setActiveRun(prev => prev ? { ...prev, report } : null);
            setStage('finished');

        } catch (error) {
            console.error("Judge Error:", error);
            alert(`Failed to get verdict: ${error}`);
            setStage('paused');
        }
    };

    const handleStartNewDebate = async () => {
        if (!selectedExperts.length) {
            alert('Выберите команду экспертов');
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
            setMessages([]);
            setCurrentRound(0);
            setStage('debating');

            handleRunRound(newRun, { newHistory: [] });

        } catch (error) {
            console.error("!!! ОШИБКА ПРИ СОЗДАНИИ 'РАНА' !!!", error);
            alert('Не удалось создать новый прогон. Смотри консоль (F12)');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading || !user) {
        return <div className="text-center mt-20 font-pixel text-accent-primary animate-pulse">Загрузка рабочего пространства...</div>;
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
                />
            </main>
        </div>
    );
}