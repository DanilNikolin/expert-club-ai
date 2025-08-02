// src/app/experts/_components/expert-constructor.logic.ts

// --- ТИПЫ ДАННЫХ ДЛЯ НАШЕГО ЭКСПЕРТА ---
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

// --- НАЧАЛЬНЫЕ ЗНАЧЕНИЯ ---
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

// --- ЛЕЙБЛЫ ---
export const archetypeLabels: Record<keyof ArchetypeMix, string> = {
  analyst: 'Аналитик',
  synthesizer: 'Синтезатор',
  resonator: 'Резонатор',
};

export const specializationLabels: Record<keyof SpecializationMix, string> = {
  'Product & Technologies': 'Продукт & Технологии',
  'Finance & Resources': 'Финансы & Ресурсы',
  'Marketing & Audience': 'Маркетинг & Аудитория',
  'Strategy & Market': 'Стратегия & Рынок',
  'Ethics & Society': 'Этика & Социум',
  'Law & Risks': 'Право & Риски',
  'Generalist': 'Широкий Профиль',
};

export const characterLabels = {
  constructiveness: 'Конструктивность',
  conformism: 'Конформизм',
  conviction: 'Убежденность',
  opennessToData: 'Открытость к данным',
  temperature: 'Креативность (Температура)'
};

export const characterDescriptions = {
  constructiveness: 'Низкие значения = деструктивность, высокие = конструктивность',
  conformism: 'Низкие значения = нонконформизм, высокие = конформизм',
  conviction: 'Насколько сильно эксперт отстаивает свою позицию',
  opennessToData: 'Готовность изменить мнение на основе новых данных',
  temperature: 'Низкие = предсказуемость, высокие = безумные идеи',
};

// --- ШАБЛОНЫ ЭКСПЕРТОВ ---
type ExpertTemplate = Partial<Omit<ExpertFormData, 'id' | 'name'>>;

export const expertTemplates: Record<string, { name: string, data: ExpertTemplate }> = {
  pedantic_analyst: {
    name: 'Душнила-Аналитик',
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
    name: 'Креативный Шторм',
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
    name: 'Прагматичный Продакт',
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

// --- ХЕЛПЕРЫ ---
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

// --- НОВАЯ ФУНКЦИЯ-САНИТАЙЗЕР ---
// Принимает объект (вроде archetypeMix), чистит и нормализует его
export function sanitizeAndNormalizeMix(mix: Record<string, number>): Record<string, number> {
  const sanitizedMix: Record<string, number> = {};
  let total = 0;

  // 1. "Стрижем" все значения, чтобы они были в диапазоне 0-100
  for (const key in mix) {
    const value = mix[key] || 0;
    const clampedValue = Math.max(0, Math.min(100, value));
    sanitizedMix[key] = clampedValue;
    total += clampedValue;
  }

  if (total === 0) return sanitizedMix; // Если все нули, оставляем как есть

  // 2. Нормализуем, чтобы сумма была ровно 100
  const normalizationFactor = 100 / total;
  let normalizedTotal = 0;
  const keys = Object.keys(sanitizedMix);

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const normalizedValue = Math.round(sanitizedMix[key] * normalizationFactor);
    sanitizedMix[key] = normalizedValue;
    normalizedTotal += normalizedValue;
  }

  // 3. Остаток кидаем на последний элемент, чтобы избежать ошибок округления
  const lastKey = keys[keys.length - 1];
  sanitizedMix[lastKey] = 100 - normalizedTotal;

  return sanitizedMix;
}