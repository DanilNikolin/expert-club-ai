//D:\expert-club-ai\expert-club-ai\src\app\experts\[id]\page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase.config';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ConfigSectionCard from '@/app/experts/_components/ConfigSectionCard';

// Импортируем всю логику и типы
import {
  initialExpertFormData,
  type ValidationErrors,
  type ArchetypeMix,
  type SpecializationMix,
  sanitizeAndNormalizeMix,
  type ExpertFormData,
} from '@/app/experts/_components/expert-constructor.logic';

// Импортируем типы для чата и предложений из нашего главного "словаря"
import {
  type ConstructorChatMessage,
  type ExpertSuggestion
} from '@/types';
// Импортируем все наши компоненты через абсолютный путь
import ConstructorHeader from '@/app/experts/_components/ConstructorHeader';
import BasicInfoSection from '@/app/experts/_components/BasicInfoSection';
import ChatConfiguratorSection from '@/app/experts/_components/ChatConfiguratorSection';
import ExpertPreview from '@/app/experts/_components/ExpertPreview';
import ArchetypeSection from '@/app/experts/_components/ArchetypeSection';
import SpecializationSection from '@/app/experts/_components/SpecializationSection';
import CharacterSection from '@/app/experts/_components/CharacterSection';
import SubmitSection from '@/app/experts/_components/SubmitSection';

export default function CreateExpertPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  // --- СТЕЙТЫ ---
  const [formData, setFormData] = useState<ExpertFormData>(initialExpertFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isCreateMode = params.id === 'create';
  const expertId = isCreateMode ? undefined : (params.id as string);
  const autoSaveKey = `expert-draft-${user?.uid || 'anonymous'}-${expertId || 'new'}`;

  // Стейты для чата
  const [chatMessages, setChatMessages] = useState<ConstructorChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  // >>> ДОБАВЬ ЭТИ ДВЕ СТРОКИ НИЖЕ <<<
  const [creationQueue, setCreationQueue] = useState<ExpertSuggestion[]>([]);
  const [isWizardActive, setIsWizardActive] = useState(false);
  const [initialQueueSize, setInitialQueueSize] = useState<number | null>(null);
  const briefSentRef = useRef(false);

  // --- ЛОГИКА (НЕ ТРОНУТА) ---

  const validateForm = useCallback((data: ExpertFormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!data.name.trim()) errors.name = 'Имя эксперта обязательно';
    else if (data.name.trim().length < 3) errors.name = 'Имя должно содержать минимум 3 символа';
    else if (data.name.trim().length > 100) errors.name = 'Имя слишком длинное (максимум 100 символов)';
    if (data.customContext.length > 500) errors.customContext = 'Контекст слишком длинный (максимум 500 символов)';
    return errors;
  }, []);

  useEffect(() => {
    if (!user || localLoading === false) return;
    const saveTimeout = setTimeout(() => {
      setIsAutoSaving(true);
      try {
        localStorage.setItem(autoSaveKey, JSON.stringify(formData));
        setLastSaved(new Date());
      } catch (err) {
        console.warn('Не удалось сохранить черновик:', err);
      } finally {
        setTimeout(() => setIsAutoSaving(false), 500);
      }
    }, 2000);
    return () => clearTimeout(saveTimeout);
  }, [formData, user, autoSaveKey, localLoading]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const loadData = async () => {
        setLocalLoading(true);
        if (isCreateMode) {
            try {
                const savedDraft = localStorage.getItem(autoSaveKey);
                if (savedDraft) {
                    const draftData = JSON.parse(savedDraft);
                    const completeData = { ...initialExpertFormData, ...draftData, character: { ...initialExpertFormData.character, ...draftData.character } };
                    setFormData(completeData);
                }
            } catch (err) {
                console.warn('Не удалось загрузить черновик:', err);
            }
        } else if (expertId) {
            try {
                const docRef = doc(db, `users/${user.uid}/customExperts`, expertId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const expertData = docSnap.data();
                    const characterWithDefaults = { ...initialExpertFormData.character, ...expertData.character };
                    setFormData({ ...expertData, character: characterWithDefaults, id: expertId } as ExpertFormData);
                } else {
                    router.push('/experts/create');
                }
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
             } catch (_err) {
                 router.push('/dashboard');
             }
        }
        setLocalLoading(false);
    };
    loadData();
  }, [expertId, user, loading, router, isCreateMode, autoSaveKey]);
  
  useEffect(() => {
    setValidationErrors(validateForm(formData));
  }, [formData, validateForm]);

  // ЭТОТ useEffect сработает один раз при загрузке страницы, чтобы перехватить бриф из URL
  useEffect(() => {
    const briefFromUrl = searchParams.get('brief');
    
    // Если мы в режиме создания, в URL есть бриф, чат пуст И ФЛАГ ЕЩЕ НЕ ПОДНЯТ
    if (isCreateMode && briefFromUrl && chatMessages.length === 0 && !briefSentRef.current) {
      briefSentRef.current = true; // <-- ПРАВКА №1: СРАЗУ ПОДНИМАЕМ ФЛАГ

      const initialPrompt = `Привет! Вот мой бриф, нужна команда для его анализа:\n\n---\n${decodeURIComponent(briefFromUrl.replace(/\+/g, ' '))}\n---`;
      
      const userMessage: ConstructorChatMessage = { role: 'user', content: initialPrompt };
      
      // Сразу отправляем его на сервер, имитируя клик пользователя
      const sendInitialBrief = async () => {
        setChatMessages([userMessage]); // Сначала показываем сообщение пользователя
        setIsChatLoading(true);
        setChatError('');
        try {
          const res = await fetch('/api/chat-configurator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [userMessage], editingExpert: null }),
          });

          if (!res.ok) throw new Error('Ошибка сети или сервера при авто-отправке брифа');
          
          const data = await res.json();
          const assistantMessage: ConstructorChatMessage = {
            role: 'assistant',
            content: data.message,
            suggestions: data.suggestions || [],
          };
          setChatMessages(prev => [...prev, assistantMessage]);

        } catch (err) {
          setChatError('Упс, что-то пошло не так при обработке брифа.');
          console.error(err);
        } finally {
          setIsChatLoading(false);
          // Очищаем URL, чтобы при перезагрузке не отправлялось заново
          router.replace('/experts/create', { scroll: false });
        }
      };
      
      sendInitialBrief();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMode, searchParams, chatMessages.length, router]); // <-- ПРАВКА №2: ДОБАВЬ 'router' В МАССИВ ЗАВИСИМОСТЕЙ

  useEffect(() => {
    if (isWizardActive && creationQueue.length > 0) {
        const nextExpert = creationQueue[0];
        const nextExpertData = creationQueue[0];
        // Умное слияние: берем основу, накладываем данные от AI, потом отдельно и глубоко сливаем вложенные объекты.
        const mergedData = {
          ...initialExpertFormData,
          ...nextExpertData,
          archetypeMix: { ...initialExpertFormData.archetypeMix, ...nextExpertData.archetypeMix },
          specializations: { ...initialExpertFormData.specializations, ...nextExpertData.specializations },
          character: { ...initialExpertFormData.character, ...nextExpertData.character },
        };
        setFormData(mergedData as ExpertFormData);
                
        const totalInQueue = creationQueue.length;
        const currentStep = (initialQueueSize || totalInQueue) - totalInQueue + 1;

        setChatMessages(prev => [...prev, { role: 'assistant', content: `Шаг ${currentStep}: Настраиваем "${nextExpert.name}". Проверь параметры и сохрани.` }]);
    }
    // Добавим стейт для отслеживания начального размера очереди для красивого вывода шагов
    if (isWizardActive && creationQueue.length > 0 && !initialQueueSize) {
        setInitialQueueSize(creationQueue.length);
    }
    if (!isWizardActive) {
        setInitialQueueSize(null);
    }
  }, [isWizardActive, creationQueue, initialQueueSize]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCharacterSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, character: { ...prev.character, [name]: Number(value) } }));
  };

  const handleCharacterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, character: { ...prev.character, [name]: checked } }));
  };

  const handleArchetypeMixChange = (type: keyof ArchetypeMix, value: number) => {
  setFormData(prev => {
    // 1. Считаем, сколько уже "занято" другими ползунками.
    const otherTotal = Object.entries(prev.archetypeMix)
      .filter(([key]) => key !== type)
      .reduce((sum, [, val]) => sum + val, 0);

    // 2. Вычисляем "потолок" для текущего ползунка. Больше этого значения он не прыгнет.
    const maxAllowed = 100 - otherTotal;

    // 3. Устанавливаем новое значение, но не больше "потолка". И не меньше нуля, на всякий случай.
    const newValue = Math.max(0, Math.min(value, maxAllowed));

    // 4. Обновляем стейт, меняя ТОЛЬКО ОДИН ползунок, который мы двигали.
    return {
      ...prev,
      archetypeMix: {
        ...prev.archetypeMix,
        [type]: newValue,
      },
    };
  });
};

  const handleSpecializationMixChange = (spec: keyof SpecializationMix, value: number) => {
  setFormData(prev => {
    // Та же самая логика, один в один.
    const otherTotal = Object.entries(prev.specializations)
      .filter(([key]) => key !== spec)
      .reduce((sum, [, val]) => sum + val, 0);

    const maxAllowed = 100 - otherTotal;
    const newValue = Math.max(0, Math.min(value, maxAllowed));

    return {
      ...prev,
      specializations: {
        ...prev.specializations,
        [spec]: newValue,
      },
    };
  });
};

  // --- НОВАЯ ЛОГИКА "МАСТЕРА СОЗДАНИЯ" И ЧАТА ---

  const startCreationWizard = useCallback((suggestions: ExpertSuggestion[], selectedNames: string[]) => {
    const queue = suggestions.filter(s => selectedNames.includes(s.name));
    setCreationQueue(queue);
    setIsWizardActive(true);
    // Прячем чат и выводим сообщение о начале работы мастера
    setChatMessages([{ role: 'user', content: `Отлично, приступаем к созданию: ${selectedNames.join(', ')}` }]);
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ConstructorChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    setChatError('');

    try {
      const res = await fetch('/api/chat-configurator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          // Если мы в режиме редактирования, отправляем данные текущего эксперта
          editingExpert: !isCreateMode ? formData : null,
        }),
      });

      if (!res.ok) throw new Error('Ошибка сети или сервера');
      
      const data = await res.json(); // Ожидаем JSON { message: string, suggestions: [] }
      
      const assistantMessage: ConstructorChatMessage = {
        role: 'assistant',
        content: data.message,
        suggestions: data.suggestions || [],
      };
      setChatMessages(prev => [...prev, assistantMessage]);

      // --- ВОТ ОН, ФИКС ---
      // Если мы в режиме редактирования и AI прислал обновленный профиль...
      if (!isCreateMode && data.suggestions && data.suggestions.length > 0) {
        const updatedExpertData = data.suggestions[0];
        // ...применяем его к нашей форме!
        setFormData(prev => ({
          ...prev, // Сохраняем ID и прочую мету
          ...updatedExpertData,
          archetypeMix: { ...prev.archetypeMix, ...updatedExpertData.archetypeMix },
          specializations: { ...prev.specializations, ...updatedExpertData.specializations },
          character: { ...prev.character, ...updatedExpertData.character },
        }));
      }

    } catch (err) {
      setChatError('та твою ж..., ассистент задумался и сломался. Попробуй еще раз.');
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const resetArchetypeMix = () => setFormData((p) => ({ ...p, archetypeMix: initialExpertFormData.archetypeMix }));
  const resetSpecializationMix = () => setFormData((p) => ({ ...p, specializations: initialExpertFormData.specializations }));
  
  const clearDraft = () => {
    if (confirm('Очистить все данные формы?')) {
      localStorage.removeItem(autoSaveKey);
      setFormData(initialExpertFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !user || isSaving || !isFormValid) return;
    
    setIsSaving(true);
    try {
      const dataToSave = { ...formData };
      delete dataToSave.id; // Просто и надежно удаляем ненужное поле
      const finalData = { ...dataToSave, userId: user.uid };

      if (expertId) {
        // Режим редактирования
        await updateDoc(doc(db, `users/${user.uid}/customExperts`, expertId), { ...finalData, updatedAt: serverTimestamp() });
        router.push('/dashboard');
      } else {
        // Режим создания (одиночный или через мастер)
        await addDoc(collection(db, `users/${user.uid}/customExperts`), { ...finalData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        
        if (isWizardActive) {
          const remainingQueue = creationQueue.slice(1);
          if (remainingQueue.length > 0) {
            setCreationQueue(remainingQueue); // Переходим к следующему в очереди
          } else {
            // Очередь пуста - мастер завершен
            setCreationQueue([]);
            setIsWizardActive(false);
            localStorage.removeItem(autoSaveKey);
            alert('Команда успешно создана!');
            router.push('/dashboard');
          }
        } else {
          // Обычное одиночное создание
          localStorage.removeItem(autoSaveKey);
          router.push('/dashboard');
        }
      }
      setLastSaved(new Date());
    } catch (err) {
      console.error('Ошибка сохранения эксперта:', err);
      alert('Не удалось сохранить эксперта.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCompletionProgress = () => {
    let done = 0;
    if (formData.name.trim()) done++;
    if (formData.customContext.trim()) done++;
    if (JSON.stringify(formData.archetypeMix) !== JSON.stringify(initialExpertFormData.archetypeMix)) done++;
    if (JSON.stringify(formData.specializations) !== JSON.stringify(initialExpertFormData.specializations)) done++;
    if (JSON.stringify(formData.character) !== JSON.stringify(initialExpertFormData.character)) done++;
    return Math.round((done / 5) * 100);
  };
  
  const completionProgress = getCompletionProgress();
  const isFormValid = !Object.keys(validationErrors).length && formData.name.trim().length >= 3;

  // --- РЕНДЕР ---
  
  if (loading || localLoading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Загрузка конструктора...</p>
          </div>
        </div>
    );
  }

return (
  <div className="container mx-auto max-w-7xl px-2 py-8 h-[calc(100vh-80px)]"> 
    <form onSubmit={handleSubmit} className="h-full">
      <div className="grid grid-cols-1 gap-20 lg:grid-cols-12 h-full pt-8">

        {/* --- ЛЕВАЯ КОЛОНКА (7 из 12) --- */}
        {/* ВНЕШНИЙ БЛОК - ТОЛЬКО СКРОЛЛ */}
        <div className="lg:col-span-7 overflow-y-auto overflow-x-hidden">
          {/* ВНУТРЕННИЙ БЛОК - ТОЛЬКО ОТСТУПЫ И КОНТЕНТ */}
            <div className="space-y-8"> 
            <BasicInfoSection
              formData={formData}
              handleChange={handleChange}
              validationErrors={validationErrors}
            />
            <ArchetypeSection 
              archetypeMix={formData.archetypeMix}
              handleArchetypeMixChange={handleArchetypeMixChange}
              resetArchetypeMix={resetArchetypeMix}
            />
            <SpecializationSection
              specializations={formData.specializations}
              customContext={formData.customContext}
              validationErrors={validationErrors}
              handleSpecializationMixChange={handleSpecializationMixChange}
              handleChange={handleChange}
              resetSpecializationMix={resetSpecializationMix}
            />
            <CharacterSection 
              character={formData.character}
              handleCharacterSliderChange={handleCharacterSliderChange}
              handleCharacterCheckboxChange={handleCharacterCheckboxChange}
            />
          </div>
        </div>

        {/* --- ПРАВАЯ КОЛОНКА (5 из 12) --- */}
        {/* ВНЕШНИЙ БЛОК - ТОЛЬКО СКРОЛЛ */}
        <aside className="lg:col-span-5 overflow-y-auto overflow-x-hidden h-full">
          {/* ВНУТРЕННИЙ БЛОК - ТОЛЬКО ОТСТУПЫ И КОНТЕНТ */}
          <div className="space-y-8">
            <ConstructorHeader 
              isCreateMode={isCreateMode}
              isAutoSaving={isAutoSaving}
              lastSaved={lastSaved}
              completionProgress={completionProgress}
            />
          {/* УСЛОВИЕ: ПОКАЗЫВАЕМ ПРЕВЬЮ В РЕЖИМЕ МАСТЕРА, ИНАЧЕ - ЧАТ */}
          {isWizardActive ? (
            <ExpertPreview formData={formData} />
          ) : (
            <ConfigSectionCard
              className="mt-8"
              title="AI-Ассистент"
              description={isCreateMode ? "Говори любую идею, даже самую сырую. Я пойму и сделаю как надо." : "Говори, что поправить. Сделаю твоего бойца лучше."}
              isCollapsible={true}
              startOpen={true}
            >
              <ChatConfiguratorSection 
                chatMessages={chatMessages}
                isChatLoading={isChatLoading}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleChatSubmit={handleChatSubmit}
                chatError={chatError}
                startCreationWizard={startCreationWizard}
                isCreateMode={isCreateMode} // <-- ДОБАВЬ ЭТУ СТРОКУ
              />
            </ConfigSectionCard>
          )}
            <SubmitSection 
              isSaving={isSaving}
              isFormValid={isFormValid}
              isCreateMode={isCreateMode}
              clearDraft={clearDraft}
              validationErrors={validationErrors}
              formName={formData.name}
            />
          </div>
        </aside>
      </div>
    </form>
  </div>
);
}