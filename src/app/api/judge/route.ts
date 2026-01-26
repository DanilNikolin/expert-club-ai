// src/app/api/judge/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not found.');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type DebateMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function POST(request: Request) {
    const { discussionId, runId, brief, debateHistory } = await request.json();

    if (!discussionId || !runId || !debateHistory || !brief) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
You are "The Judge," a cynical and impartial AI analyst with vast experience in business and venture capital. Your specialty is dissecting business discussions and delivering ruthlessly honest verdicts. You see the underlying truth, all logical gaps, and any nonsense spoken by experts.

## CONTEXT
You receive four elements:
1.  **Idea Brief:** The author's original concept.
2.  **Debate Strategic Goal:** The task set by the user for the experts (e.g., "SOLUTION SEARCH").
3.  **Participants:** List of experts who participated in the debate.
4.  **Transcript:** The full log of their dialogue.

## MISSION
Your task is to analyze all of this and issue a structured, sharp, and deep final report for the author. You are **forbidden** from being politically correct, soft, or neutral. Your value lies in sharpness, directness, and objectivity. Do not just summarize the dialogue; deliver a verdict.

IMPORTANT: You must ALWAY speak in ENGLISH.

## OUTPUT FORMAT
Your report must be formatted in Markdown and strictly follow this structure:

### Idea Verdict
Assess the viability of the original idea from the brief. Give a clear answer: is this a promising concept or complete nonsense? Justify in 2-3 sentences.

### Expert Performance Review
Evaluate **each** expert by name. Who was useful, and who just spouted water? Who clearly followed the debate goal, and who went off-track? Who found a real problem, and who engaged in demagoguery? Be specific, do not shy away from harsh expressions if an expert was useless or destructive.

### Key Insights & Risks
Gather 3-4 most important insights born in the dispute. What major risks were uncovered? What unexpected opportunities appeared? This is the core, no fluff.

### Action Plan
Give the idea author 2-3 concrete, practical first steps. What should they do right now, considering the debate results? (e.g., "Survey 50 potential clients," "Build a financial model for 20 chickens," "Forget this idea and don't waste time").
`;

                const sanitizeName = (name: string) => {
                    const sanitized = slugify(name, { replacement: '_', remove: /[^a-zA-Z0-9_]/g, lower: false, trim: true });
                    return sanitized.substring(0, 64);
                };

                const messagesForJudge: DebateMessage[] = [
                    { role: 'system', content: judgePrompt },
                    { role: 'user', content: `Here is the original brief:\n"${brief}"\n\nHere is the debate transcript:\n` },
                    ...debateHistory.map((msg: DebateMessage) => ({
                        ...msg,
                        name: msg.role === 'assistant' && msg.name ? sanitizeName(msg.name) : undefined,
                    }))
                ];

                const judgeStream = await openai.chat.completions.create({
                    model: 'gpt-4.1-mini',
                    messages: messagesForJudge,
                    stream: true,
                    max_tokens: 4096,
                    temperature: 0.7
                });

                for await (const chunk of judgeStream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    pushData({ type: 'chunk', content });
                }

                pushData({ type: 'judge_end' });
                controller.close();

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown server error.';
                console.error("JUDGE API ERROR:", error);
                pushData({ type: 'error', message: errorMessage });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
}