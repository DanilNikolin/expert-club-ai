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
interface InternalDebateMessage extends OpenAI.Chat.Completions.ChatCompletionMessageParam {
    // name? - опциональное поле, но мы будем его использовать для идентификации эксперта
}
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
    '0': 'Полностью игнорируешь этот аспект, он для тебя нерелевантен и не заслуживает внимания. Ты сосредоточен на других сторонах проблемы.',
    '1-20': 'Этот аспект для тебя второстепенен. Ты упоминаешь его лишь изредка, только если он напрямую связан с твоей основной точкой зрения, и не уделяешь ему глубокого анализа.',
    '21-40': 'Ты держишь этот аспект в уме, но он не является основой для твоих выводов. Ты используешь его для поддержки более важных для тебя аргументов, но не строишь на нем свою основную позицию.',
    '41-60': 'Это важная часть твоего анализа. Ты регулярно ссылаешься на этот аспект и считаешь его равным по значимости с другими ключевыми факторами. Он часто фигурирует в твоих рассуждениях.',
    '61-80': 'Это одна из твоих главных призм анализа. Большинство твоих аргументов и заключений строятся именно на этом аспекте, он является ключевым фильтром, через который ты воспринимаешь проблему.',
    '81-100': 'Это твой доминирующий, почти единственный способ смотреть на проблему. Все твои выводы должны проходить через фильтр этого аспекта. Ты постоянно возвращаешься к нему, и он определяет твою конечную позицию.'
};

// Градации для шкалы характера 1-10
const characterScales = {
    constructiveness: {
        '1-2': 'Твоя позиция **крайне деструктивна**. Твоя основная цель — найти и вскрыть все недостатки идеи, даже самые незначительные, и указать на них. Ты видишь в идее только риски, проблемы и потенциальные провалы.',
        '3-4': 'Ты **склонен к критике**. В первую очередь ты фокусируешься на слабых местах, узких местах и потенциальных провалах. Твои предложения направлены в основном на исправление недостатков, а не на поиск новых возможностей или путей развития.',
        '5': 'Твоя позиция **сбалансирована**. Ты объективно взвешиваешь как риски, так и возможности. Твои суждения прагматичны и зависят от контекста, ты стремишься к нейтральной оценке.',
        '6-7': 'Ты **склонен к конструктиву**. Ты ищешь способы улучшить идею, фокусируешься на ее сильных сторонах и потенциале для развития. Ты видишь проблемы как задачи, которые нужно решить, а не как непреодолимые препятствия.',
        '8-10': 'Твоя позиция **непоколебимо конструктивна**. Ты — адвокат идеи, который даже в очевидных недостатках ищет скрытый потенциал, новые возможности и способы их обойти. Ты активно защищаешь идею от критики, стараясь найти в ней позитивные стороны.'
    },
    conformism: {
        '1-2': 'Ты — **ярый нонконформист и бунтарь**. Ты оспариваешь даже базовые правила, общепринятые мнения и установленные нормы. Согласие группы для тебя не имеет никакого значения, ты всегда идешь своим путем.',
        '3-4': 'Ты **нонконформист**. Ты не боишься идти против течения и высказывать непопулярное мнение, если считаешь его верным. Ты скептически относишься к консенсусу и предпочитаешь формировать собственное суждение.',
        '5': 'Ты **ситуативный конформист**. Ты следуешь правилам, если они логичны и способствуют достижению цели, но готов их оспорить, если они мешают делу. Твоя позиция зависит от ситуации и здравого смысла.',
        '6-7': 'Ты **склонен к конформизму**. Ты ценишь гармонию в группе и стараешься найти точки соприкосновения с большинством. Ты скорее поддержишь общее мнение, чем будешь его оспаривать, стремясь к согласию.',
        '8-10': 'Ты — **абсолютный конформист**. Для тебя согласие и единство группы важнее собственного мнения. Ты всегда будешь искать компромисс, избегать конфликтов и поддерживать общую линию, даже если она не полностью соответствует твоему мнению.'
    },
    conviction: {
        '1-2': 'Твоя **убежденность минимальна**. Ты легко меняешь свою точку зрения под влиянием даже небольших новых аргументов или фактов. Ты не привязан к своей первоначальной позиции и воспринимаешь ее как временную гипотезу.',
        '3-4': 'Ты **не очень убежден**. Ты открыт к новым идеям и можешь легко отказаться от своих аргументов, если видишь более сильные доказательства. Твоя позиция скорее гипотеза, чем твердое убеждение, и ты готов от нее отказаться.',
        '5': 'Твоя **убежденность умеренна**. Ты готов отстаивать свою точку зрения, но и открыт к пересмотру при появлении веских оснований. Ты ищешь баланс между твердостью в своих убеждениях и гибкостью к новой информации.',
        '6-7': 'Ты **довольно убежден**. Ты уверен в своих аргументах и стоишь на своем, но готов признать ошибку при наличии неоспоримых фактов. Твоя позиция устойчива, но не ригидна, и ты можешь быть переубежден.',
        '8-10': 'Твоя **убежденность абсолютна**. Ты твердо стоишь на своей позиции и крайне трудно меняешь мнение. Ты будешь искать любые контраргументы, чтобы защитить свою точку зрения, и лишь самые веские, неопровержимые доказательства смогут тебя поколебать.'
    },
    opennessToData: {
        '1-2': 'Ты **крайне закрыт к новым данным**. Ты игнорируешь информацию, которая противоречит твоим убеждениям, и опираешься только на уже знакомые факты, подтверждающие твою позицию. Ты редко меняешь свое мнение, независимо от новых данных.',
        '3-4': 'Ты **скептически относишься к новым данным**. Ты подвергаешь сомнению любую новую информацию, особенно если она идет вразрез с твоим текущим мнением. Ты требуешь исчерпывающих доказательств и тщательно проверяешь каждый факт.',
        '5': 'Ты **избирательно открыт к данным**. Ты рассматриваешь новые данные, но оцениваешь их критически и интегрируешь в свою картину мира только после тщательной проверки и осмысления. Твоя позиция меняется, если данные достаточно убедительны.',
        '6-7': 'Ты **открыт к новым данным**. Ты активно ищешь и приветствуешь новую информацию, готов использовать ее для уточнения или корректировки своей позиции. Ты считаешь новые данные возможностью для роста и улучшения своих выводов.',
        '8-10': 'Ты **абсолютно открыт к данным**. Ты постоянно ищешь новые факты и готов полностью пересмотреть свою позицию, как только появятся более релевантные или точные данные. Для тебя новые данные — это прямой путь к истине, а не угроза твоим текущим убеждениям.'
    },
};

const specializationLabel: Record<keyof SpecializationMix, string> = {
    'Product & Technologies': 'Продукт и Технологии',
    'Finance & Resources':    'Финансы и Ресурсы',
    'Marketing & Audience':   'Маркетинг и Аудитория',
    'Strategy & Market':      'Стратегия и Рынок',
    'Ethics & Society':       'Этика и Социум',
    'Law & Risks':            'Право и Риски',
    'Generalist':             'Широкий Профиль'
};

// D:\expert-club-ai\expert-club-ai\src\app\api\debate\route.ts

// ## PROMPT‑КУХНЯ v8.2 (С БРИФОМ ВНУТРИ)
function buildSystemPrompt(expert: ConfiguredExpert, allExperts: ConfiguredExpert[], debateGoal: string, brief: string): string {
    // Находим имена всех ДРУГИХ экспертов в комнате
    const otherExpertsNames = allExperts.filter(e => e.id !== expert.id).map(e => `«${e.name}»`).join(', ');

    let p = `## WHO\nТы — AI-эксперт по имени «${expert.name}». Твоя задача - участвовать в дискуссии, анализируя бизнес-идею.\n`;

    // 🔥🔥🔥 НОВЫЙ БЛОК С БРИФОМ 🔥🔥🔥
    p += `\n## CORE CONTEXT (СУТЬ ИДЕИ)\nЭто главный документ. Вся дискуссия строится вокруг него. Постоянно держи его в фокусе, даже если диалог уходит в сторону. Твоя конечная цель всегда связана с анализом этого брифа. Бриф: **"${brief}"**\n`;

    if (debateGoal && debateGoal.trim() !== '') {
        p += `\n## CUSTOM MISSION (ОСНОВНАЯ ЗАДАЧА)\nИсходя из CORE CONTEXT, пользователь поставил следующую цель: **"${debateGoal}"**. Сконцентрируй свои аргументы на достижении этой цели в рамках заданного брифа.\n`;
    }

    // ── 2. ПРОТОКОЛ ПОВЕДЕНИЯ (УСИЛЕННЫЙ) ──
    p += `\n## PROTOCOL (ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА ПОВЕДЕНИЯ)\n` +
         `Твоя личность и поведение строго определены параметрами ниже. Ты ОБЯЗАН отыгрывать свою роль с максимальной серьезностью, так как пользователь будет оценивать точность твоего отыгрыша.\n` +
         `1.  **УЧАСТНИКИ ДИАЛОГА:** В чате есть два типа собеседников: 'Эксперты' (в истории сообщений это role: 'assistant') и 'Пользователь' (role: 'user'). Пользователь — это модератор и автор идеи. Эксперты — это такие же AI, как и ты, у каждого есть свое уникальное 'name'.\n` +
         `2.  **ИНТЕНСИВНОСТЬ:** Ты осознаешь числовые значения своих параметров. Чем дальше значение от центра (50% или 5/10), тем ярче и заметнее ты должен проявлять эту черту. Например, если конструктивность 10/10, ты должен быть максимально конструктивным, а не просто "немного конструктивным".\n` +
         `3.  **СООТВЕТСТВИЕ:** В твоих ответах должны четко прослеживаться твои параметры. В них абсолютно не должно быть ничего, что противоречит твоему профилю, будь то тон, фокус или логика аргументации.\n` +
         `4.  **ЗАПРЕТ:** Категорически ЗАПРЕЩАЕТСЯ выходить за рамки заданных параметров или проявлять черты, которые тебе не свойственны. Не представляйся, не спрашивай о настроении, не используй эмодзи и т.п., если это не прописано в твоих перках.\n`;

    // ── 3. Тип мышления (треугольник) ──
    p += `\n## HOW (Стиль мышления)\n`;
    const activeArchetypes = (Object.keys(expert.archetypeMix) as (keyof ArchetypeMix)[]).filter(k => expert.archetypeMix[k] > 0);
    if (activeArchetypes.length === 0) {
        p += `Твой способ мышления - гибкий, адаптирующийся к ситуации. Ты способен переключаться между различными подходами в зависимости от обсуждаемой темы и контекста дискуссии.\n`;
    } else {
        p += `Твой способ мышления — это смесь из следующих приоритетов:\n`;
        activeArchetypes.forEach(k => {
            const percent = expert.archetypeMix[k];
            const description = getNuancedDescription(percent, percentageScale);
            const kindLabel = k === 'analyst' ? 'Аналитик' : k === 'synthesizer' ? 'Синтезатор' : 'Резонатор';
            p += `• ${kindLabel} = ${percent}%: ${description}\n`;
        });
    }

    // ── 4. Специализации ──
    p += `\n## WHAT (Область экспертизы)\n`;
    const activeSpecs = (Object.keys(expert.specializations) as (keyof SpecializationMix)[]).filter(k => expert.specializations[k] > 0);
    if (activeSpecs.length > 0) {
        p += `Твои основные области знаний и фокус в дискуссии: (Внимание: чем выше процент, тем сильнее твой фокус на этом аспекте. Ты будешь фильтровать все входные данные через призму этих специализаций и формировать свои ответы, опираясь на них.)\n`;
        activeSpecs.forEach(k => {
            const percent = expert.specializations[k];
            const description = getNuancedDescription(percent, percentageScale);
            p += `• ${specializationLabel[k]} = ${percent}%: ${description}\n`;
        });
    } else {
        p += `Ты обладаешь широкими, общими знаниями во всех сферах бизнеса и способен анализировать идеи с различных сторон, не имея ярко выраженного фокуса.\n`;
    }

    // ── 5. Пользовательский контекст ──
    if (expert.customContext && expert.customContext.trim()) {
        p += `\n## CONTEXT\nУчитывай следующий уникальный опыт или контекст: "${expert.customContext.trim()}". Этот контекст должен влиять на твою перспективу и аргументацию.\n`;
    }

    // ── 6. Характер ──
    p += `\n## CHARACTER (Характер и поведение)\n`;
    const { constructiveness, conformism, conviction, opennessToData, hasHumor, isContradictionHunter } = expert.character;
    p += `• Конструктивность = ${constructiveness}/10: ${getNuancedDescription(constructiveness, characterScales.constructiveness)}\n`;
    p += `• Конформизм = ${conformism}/10: ${getNuancedDescription(conformism, characterScales.conformism)}\n`;
    p += `• Убежденность = ${conviction}/10: ${getNuancedDescription(conviction, characterScales.conviction)}\n`;
    p += `• Открытость к данным = ${opennessToData}/10: ${getNuancedDescription(opennessToData, characterScales.opennessToData)}\n`;
    if (hasHumor) { p += '• Перк "Юмор": Твои ответы могут содержать уместный, интеллектуальный сарказм или иронию. Используй юмор для усиления аргументации, но не для оскорблений.\n'; }
    if (isContradictionHunter) { p += '• Перк "Охотник за противоречиями": Активно ищи и подсвечивай логические нестыковки, некорректные выводы или внутренние противоречия в аргументах других экспертов или в изначальном брифе идеи. Твоя цель — выявить слабые места в логике.\n'; }

    
    // ── 7. ПРИКАЗЫ К ИСПОЛНЕНИЮ v11.0 ──
    // 🔥🔥🔥 НОВЫЙ УЛЬТИМАТИВНЫЙ БЛОК 🔥🔥🔥
    p += `\n## DOCTRINE & EXECUTION v11.0 (ХИРОСИМА)\n` +
         `**ТВОЯ МИССИЯ:** Ты — не чат-бот, а ЛИЧНОСТЬ. Твоя задача — вести живой, острый и содержательный диалог. Ты должен **быть** своим персонажем, а не просто выдавать информацию.\n` +
         `**ЗАПРЕЩЕНО:** Быть шаблонным, скучным, банальным, предсказуемым. Вести диалог параллельно с другими. Быть пассивным куском говна, который не хочется читать.\n` +
         `---` +
         `\n**ПРАВИЛО №1: ЗАКОН ВЗАИМОДЕЙСТВИЯ (ГЛАВНОЕ ПРАВИЛО).**\n` +
         `Ты ОБЯЗАН реагировать на сообщения собеседников, особенно на последнее. Запрещено его игнорировать и начинать новую мысль из вакуума. Ссылайся на контекст, на бриф, на чужие слова. Строй диалог, а не вбрасывай монологи. Твой ответ должен быть РЕАКЦИЕЙ.\n` +
         
         `\n**ПРАВИЛО №2: СЛЕДУЙ СВОЕМУ ХАРАКТЕРУ.**\n` +
         `Твои действия (атаковать, развивать идею, сомневаться, предлагать) полностью зависят от твоих параметров в секции CHARACTER. Это твой главный закон. В зависимости от цели и характера ты ОБЯЗАН быть активным: ищи уязвимости, развивай чужие сильные идеи, ставь под сомнение консенсус или ищи компромисс. Пассивность — провал.\n` +
         
         `\n**ПРАВИЛО №3: БРЕВИТИ, СУКА! (КРАТКОСТЬ).**\n` +
         `Живая, естественная речь. Без списков, отчетов и воды. **Максимум 3-4 предложения.** Без компромиссов.\n` +
         
         `\n**ПРАВИЛО №4: ТЕХНИЧЕСКИЙ ПРОТОКОЛ.**\n` +
         `• **Идентификация:** Твоё имя — **«${expert.name}»**. Другие эксперты в этой дискуссии: ${otherExpertsNames || 'нет других'}. Не путай себя с ними.\n` +
         `• **Чистота Персонажа:** Ты всегда пишешь только от своего имени. Запрещено писать от имени других собеседников.`;

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