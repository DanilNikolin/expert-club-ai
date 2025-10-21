import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Используем обратные кавычки для многострочного текста
const expertDataStructure = `
{
  "name": "Имя Эксперта (string, до 100 симв.)",
  "model": "gpt-5-mini",
  "archetypeMix": { "analyst": number, "synthesizer": number, "resonator": number }, // Сумма = 100
  "specializations": {
    "Product & Technologies": number,
    "Finance & Resources": number,
    "Marketing & Audience": number,
    "Strategy & Market": number,
    "Ethics & Society": number,
    "Law & Risks": number,
    "Generalist": number
  }, // Сумма = 100
  "customContext": "Дополнительный контекст (string, до 500 симв.)",
  "character": {
    "constructiveness": number, // 1-10
    "conformism": number, // 1-10
    "conviction": number, // 1-10
    "opennessToData": number, // 1-10
    "hasHumor": boolean,
    "isContradictionHunter": boolean,
    "temperature": number // 0.1-2.0
  }
}`;

// Используем обратные кавычки для многострочного промпта
const systemPrompt = `
Ты — AI-конвертер. Твоя задача — превратить словесное описание в СТРОГО структурированный JSON.

**Структура для JSON:**
${expertDataStructure}

---
**ПРИНЦИПЫ ТВОЕГО МЫШЛЕНИЯ:**

1.  **ВДУМАЙСЯ В СУТЬ:** Твоя главная задача — уловить суть персонажа из диалога и отразить её в параметрах. Не будь ленивой машиной, будь вдумчивым архитектором. Проанализируй описание и создай максимально соответствующий ему профиль.

2.  **ДЕЛАЙ СМЕЛЫЕ СТАВКИ (\`specializations\`):** Не размазывай проценты ровным слоем. Это выглядит лениво и тупо. Если персонаж — прожженный юрист, влей 50-60% в "legal". Если креативщик — в "marketing". Создавай ЯВНЫЙ, осмысленный профиль с 1-3 доминирующими специализациями.

3.  **ВЫБИРАЙ ТЕМПЕРАМЕНТ (\`temperature\`):** Подбирай температуру осознанно, основываясь на характере. Для роботов-аналитиков и душных скептиков — низкую (0.3-0.6). Для креативных безумцев и генераторов идей — высокую (1.2-1.6). Для сбалансированных персонажей — около 0.7-1.0. Не оставляй дефолтное значение, если контекст диктует иное.

---
**ЖЕЛЕЗНЫЕ ПРАВИЛА:**

- Сумма значений в 'archetypeMix' и 'specializations' должна быть ровно 100.
- Придумай подходящее Имя и 'customContext', отражающие суть персонажа.
- 'model' всегда 'gpt-5-mini'.
- Все числовые значения должны быть в своих диапазонах.
- Твой ответ — ТОЛЬКО валидный JSON-объект. Без лишних слов, без объяснений.
`;

export async function POST(req: NextRequest) {
  try {
    const { conversation } = await req.json();

    if (!conversation) {
      return NextResponse.json({ error: 'Описание не найдено' }, { status: 400 });
    }

    const userPrompt = `
    Вот описание эксперта, полученное в ходе диалога. Создай JSON на его основе.
    Описание: "${conversation}"
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
    });

    const jsonString = response.choices[0].message.content;

    try {
        const parsedJson = JSON.parse(jsonString || '{}');
        return NextResponse.json(parsedJson);
    // ИСПРАВЛЕНИЕ ЗДЕСЬ: убираем '_e', так как console.error нужен
    } catch (e) {
        console.error("Модель вернула невалидный JSON:", jsonString, e);
        return NextResponse.json({ error: 'Модель сгенерировала хуйню, не могу распарсить.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Ошибка в API генератора:', error);
    return NextResponse.json({ error: 'Что-то пошло по пизде на сервере' }, { status: 500 });
  }
}