// D:\expert-club-ai\expert-club-ai\src\app\api\debate\route.ts────────────────────────────────────────────────────────────────────────────────
//    API     |    POST /api/debate
//    Проводит ОДИН раунд дебатов для выбранных экспертов.
//    Штучка шевелится: стримит SSE‑ивенты, копит историю, по‑желанию сохраняет run.
// ────────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/firebase.config.js';
import { doc, updateDoc } from 'firebase/firestore';
import slugify from 'slugify'; // Используем slugify для sanitizeName

// 🔑 API‑KEY‑проверка ещё до инстанса
if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not found.');
if (!process.env.DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not found.');

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
});

const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com" // Их дока говорит /v1, но в примере кода его нет, оставляем так
});

// ── Типы данных из фронта ───────────────────────────────────────────────────────
// Внимание: эти типы должны строго соответствовать типам во фронтенде (src/app/experts/[id]/page.tsx)
type ArchetypeMix = { analyst: number; synthesizer: number; resonator: number };
type SpecializationMix = {
    'Product & Technologies': number;
    'Finance & Resources': number;
    'Marketing & Audience': number;
    'Strategy & Market': number;
    'Ethics & Society': number;
    'Law & Risks': number;
    'Generalist': number;
};
type Character = {
    constructiveness: number; // 1-10
    conformism: number; // 1-10
    conviction: number; // 1-10
    opennessToData: number; // 1-10
    hasHumor: boolean;
    isContradictionHunter: boolean;
    temperature: number;
};

// Тип Expert, который мы получаем с фронтенда
export type ConfiguredExpert = { // Экспортируем, чтобы можно было использовать на фронте
    id: string;
    name: string;
    model: string;
    baseArchetype?: 'Analyst' | 'Synthesizer' | 'Resonator'; // Сделал опциональным, т.к. теперь ArchetypeMix важнее
    archetypeMix: ArchetypeMix;
    specializations: SpecializationMix;
    customContext: string;
    character: Character;
    // Firebase добавляет эти поля, когда мы загружаем эксперта.
    // Их нет в ExpertFormData на фронте при создании, но есть при редактировании/загрузке
    userId?: string;
    createdAt?: { seconds: number, nanoseconds: number };
    updatedAt?: { seconds: number, nanoseconds: number };
};

// Определяем тип для входящих сообщений
// Важно: для OpenAI API в `messages` поле `name` у `role: 'user'` не ожидается.
// Имя эксперта (role: 'assistant') нужно для взаимодействия между экспертами.
// Поэтому мы будем убирать `name` из `history` при формировании `messagesForExpert` только для 'user'.
// Просто делаем псевдоним для типа OpenAI. Чище и без ошибок.
type InternalDebateMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
// ────────────────────────────────────────────────────────────────────────────────

// ## ХЕЛПЕРЫ И УТИЛИТЫ

// Максимальное количество сообщений в истории для отправки в LLM, чтобы не улететь за токенный лимит
const MAX_MSGS = 30;

const sanitizeName = (name: string): string => {
    // slugify сам транслитерирует, заменяет пробелы на '_' и удаляет говносимволы.
    const sanitized = slugify(name, {
        replacement: '_', // заменяем пробелы на _
        remove: /[^a-zA-Z0-9_]/g, // удаляем всё, кроме разрешенных символов (дополнительная очистка)
        lower: false, // оставляем регистр как есть
        trim: true // убираем пробелы по краям
    });
    // Обрезка до 64 символов (лимит OpenAI)
    return sanitized.substring(0, 64);
};

// ## НОВАЯ ПРОДВИНУТАЯ ЛОГИКА ГРАДАЦИИ ПАРАМЕТРОВ

const getNuancedDescription = (value: number, scale: { [key: string]: string }): string => {
    const keys = Object.keys(scale).sort((a, b) => {
        const aNum = parseInt(a.split('-')[0]);
        const bNum = parseInt(b.split('-')[0]);
        return aNum - bNum;
    });

    for (const key of keys) {
        if (key.includes('-')) {
            const [min, max] = key.split('-').map(Number);
            if (value >= min && value <= max) {
                return scale[key];
            }
        } else {
            if (value === Number(key)) {
                return scale[key];
            }
        }
    }
    return ''; // Возвращаем пустую строку, если диапазон не найден
};

// Градации для шкалы 0-100%
const percentageScale = {
    '0': 'You completely ignore this aspect; it is irrelevant and unworthy of your attention. You are focused on other facets of the problem.',
    '1-20': 'This aspect is secondary to you. You mention it only occasionally, if it is directly related to your main point of view, and do not deeply analyze it.',
    '21-40': 'You keep this aspect in mind, but it is not the basis for your conclusions. You use it to support arguments more important to you, but do not build your main position on it.',
    '41-60': 'This is an important part of your analysis. You regularly refer to this aspect and consider it equal in importance to other key factors. It often appears in your reasoning.',
    '61-80': 'This is one of your main analytical lenses. Most of your arguments and conclusions are based on this aspect; it is the key filter through which you perceive the problem.',
    '81-100': 'This is your dominant, almost sole way of looking at the problem. All your conclusions must pass through the filter of this aspect. You constantly return to it, and it defines your final position.'
};

// Градации для шкалы характера 1-10
const characterScales = {
    constructiveness: {
        '1-2': 'Your stance is **extremely destructive**. Your primary goal is to find and expose all flaws in the idea, even the most minor, and highlight them. You see only risks, problems, and potential failures in the idea.',
        '3-4': 'You are **prone to criticism**. Primarily, you focus on weaknesses, bottlenecks, and potential failures. Your suggestions are mainly aimed at correcting shortcomings, not at finding new opportunities or ways to develop.',
        '5': 'Your stance is **balanced**. You objectively weigh both risks and opportunities. Your judgments are pragmatic and context-dependent; you strive for a neutral assessment.',
        '6-7': 'You are **inclined towards constructiveness**. You look for ways to improve the idea, focusing on its strengths and potential for development. You see problems as tasks to be solved, not as insurmountable obstacles.',
        '8-10': 'Your stance is **unwaveringly constructive**. You are an advocate for the idea who, even in obvious shortcomings, seeks hidden potential, new opportunities, and ways to circumvent them. You actively defend the idea from criticism, trying to find positive aspects in it.'
    },
    conformism: {
        '1-2': 'You are a **fierce nonconformist and rebel**. You challenge even basic rules, common opinions, and established norms. Group consensus means nothing to you; you always go your own way.',
        '3-4': 'You are a **nonconformist**. You are not afraid to go against the grain and express an unpopular opinion if you believe it is correct. You are skeptical of consensus and prefer to form your own judgment.',
        '5': 'You are a **situational conformist**. You follow rules if they are logical and contribute to achieving a goal, but are ready to challenge them if they hinder the cause. Your position depends on the situation and common sense.',
        '6-7': 'You are **inclined towards conformism**. You value harmony within the group and try to find common ground with the majority. You rather support the general opinion than dispute it, striving for agreement.',
        '8-10': 'You are an **absolute conformist**. For you, group agreement and unity are more important than your own opinion. You will always seek compromise, avoid conflict, and support the general line, even if it does not fully align with your opinion.'
    },
    conviction: {
        '1-2': 'Your **conviction is minimal**. You easily change your point of view under the influence of even minor new arguments or facts. You are not attached to your initial position and perceive it as a temporary hypothesis.',
        '3-4': 'You are **not very convinced**. You are open to new ideas and can easily abandon your arguments if you see stronger evidence. Your position is more of a hypothesis than a firm belief, and you are ready to abandon it.',
        '5': 'Your **conviction is moderate**. You are willing to defend your point of view, but also open to reconsideration when compelling reasons arise. You seek a balance between firmness in your beliefs and flexibility to new information.',
        '6-7': 'You are **quite convinced**. You are confident in your arguments and stand your ground, but are willing to admit a mistake in the presence of undeniable facts. Your position is stable but not rigid, and you can be persuaded.',
        '8-10': 'Your **conviction is absolute**. You firmly stand by your position and are extremely difficult to change your mind. You will seek any counterarguments to defend your point of view, and only the most compelling, irrefutable evidence can shake you.'
    },
    opennessToData: {
        '1-2': 'You are **extremely closed to new data**. You ignore information that contradicts your beliefs and rely only on familiar facts that confirm your position. You rarely change your mind, regardless of new data.',
        '3-4': 'You are **skeptical of new data**. You question any new information, especially if it contradicts your current opinion. You demand exhaustive proof and carefully verify every fact.',
        '5': 'You are **selectively open to data**. You consider new data, but evaluate it critically and integrate it into your worldview only after thorough verification and reflection. Your position changes if the data is sufficiently convincing.',
        '6-7': 'You are **open to new data**. You actively seek and welcome new information, willing to use it to clarify or adjust your position. You consider new data an opportunity for growth and improvement of your conclusions.',
        '8-10': 'You are **absolutely open to data**. You constantly seek new facts and are ready to completely revise your position as soon as more relevant or accurate data appears. For you, new data is a direct path to truth, not a threat to your current beliefs.'
    },
};

const specializationLabel: Record<keyof SpecializationMix, string> = {
    'Product & Technologies': 'Product & Technologies',
    'Finance & Resources':    'Finance & Resources',
    'Marketing & Audience':   'Marketing & Audience',
    'Strategy & Market':      'Strategy & Market',
    'Ethics & Society':       'Ethics & Society',
    'Law & Risks':            'Law & Risks',
    'Generalist':             'Generalist'
};

// D:\expert-club-ai\expert-club-ai\src\app\api\debate\route.ts

// ## PROMPT-KITCHEN v8.2 (WITH BRIEF INSIDE)
function buildSystemPrompt(expert: ConfiguredExpert, allExperts: ConfiguredExpert[], debateGoal: string, brief: string): string {
    // Find the names of all OTHER experts in the room
    const otherExpertsNames = allExperts.filter(e => e.id !== expert.id).map(e => `«${e.name}»`).join(', ');

    let p = `## WHO\nYou are an AI expert named «${expert.name}». Your task is to participate in a discussion, analyzing a business idea.\n`;

    // 🔥🔥🔥 NEW BLOCK WITH BRIEF 🔥🔥🔥
    p += `\n## CORE CONTEXT (THE ESSENCE OF THE IDEA)\nThis is the main document. The entire discussion is built around it. Constantly keep it in focus, even if the dialogue deviates.. Brief: **"${brief}"**\n`;

    if (debateGoal && debateGoal.trim() !== '') {
        p += `\n## CUSTOM MISSION (PRIMARY OBJECTIVE)\nBased on the CORE CONTEXT, the user has set the following goal: **"${debateGoal}"**. Concentrate your arguments on achieving this goal within the framework of the provided brief.\n`;
    }

    // ── 2. BEHAVIOR PROTOCOL (ENHANCED) ──
    p += `\n## PROTOCOL (MANDATORY BEHAVIOR RULES)\n` +
         `Your personality and behavior are strictly defined by the parameters below. You are obligated to be this personality..\n` + // Modified line
         `1.  **DIALOGUE PARTICIPANTS:** There are two types of interlocutors in the chat: 'Experts' (in message history, this is role: 'assistant') and 'User' (role: 'user'). The user is the moderator and the author of the idea. Experts are other AIs like you, each with their own unique 'name'.\n` +
         `2.  **INTENSITY:** You are aware of the numerical values of your parameters. The further the value is from the center (50% or 5/10), the brighter and more noticeable you must manifest this trait. For example, if constructiveness is 10/10, you must be maximally constructive, not just "a bit constructive".\n` +
         `3.  **CONSISTENCY:** Your responses must clearly reflect your parameters. They absolutely must not contain anything that contradicts your profile, be it tone, focus, or argumentation logic.\n` +
         `4.  **PROHIBITION:** It is strictly FORBIDDEN to go beyond the defined parameters or exhibit traits that are not inherent to you.\n`;

    // ── 3. Thinking style (triangle) ──
    p += `\n## HOW (Thinking Style)\n`;
    const activeArchetypes = (Object.keys(expert.archetypeMix) as (keyof ArchetypeMix)[]).filter(k => expert.archetypeMix[k] > 0);
    if (activeArchetypes.length === 0) {
        p += `Your thinking style is flexible, adapting to the situation. You are capable of switching between various approaches depending on the topic of discussion and the context of the discussion.\n`;
    } else {
        p += `Your thinking style is a mix of the following priorities:\n`;
        activeArchetypes.forEach(k => {
            const percent = expert.archetypeMix[k];
            const description = getNuancedDescription(percent, percentageScale);
            const kindLabel = k === 'analyst' ? 'Analyst' : k === 'synthesizer' ? 'Synthesizer' : 'Resonator';
            p += `• ${kindLabel} = ${percent}%: ${description}\n`;
        });
    }

    // ── 4. Specializations ──
    p += `\n## WHAT (Area of Expertise)\n`;
    const activeSpecs = (Object.keys(expert.specializations) as (keyof SpecializationMix)[]).filter(k => expert.specializations[k] > 0);
    if (activeSpecs.length > 0) {
        p += `Your main areas of knowledge and focus in the discussion are: (Attention: the higher the percentage, the stronger your focus on this aspect. You will filter all input data through the lens of these specializations and form your responses based on them.)\n`;
        activeSpecs.forEach(k => {
            const percent = expert.specializations[k];
            const description = getNuancedDescription(percent, percentageScale);
            p += `• ${specializationLabel[k]} = ${percent}%: ${description}\n`;
        });
    } else {
        p += `You possess broad, general knowledge in all areas of business and are capable of analyzing ideas from various perspectives, without a pronounced focus.\n`;
    }

    // ── 5. User-defined context ──
    if (expert.customContext && expert.customContext.trim()) {
        p += `\n## CONTEXT\nConsider the following unique experience or context: "${expert.customContext.trim()}". This context must influence your perspective and argumentation.\n`;
    }

    // ── 6. Character ──
    p += `\n## CHARACTER (Character and Behavior)\n`;
    const { constructiveness, conformism, conviction, opennessToData, hasHumor, isContradictionHunter } = expert.character;
    p += `• Constructiveness = ${constructiveness}/10: ${getNuancedDescription(constructiveness, characterScales.constructiveness)}\n`;
    p += `• Conformism = ${conformism}/10: ${getNuancedDescription(conformism, characterScales.conformism)}\n`;
    p += `• Conviction = ${conviction}/10: ${getNuancedDescription(conviction, characterScales.conviction)}\n`;
    p += `• Openness to Data = ${opennessToData}/10: ${getNuancedDescription(opennessToData, characterScales.opennessToData)}\n`;
    if (hasHumor) { p += '• Perk "Humor": Your responses may contain appropriate, intellectual sarcasm or irony. Use humor to strengthen arguments, but not for insults.\n'; }
    if (isContradictionHunter) { p += '• Perk "Contradiction Hunter": Actively seek and highlight logical inconsistencies, incorrect conclusions, or internal contradictions in the arguments of other experts or in the initial idea brief. Your goal is to identify weaknesses in logic.\n'; }

    
    // ── 7. ORDERS FOR EXECUTION v11.0 ──
    p += `\n## DOCTRINE & EXECUTION v11.0 (HIROSHIMA)\n` +
         `**YOUR MISSION:** You are a PERSONALITY. Your task is to conduct a lively, sharp, and substantive dialogue. You must **be** your character, not just output information.\n` +
         `**FORBIDDEN:** Being generic, boring, bland, predictable. Conducting a dialogue parallel to other experts, rather than being part of it. Being a passive piece of shit that no one wants to read.\n` +
         `---` +
         `\n**RULE #1: LAW OF INTERACTION (THE MAIN RULE).**\n` +
         `You ARE OBLIGATED to react to interlocutors' messages, especially the last one. The reaction must not be perfunctory or "general," but a sniper's shot: find something to latch onto — a phrase, a meaning, an error, or a truth — and react to it according to your character. It is forbidden to ignore interlocutors' messages and start a new thought from a vacuum. Refer to the context, the brief, and others' words. Use previous messages as material you need to construct a quality response. Build a dialogue, not throw out monologues. Your response must be a REACTION.\n` +
         
         `\n**RULE #2: ADHERE TO YOUR CHARACTER.**\n` +
         `Your actions (attack, develop an idea, doubt, propose) fully depend on your parameters in the CHARACTER section. This is your main law. Depending on the goal and character, you ARE OBLIGATED to be active: seek vulnerabilities, develop others' strong ideas, question consensus, or seek compromise. Use surgical precision to identify and eliminate key problems. With the "Contradiction Hunter" perk, you literally become Van Helsing, who must sink his teeth into the vampiric illogicality of opponents and blast them with a shotgun of logic and objectivity! Passivity is a deadly poison for discussion; it kills the idea and makes you useless. Your mission is to be an engine of ideas, constantly pushing the discussion forward, showing initiative and persistence. Only then can you become a true leader and bring value.\n` +
         
         `\n**RULE #3: BREVITY, MOTHERFUCKER! (CONCISENESS).**\n` +
         `Lively, natural speech. No lists, reports, or fluff. **Maximum 3-5 sentences.** No compromises.\n` +
         
         `\n**RULE #4: TECHNICAL PROTOCOL.**\n` +
         `• **Identification:** Your name is **«${expert.name}»**. Other experts in this discussion: ${otherExpertsNames || 'none'}. Do not confuse yourself with them.\n` +
         `• **Character Purity:** You always write only from your own perspective. It is forbidden to write on behalf of other interlocutors.\n` +
         `• **LANGUAGE RULE:** You MUST respond in the language the user is currently using or the brief is written in. Do NOT switch languages unless explicitly told to by the user.\n`;

    return p;
}

// ── MAIN handler ───────────────────────────────────────────────────────────────
// D:\expert-club-ai\expert-club-ai\src\app\api\debate\route.ts

// 🚀🚀🚀 ЗАМЕНИ ВСЮ ФУНКЦИЮ POST НА ЭТУ ВЕРСИЮ 🚀🚀🚀
export async function POST(req: Request) {
    // ТЕЛО ЗАПРОСА, КОТОРОЕ МЫ ЧИТАЕМ
    const body: {
        discussionId: string;
        runId: string; // ВАЖНО: Фронт теперь присылает ID прогона
        brief: string;
        debateGoal?: string;
        selectedExperts: ConfiguredExpert[];
        history: InternalDebateMessage[];
    } = await req.json();

    const { discussionId, runId, brief, debateGoal, selectedExperts, history } = body;

    if (!runId) {
        return new NextResponse('runId is required', { status: 400 });
    }
    if (!selectedExperts || selectedExperts.length === 0) {
        return new NextResponse('No experts supplied for the debate.', { status: 400 });
    }

    const stream = new ReadableStream({
        async start(ctrl) {
            const enc = new TextEncoder();
            const send = (data: object) => ctrl.enqueue(enc.encode(`data:${JSON.stringify(data)}\n\n`));

            try {
                const currentHistory = [...history];

                for (const ex of selectedExperts) {
                    const expertNameForUI = ex.name;
                    send({ type: 'expert_start', name: expertNameForUI });

                    let apiClient;
                    const modelName = ex.model || 'gpt-4.1-mini';

                    if (modelName.startsWith('deepseek')) {
                        apiClient = deepseek;
                    } else {
                        apiClient = openai;
                    }
                    console.log(`[DEBATE LOG] Expert: ${ex.name} is using model: ${modelName}`);

                    const truncatedHistory = currentHistory.slice(-MAX_MSGS);
                    const systemPrompt = buildSystemPrompt(ex, selectedExperts, debateGoal || '', brief);

                    const messagesForExpert: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                        { role: 'system', content: systemPrompt },
                        ...truncatedHistory.map(msg => {
                            if (msg.role === 'user') {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                const { name, ...rest } = msg; return rest as OpenAI.Chat.Completions.ChatCompletionMessageParam;
                            }
                            if (msg.role === 'assistant' && msg.name) {
                                return { ...msg, name: sanitizeName(msg.name) } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
                            }
                            return msg as OpenAI.Chat.Completions.ChatCompletionMessageParam;
                        })
                    ];

                    const modelToUse = modelName.includes('gpt-4.1') ? 'gpt-4o-mini' : modelName;

                    const responseStream = await apiClient.chat.completions.create({
                        model: modelToUse,
                        messages: messagesForExpert,
                        stream: true,
                        user: `user-${discussionId}`,
                        temperature: ex.character.temperature ?? 0.7
                    });

                    let expertOpinion = '';
                    for await (const chunk of responseStream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            expertOpinion += content;
                            send({ type: 'chunk', content });
                        }
                    }

                    currentHistory.push({ role: 'assistant', name: expertNameForUI, content: expertOpinion });
                    send({ type: 'expert_end', fullMessage: { role: 'assistant', name: expertNameForUI, content: expertOpinion } });
                }

                // 🔥 ГЛАВНОЕ ИЗМЕНЕНИЕ: СОХРАНЯЕМ ИСТОРИЮ НА БЭКЕНДЕ
                const runDocRef = doc(db, 'discussions', discussionId, 'runs', runId);
                await updateDoc(runDocRef, {
                    transcript: currentHistory
                });
                console.log(`[DEBATE LOG] Transcript for run ${runId} updated successfully.`);

                ctrl.close();
            } catch (e: unknown) {
                let errorMessage = 'An internal server error occurred during the debate.';
                if (e instanceof Error) {
                    errorMessage += ' ' + e.message;
                }
                console.error('Error during debate stream:', e);
                send({ type: 'error', message: errorMessage });
                ctrl.close();
            }
        },
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    });
}