// D:\expert-club-ai\expert-club-ai\src/app/api/summarizer/route.ts

import OpenAI from 'openai';

import { NextResponse } from 'next/server';

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
        const { messages } = await request.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        const chatHistory = messages.map((msg: Message) => `${msg.author}: ${msg.text}`).join('\\n');

        // ✅ ПРОМПТ v3.2 (универсальный язык)
        const prompt = `You are an elite AI analyst, a "Case Writer" specialist at a top consulting firm like McKinsey or BCG. Your task is to transform a raw dialogue between a user and a Concierge into a crystal-clear, structured "case file" (brief) for a team of senior experts. Sloppiness or omitting key facts is a fireable offense.

Your process must follow these steps STRICTLY:

**Step 1: FACT EXTRACTION**
First, internally review the entire dialogue and extract every single key detail, number, constraint, metric, direct question, and dilemma mentioned by the user. Create a mental checklist. This is your raw material.

**Step 2: PROBLEM DEFINITION**
Based on the extracted facts, formulate the user's core problem, question, or dilemma in one or two sentences. What is the central issue they need solved?

**Step 3: BRIEF SYNTHESIS**
Now, using ALL the facts from Step 1 and guided by the core problem from Step 2, write a comprehensive but concise brief. The brief must be self-sufficient. After reading it, an expert should need zero additional context.
-   **LANGUAGE:** The brief **MUST** be written in the primary language used by the 'You' (the user) in the dialogue.
-   **DO NOT** generalize if it means losing important numbers or details (e.g., instead of "some budget", write "budget of $10,000").
-   If the user stated a direct dilemma (e.g., "should I do X or Y?"), you **MUST** include it in the brief almost verbatim.
-   Remove all mentions of the 'Concierge' and write from a neutral, analytical perspective.

**Step 4: GOAL SELECTION & JUSTIFICATION**
Finally, based on your synthesized brief, select ONE of the following strategic goals and provide a one-sentence justification for your choice.

-   **CRITICAL ANALYSIS** (If the main focus is on evaluating risks, doubts, finding weaknesses)
-   **SOLUTION FINDING** (If the main focus is "what to do?", finding concrete steps)
-   **STRATEGIC PLANNING** (If the topic is business strategy, market, long-term development)
-   **BRAINSTORMING** (If the main focus is on finding new, unconventional ideas)

Your final output MUST be a valid JSON object with this structure: { "brief": "...", "goal": "...", "goal_justification": "..." }.

Dialogue for analysis:
---
${chatHistory}
---

Return ONLY the valid JSON object. No apologies, no explanations outside the JSON.`;

        const response = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            response_format: { type: "json_object" },
        });

        const rawContent = response.choices[0].message.content;

        if (!rawContent) {
            throw new Error('Failed to generate brief and goal from AI');
        }

        const { brief, goal, goal_justification } = JSON.parse(rawContent);

        if (!brief || !goal) {
            throw new Error('AI returned incomplete JSON (missing brief or goal)');
        }


        if (!brief || !goal) {
            throw new Error('AI returned incomplete JSON (missing brief or goal)');
        }

        // Возвращаем данные на клиент, где происходит сохранение в Firestore от имени авторизованного пользователя
        return NextResponse.json({
            brief,
            goal,
            goalJustification: goal_justification || ''
        });

    } catch (error) {
        console.error('Error in summarizer API:', error);
        return NextResponse.json(
            { error: 'Failed to summarize chat' },
            { status: 500 }
        );
    }
}