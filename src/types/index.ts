// src/types/index.ts
import OpenAI from 'openai';

// --- БАЗОВЫЕ ТИПЫ СУЩНОСТЕЙ ---

export type ArchetypeMix = { analyst: number; synthesizer: number; resonator: number };

export type SpecializationMix = {
    'Product & Technologies': number;
    'Finance & Resources': number;
    'Marketing & Audience': number;
    'Strategy & Market': number;
    'Ethics & Society': number;
    'Law & Risks': number;
    'Generalist': number;
};

export type Character = {
    constructiveness: number;
    conformism: number;
    conviction: number;
    opennessToData: number;
    hasHumor: boolean;
    isContradictionHunter: boolean;
    temperature: number;
};

// --- Полный тип эксперта, как он хранится в Firestore ---
export type Expert = {
    id: string;
    name: string;
    model: string; // Добавил поле модели
    baseArchetype: 'Analyst' | 'Synthesizer' | 'Resonator'; // Это поле у тебя было, но не в типе
    archetypeMix: ArchetypeMix;
    specializations: SpecializationMix;
    customContext: string;
    character: Character;
    userId: string;
    createdAt: { seconds: number; nanoseconds: number };
    updatedAt: { seconds: number; nanoseconds: number };
};

export type Discussion = {
  id: string;
  userId: string; // Добавим userId для полноты картины
  brief: string;
  createdAt: { seconds: number; nanoseconds: number };
  status: string;
};

// --- НОВЫЕ ТИПЫ ДЛЯ КОНСТРУКТОРА ---

// Тип для одного предложенного эксперта от AI. Это почти полная форма, но без ID.
export type ExpertSuggestion = Omit<Expert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// Тип для сообщения в чате конструктора. Может содержать предложения.
export type ConstructorChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: ExpertSuggestion[];
};

// Тип для ответа от API-ручки /api/chat-configurator
export type ChatConfiguratorResponse = {
  message: string;
  suggestions: ExpertSuggestion[];
}


// --- ТИПЫ ДЛЯ КОМНАТЫ ДЕБАТОВ ---

export type DebateMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam & {
    name?: string;
    isStreaming?: boolean;
};

export type Run = {
    id: string;
    report?: string;
    team: { id: string; name: string }[];
    createdAt: { seconds: number; nanoseconds: number };
    transcript: DebateMessage[];
};