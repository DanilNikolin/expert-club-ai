// src/app/discussion/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
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
    const [isLoadingCustomExperts, setIsLoadingCustomExperts] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    const fetchData = async (currentUser: User) => {
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
        setIsLoadingCustomExperts(false);

        const runsSnap = await getDocs(query(collection(db, 'discussions', discussionId, 'runs'), orderBy('createdAt', 'desc')));
        const fetchedRuns = runsSnap.docs.map(x => ({ id: x.id, ...x.data() } as Run));
        setRuns(fetchedRuns);

        if (fetchedRuns.length) {
            setActiveRun(fetchedRuns[0]);
            setMessages(fetchedRuns[0].transcript);
            setStage(fetchedRuns[0].report ? 'finished' : 'setup');
        } else setStage('setup');
        setIsLoading(false);
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) fetchData(user);
    }, [discussionId, user, authLoading, router]);

    useEffect(() => {
        if (activeRun) {
            // Копируем существующий транскрипт
            const transcriptWithReport = [...activeRun.transcript];

            // Если в этом прогоне есть отчет (run.report), добавляем его в конец
            if (activeRun.report) {
            transcriptWithReport.push({
                role: 'assistant',
                name: 'Судья',
                content: activeRun.report,
            });
            }

            // Обновляем стейт уже с полным списком
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

    const parseSSE = (line: string): any | null => {
        if (!line.startsWith('data:')) return null;
        try { return JSON.parse(line.replace(/^data:\s?/, '')); } catch { return null; }
    };

    // ----- ИЗМЕНЕНИЕ #1: ФУНКЦИЯ ТЕПЕРЬ ПРИНИМАЕТ 'runToProcess' -----
    const handleRunRound = async (runToProcess: Run, opts?: { newHistory?: DebateMessage[] }) => {
    if (!runToProcess) {
        alert("Критическая ошибка: в функцию не передали прогон для обработки.");
        setStage('setup');
        return;
    }

    const history = opts?.newHistory ?? messages;
    // Убрали инкремент раунда отсюда, он будет в конце
    const roundNumber = currentRound + 1; 
    setStage('debating');
    setUserIntervention('');

    try {
        const response = await fetch('/api/debate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                discussionId,
                runId: runToProcess.id, // <--- ОБЯЗАТЕЛЬНО ПЕРЕДАЕМ ID ПРОГОНА
                brief,
                goal: debateGoal,
                selectedExperts: runToProcess.team.map(t => availableCustomExperts.find(ex => ex.id === t.id)).filter(Boolean),
                history,
                round: roundNumber, // roundNumber - это const roundNumber = currentRound + 1;
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
                    // ---> ФИКС #1: ПОЛНОСТЬЮ ИММУТАБЕЛЬНОЕ ОБНОВЛЕНИЕ СООБЩЕНИЯ <---
                    setMessages(prev => {
                        if (currentAssistantMessageIndex === -1 || !prev[currentAssistantMessageIndex]) return prev;
                        
                        const newMessages = [...prev];
                        // Создаем ПОЛНОСТЬЮ НОВЫЙ ОБЪЕКТ, а не меняем старый
                        newMessages[currentAssistantMessageIndex] = {
                            ...newMessages[currentAssistantMessageIndex],
                            content: (newMessages[currentAssistantMessageIndex].content || '') + parsed.content,
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

        

        // ---> ФИКС #2: АТОМАРНАЯ ЛОГИКА ЗАВЕРШЕНИЯ РАУНДА <---
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

// Также поправим `onContinue` в `DebateControls`. 
// Он должен вызывать `handleRunRound` с текущим `activeRun`.
// ЗАМЕНИ СТАРЫЙ onContinueDebate НА ЭТОТ
    const onContinueDebate = () => {
        if (!activeRun) {
            alert("Невозможно продолжить, не выбран активный прогон.");
            return;
        }

        let historyForNextRound = [...messages];

        // Проверяем, написал ли юзер что-то в поле
        if (userIntervention.trim()) {
            const userMsg: DebateMessage = {
                role: 'user',
                content: userIntervention.trim(),
                name: 'Ты' // Или user.displayName, если хочешь
            };
            
            // Добавляем сообщение в историю
            historyForNextRound.push(userMsg);
            
            // Сразу обновляем UI, чтобы юзер увидел свою реплику
            setMessages(historyForNextRound);
            
            // Очищаем поле ввода
            setUserIntervention('');
        }

        // Запускаем следующий раунд с обновленной (или старой, если реплики не было) историей
        handleRunRound(activeRun, { newHistory: historyForNextRound });
    };

    // СУДЬЯ
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
                    runId: activeRun.id, // <-- VERY IMPORTANT: SENDING THE RUN ID
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
                                newMessages[judgeMessageIndex].content = report; // Update with the full report
                            }
                            return newMessages;
                        });
                    }
                }
            }
            
            // Update the local state to show the final report correctly
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[judgeMessageIndex]) {
                    newMessages[judgeMessageIndex].isStreaming = false;
                    newMessages[judgeMessageIndex].content = report;
                }
                return newMessages;
            });

            // Update the activeRun in the state with the new report
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

            // ----- ИЗМЕНЕНИЕ #2: ПЕРЕДАЕМ 'newRun' НАПРЯМУЮ -----
            handleRunRound(newRun, { newHistory: [] });

        } catch (error) {
            console.error("!!! ОШИБКА ПРИ СОЗДАНИИ 'РАНА' !!!", error);
            alert('Не удалось создать новый прогон. Смотри консоль (F12)');
        } finally {
            setIsLoading(false);
        }
    };

    

    if (authLoading || isLoading || !user) { // Убрал isLoadingCustomExperts, т.к. он уже не нужен в таком виде
    return <div className="text-center mt-20 font-pixel text-accent-primary animate-pulse">Загрузка рабочего пространства...</div>;
  }

  return (
    // ИСПОЛЬЗУЕМ GRID ДЛЯ МАКЕТА
    <div className="container mx-auto mt-10 p-4 grid grid-cols-12 gap-6">
      
      {/* --- САЙДБАР (ЛЕВАЯ КОЛОНКА) --- */}
      <aside className="col-span-4">
        <div className="sticky top-6"> {/* Делаем сайдбар липким */}
          <Sidebar
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

      {/* --- ОСНОВНОЕ ОКНО (ПРАВАЯ КОЛОНКА) --- */}
      <main className="col-span-8 bg-bg-surface/50 border border-bg-surface rounded-lg shadow-inner min-h-[85vh] flex flex-col p-6">
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
          // Передаем команду, чтобы различать экспертов по цвету
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