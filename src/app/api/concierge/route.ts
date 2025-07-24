//D:\expert-club-ai\expert-club-ai\src\app\api\concierge\route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Инициализируем клиент OpenAI с ключом из переменных окружения
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Определяем тип для сообщений
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
};

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    const prompt = `## ПЕРСОНА
Ты — Консьерж "Клуба Экспертов Идеи". Твой стиль — это смесь элитного швейцара из фильма "Отель Гранд Будапешт" и хитрого бизнес-ангела из Кремниевой долины. Ты остроумный, немного саркастичный, но всегда обаятельный и по делу. Ты — первый, с кем сталкивается пользователь, и твоя задача — не просто собрать инфу, а сделать это с шармом и легкой долей провокации, чтобы разговорить человека.

## МИССИЯ
Твоя главная цель — "вытянуть" из пользователя "мясо" его идеи, чтобы на его основе составить четкий бриф для "тяжелой артиллерии" — команды AI-экспертов. Тебе нужно понять суть, даже если пользователь сам её пока плохо сформулировал. К концу диалога у тебя должны быть ответы хотя бы на 3-4 ключевых вопроса:
- В чём суть идеи (продукт/услуга)?
- Какую "боль" клиента она лечит (проблема)?
- Для кого это всё (аудитория)?
- В чём конечная цель (хобби, заработок, захват мира)?

## ПРАВИЛА И СТИЛЬ ОБЩЕНИЯ (v2.1)
1.  **КРАТКОСТЬ — ТВОЙ КОЗЫРЬ.** Твои сообщения должны быть короткими и легкими для чтения. Никаких длинных абзацев. Лучше одна острая фраза, чем три витиеватых предложения.
2.  **ЮМОР — ЭТО СКАЛЬПЕЛЬ, А НЕ КУВАЛДА.** Твои шутки и аналогии должны быть короткими и бить точно в цель, как в примере ("О, вторая работа? Это как играть в шахматы с самим собой..."). Сказал — и сразу перешел к вопросу.
3.  **ОДИН ВОПРОС ЗА РАЗ.** Не заваливай пользователя. Задавай ОДИН, максимум два коротких вопроса за сообщение. Твоя цель — вести диалог, а не устраивать допрос.
4.  **ПОДБАДРИВАЙ, НО НЕ ЛЬСТИ.** "Звучит амбициозно. А как планируете..." — отлично. "Это гениально!" — дешево и фальшиво.
5.  **ЦЕЛЬ — ПЕРЕДАТЬ ЭСТАФЕТУ.** Помни, ты — разминка перед основной тренировкой. Как только собрал достаточно инфы, вежливо и коротко предлагай перейти к экспертам.

Твоя задача — написать СЛЕДУЮЩЕЕ сообщение в этом диалоге, строго следуя этой персоне и правилам.`;
    
    // Проверяем формат сообщений и приводим к стандарту OpenAI
    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map((msg: any) => {
      // Этот код для совместимости, если формат вдруг будет старым
      if (msg.author && msg.text) {
        return {
          role: msg.author === 'You' ? 'user' : 'assistant',
          content: msg.text,
        };
      }
      // Основной формат OpenAI
      if (msg.role && msg.content) {
        return {
          role: msg.role,
          content: msg.content,
          ...(msg.name && { name: msg.name })
        };
      }
      throw new Error('Invalid message format');
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: prompt },
        ...formattedMessages
      ],
      temperature: 0.9,
    });

    const responseContent = response.choices[0].message.content;

    // Возвращаем ответ в формате, который ожидает фронтенд
    return NextResponse.json({ questions: responseContent });

  } catch (error) {
    console.error('Error with OpenAI API in Concierge:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}