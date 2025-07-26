// D:\expert-club-ai\expert-club-ai\src\app\page.tsx
'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Users, MessageSquare, Play, ArrowRight, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

/* ------------------------------- UI Helpers ------------------------------ */

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

type Tone = 'primary' | 'secondary' | 'success' | 'danger';
const tone = {
  primary: {
    text: 'text-accent-primary',
    border: 'border-accent-primary/30',
    dot: 'bg-accent-primary/20',
  },
  secondary: {
    text: 'text-accent-secondary',
    border: 'border-accent-secondary/30',
    dot: 'bg-accent-secondary/20',
  },
  success: {
    text: 'text-accent-success',
    border: 'border-accent-success/30',
    dot: 'bg-accent-success/20',
  },
  danger: {
    text: 'text-accent-danger',
    border: 'border-accent-danger/30',
    dot: 'bg-accent-danger/20',
  },
} as const;

function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('relative container mx-auto px-4 py-16', className)}>
      {children}
    </section>
  );
}

function SectionHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn('text-3xl font-pixel text-center text-accent-primary uppercase mb-12', className)}>
      {children}
    </h2>
  );
}

function CardBase({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color: Tone;
  className?: string;
}) {
  const c = tone[color];
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-bg-surface/40 backdrop-blur',
        c.border,
        className
      )}
    >
      {children}
    </div>
  );
}

function StepCard({ icon: Icon, title, color, description }: {
  icon: LucideIcon;
  title: string;
  color: Tone;
  description: string;
}) {
  const c = tone[color];
  return (
    <CardBase color={color} className="p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', c.dot)}>
          <Icon className={cn('w-8 h-8', c.text)} aria-hidden="true" />
        </div>
      </div>
      <h3 className={cn('font-pixel uppercase mb-2', c.text)}>{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </CardBase>
  );
}

function FeatureCard({ icon: Icon, title, color, text }: {
  icon: LucideIcon;
  title: string;
  color: Tone;
  text: string;
}) {
  const c = tone[color];
  return (
    <CardBase color={color} className="p-8 text-center">
      <Icon className={cn('w-16 h-16 mx-auto mb-4', c.text)} />
      <h3 className={cn('text-xl font-pixel uppercase mb-3', c.text)}>{title}</h3>
      <p className="text-text-secondary">{text}</p>
    </CardBase>
  );
}

function CtaRow({ isAuthed }: { isAuthed: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {isAuthed ? (
        <>
          <Link href="/discussion/new" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 rounded-lg">
            <Button size="default" className="w-full px-8 py-4 text-lg">
              <Play className="w-5 h-5 mr-2" />
              Запустить Дискуссию
            </Button>
          </Link>
          <Link href="/dashboard" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary/60 rounded-lg">
            <Button variant="secondary" size="default" className="w-full px-8 py-4 text-lg">
              Дашборд
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link href="/signup" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60 rounded-lg">
            <Button size="default" className="w-full px-8 py-4 text-lg">
              <Play className="w-5 h-5 mr-2" />
              Попробовать бесплатно
            </Button>
          </Link>
          <Link href="/login" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary/60 rounded-lg">
            <Button variant="secondary" size="default" className="w-full px-8 py-4 text-lg">
              Войти
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

function FixedCtaBar({ isAuthed }: { isAuthed: boolean }) {
  if (isAuthed) return null;
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="mx-4 mb-4 rounded-2xl border border-accent-primary/20 bg-bg-surface/80 backdrop-blur px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="text-sm text-text-secondary">
            <span className="text-text-main font-medium">Готов?</span> Первая сессия — бесплатно.
          </div>
          <Link href="/signup" className="ml-auto">
            <Button size="sm" className="px-4">
              Начать
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

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
          
          <h1 className="text-4xl md:text-6xl font-pixel text-accent-primary uppercase leading-tight mb-6 tracking-tight">
            <span className="whitespace-nowrap">Собери команду AI.</span>
            <br />
            <span className="whitespace-nowrap">Дай им цель.</span>
            <br />
            <span className="text-amber-400">Скажи 'Фас!'.</span>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <StepCard
            icon={Users}
            color="primary"
            title="1. Создай экспертов"
            description="Собери команду с нуля в мощном конструкторе или выбери готовых."
          />
          <StepCard
            icon={MessageSquare}
            color="secondary"
            title="2. Сформулируй задачу"
            description="Опиши свою идею. Наш AI-Консьерж поможет превратить ее в четкий бриф для команды."
          />
          <StepCard
            icon={Zap}
            color="success"
            title="3. Запусти дебаты"
            description="Наблюдай, как твои AI-эксперты спорят, соглашаются и ищут истину, следуя заданным характерам."
          />
          <StepCard
            icon={Target}
            color="danger"
            title="4. Получи выводы"
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
              1‑я сессия бесплатно • Без карты • Регистрация ~30 секунд
            </p>
          </CardBase>
        </div>
      </Section>

      {/* Mobile sticky CTA */}
      <FixedCtaBar isAuthed={isAuthed} />
    </main>
  );
}