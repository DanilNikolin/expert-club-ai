// D:\expert-club-ai\expert-club-ai\src\app\page.tsx
'use client';

import Link from 'next/link';
import { Users, MessageSquare, ArrowRight, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Section } from '@/components/landing/Section';
import { SectionHeader } from '@/components/landing/SectionHeader';
import { CardBase } from '@/components/landing/CardBase';
import { StepCard } from '@/components/landing/StepCard';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { CtaRow } from '@/components/landing/CtaRow';
import { FixedCtaBar } from '@/components/landing/FixedCtaBar';
import { TimelineConnector } from '@/components/landing/TimelineConnector';

/* --------------------------------- Page ---------------------------------- */

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-bg-main text-text-secondary"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="animate-pulse">Загрузка…</span>
      </div>
    );
  }

  const isAuthed = Boolean(user);

  return (
    <main className="min-h-screen bg-bg-main text-text-main relative isolate">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-bg-surface text-text-main px-3 py-2 rounded">
        К содержанию
      </a>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      {/* Hero */}
      <Section className="pt-20 pb-14 text-center">
        <div id="content" className="max-w-5xl mx-auto">
          
          <h1 className="flex flex-col items-center gap-y-3 text-4xl md:text-6xl font-pixel uppercase mb-8">
            <span className="inline-block md:whitespace-nowrap rounded-md bg-bg-surface/50 px-4 py-2 text-accent-primary">
              Собери команду AI.
            </span>
            <span className="inline-block md:whitespace-nowrap rounded-md bg-bg-surface/50 px-4 py-2 text-accent-primary">
              Дай им цель.
            </span>
            <span className="inline-block md:whitespace-nowrap rounded-md bg-bg-surface/50 px-4 py-2 text-accent-secondary">
              Скажи &apos;Фас!&apos;.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-3xl mx-auto">
            Это твоя песочница. Создай AI-гения, критика, идиота — кого угодно. Они будут спорить друг с другом о твоей задаче, а ты — режиссировать процесс.
          </p>

          <CtaRow isAuthed={isAuthed} />
        </div>
      </Section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="h-px w-full bg-accent-primary/30" />
      </div>

      {/* How it works */}
      <Section aria-labelledby="how" className="relative">
        <SectionHeader>Как это работает</SectionHeader>

        <div className="flex flex-col gap-6 md:hidden">
  <StepCard
    step={1}
    icon={Users}
    color="primary"
    title="Создай экспертов"
    description="Собери команду с нуля в мощном конструкторе или выбери готовых."
  />
  <StepCard
    step={2}
    icon={MessageSquare}
    color="secondary"
    title="Сформулируй задачу"
    description="Опиши свою идею. Наш AI-Консьерж поможет превратить ее в четкий бриф для команды."
  />
  <StepCard
    step={3}
    icon={Zap}
    color="success"
    title="Запусти дебаты"
    description="Наблюдай, как твои AI-эксперты спорят, соглашаются и ищут истину, следуя заданным характерам."
  />
  <StepCard
    step={4}
    icon={Target}
    color="danger"
    title="Получи выводы"
    description="В конце — вся суть на одном экране. Никакой воды. Только главные аргументы, риски и пошаговый план."
  />
</div>

{/* --- ВЕРСИЯ ДЛЯ ДЕСКТОПА (наша новая жесткая сетка) --- */}
      <div className="hidden md:grid md:grid-cols-[4fr_1fr_4fr_1fr_4fr_1fr_4fr] md:items-stretch md:gap-x-4">
        <StepCard
          step={1}
          icon={Users}
          color="primary"
          title="Создай экспертов"
          description="Собери команду с нуля в мощном конструкторе или выбери готовых."
        />
        <TimelineConnector />
        <StepCard
          step={2}
          icon={MessageSquare}
          color="secondary"
          title="Сформулируй задачу"
          description="Опиши свою идею. Наш AI-Консьерж поможет превратить ее в четкий бриф для команды."
        />
        <TimelineConnector />
        <StepCard
          step={3}
          icon={Zap}
          color="success"
          title="Запусти дебаты"
          description="Наблюдай, как твои AI-эксперты спорят, соглашаются и ищут истину, следуя заданным характерам."
        />
        <TimelineConnector />
        <StepCard
          step={4}
          icon={Target}
          color="danger"
          title="Получи выводы"
          description="В конце — вся суть на одном экране. Никакой воды. Только главные аргументы, риски и пошаговый план."
        />
      </div>
      </Section>

      {/* Why it works */}
      <Section aria-labelledby="why">
        <SectionHeader>Почему это работает</SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon={Users}
            color="primary"
            title="Сила в споре"
            text="Роли с противоположными установками. Вместо одного ответа — спектр решений с критикой и защитой."
          />
          <FeatureCard
            icon={MessageSquare}
            color="secondary"
            title="Реальный диалог"
            text="Модели спорят между собой, уточняют тезисы, эскалируют аргументы. Факты, логика и стратегия."
          />
          <FeatureCard
            icon={Target}
            color="success"
            title="Ты — режиссер"
            text="Состав, правила, раунды — под задачу. Вмешивайся в нужный момент и направляй спор к цели."
          />
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <CardBase color="primary" className="p-10 md:p-12 bg-bg-surface border-2 border-accent-primary/40">
            <h2 className="text-3xl md:text-4xl font-pixel text-accent-primary uppercase mb-4">
              Готов проверить гипотезу?
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Запусти спор — получи ясный план и список рисков. Коротко, по делу, пригодно к действию.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthed ? (
                <Link href="/discussion/new" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 rounded-lg">
                  <Button size="default" className="w-full px-10 py-4 text-lg">
                    Создать дискуссию
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/signup" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 rounded-lg">
                  <Button size="default" className="w-full px-10 py-4 text-lg">
                    Начать бесплатно
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            <p className="text-sm text-text-secondary mt-4">
              Бесплатно все (режим разработки)
            </p>
          </CardBase>
        </div>
      </Section>

      {/* Mobile sticky CTA */}
      <FixedCtaBar isAuthed={isAuthed} />
    </main>
  );
}