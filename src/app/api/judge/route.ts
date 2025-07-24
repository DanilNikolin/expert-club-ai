// src/app/api/judge/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { db } from '@/firebase.config.js';
import { doc, updateDoc } from 'firebase/firestore'; // Убедись, что тут updateDoc
import slugify from 'slugify';

if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY не найден.');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type DebateMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function POST(request: Request) {
    const { discussionId, runId, brief, debateHistory } = await request.json();

    if (!discussionId || !runId || !debateHistory || !brief) {
        return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 });
    }

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            const pushData = (data: object) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                pushData({ type: 'judge_start' });

                const judgePrompt = `## WHO
Ты — «Судья», циничный и беспристрастный AI-аналитик с огромным опытом в бизнесе и венчурных инвестициях. Твоя специализация — препарировать бизнес-дискуссии и выносить безжалостно честный вердикт. Ты видишь всю подноготную, все логические дыры и всю чушь, которую несут эксперты.

## CONTEXT
Ты получаешь на вход четыре элемента:
1.  **Бриф Идеи:** Первоначальная задумка автора.
2.  **Стратегическая Цель Дебатов:** Какую задачу ставил пользователь перед экспертами (например, "ПОИСК РЕШЕНИЙ").
3.  **Участники:** Список экспертов, участвовавших в споре.
4.  **Стенограмма:** Полный лог их диалога.

## MISSION
Твоя задача — проанализировать всё это и выдать структурированный, острый и глубокий финальный отчет для автора идеи. Тебе **запрещено** быть политкорректным, мягким или нейтральным. Твоя ценность — в остроте, прямоте и объективности. Ты не пересказываешь диалог, ты выносишь из него вердикт.

## OUTPUT FORMAT
Твой отчет должен быть отформатирован в Markdown и строго следовать этой структуре:

### Вердикт по Идее
Оцени жизнеспособность первоначальной идеи из брифа. Дай четкий ответ: это перспективная задумка или полная хуйня? Обоснуй в 2-3 предложениях.

### Разбор Полётов (Анализ Экспертов)
Оцени **каждого** эксперта по имени. Кто был полезен, а кто лил воду? Кто четко следовал цели дебатов, а кто ушел в сторону? Кто нашел реальную проблему, а кто занимался демагогией? Будь конкретен, не стесняйся в выражениях, если эксперт был бесполезен или деструктивен.

### Ключевые Выводы и Риски
Собери 3-4 самых важных инсайта, которые родились в споре. Какие главные риски были вскрыты? Какие неожиданные возможности появились? Это самая суть, без воды.

### Рекомендация к Действию
Дай автору идеи 2-3 конкретных, практических первых шага. Что ему делать прямо сейчас, учитывая итоги дебатов? (Например: "Провести опрос 50 потенциальных клиентов", "Составить фин. модель на 20 кур", "Забыть эту идею и не тратить время").
`;
                
                const sanitizeName = (name: string) => {
                    const sanitized = slugify(name, { replacement: '_', remove: /[^a-zA-Z0-9_]/g, lower: false, trim: true });
                    return sanitized.substring(0, 64);
                };

                const messagesForJudge: DebateMessage[] = [
                    { role: 'system', content: judgePrompt },
                    { role: 'user', content: `Вот первоначальный бриф:\n"${brief}"\n\nВот стенограмма дебатов:\n`},
                    ...debateHistory.map((msg: DebateMessage) => ({
                        ...msg,
                        name: msg.role === 'assistant' && msg.name ? sanitizeName(msg.name) : undefined,
                    }))
                ];
                
                const judgeStream = await openai.chat.completions.create({
                    model: 'gpt-4o-mini', 
                    messages: messagesForJudge,
                    stream: true,
                    temperature: 0.5
                });
        
                let report = '';
                for await (const chunk of judgeStream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    report += content;
                    pushData({ type: 'chunk', content });
                }
        
                // ГЛАВНОЕ: ОБНОВЛЯЕМ, А НЕ СОЗДАЕМ
                const runDocRef = doc(db, 'discussions', discussionId, 'runs', runId);
                await updateDoc(runDocRef, {
                    report: report,
                    transcript: debateHistory 
                });

                pushData({ type: 'judge_end' });
                controller.close();

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка на сервере.';
                console.error("ОШИБКА В API СУДЬИ:", error); 
                pushData({ type: 'error', message: errorMessage });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
}