'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase.config';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';

// Импортируем всю логику и типы
import {
  initialExpertFormData,
  clampSliderValue,
  type ExpertFormData,
  type ValidationErrors,
  type ArchetypeMix,
  type SpecializationMix,
  sanitizeAndNormalizeMix,
} from '@/app/experts/_components/expert-constructor.logic';

// Импортируем все наши компоненты через абсолютный путь
import ConstructorHeader from '@/app/experts/_components/ConstructorHeader';
import BasicInfoSection from '@/app/experts/_components/BasicInfoSection';
import ChatConfiguratorSection from '@/app/experts/_components/ChatConfiguratorSection';
import TemplatesSection from '@/app/experts/_components/TemplatesSection';
import ExpertPreview from '@/app/experts/_components/ExpertPreview';
import ArchetypeSection from '@/app/experts/_components/ArchetypeSection';
import SpecializationSection from '@/app/experts/_components/SpecializationSection';
import CharacterSection from '@/app/experts/_components/CharacterSection';
import SubmitSection from '@/app/experts/_components/SubmitSection';
import { expertTemplates } from '@/app/experts/_components/expert-constructor.logic';
import ConfigSectionCard from '@/app/experts/_components/ConfigSectionCard';

export default function CreateExpertPage() {
  const router = useRouter();
  const params = useParams();
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
  type Message = { role: 'user' | 'assistant'; content: string };
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [chatError, setChatError] = useState('');

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
            } catch (err) {
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
    setFormData((prev) => ({ ...prev, archetypeMix: { ...prev.archetypeMix, [type]: clampSliderValue(prev.archetypeMix, type, value) } }));
  };

  const handleSpecializationMixChange = (spec: keyof SpecializationMix, value: number) => {
    setFormData((prev) => ({ ...prev, specializations: { ...prev.specializations, [spec]: clampSliderValue(prev.specializations, spec, value) } }));
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const newUserMessage: Message = { role: 'user', content: chatInput };
    const newMessages = [...chatMessages, newUserMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);
    setChatError('');
    const CONFIRMATION_PHRASE = '[CONFIRMATION_READY]';
    try {
        const res = await fetch('/api/chat-configurator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
        });
        if (!res.ok) { throw new Error('Ошибка сети или сервера'); }
        const data = await res.json();
        let assistantMessageContent = data.message;
        if (assistantMessageContent.includes(CONFIRMATION_PHRASE)) {
        assistantMessageContent = assistantMessageContent.replace(CONFIRMATION_PHRASE, '').trim();
        setNeedsConfirmation(true);
        }
        setChatMessages(prev => [...prev, { role: 'assistant', content: assistantMessageContent }]);
    } catch (err) {
        setChatError('Бля, ассистент задумался и сломался. Попробуй еще раз.');
        console.error(err);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleConfirmGeneration = async () => {
    setIsChatLoading(true);
    setChatError('');
    setNeedsConfirmation(false);
    const conversation = chatMessages.map(m => `${m.role}: ${m.content}`).join('\n');
    try {
        const res = await fetch('/api/generate-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation }),
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Ошибка генерации');
        }
        const expertConfig = await res.json();

        // --- ПРИМЕНЯЕМ НАШ ФЕЙС-КОНТРОЛЬ ---
        const sanitizedArchetypes = sanitizeAndNormalizeMix(expertConfig.archetypeMix || initialExpertFormData.archetypeMix);
        const sanitizedSpecs = sanitizeAndNormalizeMix(expertConfig.specializations || initialExpertFormData.specializations);

        setFormData(prev => ({
            ...initialExpertFormData,
            ...prev,
            ...expertConfig,
            archetypeMix: sanitizedArchetypes, // Используем очищенные данные
            specializations: sanitizedSpecs,    // Используем очищенные данные
            character: { ...initialExpertFormData.character, ...expertConfig.character },
        }));
        setChatMessages([]);
    } catch (err: any) {
        setChatError(err.message || 'Пиздец, генератор взорвался. Начнем заново?');
        console.error(err);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleCancelGeneration = () => {
    setChatMessages([]);
    setNeedsConfirmation(false);
    setChatError('');
  };

  const resetArchetypeMix = () => setFormData((p) => ({ ...p, archetypeMix: initialExpertFormData.archetypeMix }));
  const resetSpecializationMix = () => setFormData((p) => ({ ...p, specializations: initialExpertFormData.specializations }));
  
  const clearDraft = () => {
    if (confirm('Очистить все данные формы?')) {
      localStorage.removeItem(autoSaveKey);
      setFormData(initialExpertFormData);
    }
  };

  const applyGlobalTemplate = (key: string) => {
    const templateData = expertTemplates[key]?.data;
    if (!templateData) return;
    setFormData((prev) => ({
      ...prev, ...templateData,
      character: { ...initialExpertFormData.character, ...templateData.character },
      archetypeMix: { ...templateData.archetypeMix },
      specializations: { ...templateData.specializations },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !user || isSaving) return;
    const errors = validateForm(formData);
    if (Object.keys(errors).length) { setValidationErrors(errors); return; }
    setIsSaving(true);
    try {
      const dataToSave = { ...formData, userId: user.uid, updatedAt: new Date() };
      if (expertId) {
        await updateDoc(doc(db, `users/${user.uid}/customExperts`, expertId), dataToSave);
      } else {
        await addDoc(collection(db, `users/${user.uid}/customExperts`), { ...dataToSave, createdAt: new Date() });
      }
      localStorage.removeItem(autoSaveKey);
      router.push('/dashboard');
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

  // СТАЛО:
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
            <ExpertPreview formData={formData} />
            <ConfigSectionCard
              className="mt-8"
              title="AI-Ассистент"
              description="Задай вопрос или попроси заполнить за тебя."
              isCollapsible={true}
              startOpen={true}
            >
              <ChatConfiguratorSection 
                chatMessages={chatMessages}
                isChatLoading={isChatLoading}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleChatSubmit={handleChatSubmit}
                needsConfirmation={needsConfirmation}
                handleConfirmGeneration={handleConfirmGeneration}
                handleCancelGeneration={handleCancelGeneration}
                chatError={chatError}
              />
            </ConfigSectionCard>
            <SubmitSection 
              isSaving={isSaving}
              isFormValid={isFormValid}
              expertId={expertId}
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