// src/app/experts/_components/expert-constructor.logic.ts

// --- DATA TYPES FOR OUR EXPERT ---
export type ArchetypeMix = {
  analyst: number;
  synthesizer: number;
  resonator: number;
};

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
  thinkingBudget: number;
};

export type ExpertFormData = {
  id?: string;
  name: string;
  model: string;
  baseArchetype: 'Analyst' | 'Synthesizer' | 'Resonator';
  archetypeMix: ArchetypeMix;
  specializations: SpecializationMix;
  customContext: string;
  character: Character;
};

export type ValidationErrors = {
  name?: string;
  customContext?: string;
};

// --- INITIAL VALUES ---
export const initialExpertFormData: ExpertFormData = {
  name: '',
  model: 'gpt-4.1-mini',
  baseArchetype: 'Analyst',
  archetypeMix: { analyst: 0, synthesizer: 0, resonator: 0 },
  specializations: {
    'Product & Technologies': 0, 'Finance & Resources': 0, 'Marketing & Audience': 0,
    'Strategy & Market': 0, 'Ethics & Society': 0, 'Law & Risks': 0, 'Generalist': 0,
  },
  customContext: '',
  character: {
    constructiveness: 1, conformism: 1, conviction: 1, opennessToData: 1,
    hasHumor: false, isContradictionHunter: false, temperature: 0.7,
    thinkingBudget: 100,
  },
};

// --- MODEL DISPLAY NAMES ---
export const MODEL_DISPLAY_NAMES = {
  'gpt-4.1-mini': 'Lightning Fast',
  'gpt-5-mini': 'Universal Intelligence',
  'deepseek-chat': 'Deep Analysis',
};

// --- LABELS ---
export const archetypeLabels: Record<keyof ArchetypeMix, string> = {
  analyst: 'Analyst',
  synthesizer: 'Synthesizer',
  resonator: 'Resonator',
};

export const specializationLabels: Record<keyof SpecializationMix, string> = {
  'Product & Technologies': 'Product & Technologies',
  'Finance & Resources': 'Finance & Resources',
  'Marketing & Audience': 'Marketing & Audience',
  'Strategy & Market': 'Strategy & Market',
  'Ethics & Society': 'Ethics & Society',
  'Law & Risks': 'Law & Risks',
  'Generalist': 'Generalist',
};

export const characterLabels = {
  constructiveness: 'Constructiveness',
  conformism: 'Conformism',
  conviction: 'Conviction',
  opennessToData: 'Openness to data',
  temperature: 'Creativity (Temperature)'
};

export const characterDescriptions = {
  constructiveness: 'Low values = destructiveness, high values = constructiveness',
  conformism: 'Low values = nonconformism, high values = conformism',
  conviction: 'How strongly the expert defends their position',
  opennessToData: 'Willingness to change opinion based on new data',
  temperature: 'Low = predictability, high = wild ideas',
};

// --- EXPERT TEMPLATES ---
type ExpertTemplate = Partial<Omit<ExpertFormData, 'id' | 'name'>>;

export const expertTemplates: Record<string, { name: string, data: ExpertTemplate }> = {
  pedantic_analyst: {
    name: 'Pedantic Analyst',
    data: {
      model: 'gpt-4.1-mini',
      archetypeMix: { analyst: 80, synthesizer: 10, resonator: 10 },
      specializations: {
        'Product & Technologies': 30, 'Finance & Resources': 30, 'Marketing & Audience': 0,
        'Strategy & Market': 20, 'Ethics & Society': 0, 'Law & Risks': 20, 'Generalist': 0,
      },
      character: {
        constructiveness: 8, conformism: 3, conviction: 9, opennessToData: 9,
        hasHumor: false, isContradictionHunter: true, temperature: 0.3,
        thinkingBudget: 100,
      },
    }
  },
  creative_storm: {
    name: 'Creative Storm',
    data: {
      model: 'gpt-4.1-mini',
      archetypeMix: { analyst: 10, synthesizer: 80, resonator: 10 },
      specializations: {
        'Product & Technologies': 40, 'Finance & Resources': 0, 'Marketing & Audience': 50,
        'Strategy & Market': 10, 'Ethics & Society': 0, 'Law & Risks': 0, 'Generalist': 0,
      },
      character: {
        constructiveness: 7, conformism: 8, conviction: 4, opennessToData: 6,
        hasHumor: true, isContradictionHunter: false, temperature: 1.5,
        thinkingBudget: 100,
      },
    }
  },
  pragmatic_product_manager: {
    name: 'Pragmatic Prod. Manager',
    data: {
      model: 'gpt-4.1-mini',
      archetypeMix: { analyst: 50, synthesizer: 30, resonator: 20 },
      specializations: {
        'Product & Technologies': 50, 'Finance & Resources': 20, 'Marketing & Audience': 20,
        'Strategy & Market': 10, 'Ethics & Society': 0, 'Law & Risks': 0, 'Generalist': 0,
      },
      character: {
        constructiveness: 9, conformism: 6, conviction: 7, opennessToData: 8,
        hasHumor: false, isContradictionHunter: false, temperature: 0.7,
        thinkingBudget: 100,
      },
    }
  },
};

// --- HELPERS ---
export const clampSliderValue = <T extends Record<string, number>>(
  mix: T,
  key: keyof T,
  newVal: number,
): number => {
  const otherTotal = Object.entries(mix)
    .filter(([k]) => k !== key)
    .reduce((sum, [, v]) => sum + v, 0);
  const maxAllowed = Math.max(0, 100 - otherTotal);
  return Math.min(newVal, maxAllowed);
};

// --- NEW SANITIZER FUNCTION ---
// Accepts an object (like archetypeMix), cleans and normalizes it
export function sanitizeAndNormalizeMix(mix: Record<string, number>): Record<string, number> {
  const sanitizedMix: Record<string, number> = {};
  let total = 0;

  // 1. "Clip" all values to be in range 0-100
  for (const key in mix) {
    const value = mix[key] || 0;
    const clampedValue = Math.max(0, Math.min(100, value));
    sanitizedMix[key] = clampedValue;
    total += clampedValue;
  }

  if (total === 0) return sanitizedMix; // If all zeros, leave as is

  // 2. Normalize so sum is exactly 100
  const normalizationFactor = 100 / total;
  let normalizedTotal = 0;
  const keys = Object.keys(sanitizedMix);

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const normalizedValue = Math.round(sanitizedMix[key] * normalizationFactor);
    sanitizedMix[key] = normalizedValue;
    normalizedTotal += normalizedValue;
  }

  // 3. Add remainder to the last element to avoid rounding errors
  const lastKey = keys[keys.length - 1];
  sanitizedMix[lastKey] = 100 - normalizedTotal;

  return sanitizedMix;
}