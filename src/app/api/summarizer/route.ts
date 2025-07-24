// D:\expert-club-ai\expert-club-ai\src\app\api\summarizer\route.ts

import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { db } from '@/firebase.config.js';
import { collection, addDoc } from 'firebase/firestore';

// ✅ Создаем отдельного клиента для Deepseek
const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
});

type Message = {
    author: 'You' | 'Concierge';
    text: string;
};

export async function POST(request: Request) {
    try {
        const { messages, userId } = await request.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        const chatHistory = messages.map((msg: Message) => `${msg.author}: ${msg.text}`).join('\n');

        // ✅ НОВЫЙ, УМНЫЙ ПРОМТ ДЛЯ ВЫЖИМЩИКА v2.0
        const prompt = `Ты — элитный AI-аналитик. Твоя специализация — "Case Writer". Ты превращаешь сырой диалог между пользователем и Консьержем в четкий, структурированный "кейс" (бриф) для команды старших экспертов.

        Твоя задача — дистиллировать диалог, уловив **суть главного вопроса или дилеммы пользователя**, но при этом сохранив **все ключевые детали, факты и контекст**, которые необходимы экспертам для глубокого погружения. Бриф должен быть самодостаточным. Прочитав его, эксперты должны понять не только "что" обсуждать, но и "почему" это важно для пользователя.

        Если пользователь озвучил прямую дилемму (например, "стоит ли мне... или..."), **обязательно включи её в бриф дословно** или очень близко к тексту. Эксперты должны решать реальную проблему пользователя, а не её абстрактную модель.

        Твой результат — это JSON-объект следующей структуры: { "brief": "...", "goal": "..." }.

        1.  **brief (string):** Напиши исчерпывающий, но лаконичный бриф. Не ограничивай себя искусственно, пиши столько, сколько нужно для полного раскрытия контекста. Убери все упоминания 'Консьержа'.
        2.  **goal (string):** Основываясь на сути брифа, выбери ОДНУ из следующих стратегических целей для дебатов:
            -   КРИТИЧЕСКИЙ АНАЛИЗ (если главный вопрос — оценка рисков, сомнения, поиск слабых мест)
            -   ПОИСК РЕШЕНИЙ (если главный вопрос — "что делать?", поиск конкретных шагов)
            -   СТРАТЕГИЧЕСКОЕ ПЛАНИРОВАНИЕ (если речь о бизнес-стратегии, рынке, долгосрочном развитии)
            -   МОЗГОВОЙ ШТУРМ (если главный вопрос — поиск новых, нестандартных идей)

        Диалог для анализа:
        ---
        ${chatHistory}
        ---

        Верни ТОЛЬКО валидный JSON-объект.`;

        const response = await deepseek.chat.completions.create({
            model: 'deepseek-chat', // ✅ ИСПОЛЬЗУЕМ DEEPSEEK
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5, // ✅ ЧУТЬ ПОДНЯЛИ ДЛЯ ЛУЧШЕГО ПОНИМАНИЯ НЮАНСОВ
            response_format: { type: "json_object" },
        });

        const rawContent = response.choices[0].message.content;

        if (!rawContent) {
            throw new Error('Failed to generate brief and goal from AI');
        }

        const { brief, goal } = JSON.parse(rawContent);

        if (!brief || !goal) {
            throw new Error('AI returned incomplete JSON');
        }

        const docRef = await addDoc(collection(db, 'discussions'), {
            brief: brief,
            goal: goal,
            createdAt: new Date(),
            userId: userId,
            status: 'brief_created'
        });

        return NextResponse.json({ discussionId: docRef.id });

    } catch (error) {
        console.error('Error in summarizer API:', error);
        return NextResponse.json(
            { error: 'Failed to summarize chat' },
            { status: 500 }
        );
    }
}