// src/types/index.ts
import OpenAI from 'openai';

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

export type Expert = {
    id: string;
    name: string;
    baseArchetype: 'Analyst' | 'Synthesizer' | 'Resonator';
    archetypeMix: ArchetypeMix;
    specializations: SpecializationMix;
    customContext: string;
    character: Character;
    userId: string;
    createdAt: { seconds: number; nanoseconds: number };
    updatedAt: { seconds: number; nanoseconds: number };
};

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